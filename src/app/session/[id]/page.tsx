'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getSessionById } from '@/lib/sessions'
import { getSessionMessages } from '@/lib/messages'
import { Session, Message } from '@/lib/supabase'
import ChatInterface from '@/components/chat/chat-interface'

export default function SessionPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  useEffect(() => {
    const loadSessionData = async () => {
      try {
        // 사용자 인증 확인
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }
        setUser(currentUser)

        // 세션 데이터 가져오기
        const sessionData = await getSessionById(sessionId)
        if (!sessionData) {
          router.push('/home')
          return
        }

        // 세션 소유자 확인
        if (sessionData.user_id !== currentUser.id) {
          router.push('/home')
          return
        }

        // 완료된 상담 또는 요약 상태면 바로 리포트 페이지로 이동
        if (
          sessionData.status === 'completed' ||
          sessionData.counseling_phase === 'summary' ||
          !!sessionData.generated_why
        ) {
          router.replace(`/session/${sessionId}/report`)
          return
        }

        setSession(sessionData)

        // 세션 메시지 가져오기
        try {
          const sessionMessages = await getSessionMessages(sessionId)
          setMessages(sessionMessages)
        } catch (error) {
          console.error('메시지 로딩 오류:', error)
          setMessages([])
        }
      } catch (error) {
        console.error('세션 데이터 로딩 오류:', error)
        router.push('/home')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-500">상담 세션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">
            세션을 찾을 수 없습니다
          </h2>
          <button
            onClick={() => router.push('/home')}
            className="underline text-gray-600 hover:text-gray-800"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="h-full flex flex-col">
        {/* 상단 고정 헤더 (뒤로가기 + 질문 텍스트) */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="mx-auto max-w-4xl w-full px-6 py-3 flex items-center gap-4 rounded-b-xl border-b border-white/30 bg-white/60 backdrop-blur-md shadow-sm">
            <button
              onClick={() => router.push('/home')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 홈으로 돌아가기
            </button>
            {session && (
              <div className="flex-1">
                <p className="text-xs text-gray-500">질문 {session.current_question_index}/8</p>
                {session.counseling_phase === 'questions' && (
                  <p className="text-base font-semibold text-gray-900 truncate">{`당신이 가장 뿌듯했던 경험은 무엇인가요?`}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 상담 인터페이스 영역 (단일 스크롤 영역 확보) */}
        <div className="h-full overflow-hidden">
          <ChatInterface
            session={session}
            initialMessages={messages}
            onSessionUpdate={(updatedSession) => setSession(updatedSession)}
          />
        </div>
      </div>
    </div>
  )
}
