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

  if (isSessionRoute) {
    // 세션 경로: 전역 헤더/푸터 제외, 풀블리드 + 그라디언트 배경
    return (
      <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_50%_-100px,rgba(242,230,255,0.7),transparent_60%),radial-gradient(900px_500px_at_80%_200px,rgba(230,245,255,0.6),transparent_60%),var(--background)]">
        {children}
      </div>
    )
  }

  // 기본 경로: 전역 헤더/푸터 노출
  return (
    <>
      <AppHeader />
      <main className="ui-container min-h-screen">
        {children}
      </main>
      <AppFooter />
    </>
  )
}


