'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AppHeader() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => { /* 테마 토글 제거로 초기화만 유지 */ setIsDark(false) }, [])

  return (
    <header className="w-full border-b border-white/30 bg-white/60 backdrop-blur-md safe-area-top">
      <div className="ui-container flex items-center justify-between py-3">
        <Link href="/home" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity" aria-label="홈으로">
          <span className="text-xl">🌟</span>
          <span className="font-semibold">WHY</span>
        </Link>
        <div />
      </div>
    </header>
  )
}


