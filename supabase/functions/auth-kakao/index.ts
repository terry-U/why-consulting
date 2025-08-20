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

    // 카카오 토큰 교환
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: Deno.env.get('KAKAO_REST_API_KEY')!,
        client_secret: Deno.env.get('KAKAO_CLIENT_SECRET')!,
        redirect_uri: `${Deno.env.get('NEXT_PUBLIC_SITE_URL')}/auth/kakao-callback`,
        code: code,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }

    const tokenData = await tokenResponse.json()

    // 카카오 사용자 정보 가져오기
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error(`User info fetch failed: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Supabase 클라이언트 생성
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 사용자 생성 또는 업데이트
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.kakao_account?.email || `kakao_${userData.id}@placeholder.com`,
      user_metadata: {
        full_name: userData.kakao_account?.profile?.nickname || 'Kakao User',
        avatar_url: userData.kakao_account?.profile?.profile_image_url,
        provider: 'kakao',
        kakao_id: userData.id.toString(),
      },
      email_confirm: true,
    })

    if (authError && authError.message !== 'User already registered') {
      throw new Error(`User creation failed: ${authError.message}`)
    }

    // 세션 생성
    const userId = authData?.user?.id || authError?.message === 'User already registered' 
      ? (await supabase.from('users').select('id').eq('email', userData.kakao_account?.email || `kakao_${userData.id}@placeholder.com`).single()).data?.id
      : null

    if (!userId) {
      throw new Error('Failed to get user ID')
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.kakao_account?.email || `kakao_${userData.id}@placeholder.com`,
    })

    if (sessionError) {
      throw new Error(`Session generation failed: ${sessionError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        session: sessionData.properties,
        user: {
          id: userId,
          email: userData.kakao_account?.email || `kakao_${userData.id}@placeholder.com`,
          full_name: userData.kakao_account?.profile?.nickname || 'Kakao User',
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Kakao auth error:', error)
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
