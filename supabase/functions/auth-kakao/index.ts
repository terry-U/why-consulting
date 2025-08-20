import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

Deno.serve(async (req) => {
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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!kakaoClientId || !kakaoClientSecret || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('❌ Missing environment variables')
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
      redirect_uri: redirectUri || 'https://findmywhy.co/auth/kakao-callback',
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

    const tokenData = await tokenResponse.json()
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

    const userData = await userResponse.json()
    console.log('✅ Kakao user info received:', userData.id)

    // 3. Supabase 클라이언트 생성 (서비스 롤 키 사용)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
    // 공개 키로 인증 세션 발급용 클라이언트
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 4. 사용자 정보 안전하게 추출
    const userEmail = userData.kakao_account?.email || `kakao_${userData.id}@findmywhy.co`
    const userPassword = crypto.randomUUID()
    
    // Safe nickname/image access
    const nickname = userData.properties?.nickname || userData.kakao_account?.profile?.nickname || '사용자'
    const profileImage = userData.properties?.profile_image || userData.kakao_account?.profile?.profile_image_url

    console.log('📧 User email:', userEmail)
    console.log('👤 Nickname:', nickname)

    // 5. 기존 사용자 확인 (users 테이블에서 kakao_id로 확인)
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('kakao_id', userData.id.toString())
      .single()

    let authUser

    if (existingUser) {
      // 기존 사용자 - 직접 사용자 정보 가져오기
      console.log('👤 Existing user found, getting user data...')
      const { data: userAuthData, error: getUserError } = await supabase.auth.admin.getUserById(existingUser.id)
      
      if (getUserError || !userAuthData.user) {
        console.error('❌ Failed to get existing user:', getUserError)
        return new Response(
          JSON.stringify({ error: 'Failed to authenticate existing user' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      authUser = userAuthData.user
      // 기존 사용자 비밀번호 갱신 (세션 발급을 위해 임시 패스워드 설정)
      const { error: pwdUpdateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: userPassword
      })
      if (pwdUpdateError) {
        console.error('❌ Password update error:', pwdUpdateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update user password', details: pwdUpdateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('✅ Existing user authenticated:', authUser.id)
    } else {
      // 새 사용자 생성
      console.log('✨ Creating new user...')
      const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
          kakao_id: userData.id.toString(),
          nickname: nickname,
          profile_image: profileImage,
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

      // users 테이블에 추가 정보 저장
      const { error: userError } = await supabase.from('users').insert({
        id: authUser.id,
        kakao_id: userData.id.toString(),
        nickname: nickname,
        profile_image: profileImage,
        email: userEmail,
        created_at: new Date().toISOString()
      })

      if (userError) {
        console.error('⚠️ User table insert error:', userError)
      }

      console.log('✅ New user created:', authUser.id)
    }

    // 6. 실제 세션 토큰 발급 (임시 패스워드로 로그인)
    console.log('🎫 Signing in to generate session tokens for user:', authUser.id)
    const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
      email: authUser.email!,
      password: userPassword
    })

    if (signInError || !signInData.session) {
      console.error('❌ Sign-in to generate session failed:', signInError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate session token', details: signInError?.message || 'No session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Session tokens generated successfully')

    console.log('✅ Authentication successful for user:', authUser.id)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authUser.id,
          email: userEmail,
          nickname: nickname,
          profile_image: profileImage,
          kakao_id: userData.id.toString()
        },
        session: {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_in: signInData.session.expires_in,
          token_type: 'bearer'
        }
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
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
