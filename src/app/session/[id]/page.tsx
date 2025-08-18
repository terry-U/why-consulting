'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getSessionById } from '@/lib/sessions'
import { Session } from '@/lib/supabase'

export default function SessionPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<Session | null>(null)
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
            <p className="text-gray-600 text-sm">
              단계: {session.counseling_phase}
            </p>
          </div>
          <div></div> {/* 균형을 위한 빈 div */}
        </div>

        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-colors ${
                  index < session.current_question_index 
                    ? 'bg-yellow-500' 
                    : index === session.current_question_index
                    ? 'bg-yellow-300'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-gray-600 mt-2">
            질문 {session.current_question_index + 1} / 8
          </p>
        </div>

        {/* 상담 인터페이스 영역 */}
        <div className="bg-white rounded-2xl shadow-lg min-h-[500px] flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              상담 인터페이스 구현 중
            </h3>
            <p className="text-gray-600">
              곧 완성될 예정입니다
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
