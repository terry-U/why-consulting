import './globals.css'
import AppHeader from '@/components/layout/AppHeader'
import AppFooter from '@/components/layout/AppFooter'

export const metadata = {
  title: 'Why 상담사',
  description: '당신의 진정한 동기를 찾아드립니다',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="light">
      <body>
        <AppHeader />
        <main className="ui-container min-h-screen">{children}</main>
        <AppFooter />
      </body>
    </html>
  )
}
