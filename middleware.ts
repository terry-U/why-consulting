import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Supabase 표준 토큰 쿠키 키 우선 조회
          if (name === 'sb-access-token') return req.cookies.get('sb-access-token')?.value
          if (name === 'sb-refresh-token') return req.cookies.get('sb-refresh-token')?.value
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          // 표준 키로도 복제 설정
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 인증 상태 새로고침
  const { data: { session } } = await supabase.auth.getSession()

  // 보호된 경로들 (로그인이 필요한 경로)
  const protectedPaths = ['/home', '/session', '/onboarding', '/journal', '/wallet', '/settings']
  
  // 현재 경로가 보호된 경로인지 확인
  const isProtectedPath = protectedPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // 로그인 관련 페이지들
  const authPaths = ['/login', '/signup', '/auth']
  const isAuthPath = authPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  )

  // 세션 종료 시 채팅 화면 접근 차단: /session/[id] -> /session/[id]/report
  const sessionChatMatch = req.nextUrl.pathname.match(/^\/session\/(.+)$/)
  if (sessionChatMatch) {
    const pathRemainder = sessionChatMatch[1]
    // 중첩 경로(report/why 등)는 제외하고 정확히 /session/[id] 일 때만 검사
    if (!pathRemainder.includes('/')) {
      const sessionId = pathRemainder
      try {
        const { data: s } = await supabase
          .from('sessions')
          .select('id,status,counseling_phase,generated_why')
          .eq('id', sessionId)
          .single()
        if (s && (s.status === 'completed' || s.counseling_phase === 'summary' || !!s.generated_why)) {
          return NextResponse.redirect(new URL(`/session/${sessionId}/report`, req.url))
        }
      } catch {}
    }
  }

  // 보호된 경로에 접근하려는데 로그인되지 않은 경우
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // 이미 로그인된 사용자가 인증 페이지에 접근하는 경우
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
