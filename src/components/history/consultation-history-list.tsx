'use client'

import { useMemo, useState } from 'react'
import { SessionWithHistory } from '@/lib/history'

interface ConsultationHistoryListProps {
  history: SessionWithHistory[]
  onSelectSession: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
}

export default function ConsultationHistoryList({ 
  history, 
  onSelectSession,
  onDeleteSession 
}: ConsultationHistoryListProps) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  const ordinalMap = useMemo(() => {
    const toMs = (v: any) => new Date(v || '').getTime()
    const arr = [...history].sort((a, b) => {
      const as = toMs((a as any).started_at || (a as any).created_at || (a as any).createdAt)
      const bs = toMs((b as any).started_at || (b as any).created_at || (b as any).createdAt)
      return as - bs
    })
    const map = new Map<string, number>()
    arr.forEach((s, i) => map.set(s.id, i + 1))
    return map
  }, [history])

  const toKoreanOrdinal = (n?: number) => {
    if (!n || n < 1) return '상담'
    const dict: Record<number, string> = {
      1: '첫번째', 2: '두번째', 3: '세번째', 4: '네번째', 5: '다섯번째', 6: '여섯번째', 7: '일곱번째', 8: '여덟번째', 9: '아홉번째', 10: '열번째',
      11: '열한번째', 12: '열두번째', 13: '열세번째', 14: '열네번째', 15: '열다섯번째', 16: '열여섯번째', 17: '열일곱번째', 18: '열여덟번째', 19: '열아홉번째', 20: '스무번째',
    }
    return dict[n] || `${n}번째`
  }

  const formatRelative = (value?: any) => {
    if (!value) return '-'
    const d = new Date(value)
    if (isNaN(d.getTime())) return '-'
    const now = Date.now()
    const diffMs = now - d.getTime()
    const min = 60 * 1000
    const hour = 60 * min
    const day = 24 * hour
    const week = 7 * day
    if (diffMs < min) return '얼마 전'
    if (diffMs < hour) return `${Math.floor(diffMs / min)}분 전`
    if (diffMs < day) return `${Math.floor(diffMs / hour)}시간 전`
    if (diffMs < week) return `${Math.floor(diffMs / day)}일 전`
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const da = String(d.getDate()).padStart(2, '0')
    return `${y}.${m}.${da}`
  }

  const formatDate = (value?: any, withTime = false) => {
    if (!value) return '-'
    const d = new Date(value)
    if (isNaN(d.getTime())) return '-'
    return withTime ? d.toLocaleString('ko-KR') : d.toLocaleDateString('ko-KR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-yellow-100 text-yellow-800'
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'active':
        return '진행 중'
      case 'paused':
        return '일시정지'
      default:
        return '알 수 없음'
    }
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          아직 상담 기록이 없습니다
        </h3>
        <p className="text-gray-600">
          첫 상담을 시작해보세요
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">상담 히스토리</h2>
        <span className="text-sm text-gray-500">총 {history.length}회</span>
      </div>
      
      <div className="space-y-3">
        {history.map((session) => (
          <div 
            key={session.id}
            className="card overflow-hidden"
          >
            {/* 기본 정보 */}
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onSelectSession(session.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900">
                    {toKoreanOrdinal(ordinalMap.get(session.id))} 상담
                  </h3>
                  {(() => {
                    const effectiveDone = session.status === 'completed' || session.counseling_phase === 'summary' || !!session.whyStatement || !!session.generated_why
                    const effectiveStatus = effectiveDone ? 'completed' : session.status
                    return (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(effectiveStatus)}`}>
                        {getStatusText(effectiveStatus)}
                      </span>
                    )
                  })()}
                </div>
                
                <div className="text-xs text-gray-500">
                  {(session.status === 'completed' || session.counseling_phase === 'summary' || !!session.whyStatement)
                    ? (<>{formatRelative((session as any).updated_at || (session as any).updatedAt)} 상담 종료</>)
                    : (<>{formatRelative((session as any).started_at || (session as any).created_at || (session as any).createdAt)} 상담 시작</>)}
                </div>
              </div>
              
              {/* Why 문장 (완료된 경우) */}
              {session.whyStatement && (
                <div className="mt-3 card p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">나의 Why 한문장</p>
                  <p className="text-gray-900 font-medium">"{session.whyStatement}"</p>
                </div>
              )}
              
              {/* 마지막 메시지 (진행 중인 경우) */}
              {!session.whyStatement && session.lastMessage && (
                <div className="mt-3 card p-3">
                  <p className="text-sm text-gray-700 line-clamp-3">💬 {session.lastMessage}</p>
                </div>
              )}
            </div>

            {/* 확장 정보/삭제/토글 제거 */}
          </div>
        ))}
      </div>
    </div>
  )
}
