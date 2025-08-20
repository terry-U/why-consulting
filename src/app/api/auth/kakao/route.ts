import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    console.log('🔄 Processing Kakao OAuth callback...')

    // Supabase Edge Function 호출
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Edge Function 호출
    const { data, error } = await supabase.functions.invoke('auth-kakao', {
      body: {
        code,
        redirectUri
      }
    })

    if (error) {
      console.error('❌ Edge Function error:', error)
      return NextResponse.json(
        { error: 'Authentication failed', details: error.message },
        { status: 500 }
      )
    }

    if (!data.success) {
      console.error('❌ Kakao authentication failed:', data.error)
      return NextResponse.json(
        { error: data.error || 'Authentication failed' },
        { status: 400 }
      )
    }

    console.log('✅ Kakao authentication successful')

    // 세션 설정을 위한 응답
    const response = NextResponse.json({
      success: true,
      user: data.user,
      redirect: '/home'
    })

    // 세션 쿠키 설정 (선택사항)
    if (data.session?.access_token) {
      response.cookies.set('supabase-auth-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7일
      })
    }

    return response

  } catch (error) {
    console.error('❌ Kakao auth API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
