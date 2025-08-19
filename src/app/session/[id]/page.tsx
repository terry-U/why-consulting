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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상담 세션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            세션을 찾을 수 없습니다
          </h2>
          <button
            onClick={() => router.push('/home')}
            className="text-yellow-600 hover:text-yellow-700 underline"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/home')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 홈으로 돌아가기
          </button>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900">
              상담 진행 중
            </h1>
          </div>
          <div></div> {/* 균형을 위한 빈 div */}
        </div>



        {/* 상담 인터페이스 영역 */}
        <div className="bg-white rounded-2xl shadow-lg h-[600px] overflow-hidden">
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
