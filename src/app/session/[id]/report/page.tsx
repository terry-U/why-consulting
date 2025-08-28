'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

type ReportType = 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers'

type MyWhy = { whySentence: string; rationale?: string; evidence?: string[] }
type ValueMap = { coreValues?: string[]; supportingValues?: string[]; conflicts?: string[] }
type StylePattern = { communicationStyle?: string[]; decisionPatterns?: string[]; stressResponses?: string[] }
type MasterManager = { position?: 'Master'|'Manager'|'Hybrid'; score?: number; explanation?: string }
type FitTriggers = { bestFit?: string[]; antiFit?: string[]; positiveTriggers?: string[]; negativeTriggers?: string[] }

type ReportData = MyWhy | ValueMap | StylePattern | MasterManager | FitTriggers | { markdown?: string }

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [loading, setLoading] = useState(true)
  const [activeType, setActiveType] = useState<ReportType>('my_why')
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser()
        if (!user) return router.push('/auth')
        const res = await fetch(`/api/session/${sessionId}/report?type=${activeType}`)
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
  }, [sessionId, router, activeType])

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

  const renderBody = () => {
    switch (activeType) {
      case 'my_why': {
        const md = (report as any)?.markdown as string | undefined
        return (
          <div className="card p-6 mb-10 prose max-w-none">
            <ReactMarkdown>{md || ''}</ReactMarkdown>
          </div>
        )
      }
      case 'value_map': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown>{md || ''}</ReactMarkdown></div>
      }
      case 'style_pattern': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown>{md || ''}</ReactMarkdown></div>
      }
      case 'master_manager_spectrum': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown>{md || ''}</ReactMarkdown></div>
      }
      case 'fit_triggers': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown>{md || ''}</ReactMarkdown></div>
      }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen ui-container py-12">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.push(`/session/${sessionId}`)} className="mb-8 text-gray-600 hover:text-gray-900">← 상담으로 돌아가기</button>

        <div className="mb-6 flex gap-2 overflow-x-auto">
          {[
            { key: 'my_why', label: 'My “Why”' },
            { key: 'value_map', label: 'Value Map' },
            { key: 'style_pattern', label: 'Style Pattern' },
            { key: 'master_manager_spectrum', label: 'Master–Manager Spectrum' },
            { key: 'fit_triggers', label: 'Fit & Triggers' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key as ReportType)}
              className={`btn ${activeType === (t.key as ReportType) ? 'btn-primary text-white' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {renderBody()}

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
    <div className="card p-5">
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


