'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser, signOut } from '@/lib/auth'
import { Session } from '@/lib/supabase'
import { getUserSessions, createNewSession } from '@/lib/sessions'
import { getUserConsultationHistory, SessionWithHistory } from '@/lib/history'
import dynamic from 'next/dynamic'

// 지연 로딩으로 성능 최적화
const ConsultationHistoryList = dynamic(
  () => import('@/components/history/consultation-history-list'),
  { 
    loading: () => <SkeletonLoader type="session" count={3} />,
    ssr: false
  }
)
import { DashboardSkeleton } from '@/components/common/skeleton-loader'
import SkeletonLoader from '@/components/common/skeleton-loader'
import ResponsiveLayout from '@/components/layout/responsive-layout'

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [sessions, setSessions] = useState<SessionWithHistory[]>([])
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
        
        // 사용자 상담 히스토리 가져오기
        try {
          const userHistory = await getUserConsultationHistory(currentUser.id)
          setSessions(userHistory)
        } catch (error) {
          console.error('히스토리 로딩 오류:', error)
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
      <ResponsiveLayout className="bg-gradient-to-br from-yellow-50 to-orange-100">
        <DashboardSkeleton />
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout className="bg-gradient-to-br from-yellow-50 to-orange-100">
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
          
          <ConsultationHistoryList
            history={sessions}
            onSelectSession={(sessionId) => {
              const session = sessions.find(s => s.id === sessionId)
              if (session?.status === 'completed' && session.whyStatement) {
                router.push(`/session/${sessionId}/why`)
              } else {
                router.push(`/session/${sessionId}`)
              }
            }}
            onDeleteSession={async (sessionId) => {
              try {
                // TODO: 삭제 API 구현
                setSessions(sessions.filter(s => s.id !== sessionId))
              } catch (error) {
                console.error('세션 삭제 오류:', error)
                alert('세션 삭제에 실패했습니다.')
              }
            }}
          />
          
          {sessions.length === 0 && (
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
    </ResponsiveLayout>
  )
}
