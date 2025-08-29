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

    // 결제/온보딩/첫 세션 자동 시작 분기
    (async () => {
      try {
        // 1) 결제 여부 확인
        const res = await fetch(`/api/user/status?userId=${user.id}`)
        const data = await res.json()
        const isPaid = !!data?.user?.is_paid_user

        if (!isPaid) {
          router.push('/pay')
          return
        }

        // 2) 온보딩 체크(기기 기준). 미완료면 온보딩으로
        try {
          const seen = typeof window !== 'undefined' && localStorage.getItem('onboarding_seen') === 'true'
          if (!seen) {
            router.push('/onboarding?autoStart=1')
            return
          }
        } catch {}

        // 3) 첫 상담 자동 시작: 활성 세션 없으면 생성해서 바로 세션으로 이동
        try {
          const resp = await fetch(`/api/session?userId=${user.id}`)
          const js = await resp.json()
          const active = js?.session
          if (!active) {
            // 서버 API에 활성 세션 생성 로직이 없으므로, 홈의 NewSession 버튼과 동일한 경로 사용을 위해 클라이언트 생성
            const created = await createNewSession(user.id as any)
            router.push(`/session/${created.id}`)
            return
          }
        } catch {}
      } catch {}
    })()

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
            className="w-full btn btn-primary py-8 px-6 text-white font-semibold rounded-3xl text-left"
            aria-label="새로운 Why 찾기 시작하기"
          >
            <div className="text-left">
              <div className="text-3xl mb-3">🌟</div>
              <div className="text-xl mb-2">새로운 Why 찾기</div>
              <p className="text-gray-200 text-sm opacity-90">
                8명의 질문자와 함께하는 특별한 여정
              </p>
            </div>
          </button>
        </div>

        {/* 질문자 소개 섹션 제거 */}

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
          <h2 className="text-xl font-semibold text-gray-900">내 대화 기록</h2>
          
          <ConsultationHistoryList
            history={sessions}
            onSelectSession={(sessionId) => {
              const session = sessions.find(s => s.id === sessionId)
              // 완료/요약 상태이거나 Why가 생성된 경우엔 보고서로 이동
              if (
                session?.status === 'completed' ||
                session?.counseling_phase === 'summary' ||
                session?.generated_why
              ) {
                router.push(`/session/${sessionId}/report`)
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
                aria-label="첫 상담 시작하기"
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
