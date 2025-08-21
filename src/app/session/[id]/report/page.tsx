'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

interface ReportData {
  whySentence: string
  categories: {
    values: string[]
    strengths: string[]
    emotionalTriggers: string[]
    narratives: string[]
    risks: string[]
    actionSteps: { title: string; description: string; timeframe: string }[]
  }
}

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return router.push('/auth')
        const res = await fetch(`/api/session/${sessionId}/report`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        setReport(data.report)
      } catch (e: any) {
        setError(e?.message || '보고서 생성에 실패했습니다')
      } finally {
        setLoading(false)
      }
    }
    if (sessionId) load()
  }, [sessionId, router])

  if (loading) {
    return (
      <div className="min-h-screen ui-container flex items-center justify-center">
        <div className="text-gray-600">보고서를 생성하고 있어요…</div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen ui-container flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-700">{error || '보고서를 불러오지 못했습니다'}</p>
        </div>
      </div>
    )
  }

  const { whySentence, categories } = report

  return (
    <div className="min-h-screen ui-container py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push(`/session/${sessionId}`)} className="mb-8 text-gray-600 hover:text-gray-900">← 상담으로 돌아가기</button>
        <div className="mb-10">
          <div className="text-5xl mb-4">🧭</div>
          <h1 className="text-3xl font-bold mb-3">당신의 Why</h1>
          <p className="text-2xl text-gray-900">"{whySentence}"</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Section title="가치(values)" items={categories.values} icon="💎" />
          <Section title="강점(strengths)" items={categories.strengths} icon="💪" />
          <Section title="감정 트리거" items={categories.emotionalTriggers} icon="💓" />
          <Section title="반복 서사(narratives)" items={categories.narratives} icon="📖" />
          <Section title="리스크(risks)" items={categories.risks} icon="⚠️" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">실행 계획(Action Steps)</h2>
          <div className="space-y-3">
            {categories.actionSteps?.map((a, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{a.title}</div>
                  <span className="text-xs text-gray-500">{labelTimeframe(a.timeframe)}</span>
                </div>
                <p className="text-gray-700 mt-1">{a.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex gap-3">
          <button onClick={() => router.push(`/session/${sessionId}/why`)} className="btn">Why 후보 다시 보기</button>
          <button onClick={() => router.push('/home')} className="btn btn-primary text-white">홈으로</button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, items, icon }: { title: string; items?: string[]; icon: string }) {
  if (!items || items.length === 0) return null
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-white">
      <div className="mb-2 font-semibold">{icon} {title}</div>
      <ul className="list-disc list-inside text-gray-800 space-y-1">
        {items.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  )
}

function labelTimeframe(tf: string) {
  switch (tf) {
    case 'today': return '오늘'
    case 'this_week': return '이번 주'
    case 'this_month': return '이번 달'
    default: return tf
  }
}


