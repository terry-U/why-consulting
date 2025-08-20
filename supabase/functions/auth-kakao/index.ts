import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Authorization code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🔄 Starting Kakao token exchange...')

    // 카카오 토큰 교환
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: Deno.env.get('KAKAO_REST_API_KEY')!,
      client_secret: Deno.env.get('KAKAO_CLIENT_SECRET')!,
      redirect_uri: 'https://findmywhy.co/auth/kakao-callback',
      code: code,
    })

    console.log('📤 Token exchange params:', Object.fromEntries(tokenParams))

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    })

    const tokenData = await tokenResponse.json()
    console.log('📥 Token response:', tokenResponse.status, tokenData)

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status} - ${JSON.stringify(tokenData)}`)
    }

    // 카카오 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()
    console.log('👤 User data:', userData)

    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${userResponse.status} - ${JSON.stringify(userData)}`)
    }

    // Supabase 클라이언트 생성 (admin)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const email = userData.kakao_account?.email || `kakao_${userData.id}@findmywhy.co`
    const nickname = userData.kakao_account?.profile?.nickname || 'Kakao User'

    console.log('📧 Using email:', email)

    // 기존 사용자 확인
    const { data: existingUser } = await supabase.auth.admin.getUserById(userData.id.toString())
    
    let userId: string

    if (existingUser.user) {
      console.log('✅ Existing user found')
      userId = existingUser.user.id
    } else {
      console.log('🆕 Creating new user...')
      // 새 사용자 생성
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        user_metadata: {
          full_name: nickname,
          avatar_url: userData.kakao_account?.profile?.profile_image_url,
          provider: 'kakao',
          kakao_id: userData.id.toString(),
        },
        email_confirm: true,
      })

      if (createError) {
        console.error('❌ User creation error:', createError)
        throw new Error(`User creation failed: ${createError.message}`)
      }

      userId = newUser.user.id
      console.log('✅ New user created:', userId)
    }

    // 세션 생성
    console.log('🔐 Generating session...')
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    })

    if (sessionError) {
      console.error('❌ Session generation error:', sessionError)
      throw new Error(`Session generation failed: ${sessionError.message}`)
    }

    console.log('✅ Session generated successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: sessionData.properties,
        user: {
          id: userId,
          email: email,
          full_name: nickname,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Kakao auth error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Authentication failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
