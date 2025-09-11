import './globals.css'
import AppChrome from '@/components/layout/AppChrome'

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
      <body className="min-h-screen">
        <div className="fixed inset-0 z-0 pointer-events-none select-none app-bg" aria-hidden="true" />
        <div className="relative z-10">
          <AppChrome>
            {children}
          </AppChrome>
        </div>
      </body>
    </html>
  )
}
