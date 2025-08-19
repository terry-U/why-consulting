'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthForm from '@/components/auth/auth-form'

function AuthContent() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [authError, setAuthError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setAuthError(decodeURIComponent(error))
    }
  }, [searchParams])

  const handleAuthSuccess = () => {
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 메인으로 돌아가기
        </button>

        {/* 오류 메시지 */}
        {authError && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm text-red-700">
                {authError}
              </div>
            </div>
          </div>
        )}

        {/* 인증 폼 */}
        <div className="max-w-md mx-auto">
          {/* 탭 버튼 */}
          <div className="flex bg-white rounded-lg p-1 mb-8 shadow-sm">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'login'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-yellow-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              회원가입
            </button>
          </div>

          <AuthForm mode={mode} onSuccess={handleAuthSuccess} />
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
