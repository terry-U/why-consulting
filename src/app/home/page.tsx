'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Session } from '@/lib/supabase'
import { getUserSessions, createNewSession } from '@/lib/sessions'
import { getUserConsultationHistory, SessionWithHistory } from '@/lib/history'
import { useAuth } from '@/hooks/useAuth'
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
  const { user, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionWithHistory[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth')
      return
    }

    // 최초 로그인 한 번만 온보딩 자동 표시 (로컬 디바이스 기준)
    try {
      const seen = typeof window !== 'undefined' && localStorage.getItem('onboarding_seen') === 'true'
      if (!seen) {
        router.push('/onboarding')
        return
      }
    } catch (e) {
      // localStorage 접근 불가 시 무시
    }

    const loadUserData = async () => {
      try {
        // 사용자 상담 히스토리 가져오기
        const userHistory = await getUserConsultationHistory(user.id)
        setSessions(userHistory)
      } catch (error) {
        console.error('히스토리 로딩 오류:', error)
        setSessions([])
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user, authLoading, router])

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
      // 요구사항: 상담 시작 시에는 온보딩을 보여주지 않고 바로 세션으로 이동
      router.push(`/session/${newSession.id}`)
    } catch (error) {
      console.error('새 세션 생성 오류:', error)
      alert('새 상담을 시작할 수 없습니다. 다시 시도해주세요.')
    }
  }

  if (authLoading || loading) {
    return (
      <ResponsiveLayout className="bg-gradient-to-br from-yellow-50 to-orange-100">
        <DashboardSkeleton />
      </ResponsiveLayout>
    )
  }

  return (
    <ResponsiveLayout>
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold">
              다시 만나서 반가워요 😊
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {user?.email?.split('@')[0]}님
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="icon-btn text-gray-500"
          >
            로그아웃
          </button>
        </div>

        {/* 메인 CTA */}
        <div className="mb-8">
          <button
            onClick={handleNewSession}
            className="w-full btn btn-primary py-8 px-6 text-white font-semibold rounded-3xl"
          >
            <div className="text-center">
              <div className="text-3xl mb-3">🌟</div>
              <div className="text-xl mb-2">새로운 Why 찾기</div>
              <p className="text-gray-200 text-sm opacity-90">
                8명의 상담사와 함께하는 특별한 여정
              </p>
            </div>
          </button>
        </div>

        {/* 상담사 소개 */}
        <div className="card p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상담사 팀</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3">
              <div className="text-2xl mb-2">🌞</div>
              <div className="text-sm font-medium text-gray-900">옐로</div>
              <div className="text-xs text-gray-600">성취 탐구</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl mb-2">🦋</div>
              <div className="text-sm font-medium text-gray-900">비비</div>
              <div className="text-xs text-gray-600">감정 탐구</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl mb-2">🌿</div>
              <div className="text-sm font-medium text-gray-900">그린</div>
              <div className="text-xs text-gray-600">꿈 탐구</div>
            </div>
            <div className="text-center p-3">
              <div className="text-2xl mb-2">🌟</div>
              <div className="text-sm font-medium text-gray-900">지혜</div>
              <div className="text-xs text-gray-600">Why 도출</div>
            </div>
          </div>
        </div>

        {/* 티켓 지갑 */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">상담권</h3>
              <p className="text-gray-500 text-sm">남은 상담 횟수</p>
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
            <div className="card p-8 text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold mb-2">
                첫 상담을 시작해볼까요?
              </h3>
              <p className="text-gray-500 mb-6">
                8개의 질문을 통해 당신만의 Why를 발견해보세요
              </p>
              <button
                onClick={handleNewSession}
                className="btn btn-primary text-white px-6 py-3 rounded-full font-medium"
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
