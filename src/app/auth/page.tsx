'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signInWithKakao } from '@/lib/auth-kakao'

function AuthContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setAuthError(decodeURIComponent(error))
    }
  }, [searchParams])

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true)
      setAuthError('')
      
      console.log('🔄 Starting Kakao login...')
      await signInWithKakao()
      // 성공 시 카카오가 자동으로 콜백 페이지로 리다이렉트
    } catch (error: any) {
      console.error('❌ Kakao login error:', error)
      setAuthError(error?.error || '로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen ui-container py-12">
      {/* 헤더 액션 */}
      <button
        onClick={() => router.push('/')}
        className="mb-8 text-gray-600 hover:text-gray-900 transition-colors"
      >
        ← 메인으로 돌아가기
      </button>

      {/* 오류 메시지 */}
      {authError && (
        <div className="max-w-md mb-6">
          <div className="card p-4">
            <div className="text-sm text-red-600">{authError}</div>
          </div>
        </div>
      )}

      {/* 카카오 로그인 */}
      <div className="max-w-md">
        <div className="card p-8">
          <div className="mb-8">
            <div className="text-4xl mb-3">🌟</div>
            <h1 className="text-3xl font-bold mb-1">Why Consulting</h1>
            <p className="text-gray-500">나만의 Why를 발견하는 여정</p>
          </div>

          <button
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full btn bg-[#FEE500] hover:bg-[#FDD800] text-[#3C1E1E] font-medium py-4 px-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3C1E1E]"></div>
                로그인 중...
              </>
            ) : (
              <>
                🟡 카카오로 시작하기
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">카카오 로그인을 통해 간편하게 시작하세요</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">로딩 중...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
