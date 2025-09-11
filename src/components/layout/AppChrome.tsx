'use client'

import { usePathname } from 'next/navigation'
import AppHeader from '@/components/layout/AppHeader'
import AppFooter from '@/components/layout/AppFooter'

interface Props {
  children: React.ReactNode
}

export default function AppChrome({ children }: Props) {
  const pathname = usePathname() || ''
  const isSessionRoute = pathname.startsWith('/session/')
  const isChatRoute = isSessionRoute && !pathname.includes('/report')

  if (isChatRoute) {
    // 채팅 화면: 루트 고정 배경 사용 → 투명 유지
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  if (isSessionRoute) {
    // 보고서 등 세션 하위 기타 화면: 단색 배경(흰색)
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // 기본 경로: 전역 헤더/푸터 노출 (루트 고정 배경 사용 → 투명 유지)
  return (
    <>
      <AppHeader />
      <div className="min-h-screen">
        <main className="ui-container min-h-screen">
          {children}
        </main>
        <AppFooter />
      </div>
    </>
  )
}


