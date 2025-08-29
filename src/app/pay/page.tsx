'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function PayPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) {
          router.push('/auth?next=/pay')
          return
        }
        setUserId(user.id)
        // 이미 결제된 경우 홈으로
        try {
          const res = await fetch(`/api/user/status?userId=${user.id}`)
          const js = await res.json()
          if (js?.user?.is_paid_user) {
            router.replace('/home')
            return
          }
        } catch {}
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const handleMockPayment = async () => {
    if (!userId) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/pay/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || '결제 처리 실패')
      // 결제 후 온보딩으로 (자동 시작 모드)
      router.replace('/onboarding?autoStart=1')
    } catch (e: any) {
      setError(e?.message || '결제 처리 실패')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ui-container py-12">
      <div className="max-w-xl mx-auto">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2">결제</h1>
          <p className="text-gray-600 mb-6">Why Consulting 상담권 10장 • ₩299,000</p>
          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}
          <button
            onClick={handleMockPayment}
            disabled={submitting}
            className="btn btn-primary text-white w-full py-4 disabled:opacity-50"
          >
            {submitting ? '결제 처리 중…' : '임의 결제 처리(개발용)'}
          </button>
          <p className="text-[12px] text-gray-500 mt-3">라이브 전 제거 예정 · 결제 시스템 연동 전 임시 버튼</p>
        </div>
      </div>
    </div>
  )
}


