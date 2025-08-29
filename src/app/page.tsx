'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          // 로그인된 사용자는 홈 대시보드로
          router.push('/home')
        } else {
          // 비로그인 사용자는 랜딩 페이지 표시
          setLoading(false)
        }
      } catch (error) {
        // 인증 오류 시 랜딩 페이지 표시
        setLoading(false)
      }
    }

    checkAuthAndRedirect()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  // 랜딩 페이지 (비로그인 사용자용)
  return (
    <div className="min-h-screen">
      {/* Hero Section - 미니멀, 좌측 정렬 */}
      <div className="ui-container py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-5xl">🌟</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            당신답게 사는 기준을 찾는<br />8개의 질문
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            복잡한 삶 속에서 진정한 나의 동기를 발견하고<br />
            더 나다운 삶으로 나아갈 수 있는 한 문장을 찾아보세요
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth?next=/pay')}
              className="btn btn-primary text-white text-xl font-semibold px-8 py-4 rounded-full"
            >
              상담 시작하기
            </button>
            <p className="text-gray-500">첫 상담권 10장 포함 • ₩299,000</p>
          </div>

          {/* 가치 제안 - 타이포 중심 */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-gray-700 text-lg">정교한 8문항으로 핵심 동기 발견</p>
            </div>
            <div>
              <div className="text-3xl mb-2">🤝</div>
              <p className="text-gray-700 text-lg">정서적 안전을 보장하는 대화 흐름</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📈</div>
              <p className="text-gray-700 text-lg">일상에서 바로 쓰는 행동 가이드</p>
            </div>
          </div>
        </div>
      </div>

      {/* 프로세스 - 단순 리스트 */}
      <div className="py-12 border-t border-gray-200">
        <div className="ui-container max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">어떻게 진행되나요?</h2>
          <ul className="space-y-4 text-lg text-gray-800">
            <li>1️⃣ 온보딩으로 흐름을 이해합니다</li>
            <li>2️⃣ 8개의 질문에 차례대로 답합니다</li>
            <li>3️⃣ 당신만의 Why 문장을 도출합니다</li>
            <li>4️⃣ 일상 적용 가이드를 받습니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}