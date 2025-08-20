'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { handleKakaoCallback } from '@/lib/auth-kakao'
import { supabase } from '@/lib/auth'

function KakaoCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setError('카카오 로그인이 취소되었습니다.')
          setIsLoading(false)
          return
        }

        if (!code) {
          setError('인증 코드가 없습니다.')
          setIsLoading(false)
          return
        }

        console.log('🔄 Processing Kakao callback with code:', code)

        // 카카오 콜백 처리
        const result = await handleKakaoCallback(code)

        if (!result.success) {
          setError(result.error || '로그인에 실패했습니다.')
          setIsLoading(false)
          return
        }

        console.log('✅ Kakao login successful, setting session...')

        // Edge Function에서 받은 세션 데이터로 Supabase 세션 설정
        if (result.session) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: result.session.properties.hashed_token,
            refresh_token: result.session.properties.hashed_token
          })
          
          if (sessionError) {
            console.error('❌ Session setting error:', sessionError)
            setError('세션 설정에 실패했습니다.')
            setIsLoading(false)
            return
          }
        }

        console.log('✅ Session set successfully, redirecting to home...')
        // 홈으로 리다이렉트
        router.replace('/home')

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">카카오 로그인 처리 중...</p>
          <p className="text-gray-400 text-sm mt-2">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">로그인 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/auth')}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            다시 시도하기
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">로딩 중...</p>
        </div>
      </div>
    }>
      <KakaoCallbackContent />
    </Suspense>
  )
}
