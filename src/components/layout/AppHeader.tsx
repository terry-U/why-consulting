'use client'

import Link from 'next/link'

export default function AppHeader() {
  return (
    <header className="w-full border-b border-white/30 bg-white/60 backdrop-blur-md safe-area-top">
      <div className="ui-container flex items-center justify-between py-3">
        <Link href="/home" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
          <span className="text-xl">🌟</span>
          <span className="font-semibold">WHY</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/home" className="btn px-3 text-sm">홈</Link>
          <Link href="/onboarding" className="btn px-3 text-sm">온보딩</Link>
        </nav>
      </div>
    </header>
  )
}


