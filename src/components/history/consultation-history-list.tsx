'use client'

import { useState } from 'react'
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

  const toggleExpanded = (sessionId: string) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId)
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
                    상담 #{session.id.slice(0, 8)}
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
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExpanded(session.id)
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {expandedSession === session.id ? '▲' : '▼'}
                  </button>
                  
                  {onDeleteSession && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm('이 상담 기록을 삭제하시겠습니까?')) {
                          onDeleteSession(session.id)
                        }
                      }}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-2">
                {new Date(session.created_at).toLocaleDateString('ko-KR')} • 
                메시지 {session.messageCount || 0}개
              </p>
              
              {/* Why 문장 (완료된 경우) */}
              {session.whyStatement && (
                <div className="mt-3 card p-3">
                  <p className="text-sm font-medium text-gray-600 mb-1">도출된 Why</p>
                  <p className="text-gray-900 font-medium">"{session.whyStatement}"</p>
                </div>
              )}
              
              {/* 마지막 메시지 (진행 중인 경우) */}
              {!session.whyStatement && session.lastMessage && (
                <div className="mt-3 card p-3">
                  <p className="text-sm text-gray-700 truncate">💬 {session.lastMessage}</p>
                </div>
              )}
            </div>

            {/* 확장된 상세 정보 */}
            {expandedSession === session.id && (
              <div className="border-t border-gray-200 p-4 bg-white/60 backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">상담 단계:</span>
                    <span className="ml-2 text-gray-600">
                      {session.counseling_phase === 'questions' ? `질문 ${session.current_question_index}/8` :
                       session.counseling_phase === 'summary' ? '요약 중' :
                       session.counseling_phase === 'completed' ? '완료' : '알 수 없음'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">진행률:</span>
                    <span className="ml-2 text-gray-600">
                      {session.counseling_phase === 'completed' ? '100%' :
                       session.counseling_phase === 'questions' ? `${Math.round((session.current_question_index / 8) * 100)}%` :
                       session.counseling_phase === 'summary' ? '90%' : '5%'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">생성일:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(session.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">수정일:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(session.updated_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                </div>
                
                {/* 답변 요약 (있는 경우) */}
                {session.answers && Object.keys(session.answers).length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-700 mb-2">답변 요약:</p>
                    <div className="space-y-2">
                      {Object.entries(session.answers).map(([questionId, answer]) => (
                        <div key={questionId} className="text-sm">
                          <span className="font-medium text-gray-600">{questionId}:</span>
                          <span className="ml-2 text-gray-800">
                            {typeof answer === 'string' && answer.length > 100 
                              ? answer.substring(0, 100) + '...' 
                              : answer}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
