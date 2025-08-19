import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (!error) {
        console.log('✅ 이메일 인증 성공')
        // 인증 성공 - 홈페이지로 리다이렉트
        return NextResponse.redirect(new URL(next, origin))
      } else {
        console.error('❌ 인증 코드 교환 실패:', error)
      }
    } catch (error) {
      console.error('❌ Auth callback error:', error)
    }
  }

  // 오류 발생 시 로그인 페이지로 리다이렉트
  console.log('🔄 인증 실패 - 로그인 페이지로 리다이렉트')
  return NextResponse.redirect(new URL('/auth?error=이메일_인증에_실패했습니다', origin))
}
