'use client'

import { useEffect, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
// GFM 지원(테이블 등)
import remarkGfm from 'remark-gfm'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import LoadingSpinner from '@/components/common/loading-spinner'

type ReportType = 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers' | 'prologue'

type MyWhy = { whySentence: string; rationale?: string; evidence?: string[] }
type ValueMap = { coreValues?: string[]; supportingValues?: string[]; conflicts?: string[] }
type StylePattern = { communicationStyle?: string[]; decisionPatterns?: string[]; stressResponses?: string[] }
type MasterManager = { position?: 'Master'|'Manager'|'Hybrid'; score?: number; explanation?: string }
type FitTriggers = { bestFit?: string[]; antiFit?: string[]; positiveTriggers?: string[]; negativeTriggers?: string[] }

type Prologue = { title?: string; on_why?: string; off_why_main?: string; off_why_alternatives?: string[]; narrative?: string[]; reflection_questions?: string[]; one_line_template?: string; cta_label?: string; post_prompt?: string }
type ReportData = MyWhy | ValueMap | StylePattern | MasterManager | FitTriggers | { markdown?: string } | Prologue

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

        // 1) 존재 여부만 빠르게 점검 (생성 트리거 금지)
        const types: ReportType[] = ['my_why','prologue','value_map','style_pattern','master_manager_spectrum','fit_triggers']
        const existence = await Promise.all(types.map(async (t) => {
          const res = await fetch(`/api/session/${sessionId}/report?type=${t}&check=1`)
          return res.status === 200
        }))
        const firstGen = !existence.every(Boolean)
        setIsFirstGen(firstGen)
        setShowGenerating(firstGen)

        let results: Array<ReportData | null> = []
        if (firstGen) {
          // 2) 최초 생성이면 온보딩 로딩을 즉시 노출한 상태에서 생성 트리거 후 폴링
          await fetch(`/api/session/${sessionId}/report?type=my_why&cascade=1`)
          for (let attempt = 0; attempt < 10; attempt++) {
            await new Promise(r => setTimeout(r, 1200))
            results = await Promise.all(types.map(t => fetchReport(t)))
            if (results.every(Boolean)) break
          }
        } else {
          // 3) 이미 모두 존재하면 즉시 데이터 로드
          results = await Promise.all(types.map(t => fetchReport(t)))
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
        onContinue={() => { /* 보고서 내에서 이어서 표시 */ }}
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
    // Prologue 영역을 최상단으로 배치
    const pro = reportsMap['prologue'] as any
    const prologueView = pro ? (
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2">{pro.title || '나의 Why는,'}</h2>
        {/* HTML이 오면 우선 렌더 */}
        {pro.html ? (
          <div className="card p-5 mb-4" dangerouslySetInnerHTML={{ __html: pro.html }} />
        ) : (
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="pill"><strong>스위치 ON</strong></span>
          </div>
          <p className="text-lg font-semibold">{pro.on_why}</p>
          {pro.off_why_main ? (
            <details className="mt-2"><summary className="cursor-pointer">OFF 대안 문장 보기</summary>
              <ul className="ml-4 mt-2 list-disc">
                {Array.isArray(pro.off_why_alternatives) ? pro.off_why_alternatives.map((s: string, i: number) => <li key={i} className="text-sm text-gray-600">{s}</li>) : null}
              </ul>
            </details>
          ) : null}
        </div>
        )}
        {Array.isArray(pro.narrative) && pro.narrative.length > 0 && (
          <div className="card p-5 mb-4">
            {pro.narrative.map((p: string, i: number) => <p key={i} className="mb-3">{p}</p>)}
          </div>
        )}
        {Array.isArray(pro.reflection_questions) && pro.reflection_questions.length === 3 && (
          <div className="card p-5">
            <h3 className="text-lg font-semibold mb-1">어제 있었던 일을 잠깐 떠올려볼까요?</h3>
            <ul className="list-disc ml-5 mb-3">
              {pro.reflection_questions.map((q: string, i: number) => <li key={i} className="mb-2">{q}</li>)}
            </ul>
            <div className="flex gap-2">
              <input placeholder={pro.one_line_template || '“어제 나는 ______ 때문에 _____해졌고, ______ 때문에 _____해졌다.”'} aria-label="한 줄 기록 입력" className="flex-1 input" />
              <button className="btn btn-primary text-white">{pro.cta_label || '엔터'}</button>
            </div>
            {pro.post_prompt && <p className="text-xs text-gray-500 mt-2">{pro.post_prompt}</p>}
          </div>
        )}
      </div>
    ) : null

    switch (activeType) {
      case 'my_why': {
        const md = (report as any)?.markdown as string | undefined
        return (
          <div className="prose max-w-none">
            {prologueView}
            <div className="card p-6 mb-10">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{md || ''}</ReactMarkdown>
            </div>
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
    '우리가 만드는 것은 정답이나 라벨이 아닙니다. 당신이 살아온 경험 속 장면과 감정을 함께 들여다보며, 그 안에서 반복적으로 드러난 가치와 방식들을 발견해 갑니다.',
    '이 여정은 진단이 아니라 발견입니다. 때로는 익숙한 말보다 낯선 단어가 더 정확할 수 있어요.',
    '조금만 기다려 주세요. 대화 전체를 바탕으로 당신만의 Why를 정리하고 있어요. 잠시 뒤 결과를 함께 확인합니다.',
    '왜 그렇게 살아왔는지, 무엇을 중요하게 여겨왔는지. 작은 습관부터 선택의 기준까지 연결해 하나의 문장으로 응축합니다.',
    '그 문장은 앞으로의 방향을 잡아 줄 기준이 됩니다. 일과 관계, 생활의 리듬까지 더 당신답게 만들 수 있어요.',
    '준비가 되면 나의 Why 보고서로 이동해 주세요. 거기서 더 깊이 있는 해석과 가이드도 함께 드립니다.'
  ]

  // 온점/물음표/느낌표 기준으로 문장 단위로 평탄화
  const segments = useMemo(() => {
    const result: string[] = []
    scripts.forEach(m => {
      const matches = m.match(/[^.?!]+[.?!]/g)
      if (matches && matches.length) {
        matches.forEach(s => { const t = s.trim(); if (t) result.push(t) })
        const tail = m.replace(/[^.?!]+[.?!]/g, '').trim()
        if (tail) result.push(tail)
      } else {
        const t = m.trim(); if (t) result.push(t)
      }
    })
    return result
  }, [])

  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isShrinking, setIsShrinking] = useState(false)

  const WAIT_MS = 800
  const SHRINK_MS = 180

  const startShrinkThenNext = (quick = false) => {
    setTimeout(() => {
      setIsShrinking(true)
      setTimeout(() => {
        setIsShrinking(false)
        setStep(s => Math.min(s + 1, segments.length))
      }, SHRINK_MS)
    }, quick ? 80 : WAIT_MS)
  }

  useEffect(() => {
    if (step >= segments.length) return
    const full = segments[step]
    let i = 0
    setTyped('')
    setIsTyping(true)
    const iv = setInterval(() => {
      i++
      setTyped(full.slice(0, i))
      if (i >= full.length) {
        clearInterval(iv)
        setIsTyping(false)
        startShrinkThenNext(false)
      }
    }, 28)
    return () => clearInterval(iv)
  }, [step, segments])

  return (
    <div className="min-h-screen ui-container">
      <div className="max-w-4xl w-full px-6 pt-24 pb-24 mx-auto">
        <div className="text-left font-semibold leading-tight tracking-tight text-3xl md:text-5xl min-h-[5.5rem] md:min-h-[8rem]">
          {step < segments.length && (
            <p
              role="button"
              onClick={() => {
                if (isTyping) {
                  const full = segments[step]
                  setTyped(full)
                  setIsTyping(false)
                  startShrinkThenNext(true)
                } else if (!isShrinking) {
                  startShrinkThenNext(true)
                }
              }}
              className={`mb-4 cursor-pointer select-none transition-all duration-200 ease-out ${isShrinking ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
            >
              {typed}<span className="opacity-40">▍</span>
            </p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-end">
          <button
            className="btn btn-primary text-white font-semibold px-6 py-3 rounded-full disabled:opacity-40 flex items-center gap-2"
            onClick={onContinue}
            disabled={!ready}
          >
            {!ready && (
              <span className="inline-block w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#facc1540', borderTopColor: '#facc15' }} />
            )}
            {ready ? '나의 Why 보고서' : '보고서 작성중…'}
          </button>
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


