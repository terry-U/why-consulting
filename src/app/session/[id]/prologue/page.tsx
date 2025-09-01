'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

type Prologue = {
  title: string
  on_why: string
  off_why_main: string
  off_why_alternatives: string[]
  narrative: string[]
  reflection_questions: string[]
  one_line_template: string
  cta_label: string
  post_prompt: string
}

export default function ProloguePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [data, setData] = useState<Prologue | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOn, setIsOn] = useState(true)
  const [oneLine, setOneLine] = useState('')
  const [ok, setOk] = useState('')
  const [warn, setWarn] = useState('')

  useEffect(() => {
    const init = async () => {
      const me = await getCurrentUser()
      if (!me) return router.push('/auth')
      const res = await fetch(`/api/session/${sessionId}/report?type=prologue`)
      const js = await res.json()
      if (!res.ok || !js?.success) {
        // 없으면 생성 시도 후 재요청
        await fetch(`/api/session/${sessionId}/report?type=prologue`)
        const res2 = await fetch(`/api/session/${sessionId}/report?type=prologue`)
        const js2 = await res2.json()
        if (!res2.ok || !js2?.success) return router.push(`/session/${sessionId}/report`)
        setData(js2.report as Prologue)
      } else {
        setData(js.report as Prologue)
      }
      setLoading(false)
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'prologue_view' } }))
    }
    if (sessionId) init()
  }, [sessionId, router])

  const submit = async () => {
    const val = (oneLine || '').trim()
    if (!val || val.length < 8) {
      setWarn('입력을 확인해주세요')
      setOk('')
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'one_line_submit', ok: false } }))
      return
    }
    setWarn('')
    setOk('저장되었습니다')
    window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'one_line_submit', ok: true } }))
    // TODO: persist to DB via dedicated endpoint
    setTimeout(() => router.push(`/session/${sessionId}/why`), 600)
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen ui-container flex items-center justify-center"><div className="text-gray-500">로딩 중…</div></div>
    )
  }

  return (
    <div className="min-h-screen ui-container">
      <div className="max-w-4xl w-full px-6 pt-24 pb-24 mx-auto">
        <h1 className="text-3xl font-bold mb-1">{data.title || '나의 Why는,'}</h1>
        <p className="text-gray-500 mb-5">이 페이지는 진단이 아니라 ‘당신이 이미 살아온 경험’을 비추는 거울이에요.</p>

        <div className="card p-5 mb-5" aria-live="polite">
          <div className="flex items-center gap-3 mb-2">
            <span className="pill"><strong>{isOn ? '스위치 ON' : '스위치 OFF'}</strong></span>
            <button onClick={() => { setIsOn(v => !v); window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'why_switch_toggled', state: !isOn ? 'ON' : 'OFF' } })) }} className="btn">ON/OFF 전환</button>
          </div>
          {isOn ? (
            <p className="text-lg font-semibold">{data.on_why} <span className="badge">ON</span></p>
          ) : (
            <>
              <p className="text-lg font-semibold text-gray-300">{data.off_why_main} <span className="badge">OFF</span></p>
              {data.off_why_alternatives?.length ? (
                <details className="mt-2"><summary className="cursor-pointer">OFF 대안 문장 보기</summary>
                  <ul className="ml-4 mt-2 list-disc">
                    {data.off_why_alternatives.map((s, i) => <li key={i} className="text-sm text-gray-400">{s}</li>)}
                  </ul>
                </details>
              ) : null}
            </>
          )}
        </div>

        <div className="card p-5 narrative">
          {data.narrative?.map((p, i) => <p key={i} className="mb-3">{p}</p>)}
        </div>

        <div className="card p-5 mt-4">
          <h2 className="text-lg font-semibold mb-1">어제 있었던 일을 잠깐 떠올려볼까요?</h2>
          <ul className="list-disc ml-5 mb-3">
            {data.reflection_questions?.map((q, i) => <li key={i} className="mb-2">{q}</li>)}
          </ul>
          <div className="flex gap-2">
            <input value={oneLine} onChange={e => setOneLine(e.target.value)} placeholder={data.one_line_template} aria-label="한 줄 기록 입력" className="flex-1 input" />
            <button onClick={submit} className="btn btn-primary text-white">{data.cta_label || '엔터'}</button>
          </div>
          <p className="text-xs text-gray-500 mt-2">엔터를 누르면 다음 단계로 넘어가요. {ok && <span className="text-green-500">{ok}</span>} {warn && <span className="text-rose-400">{warn}</span>}</p>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span>{data.post_prompt}</span>
          <button onClick={async () => {
            const txt = (isOn ? data.on_why : data.off_why_main) || ''
            try { await navigator.clipboard.writeText(txt) } catch {}
            window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'copy_why' } }))
          }} className="btn">Why 복사</button>
        </div>
      </div>
    </div>
  )
}


