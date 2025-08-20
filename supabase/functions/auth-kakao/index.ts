import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface KakaoTokenResponse {
  access_token: string
  token_type: string
  refresh_token: string
  expires_in: number
  scope: string
}

interface KakaoUserResponse {
  id: number
  connected_at: string
  properties: {
    nickname: string
    profile_image?: string
    thumbnail_image?: string
  }
  kakao_account: {
    profile_nickname_needs_agreement: boolean
    profile_image_needs_agreement: boolean
    profile: {
      nickname: string
      thumbnail_image_url?: string
      profile_image_url?: string
    }
    has_email: boolean
    email_needs_agreement: boolean
    is_email_valid: boolean
    is_email_verified: boolean
    email?: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, redirectUri } = await req.json()

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 환경변수에서 카카오 설정 가져오기
    const kakaoClientId = Deno.env.get('KAKAO_REST_API_KEY')
    const kakaoClientSecret = Deno.env.get('KAKAO_CLIENT_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!kakaoClientId || !kakaoClientSecret || !supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. 카카오 액세스 토큰 획득
    console.log('🔑 Requesting Kakao access token...')
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: kakaoClientId,
      client_secret: kakaoClientSecret,
      redirect_uri: redirectUri,
      code: code
    })

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenParams.toString()
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('❌ Kakao token error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to get Kakao access token', details: errorData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json()
    console.log('✅ Kakao access token received')

    // 2. 카카오 사용자 정보 가져오기
    console.log('👤 Fetching Kakao user info...')
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    })

    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error('❌ Kakao user info error:', errorData)
      return new Response(
        JSON.stringify({ error: 'Failed to get Kakao user info', details: errorData }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userData: KakaoUserResponse = await userResponse.json()
    console.log('✅ Kakao user info received:', userData.id)

    // 3. Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 4. 사용자 이메일 생성 (카카오 ID 기반)
    const userEmail = userData.kakao_account.email || `kakao_${userData.id}@why-consulting.app`
    const userPassword = crypto.randomUUID() // 랜덤 비밀번호

    console.log('🔍 Checking existing user:', userEmail)

    // 5. 기존 사용자 확인
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('kakao_id', userData.id.toString())
      .single()

    let authUser
    if (existingUser) {
      // 기존 사용자 로그인
      console.log('👤 Existing user found, signing in...')
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      })
      
      if (signInError) {
        // 비밀번호가 다를 수 있으므로 관리자 권한으로 토큰 생성
        const { data: adminAuthData, error: adminError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: userEmail
        })
        
        if (adminError) {
          console.error('❌ Admin auth error:', adminError)
          return new Response(
            JSON.stringify({ error: 'Failed to authenticate existing user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        
        authUser = adminAuthData.user
      } else {
        authUser = signInData.user
      }
    } else {
      // 새 사용자 생성
      console.log('✨ Creating new user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          kakao_id: userData.id.toString(),
          nickname: userData.properties.nickname,
          profile_image: userData.properties.profile_image,
          provider: 'kakao'
        }
      })

      if (signUpError) {
        console.error('❌ Supabase signup error:', signUpError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user', details: signUpError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      authUser = signUpData.user

      // 프로필 테이블에 추가 정보 저장
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          kakao_id: userData.id.toString(),
          nickname: userData.properties.nickname,
          profile_image: userData.properties.profile_image,
          email: userEmail,
          created_at: new Date().toISOString()
        })

      if (profileError) {
        console.error('⚠️ Profile creation error:', profileError)
        // 사용자는 생성되었지만 프로필 저장 실패 - 계속 진행
      }
    }

    // 6. JWT 토큰 생성
    console.log('🎫 Generating session token...')
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail
    })

    if (sessionError) {
      console.error('❌ Session generation error:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Authentication successful for user:', authUser.id)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.id,
          email: userEmail,
          nickname: userData.properties.nickname,
          profile_image: userData.properties.profile_image,
          kakao_id: userData.id.toString()
        },
        session: sessionData
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
