'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AuthForm from '@/components/auth/auth-form'
import { getCurrentUser } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 사용자는 메인 페이지로 리다이렉트
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          router.push('/')
        }
      } catch (error) {
        // 로그인되지 않은 상태 - 정상적으로 로그인 페이지 표시
      }
    }
    checkAuth()
  }, [router])

  const handleLoginSuccess = () => {
    router.push('/')
  }

  return (
    <AuthForm 
      mode="login" 
      onSuccess={handleLoginSuccess} 
    />
  )
}
