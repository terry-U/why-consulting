'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'
import { Session } from '@/lib/supabase'
import { getUserSessions, createNewSession } from '@/lib/sessions'
import { getUserConsultationHistory, SessionWithHistory } from '@/lib/history'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import * as React from 'react'

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
import AsyncButton from '@/components/common/AsyncButton'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [sessions, setSessions] = useState<SessionWithHistory[]>([])
  const [tickets, setTickets] = useState<number | null>(null)
  const [showBuyPopup, setShowBuyPopup] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth')
      return
    }

    // 결제만 확인 (홈에서는 온보딩 자동 이동 금지)
    (async () => {
      try {
        // 1) 결제 여부 확인
        const res = await fetch(`/api/user/status?userId=${user.id}`)
        const data = await res.json()
        const isPaid = !!data?.user?.is_paid_user
        setTickets(typeof data?.user?.remaining_tickets === 'number' ? data.user.remaining_tickets : null)

        if (!isPaid) {
          router.replace('/pay')
          return
        }
        // 홈에서는 자동 시작하지 않음. 사용자가 명시적으로 CTA를 눌러야 시작
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

      // 결제 게이트 확인(서버가 이중으로 차단하지만 UI도 보호)
      const res = await fetch(`/api/user/status?userId=${user.id}`)
      const js = await res.json()
      if (!js?.user?.is_paid_user) {
        router.replace('/pay')
        return
      }
      if (typeof js?.user?.remaining_tickets === 'number') {
        setTickets(js.user.remaining_tickets)
        if (js.user.remaining_tickets <= 0) { setShowBuyPopup(true); return }
      }

      const newSession = await createNewSession(user.id)
      // 세션 생성이 성공하면 서버에서 1장 차감되었으므로 UI도 즉시 반영
      if (typeof tickets === 'number') setTickets(Math.max(0, tickets - 1))
      router.replace(`/session/${newSession.id}`)
    } catch (error: any) {
      console.error('새 세션 생성 오류:', error)
      const msg = String(error?.message || '')
      if (msg.includes('NO_TICKETS') || msg.includes('402')) { setShowBuyPopup(true); return }
      alert('새 상담을 시작할 수 없습니다. 다시 시도해주세요.')
    }
  }

  if (authLoading || loading) {
    return (
      <ResponsiveLayout>
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
          <div />
        </div>

        {/* 레이어 구매 팝업 */}
        {showBuyPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowBuyPopup(false)} />
            <div className="relative z-10 w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{background:'rgba(255,255,255,0.85)'}}>
              <h3 className="text-lg font-semibold mb-2">상담권이 필요합니다</h3>
              <p className="text-sm text-gray-600 mb-4">남은 상담권이 없습니다. 지금 5장을 9,900원에 구매해 바로 상담을 시작하시겠어요?</p>
              <div className="flex justify-end gap-2">
                <button className="btn px-4 py-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={() => setShowBuyPopup(false)}>나중에</button>
                <button className="btn btn-primary px-4 py-2 rounded-full text-white" onClick={() => router.push('/pay')}>지금 구매하기</button>
                {/* 테스트용 티켓 충전 버튼 (개발 환경 전용) */}
                <button
                  className="btn px-4 py-2 rounded-full text-gray-700 bg-green-100 hover:bg-green-200"
                  onClick={async () => {
                    try {
                      if (!user) return
                      const res = await fetch('/api/user/add-tickets', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, amount: 10 })
                      })
                      const js = await res.json()
                      if (!res.ok || !js?.success) throw new Error(js?.error || '충전 실패')
                      // UI 갱신
                      setTickets((prev) => typeof prev === 'number' ? prev + 10 : 10)
                      setShowBuyPopup(false)
                      alert('테스트용으로 상담권 10장을 충전했습니다.')
                    } catch (e) {
                      alert('충전에 실패했습니다.')
                    }
                  }}
                >
                  테스트로 10장 충전
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 메인 CTA */}
        <div className="mb-8">
          <AsyncButton
            onClickAsync={handleNewSession}
            className="w-full btn btn-primary py-8 px-6 text-white font-semibold rounded-3xl text-left"
            aria-label="새로운 Why 찾기 시작하기"
            persistBusyOnSuccess={true}
            busyText="세션 준비 중…"
          >
            <div className="text-left">
              <div className="text-3xl mb-3">🌟</div>
              <div className="text-xl mb-2">새로운 Why 찾기</div>
              <p className="text-gray-200 text-sm opacity-90">
                8명의 질문자와 함께하는 특별한 여정
              </p>
            </div>
          </AsyncButton>
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
              <div className="text-2xl font-bold text-yellow-600">{tickets === null ? '-' : `${tickets}장`}</div>
              <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => router.push('/pay')}>
                구매하기
              </button>
            </div>
          </div>
        </div>

        {/* 세션 목록 */}
        <div className="space-y-6">
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
              <AsyncButton
                onClickAsync={handleNewSession}
                className="btn btn-primary text-white px-6 py-3 rounded-full font-medium"
                aria-label="첫 상담 시작하기"
                persistBusyOnSuccess={true}
                busyText="세션 준비 중…"
              >
                첫 상담 시작하기
              </AsyncButton>
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
