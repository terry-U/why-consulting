'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleKakaoCallback } from '@/lib/auth-kakao'

function KakaoCallbackContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          console.error('❌ Kakao OAuth error:', error)
          setError('카카오 로그인이 취소되었습니다.')
          setIsLoading(false)
          return
        }

        if (!code) {
          console.error('❌ No authorization code received')
          setError('인증 코드를 받지 못했습니다.')
          setIsLoading(false)
          return
        }

        console.log('🔄 Processing Kakao callback with code:', code)

        // 카카오 콜백 처리
        const result = await handleKakaoCallback(code)

        if (!result.success) {
          console.error('❌ Kakao callback failed:', result.error)
          setError(result.error || '로그인에 실패했습니다.')
          setIsLoading(false)
          return
        }

        console.log('✅ Kakao login successful, deciding next route...')
        // 로그인 후 이동 결정: 결제/온보딩/첫 세션 자동 시작 흐름 지원
        let next = '/home'
        try {
          const stored = localStorage.getItem('auth_next')
          if (stored) next = stored
        } catch {}
        router.replace(next)

      } catch (error) {
        console.error('❌ Callback processing error:', error)
        setError('로그인 처리 중 오류가 발생했습니다.')
        setIsLoading(false)
      }
    }

    processCallback()
  }, [searchParams, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">카카오 로그인 처리 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    }>
      <KakaoCallbackContent />
    </Suspense>
  )
}