'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@/components/auth/auth-form'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const router = useRouter()

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
