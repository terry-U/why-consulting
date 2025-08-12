'use client'

import { useEffect, useState } from 'react'
import { Session } from '@/lib/supabase'

interface Props {
  userId?: string
  onStartNew: () => void
}

export default function SessionList({ userId, onStartNew }: Props) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/session?userId=${userId}&mode=list`)
        const data = await res.json()
        if (data.success) setSessions(data.sessions || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId])

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">내 상담</h2>
      <button
        onClick={onStartNew}
        className="w-full mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg shadow hover:shadow-md"
      >
        새로운 상담 시작하기
      </button>

      {loading ? (
        <p className="text-gray-500">불러오는 중...</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500">진행 중인 상담이 없습니다.</p>
      ) : (
        <ul className="divide-y">
          {sessions.map((s) => (
            <li key={s.id} className="py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">세션 {s.id.substring(0, 6)}</p>
                <p className="text-xs text-gray-500">{s.status} · {new Date(s.updated_at).toLocaleString('ko-KR')}</p>
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  // 단순히 새로고침으로 서버 세션 상태를 유지한 채 이어서 하게 함
                  window.location.reload()
                }}
                className="text-blue-600 text-sm"
              >
                이어서 진행
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


