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
        <div className="fixed inset-0 z-0 pointer-events-none select-none app-bg" aria-hidden="true">
          {/* Subtle animated gradient blobs (design-ref/extracted 스타일 차용) */}
          <div
            className="absolute -top-24 -left-24 w-[70vw] h-[50vh] blur-2xl opacity-80 animate-blobA"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 50%, #fff6e5 0%, rgba(255,246,229,0) 60%)'
            }}
          />
          <div
            className="absolute -top-20 -right-24 w-[60vw] h-[45vh] blur-2xl opacity-80 animate-blobB"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 50%, #eaf3ff 0%, rgba(234,243,255,0) 60%)'
            }}
          />
          {/* Pink attention layer */}
          <div
            className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2 w-[70vw] max-w-[1200px] h-[40vh] rounded-full blur-3xl animate-attn"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 50%, rgba(255, 182, 193, 0.55) 0%, rgba(255, 182, 193, 0) 60%), radial-gradient(60% 60% at 60% 40%, rgba(255, 105, 180, 0.35) 0%, rgba(255, 105, 180, 0) 60%)'
            }}
          />
        </div>
        <div className="relative z-10">
          <AppChrome>
            {children}
          </AppChrome>
        </div>
      </body>
    </html>
  )
}
