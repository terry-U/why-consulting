'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AppHeader() {
  const [isDark, setIsDark] = useState(false)

  // 초기 테마 결정: localStorage > prefers-color-scheme
  useEffect(() => {
    try {
      const saved = localStorage.getItem('theme')
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const shouldDark = saved ? saved === 'dark' : prefersDark
      setIsDark(shouldDark)
      document.documentElement.classList.toggle('dark', shouldDark)
    } catch {}
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('theme', next ? 'dark' : 'light') } catch {}
  }

  return (
    <header className="w-full border-b border-white/30 bg-white/60 backdrop-blur-md safe-area-top">
      <div className="ui-container flex items-center justify-between py-3">
        <Link href="/home" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity" aria-label="홈으로">
          <span className="text-xl">🌟</span>
          <span className="font-semibold">WHY</span>
        </Link>
        <nav className="flex items-center gap-2">
          <button onClick={toggleTheme} className="btn px-3 text-sm" aria-label="테마 전환">
            {isDark ? '라이트' : '다크'}
          </button>
          <Link href="/home" className="btn px-3 text-sm" aria-label="홈">홈</Link>
          <Link href="/onboarding" className="btn px-3 text-sm" aria-label="온보딩">온보딩</Link>
        </nav>
      </div>
    </header>
  )
}


