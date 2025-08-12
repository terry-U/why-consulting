'use client'

import { useEffect, useState } from 'react'
import { Session, Message } from '@/lib/supabase'

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
        const res = await fetch(`/api/session?userId=${userId}&mode=listWithLast`)
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
          {sessions.map((s: Session & { last_message?: Message }) => (
            <li key={s.id} className="py-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="font-medium truncate">세션 {s.id.substring(0, 6)} · {s.status}</p>
                <p className="text-xs text-gray-500 truncate">{new Date(s.updated_at).toLocaleString('ko-KR')}</p>
                {s.last_message && (
                  <p className="text-sm text-gray-600 mt-1 truncate">마지막: {s.last_message.content}</p>
                )}
              </div>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  window.location.reload()
                }}
                className="text-blue-600 text-sm flex-shrink-0"
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


