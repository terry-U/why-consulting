'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { Session } from '@/lib/supabase'
import { getUserSessions, createNewSession } from '@/lib/sessions'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push('/auth')
          return
        }

        setUser(currentUser)
        
        // 사용자 세션 목록 가져오기
        try {
          const userSessions = await getUserSessions(currentUser.id)
          setSessions(userSessions)
        } catch (error) {
          console.error('세션 목록 로딩 오류:', error)
          setSessions([])
        }
      } catch (error) {
        console.error('사용자 데이터 로딩 오류:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [router])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('로그아웃 오류:', error)
    }
  }

  const handleNewSession = async () => {
    try {
      if (!user) return
      
      const newSession = await createNewSession(user.id)
      router.push(`/onboarding?sessionId=${newSession.id}`)
    } catch (error) {
      console.error('새 세션 생성 오류:', error)
      alert('새 상담을 시작할 수 없습니다. 다시 시도해주세요.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              안녕하세요! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            로그아웃
          </button>
        </div>

        {/* 심볼 영역 */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl mb-4 animate-pulse">
            🌟
          </div>
          <p className="text-lg text-gray-700">
            오늘도 나답게 살아가고 계신가요?
          </p>
        </div>

        {/* 새 상담 시작 CTA */}
        <div className="mb-8">
          <button
            onClick={handleNewSession}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xl font-semibold py-6 px-8 rounded-2xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl">✨</span>
              <span>새 상담 시작하기</span>
            </div>
            <p className="text-yellow-100 text-sm mt-2">
              당신의 Why를 찾아가는 여정을 시작해보세요
            </p>
          </button>
        </div>

        {/* 티켓 지갑 */}
        <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">상담권</h3>
              <p className="text-gray-600 text-sm">남은 상담 횟수</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-yellow-600">10장</div>
              <button className="text-sm text-gray-500 hover:text-gray-700">
                구매하기
              </button>
            </div>
          </div>
        </div>

        {/* 세션 목록 */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">내 상담 기록</h2>
          
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                첫 상담을 시작해볼까요?
              </h3>
              <p className="text-gray-600 mb-6">
                8개의 질문을 통해 당신만의 Why를 발견해보세요
              </p>
              <button
                onClick={handleNewSession}
                className="bg-yellow-500 text-white px-6 py-3 rounded-full font-medium hover:bg-yellow-600 transition-colors"
              >
                첫 상담 시작하기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/session/${session.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        상담 #{session.id.slice(0, 8)}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {new Date(session.created_at).toLocaleDateString('ko-KR')}
                      </p>
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          session.status === 'active' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : session.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status === 'active' ? '진행 중' : 
                           session.status === 'completed' ? '완료' : '일시정지'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <button className="text-yellow-600 hover:text-yellow-700 font-medium">
                        {session.status === 'active' ? '이어서 하기' : '다시 보기'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 온보딩 다시보기 */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/onboarding')}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            온보딩 다시보기
          </button>
        </div>
      </div>
    </div>
  )
}
