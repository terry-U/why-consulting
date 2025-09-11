'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AppHeader() {
  const [isDark, setIsDark] = useState(false)
  useEffect(() => { /* 테마 토글 제거로 초기화만 유지 */ setIsDark(false) }, [])

  return (
    <header className="w-full border-b border-white/20 bg-transparent safe-area-top">
      <div className="ui-container flex items-center justify-between py-3">
        <a className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity" aria-label="홈으로" href="/home">
          <span className="text-xl">🌟</span><span className="font-semibold">WHY</span>
        </a>
        <a
          href="/auth"
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="로그아웃"
          title="로그아웃"
          onClick={(e) => {
            e.preventDefault();
            // soft navigate to trigger logout route if exists; otherwise fallback client hook
            fetch('/api/auth/signout', { method: 'POST' }).finally(() => {
              window.location.href = '/auth';
            });
          }}
        >
          로그아웃
        </a>
      </div>
    </header>
  )
}


