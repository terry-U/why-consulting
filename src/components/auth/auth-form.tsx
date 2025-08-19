'use client'

import { useState } from 'react'
import { signIn, signUp } from '@/lib/auth'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSuccess: () => void
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'signup') {
        const result = await signUp(email, password)
        if (result.user && !result.session) {
          // 이메일 확인이 필요한 경우
          setMessage('회원가입이 완료되었습니다! 이메일을 확인하여 계정을 활성화해주세요.')
        } else {
          onSuccess()
        }
      } else {
        await signIn(email, password)
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'login' ? '다시 만나서 반가워요' : '처음 뵙겠습니다'}
          </h2>
          <p className="mt-2 text-gray-600">
            {mode === 'login' 
              ? '당신의 Why 여정을 계속해보세요' 
              : '8명의 상담사와 함께 특별한 여정을 시작해보세요'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                className="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                {error}
              </div>
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                {message}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  잠시만요...
                </div>
              ) : (
                mode === 'login' ? '여정 계속하기' : '여정 시작하기'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  처음 방문이신가요?{' '}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/signup'}
                    className="font-medium text-yellow-600 hover:text-yellow-500"
                  >
                    새 여정 시작하기
                  </button>
                </>
              ) : (
                <>
                  이미 계정이 있으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => window.location.href = '/login'}
                    className="font-medium text-yellow-600 hover:text-yellow-500"
                  >
                    기존 여정 이어가기
                  </button>
                </>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
