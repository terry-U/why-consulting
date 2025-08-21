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
      {/* Hero Section */}
      <div className="ui-container py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* 심볼 영역 */}
          <div className="mb-8">
            <div className="neo w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl">
              🌟
            </div>
          </div>

          {/* 헤드카피 */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            당신답게 사는 기준을 찾는<br />
            <span className="text-gray-700">8개의 질문</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
            복잡한 삶 속에서 진정한 나의 동기를 발견하고<br />
            더 나다운 삶으로 나아갈 수 있는 한 문장을 찾아보세요
          </p>

          {/* CTA 버튼들 */}
          <div className="space-y-4">
            <button
              onClick={() => router.push('/auth')}
              className="w-full max-w-md mx-auto block btn btn-primary text-white text-xl font-semibold py-4 px-8 rounded-full"
            >
              상담 시작하기
            </button>
            
            <p className="text-gray-600">
              첫 상담권 10장 포함 • ₩299,000
            </p>
          </div>

          {/* 가치 제안 */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">정확한 진단</h3>
              <p className="text-gray-600">
                8개의 정교한 질문으로<br />
                당신의 핵심 동기를 발견
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">안전한 환경</h3>
              <p className="text-gray-600">
                정서적 안전을 보장하는<br />
                전문적인 상담 환경
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">실천 가능한 결과</h3>
              <p className="text-gray-600">
                일상에서 바로 적용할 수 있는<br />
                구체적인 행동 가이드
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 프로세스 설명 */}
      <div className="py-16">
        <div className="ui-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">
              어떻게 진행되나요?
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="chip">1</div>
                <p className="text-lg">온보딩을 통해 상담 과정을 이해합니다</p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="chip">2</div>
                <p className="text-lg">8개의 질문에 차례로 답변합니다</p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="chip">3</div>
                <p className="text-lg">당신만의 Why 문장을 도출합니다</p>
              </div>
              
              <div className="flex items-center justify-center space-x-4">
                <div className="chip">4</div>
                <p className="text-lg">일상 적용 가이드를 받습니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}