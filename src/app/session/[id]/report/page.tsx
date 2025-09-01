'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
// GFM 지원(테이블 등)
import remarkGfm from 'remark-gfm'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import LoadingSpinner from '@/components/common/loading-spinner'

type ReportType = 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers'

type MyWhy = { whySentence: string; rationale?: string; evidence?: string[] }
type ValueMap = { coreValues?: string[]; supportingValues?: string[]; conflicts?: string[] }
type StylePattern = { communicationStyle?: string[]; decisionPatterns?: string[]; stressResponses?: string[] }
type MasterManager = { position?: 'Master'|'Manager'|'Hybrid'; score?: number; explanation?: string }
type FitTriggers = { bestFit?: string[]; antiFit?: string[]; positiveTriggers?: string[]; negativeTriggers?: string[] }

type ReportData = MyWhy | ValueMap | StylePattern | MasterManager | FitTriggers | { markdown?: string }

type WhyJson = { headline?: string; markdown?: string }

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const [initializing, setInitializing] = useState(true)
  const [showGenerating, setShowGenerating] = useState(false)
  const [isFirstGen, setIsFirstGen] = useState(false)
  const [tabLoading, setTabLoading] = useState(false)
  const [allReady, setAllReady] = useState(false)
  const [activeType, setActiveType] = useState<ReportType>('my_why')
  const [report, setReport] = useState<ReportData | null>(null)
  const [error, setError] = useState('')
  const [reportsMap, setReportsMap] = useState<Partial<Record<ReportType, ReportData>>>({})
  const [gateOpen, setGateOpen] = useState(false)
  const gateKey = typeof window !== 'undefined' ? `why_gate_seen_${sessionId}` : ''

  useEffect(() => {
    if (!sessionId) return

    const fetchReport = async (t: ReportType) => {
      const res = await fetch(`/api/session/${sessionId}/report?type=${t}`)
      const data = await res.json()
      if (!data.success) {
        if (res.status === 202 && data.pending) return null
        throw new Error(data.error)
      }
      return data.report as ReportData
    }

    const ensureAll = async () => {
      setInitializing(true)
      try {
        const user = await getCurrentUser()
        if (!user) return router.push('/auth')

        // 1) 우선 캐시만 확인 (cascade 트리거하지 않음)
        await fetch(`/api/session/${sessionId}/report?type=my_why`)

        // 2) 5개 모두 확보 (이미 존재 시 즉시 반환)
        const types: ReportType[] = ['my_why','value_map','style_pattern','master_manager_spectrum','fit_triggers']
        // 먼저 한번 조회
        let results: Array<ReportData | null> = await Promise.all(types.map(t => fetchReport(t)))
        const firstGen = !results.every(Boolean)
        setIsFirstGen(firstGen)
        setShowGenerating(firstGen)
        // 일부가 비어 있으면 그때만 cascade 트리거 후 짧게 폴링
        if (firstGen) {
          await fetch(`/api/session/${sessionId}/report?type=my_why&cascade=1`)
          for (let attempt = 0; attempt < 6 && !results.every(Boolean); attempt++) {
            await new Promise(r => setTimeout(r, 1200))
            results = await Promise.all(types.map(t => fetchReport(t)))
          }
        }

        setAllReady(results.every(Boolean))
        // 캐시 맵 구성 및 초기 표시
        const map: Partial<Record<ReportType, ReportData>> = {}
        types.forEach((t, i) => {
          if (results[i]) map[t] = results[i] as ReportData
        })
        setReportsMap(map)
        // 게이트: 기존 보고서 경로에서만 사용(최초 생성 플로우에서는 스킵)
        if (!firstGen) {
          const why = map['my_why'] as WhyJson | undefined
          let seen = false
          try {
            if (typeof window !== 'undefined' && gateKey) {
              seen = localStorage.getItem(gateKey) === '1'
            }
          } catch {}
          setGateOpen(!!why?.headline && !seen)
        } else {
          setGateOpen(false)
        }
        const idx = types.indexOf(activeType)
        const initial = (map[types[idx]] as ReportData) || (map['my_why'] as ReportData)
        setReport(initial || null)
      } catch (e: any) {
        setError(e?.message || '보고서 생성에 실패했습니다')
      } finally {
        setInitializing(false)
      }
    }

    ensureAll()
  }, [sessionId, router])

  useEffect(() => {
    const loadActive = async () => {
      if (!allReady || !sessionId) return
      // 캐시가 있으면 즉시 표시하고 네트워크 요청 생략
      if (reportsMap[activeType]) {
        setReport(reportsMap[activeType] as ReportData)
        return
      }
      setTabLoading(true)
      try {
        const res = await fetch(`/api/session/${sessionId}/report?type=${activeType}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error)
        setReport(data.report)
        setReportsMap(prev => ({ ...prev, [activeType]: data.report as ReportData }))
      } catch (e: any) {
        setError(e?.message || '보고서 불러오기에 실패했습니다')
      } finally {
        setTabLoading(false)
      }
    }
    loadActive()
  }, [activeType, allReady, sessionId, reportsMap])

  // 최초 생성 중에는 온보딩형 로딩 화면과 버튼(완료 시 활성화) 표시
  if (initializing && showGenerating && isFirstGen) {
    return (
      <LoadingStage
        ready={allReady}
        onContinue={() => {
          if (allReady) router.push(`/session/${sessionId}/why`)
        }}
      />
    )
  }

  // 데이터 페칭 로딩: 캐시가 있는 상태에서의 초기화는 간결 스피너로 처리
  if (initializing) {
    return (
      <div className="min-h-screen ui-container flex items-center justify-center">
        <LoadingSpinner size="medium" message="보고서 불러오는 중..." />
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

  // 1단계: Why 한줄 확인 게이트
  if (gateOpen) {
    const why = (reportsMap['my_why'] as WhyJson) || {}
    return (
      <div className="min-h-screen ui-container flex items-center justify-center">
        <div className="max-w-xl w-full card p-8 text-center">
          <div className="text-sm text-gray-500 mb-2">축하합니다!</div>
          <h1 className="text-2xl font-bold mb-4">당신의 Why</h1>
          <div className="border rounded-xl p-6 bg-white">
            <div className="text-xl font-semibold text-gray-900 leading-relaxed">{why.headline || 'Why 한줄을 불러왔습니다.'}</div>
          </div>
          <button className="btn btn-primary text-white mt-6" onClick={() => { try { if (gateKey) localStorage.setItem(gateKey, '1') } catch {}; setGateOpen(false) }}>보고서로 이동</button>
        </div>
      </div>
    )
  }

  const renderBody = () => {
    if (tabLoading) {
      return (
        <div className="card p-6 mb-10">
          <div className="text-gray-600">이 섹션을 불러오는 중…</div>
        </div>
      )
    }
    switch (activeType) {
      case 'my_why': {
        const md = (report as any)?.markdown as string | undefined
        return (
          <div className="card p-6 mb-10 prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md || ''}</ReactMarkdown>
          </div>
        )
      }
      case 'value_map': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{md || ''}</ReactMarkdown></div>
      }
      case 'style_pattern': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{md || ''}</ReactMarkdown></div>
      }
      case 'master_manager_spectrum': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{md || ''}</ReactMarkdown></div>
      }
      case 'fit_triggers': {
        const md = (report as any)?.markdown as string | undefined
        return <div className="card p-6 mb-10 prose max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{md || ''}</ReactMarkdown></div>
      }
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen ui-container py-12">
      <div className="max-w-4xl mx-auto">
        {/* 상담으로 돌아가기 버튼 제거 (보고서가 최종 단계) */}
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

function LoadingStage({ ready, onContinue }: { ready: boolean; onContinue: () => void }) {
  const scripts = [
    '우리가 만드는 것은 정답이나 라벨이 아닙니다.',
    '당신이 살아온 경험 속 장면과 감정을 함께 들여다보며,',
    '그 안에서 반복적으로 드러난 가치와 방식들을 발견해 갑니다.',
    '잠시 뒤, 당신만의 Why를 함께 확인하겠습니다.'
  ]
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')

  // 간단한 타자 효과
  useEffect(() => {
    if (step >= scripts.length) return
    const full = scripts[step]
    let i = 0
    setTyped('')
    const iv = setInterval(() => {
      i++
      setTyped(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(iv)
        setTimeout(() => setStep(s => Math.min(s + 1, scripts.length)), 650)
      }
    }, 28)
    return () => clearInterval(iv)
  }, [step])

  return (
    <div className="min-h-screen ui-container flex items-center justify-center">
      <div className="max-w-xl w-full text-center">
        <div className="card p-8 text-left">
          <div className="text-sm text-gray-500 mb-4">함께 발견하는 여정</div>
          {scripts.slice(0, step).map((line, idx) => (
            <p key={idx} className="text-gray-900 mb-3 leading-relaxed">{line}</p>
          ))}
          {step < scripts.length && (
            <p className="text-gray-900 mb-3 leading-relaxed">{typed}<span className="opacity-40">▍</span></p>
          )}
          <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden shadow-inner mt-4">
            <div className="h-full bg-gray-900 animate-[progress_2.2s_ease_infinite]"></div>
          </div>
          <button
            className="btn btn-primary text-white mt-8 disabled:opacity-40"
            onClick={onContinue}
            disabled={!ready}
          >
            {ready ? '나의 Why 보고서' : '생성 중…'}
          </button>
          <style>{`@keyframes progress{0%{width:10%}50%{width:85%}100%{width:10%}}`}</style>
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


