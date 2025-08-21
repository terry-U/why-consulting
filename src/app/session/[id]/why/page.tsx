'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getSessionById } from '@/lib/sessions'
import { Session } from '@/lib/supabase'
import WhyCandidates from '@/components/why/why-candidates'
import { parseWhyCandidates } from '@/lib/why-generation'

export default function WhyPage() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [finalWhy, setFinalWhy] = useState<string | null>(null)
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  useEffect(() => {
    const loadWhyData = async () => {
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

        // Why 문장이 이미 생성되어 있는지 확인
        if (sessionData.generated_why) {
          setFinalWhy(sessionData.generated_why)
        } else {
          // Why 문장 생성 API 호출
          await generateWhy(sessionId, currentUser.id)
        }

      } catch (error) {
        console.error('Why 페이지 로딩 오류:', error)
        router.push('/home')
      } finally {
        setLoading(false)
      }
    }

    if (sessionId) {
      loadWhyData()
    }
  }, [sessionId, router])

  const generateWhy = async (sessionId: string, userId: string) => {
    try {
      const response = await fetch('/api/why-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, userId }),
      })

      const data = await response.json()

      if (data.success) {
        setCandidates(data.candidates || [])
        if (data.defaultWhy) {
          setFinalWhy(data.defaultWhy)
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Why 생성 오류:', error)
      alert('Why 문장 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleFinalizeWhy = async (selectedWhy: string) => {
    try {
      setFinalWhy(selectedWhy)
      
      // 세션 완료 처리
      const response = await fetch(`/api/session/${sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ finalWhy: selectedWhy }),
      })

      if (response.ok) {
        // 완료 페이지로 이동하거나 홈으로 이동
        setTimeout(() => {
          router.push('/home')
        }, 3000)
      }
    } catch (error) {
      console.error('Why 확정 오류:', error)
      alert('Why 문장 확정에 실패했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">당신의 Why를 생성하는 중...</p>
          <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  if (finalWhy && candidates.length === 0) {
    // 최종 확정된 상태
    return (
      <div className="min-h-screen ui-container py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-8">✨</div>
          <h1 className="text-3xl font-bold mb-6">축하합니다! 🎉</h1>
          <div className="card p-8 mb-8">
            <h2 className="text-xl font-semibold mb-4">당신의 Why</h2>
            <p className="text-2xl font-medium leading-relaxed">"{finalWhy}"</p>
          </div>
          <p className="text-gray-500 mb-8">이 문장을 마음에 새기고 더 당신다운 삶을 살아가세요</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push(`/session/${sessionId}/report`)}
              className="btn btn-primary text-white text-lg font-semibold py-4 px-8 rounded-full"
            >
              보고서 보기
            </button>
            <button
              onClick={() => router.push('/home')}
              className="btn text-lg font-semibold py-4 px-8 rounded-full"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ui-container py-12">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push(`/session/${sessionId}`)}
          className="mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 상담으로 돌아가기
        </button>

        {/* Why 후보 선택 */}
        {candidates.length > 0 ? (
          <WhyCandidates 
            candidates={candidates} 
            onFinalize={handleFinalizeWhy}
          />
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold mb-2">Why 문장을 생성하는 중입니다</h2>
            <p className="text-gray-500">조금만 더 기다려주세요...</p>
          </div>
        )}
      </div>
    </div>
  )
}
