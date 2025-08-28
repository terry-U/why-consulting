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
      <body>
        <AppChrome>
          {children}
        </AppChrome>
      </body>
    </html>
  )
}
