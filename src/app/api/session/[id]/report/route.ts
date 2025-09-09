import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'
import { buildReportPrompt, SYSTEM_KO_JSON_ONLY } from '@/lib/report-prompts'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function parseJsonFlex(raw: string): any {
  // direct parse
  try { return JSON.parse(raw) } catch {}
  // strip code fences
  const noFence = raw.replace(/^```[a-zA-Z0-9]*\n?|```$/g, '').trim()
  try { return JSON.parse(noFence) } catch {}
  // find first "{" and last "}"
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    const slice = raw.slice(start, end + 1)
    try { return JSON.parse(slice) } catch {}
  }
  throw new Error('Unable to parse JSON content')
}

function validateAndFillMyWhy(input: any) {
  const result: any = {
    headline: typeof input?.headline === 'string' ? input.headline.trim() : '',
    markdown: typeof input?.markdown === 'string' ? input.markdown.trim() : '',
    off_why_main: typeof input?.off_why_main === 'string' ? input.off_why_main.trim() : '',
    off_why_alternatives: Array.isArray(input?.off_why_alternatives) ? input.off_why_alternatives.slice(0, 3) : [],
    narrative: Array.isArray(input?.narrative) ? input.narrative.slice(0, 3) : [],
    reflection_questions: Array.isArray(input?.reflection_questions) ? input.reflection_questions.slice(0, 3) : [],
    one_line_template: typeof input?.one_line_template === 'string' ? input.one_line_template : '어제 나는 ______ 때문에 _____해졌다.',
    cta_label: typeof input?.cta_label === 'string' ? input.cta_label : '엔터',
    post_prompt: typeof input?.post_prompt === 'string' ? input.post_prompt : '어때요. 나의 Why와 비슷한 모습인가요?'
  }
  const defaults = [
    '어제, 일이 잘 풀렸던 장면을 떠올리면 누구의 얼굴이 함께 떠오르나요?',
    '그 순간 당신의 에너지는 올라갔나요, 유지됐나요, 줄었나요? 이유는 무엇이었나요?',
    '숫자만 남은 성과였다면 무엇이 빠져 있었나요? (얼굴/목소리/이야기의 맥락)'
  ]
  if (result.reflection_questions.length < 3) {
    result.reflection_questions = defaults.slice(0, 3)
  }
  return result
}

function validateAndFillValueMap(input: any) {
  const toItem = (it: any) => ({
    head: typeof it?.head === 'string' ? it.head.trim() : '',
    heart: typeof it?.heart === 'string' ? it.heart.trim() : '',
    gapLevel: (['high','medium','low'] as const).includes(it?.gapLevel) ? it.gapLevel : 'medium',
    headDetail: typeof it?.headDetail === 'string' ? it.headDetail.trim() : '',
    heartDetail: typeof it?.heartDetail === 'string' ? it.heartDetail.trim() : '',
    scene: typeof it?.scene === 'string' ? it.scene.trim() : '',
    bridge: typeof it?.bridge === 'string' ? it.bridge.trim() : ''
  })
  const rawItems = Array.isArray(input?.items) ? input.items : []
  const items = rawItems.slice(0, 3).map(toItem)
  const today_actions = Array.isArray(input?.today_actions) ? input.today_actions.slice(0, 3).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : []
  const summary = typeof input?.summary === 'string' ? input.summary.trim() : ''
  return { items, today_actions, summary }
}

function valueMapToMarkdown(vm: { items: any[]; today_actions?: string[]; summary?: string }) {
  const lines: string[] = []
  lines.push('# Value Map')
  if (vm.summary) {
    lines.push(vm.summary)
  }
  lines.push('')
  for (const it of vm.items || []) {
    lines.push(`## ${it.head} ↔ ${it.heart} (${it.gapLevel || 'medium'})`)
    if (it.headDetail || it.heartDetail) {
      lines.push(`- 머리: ${it.headDetail || ''}`)
      lines.push(`- 마음: ${it.heartDetail || ''}`)
    }
    if (it.scene) lines.push(`\n> ${it.scene}`)
    if (it.bridge) lines.push(`\n💡 ${it.bridge}`)
    lines.push('')
  }
  if (Array.isArray(vm.today_actions) && vm.today_actions.length) {
    lines.push('### 오늘, 여기서 한 걸음')
    for (const a of vm.today_actions) lines.push(`- ${a}`)
  }
  return lines.join('\n')
}

function validateAndFillStylePattern(input: any) {
  const normalizeItem = (it: any) => ({
    title: typeof it?.title === 'string' ? it.title.trim() : '',
    subtitle: typeof it?.subtitle === 'string' ? it.subtitle.trim() : '',
    fitLevel: (['high','medium','conditional'] as const).includes(it?.fitLevel) ? it.fitLevel : 'medium',
    what: typeof it?.what === 'string' ? it.what.trim() : '',
    example: typeof it?.example === 'string' ? it.example.trim() : '',
    why: typeof it?.why === 'string' ? it.why.trim() : '',
    caution: typeof it?.caution === 'string' ? it.caution.trim() : '',
    story: typeof it?.story === 'string' ? it.story.trim() : ''
  })
  const styles = Array.isArray(input?.styles) ? input.styles.slice(0, 5).map(normalizeItem) : []
  const quick_tips = Array.isArray(input?.quick_tips)
    ? input.quick_tips.slice(0, 4).map((q: any) => ({
        id: typeof q?.id === 'string' ? q.id : '',
        title: typeof q?.title === 'string' ? q.title.trim() : '',
        method: typeof q?.method === 'string' ? q.method.trim() : '',
        tip: typeof q?.tip === 'string' ? q.tip.trim() : ''
      }))
    : []
  const today_checklist = Array.isArray(input?.today_checklist)
    ? input.today_checklist.slice(0, 6).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
    : []
  const summary = typeof input?.summary === 'string' ? input.summary.trim() : ''
  return { styles, quick_tips, today_checklist, summary }
}

function stylePatternToMarkdown(sp: { styles: any[]; quick_tips?: any[]; today_checklist?: string[]; summary?: string }) {
  const lines: string[] = []
  lines.push('# Style Pattern')
  if (sp.summary) lines.push(sp.summary)
  lines.push('')
  for (const s of sp.styles || []) {
    lines.push(`## ${s.title} (${s.fitLevel || 'medium'})`)
    if (s.subtitle) lines.push(`_${s.subtitle}_`)
    if (s.what) lines.push(`- 무엇: ${s.what}`)
    if (s.example) lines.push(`- 예시: ${s.example}`)
    if (s.why) lines.push(`- 왜: ${s.why}`)
    if (s.caution) lines.push(`- 주의: ${s.caution}`)
    if (s.story) lines.push(`\n> ${s.story}`)
    lines.push('')
  }
  if (Array.isArray(sp.quick_tips) && sp.quick_tips.length) {
    lines.push('### 바로 쓰는 팁')
    for (const q of sp.quick_tips) {
      lines.push(`- ${q?.title || ''}: ${q?.method || ''} (${q?.tip || ''})`)
    }
    lines.push('')
  }
  if (Array.isArray(sp.today_checklist) && sp.today_checklist.length) {
    lines.push('### 오늘 체크')
    for (const c of sp.today_checklist) lines.push(`- [ ] ${c}`)
  }
  return lines.join('\n')
}

function validateAndFillMasterManager(input: any) {
  const clamp = (n: any) => {
    const x = Number(n)
    if (!isFinite(x)) return 0
    return Math.max(0, Math.min(100, Math.round(x)))
  }
  const scores = {
    others: clamp(input?.scores?.others),
    master: clamp(input?.scores?.master)
  }
  const calcOrientation = (o: number): { side: 'self'|'others'; score: number } => ({
    side: (o >= 50 ? 'others' : 'self') as 'self'|'others',
    score: o >= 50 ? o : 100 - o
  })
  const calcExecution = (m: number): { side: 'manager'|'master'; score: number } => ({
    side: (m >= 50 ? 'master' : 'manager') as 'manager'|'master',
    score: m >= 50 ? m : 100 - m
  })
  const orientationDefault = calcOrientation(scores.others)
  const executionDefault = calcExecution(scores.master)

  const normalizeInsight = (o: any, def: { side: any; score: number }) => ({
    side: (o?.side === 'self' || o?.side === 'others') ? o.side : def.side,
    score: clamp(o?.score ?? def.score),
    headline: typeof o?.headline === 'string' ? o.headline.trim() : '',
    paragraph: typeof o?.paragraph === 'string' ? o.paragraph.trim() : '',
    evidence: Array.isArray(o?.evidence) ? o.evidence.slice(0,5).map((s: any)=> typeof s === 'string' ? s.trim() : '') : [],
    analysis: typeof o?.analysis === 'string' ? o.analysis.trim() : '',
    summary: typeof o?.summary === 'string' ? o.summary.trim() : ''
  })

  const orientation = normalizeInsight(input?.orientation, orientationDefault)
  const execution = normalizeInsight(input?.execution, executionDefault)
  const normType = (t: any) => ({
    id: typeof t?.id === 'string' ? t.id : '',
    name: typeof t?.name === 'string' ? t.name.trim() : '',
    position: typeof t?.position === 'string' ? t.position.trim() : '',
    description: typeof t?.description === 'string' ? t.description.trim() : '',
    traits: Array.isArray(t?.traits) ? t.traits.slice(0, 8).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : []
  })
  const current_type = normType(input?.current_type || {})
  const types = Array.isArray(input?.types) ? input.types.slice(0, 5).map(normType) : []
  const scenes = Array.isArray(input?.scenes)
    ? input.scenes.slice(0, 5).map((s: any) => ({
        category: typeof s?.category === 'string' ? s.category.trim() : '',
        evidence: Array.isArray(s?.evidence) ? s.evidence.slice(0, 5).map((e: any) => (typeof e === 'string' ? e.trim() : '')) : [],
        analysis: typeof s?.analysis === 'string' ? s.analysis.trim() : '',
        conclusion: typeof s?.conclusion === 'string' ? s.conclusion.trim() : ''
      }))
    : []
  return { scores, orientation, execution, current_type, types, scenes }
}

function masterManagerToMarkdown(mm: { scores: any; current_type: any; types?: any[]; scenes?: any[] }) {
  const lines: string[] = []
  lines.push('# Master–Manager Spectrum')
  lines.push('')
  if (mm?.scores) {
    lines.push(`- Master 점수: ${mm.scores.master}%`)
    lines.push(`- Manager(others) 점수: ${mm.scores.others}%`)
    lines.push('')
  }
  if (mm?.current_type?.name) {
    lines.push(`## 현재 타입: ${mm.current_type.name}`)
    if (mm.current_type.position) lines.push(`- 포지션: ${mm.current_type.position}`)
    if (mm.current_type.description) lines.push(`- 설명: ${mm.current_type.description}`)
    if (Array.isArray(mm.current_type.traits) && mm.current_type.traits.length) {
      lines.push('- 특성:')
      for (const tr of mm.current_type.traits) lines.push(`  - ${tr}`)
    }
    lines.push('')
  }
  if (Array.isArray(mm.scenes) && mm.scenes.length) {
    lines.push('## 장면 근거')
    for (const s of mm.scenes) {
      lines.push(`- 카테고리: ${s.category || ''}`)
      if (Array.isArray(s.evidence) && s.evidence.length) {
        lines.push('  - 근거:')
        for (const e of s.evidence) lines.push(`    - ${e}`)
      }
      if (s.analysis) lines.push(`  - 해석: ${s.analysis}`)
      if (s.conclusion) lines.push(`  - 결론: ${s.conclusion}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function validateAndFillFitTriggers(input: any) {
  const on = Array.isArray(input?.on)
    ? input.on.slice(0, 7).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
    : []
  const off = Array.isArray(input?.off)
    ? input.off.slice(0, 7).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
    : []
  const do_more = Array.isArray(input?.do_more)
    ? input.do_more.slice(0, 3).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
    : []
  const do_less = Array.isArray(input?.do_less)
    ? input.do_less.slice(0, 3).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
    : []
  const recovery = {
    quick90: typeof input?.recovery?.quick90 === 'string' ? input.recovery.quick90.trim() : '호흡(30s) → 감정 라벨(30s) → 다음 한 걸음(30s)',
    extended: Array.isArray(input?.recovery?.extended)
      ? input.recovery.extended.slice(0, 3).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
      : ['환경 정리', '연결 요청', '작은 성취']
  }
  const boundary_phrases = Array.isArray(input?.boundary_phrases)
    ? input.boundary_phrases.slice(0, 3).map((s: any) => (typeof s === 'string' ? s.trim() : ''))
    : []
  return { on, off, do_more, do_less, recovery, boundary_phrases }
}

function fitTriggersToMarkdown(ft: { on?: string[]; off?: string[]; do_more?: string[]; do_less?: string[]; recovery?: any; boundary_phrases?: string[] }) {
  const lines: string[] = []
  lines.push('# Fit & Triggers')
  lines.push('')
  if (Array.isArray(ft.on) && ft.on.length) {
    lines.push('## On(켜짐) 조건')
    for (const s of ft.on) lines.push(`- ${s}`)
    lines.push('')
  }
  if (Array.isArray(ft.off) && ft.off.length) {
    lines.push('## Off(꺼짐) 조건')
    for (const s of ft.off) lines.push(`- ${s}`)
    lines.push('')
  }
  if (Array.isArray(ft.do_more) && ft.do_more.length) {
    lines.push('## Do more')
    for (const s of ft.do_more) lines.push(`- [ ] ${s}`)
    lines.push('')
  }
  if (Array.isArray(ft.do_less) && ft.do_less.length) {
    lines.push('## Do less')
    for (const s of ft.do_less) lines.push(`- [ ] ${s}`)
    lines.push('')
  }
  if (ft?.recovery) {
    lines.push('## Recovery Protocol')
    if (ft.recovery.quick90) lines.push(`- 90초 루틴: ${ft.recovery.quick90}`)
    if (Array.isArray(ft.recovery.extended) && ft.recovery.extended.length) {
      lines.push('- 확장 루틴:')
      for (const s of ft.recovery.extended) lines.push(`  - ${s}`)
    }
    lines.push('')
  }
  if (Array.isArray(ft.boundary_phrases) && ft.boundary_phrases.length) {
    lines.push('## 경계 문장')
    for (const s of ft.boundary_phrases) lines.push(`- ${s}`)
  }
  return lines.join('\n')
}

function validateAndFillLightShadow(input: any) {
  const normalizeStrength = (x: any) => ({
    title: typeof x?.title === 'string' ? x.title.trim() : '',
    percentage: Number.isFinite(Number(x?.percentage)) ? Number(x.percentage) : 0,
    description: typeof x?.description === 'string' ? x.description.trim() : '',
    insight: typeof x?.insight === 'string' ? x.insight.trim() : '',
    situations: Array.isArray(x?.situations) ? x.situations.slice(0, 5).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : [],
    roles: Array.isArray(x?.roles) ? x.roles.slice(0, 5).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : [],
    impact: typeof x?.impact === 'string' ? x.impact.trim() : ''
  })
  const normalizeShadow = (x: any) => ({
    title: typeof x?.title === 'string' ? x.title.trim() : '',
    percentage: Number.isFinite(Number(x?.percentage)) ? Number(x.percentage) : 0,
    description: typeof x?.description === 'string' ? x.description.trim() : '',
    insight: typeof x?.insight === 'string' ? x.insight.trim() : '',
    examples: Array.isArray(x?.examples) ? x.examples.slice(0, 5).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : [],
    solutions: Array.isArray(x?.solutions) ? x.solutions.slice(0, 5).map((s: any) => ({
      title: typeof s?.title === 'string' ? s.title.trim() : '',
      method: typeof s?.method === 'string' ? s.method.trim() : ''
    })) : []
  })
  const strengths = Array.isArray(input?.strengths) ? input.strengths.slice(0, 3).map(normalizeStrength) : []
  const shadows = Array.isArray(input?.shadows) ? input.shadows.slice(0, 3).map(normalizeShadow) : []
  return { strengths, shadows }
}

function lightShadowToMarkdown(ls: { strengths?: any[]; shadows?: any[] }) {
  const lines: string[] = []
  lines.push('# Light & Shadow')
  lines.push('')
  if (Array.isArray(ls.strengths) && ls.strengths.length) {
    lines.push('## Strengths')
    for (const s of ls.strengths) {
      lines.push(`- ${s.title} (${s.percentage || 0}%)`)
      if (s.description) lines.push(`  - ${s.description}`)
    }
    lines.push('')
  }
  if (Array.isArray(ls.shadows) && ls.shadows.length) {
    lines.push('## Shadows')
    for (const s of ls.shadows) {
      lines.push(`- ${s.title} (${s.percentage || 0}%)`)
      if (s.description) lines.push(`  - ${s.description}`)
    }
  }
  return lines.join('\n')
}

function validateAndFillPhilosophy(input: any) {
  const letter_content = typeof input?.letter_content === 'string' ? input.letter_content.trim() : ''
  return { letter_content }
}

function philosophyToMarkdown(p: { letter_content?: string }) {
  return `# Philosophy\n\n${p.letter_content || ''}`
}

function validateAndFillActionRecipe(input: any) {
  const normalize = (r: any) => ({
    id: typeof r?.id === 'string' ? r.id : '',
    title: typeof r?.title === 'string' ? r.title.trim() : '',
    duration: typeof r?.duration === 'string' ? r.duration.trim() : '',
    frequency: typeof r?.frequency === 'string' ? r.frequency.trim() : '',
    steps: Array.isArray(r?.steps) ? r.steps.slice(0, 10).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : []
  })
  const recipes = Array.isArray(input?.recipes) ? input.recipes.slice(0, 5).map(normalize) : []
  return { recipes }
}

function actionRecipeToMarkdown(a: { recipes?: any[] }) {
  const lines: string[] = []
  lines.push('# Action Recipe')
  lines.push('')
  for (const r of a.recipes || []) {
    lines.push(`## ${r.title}`)
    lines.push(`- 기간: ${r.duration || ''}`)
    lines.push(`- 빈도: ${r.frequency || ''}`)
    if (Array.isArray(r.steps) && r.steps.length) {
      lines.push('- 단계:')
      for (const s of r.steps) lines.push(`  - ${s}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function validateAndFillFuturePath(input: any) {
  const normalizeEnv = (e: any) => ({
    category: typeof e?.category === 'string' ? e.category.trim() : '',
    items: Array.isArray(e?.items) ? e.items.slice(0, 4).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : [],
    impact: typeof e?.impact === 'string' ? e.impact.trim() : ''
  })
  const environment = {
    remove: Array.isArray(input?.environment?.remove) ? input.environment.remove.slice(0, 3).map(normalizeEnv) : [],
    strengthen: Array.isArray(input?.environment?.strengthen) ? input.environment.strengthen.slice(0, 3).map(normalizeEnv) : []
  }
  return { environment }
}

function futurePathToMarkdown(f: { environment?: any }) {
  const lines: string[] = []
  lines.push('# Future Path')
  lines.push('')
  if (f.environment) {
    lines.push('## 환경')
    if (Array.isArray(f.environment.remove) && f.environment.remove.length) lines.push('- 제거: ' + f.environment.remove.map((x: any) => x.category).join(', '))
    if (Array.isArray(f.environment.strengthen) && f.environment.strengthen.length) lines.push('- 강화: ' + f.environment.strengthen.map((x: any) => x.category).join(', '))
    lines.push('')
  }
  return lines.join('\n')
}

function validateAndFillEpilogue(input: any) {
  const overall_score = Number.isFinite(Number(input?.overall_score)) ? Number(input.overall_score) : 0
  const insights = Array.isArray(input?.insights)
    ? input.insights.slice(0, 5).map((x: any) => ({
        title: typeof x?.title === 'string' ? x.title.trim() : '',
        description: typeof x?.description === 'string' ? x.description.trim() : '',
        score: Number.isFinite(Number(x?.score)) ? Number(x.score) : 0
      }))
    : []
  const action_items = Array.isArray(input?.action_items) ? input.action_items.slice(0, 10).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : []
  const reflection = typeof input?.reflection === 'string' ? input.reflection.trim() : ''
  return { overall_score, insights, action_items, reflection }
}

function epilogueToMarkdown(e: { overall_score?: number; insights?: any[]; action_items?: string[]; reflection?: string }) {
  const lines: string[] = []
  lines.push('# Epilogue')
  lines.push(`- 종합 점수: ${e.overall_score ?? 0}`)
  if (Array.isArray(e.insights) && e.insights.length) {
    lines.push('## 인사이트')
    for (const i of e.insights) lines.push(`- ${i.title}: ${i.description} (${i.score})`)
  }
  if (Array.isArray(e.action_items) && e.action_items.length) {
    lines.push('## 액션')
    for (const a of e.action_items) lines.push(`- [ ] ${a}`)
  }
  if (e.reflection) {
    lines.push('## 회고')
    lines.push(e.reflection)
  }
  return lines.join('\n')
}
export async function GET(req: Request, context: any) {
  // Robust sessionId resolution: await params (Next 15) and safe URL fallback
  let sessionId: string | undefined
  try {
    const params = await (context?.params)
    sessionId = params?.id
  } catch {}
  if (!sessionId) {
    const parts = new URL(req.url).pathname.split('/').filter(Boolean)
    const idx = parts.indexOf('session')
    sessionId = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : parts.slice(-2, -1)[0]
  }
  const { searchParams } = new URL(req.url)
  const type = (searchParams.get('type') || 'my_why') as 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers' | 'light_shadow' | 'philosophy' | 'action_recipe' | 'future_path' | 'epilogue'
  const checkOnly = (searchParams.get('check') === '1' || searchParams.get('check') === 'true')
  const backfill = false
  const force = (searchParams.get('force') === '1' || searchParams.get('force') === 'true')
  const cascade = (searchParams.get('cascade') === '1' || searchParams.get('cascade') === 'true') && type === 'my_why'
  const reset = (searchParams.get('reset') === '1' || searchParams.get('reset') === 'true')
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId가 필요합니다' }, { status: 400 })
  }

  try {
    // reset=1: 기존 보고서 전부 삭제 후 진행
    if (reset) {
      await supabaseServer
        .from('reports')
        .delete()
        .eq('session_id', sessionId)
    }
    // 1) 기존 저장된 보고서가 있으면 반환 (캐싱) — force=1이면 건너뜀
    const { data: existing, error: existingErr } = force ? { data: null as any, error: null as any } : await supabaseServer
      .from('reports')
      .select('content, created_at, updated_at')
      .eq('session_id', sessionId)
      .eq('type', type)
      .single()
    const needsBackfill = false

    if (!force && !existingErr && existing?.content && !needsBackfill) {
      // 캐시 즉시 반환. 보고서가 존재한다면 상태를 완료로 갱신(비동기)
      markSessionCompleted(sessionId, existing.content?.markdown).catch(() => {})
      // my_why + cascade는 비동기로 연쇄 생성 트리거(응답 지연 방지)
      if (type === 'my_why' && cascade) generateOthersIfMissing(sessionId).catch(() => {})
      return NextResponse.json({ success: true, report: existing.content, cached: true, createdAt: existing.created_at || existing.updated_at })
    }

    // 존재 확인만 요청한 경우: 생성 로직을 시작하지 않고 보류 응답
    if (checkOnly) {
      return NextResponse.json({ success: false, pending: true, error: '보고서 미생성' }, { status: 202 })
    }

    // 2) 세션 및 전체 메시지 로드
    const { data: sessionData, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !sessionData) {
      return NextResponse.json({ success: false, error: '세션을 찾을 수 없습니다' }, { status: 404 })
    }

    const { data: messages, error: msgError } = await supabaseServer
      .from('messages')
      .select('role, content, counselor_id, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (msgError) {
      return NextResponse.json({ success: false, error: '메시지 로딩 실패' }, { status: 500 })
    }

    // transcriptBuilder로 대체됨
    // 3) 이전에 생성된 1번 Why 보고서(있다면) 로드하여 2~5번 입력에 합산
    let whyReportContent: any = null
    if (type !== 'my_why') {
      // 1차: reports 테이블에서 조회
      const { data: whyExisting } = await supabaseServer
        .from('reports')
        .select('content')
        .eq('session_id', sessionId)
        .eq('type', 'my_why')
        .single()
      if (whyExisting?.content) {
        whyReportContent = whyExisting.content
      } else {
        // 2차: 세션 컬럼 폴백 사용
        const { data: sessionWhy } = await supabaseServer
          .from('sessions')
          .select('generated_why')
          .eq('id', sessionId)
          .single()
        if (sessionWhy?.generated_why) {
          whyReportContent = { markdown: sessionWhy.generated_why }
        }
      }
    }

    // 4) 선행 조건: 2~5 타입은 my_why 보고서가 이미 있어야 함 → 없으면 일시 보류(202)
    if (type !== 'my_why' && !whyReportContent) {
      return NextResponse.json({ success: false, pending: true, error: 'My Why 생성 대기 중' }, { status: 202 })
    }

    // Helpers
    const transcriptBuilder = () => (messages || [])
      .map(m => `${m.role === 'assistant' ? `[${m.counselor_id || 'assistant'}]` : '[user]'} ${m.content}`)
      .join('\n')

    const prompt = buildReportPrompt(type as any, {
      transcript: transcriptBuilder(),
      whyMarkdown: whyReportContent?.markdown,
      whyHeadline: (sessionData as any)?.user_name,
      userName: (sessionData as any)?.user_name
    })

    const systemMessage = SYSTEM_KO_JSON_ONLY

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ]
    })

    const content = completion.choices[0]?.message?.content || ''
    // 5) 응답 파싱: 실패 시 1회 엄격 재시도(JSON만)
    let parsed: any
    const tryParse = (raw: string) => {
      try { return parseJsonFlex(raw) } catch { return null }
    }
    parsed = tryParse(content)
    if (!parsed || typeof parsed !== 'object') {
      try {
        const strictPrompt = buildReportPrompt(type as any, {
          transcript: transcriptBuilder(),
          whyMarkdown: whyReportContent?.markdown,
          whyHeadline: (sessionData as any)?.user_name,
          userName: (sessionData as any)?.user_name,
        }) + '\n\n프리텍스트 금지. JSON만 반환.'
        const retry = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_KO_JSON_ONLY },
            { role: 'user', content: strictPrompt }
          ]
        })
        const retryContent = retry.choices[0]?.message?.content || ''
        parsed = tryParse(retryContent) || { markdown: retryContent.trim() }
      } catch {
        parsed = { markdown: content.trim() }
      }
    }

    // 6) 저장(UPSERT) — 검증 없이 그대로 저장
    const { error: upErr } = await supabaseServer
      .from('reports')
      .upsert({ session_id: sessionId, type, content: parsed }, { onConflict: 'session_id,type' })

    if (upErr) {
      console.error('❌ 보고서 저장 실패', upErr)
      // 폴백: 세션 컬럼에 저장 시도 (my_why인 경우에만 의미 있음)
      if (type === 'my_why' && parsed?.markdown) {
        const { error: sessErr } = await supabaseServer
          .from('sessions')
          .update({ generated_why: parsed.markdown, updated_at: new Date().toISOString() })
          .eq('id', sessionId)
        if (sessErr) console.error('❌ 세션 폴백 저장 실패', sessErr)
      }
    }

    // 어떤 타입이든 생성/저장 후 세션 상태 완료 처리 (why markdown만 동기화)
    await markSessionCompleted(sessionId, parsed?.markdown)

    // cascade: my_why 생성 완료 시 2~5 자동 생성 (이미 존재하면 스킵)
    if (cascade && type === 'my_why') {
      const whyMd = (parsed?.markdown as string | undefined)
      generateOthersIfMissing(sessionId, whyMd).catch(() => {})
      return NextResponse.json({ success: true, report: parsed, first: true, cascading: true, createdAt: new Date().toISOString() })
    }

    return NextResponse.json({ success: true, report: parsed, createdAt: new Date().toISOString() })
  } catch (e) {
    console.error('❌ Report generation error', e)
    return NextResponse.json({ success: false, error: '보고서 생성 실패' }, { status: 500 })
  }
}

async function generateOthersIfMissing(sessionId: string, whyMd?: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // 토큰 절약: 현재 UI에서 사용 중인 필수 타입만 연쇄 생성 (타입은 전체 유지, 값만 축소)
  const types: Array<'value_map'|'style_pattern'|'master_manager_spectrum'|'fit_triggers'|'light_shadow'|'philosophy'|'action_recipe'|'future_path'|'epilogue'> = [
    'value_map','style_pattern','master_manager_spectrum','light_shadow','philosophy','future_path'
  ]
  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
  // Load messages to build transcript
  const { data: messages } = await supabaseServer
    .from('messages')
    .select('role, content, counselor_id, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  const transcript = (messages || [])
    .map(m => `${m.role === 'assistant' ? `[${m.counselor_id || 'assistant'}]` : '[user]'} ${m.content}`)
    .join('\n')

  // ensure whyMd available via fallback
  if (!whyMd) {
    const { data: whyFromReports } = await supabaseServer
      .from('reports')
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', 'my_why')
      .single()
    whyMd = whyFromReports?.content?.markdown
    if (!whyMd) {
      const { data: sessionWhy } = await supabaseServer
        .from('sessions')
        .select('generated_why')
        .eq('id', sessionId)
        .single()
      if (sessionWhy?.generated_why) whyMd = sessionWhy.generated_why
    }
  }

  for (const t of types) {
    const { data: existing } = await supabaseServer
      .from('reports')
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', t)
      .single()
    if (existing?.content) continue

    const prompt = buildReportPrompt(t as any, {
      transcript,
      whyMarkdown: whyMd,
      userName: undefined
    })

    // Retry up to 3 attempts with incremental backoff
    let lastErr: any = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const sys = (t === 'value_map' || t === 'style_pattern' || t === 'master_manager_spectrum' || t === 'light_shadow' || t === 'philosophy' || t === 'future_path')
          ? '한국어로만 작성. 프리텍스트 금지. JSON만 반환.'
          : '한국어로만 작성. 지정된 마크다운 템플릿 그대로, 불필요한 텍스트 금지. 마크다운만 반환.'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
            { role: 'system', content: sys },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
    const content = completion.choices[0]?.message?.content || ''
        let parsed: any
        // JSON 스키마 출력 타입은 JSON→검증→Markdown 변환
        if (t === 'value_map') {
          try {
            const json = parseJsonFlex(content)
            const vm = validateAndFillValueMap(json)
            parsed = { ...vm, markdown: valueMapToMarkdown(vm) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'style_pattern') {
          try {
            const json = parseJsonFlex(content)
            const sp = validateAndFillStylePattern(json)
            parsed = { ...sp, markdown: stylePatternToMarkdown(sp) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'master_manager_spectrum') {
          try {
            const json = parseJsonFlex(content)
            const mm = validateAndFillMasterManager(json)
            parsed = { ...mm, markdown: masterManagerToMarkdown(mm) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'fit_triggers') {
          try {
            const json = parseJsonFlex(content)
            const ft = validateAndFillFitTriggers(json)
            parsed = { ...ft, markdown: fitTriggersToMarkdown(ft) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'light_shadow') {
          try {
            const json = parseJsonFlex(content)
            const ls = validateAndFillLightShadow(json)
            parsed = { ...ls, markdown: lightShadowToMarkdown(ls) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'philosophy') {
          try {
            const json = parseJsonFlex(content)
            const ph = validateAndFillPhilosophy(json)
            parsed = { ...ph, markdown: philosophyToMarkdown(ph) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'action_recipe') {
          try {
            const json = parseJsonFlex(content)
            const ar = validateAndFillActionRecipe(json)
            parsed = { ...ar, markdown: actionRecipeToMarkdown(ar) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'future_path') {
          try {
            const json = parseJsonFlex(content)
            const fp = validateAndFillFuturePath(json)
            parsed = { ...fp, markdown: futurePathToMarkdown(fp) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'epilogue') {
          try {
            const json = parseJsonFlex(content)
            const ep = validateAndFillEpilogue(json)
            parsed = { ...ep, markdown: epilogueToMarkdown(ep) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else {
          // 나머지는 마크다운 템플릿 그대로
          parsed = { markdown: content.trim() }
        }
        // 품질 체크: JSON 타입은 필수 필드 확인, 마크다운 타입은 길이 확인
        if (t === 'value_map') {
          if (!Array.isArray(parsed?.items) || parsed.items.length !== 3) {
            throw new Error('value_map items invalid')
          }
        } else if (t === 'style_pattern') {
          if (!Array.isArray(parsed?.styles) || parsed.styles.length < 3) {
            throw new Error('style_pattern styles empty')
          }
        } else if (t === 'master_manager_spectrum') {
          if (!parsed?.scores || typeof parsed.scores.master !== 'number' || typeof parsed.scores.others !== 'number') {
            throw new Error('mm scores invalid')
          }
        } else if (t === 'fit_triggers') {
          if (!Array.isArray(parsed?.on) || !Array.isArray(parsed?.off)) {
            throw new Error('fit_triggers invalid')
          }
        } else if (t === 'light_shadow') {
          if (!Array.isArray(parsed?.strengths) || !Array.isArray(parsed?.shadows)) {
            throw new Error('light_shadow invalid')
          }
        } else if (t === 'philosophy') {
          if (typeof parsed?.letter_content !== 'string' || parsed.letter_content.length < 10) {
            throw new Error('philosophy empty')
          }
        } else if (t === 'action_recipe') {
          if (!Array.isArray(parsed?.recipes) || parsed.recipes.length === 0) {
            throw new Error('action_recipe empty')
          }
        } else if (t === 'future_path') {
          if (!parsed?.environment || !Array.isArray(parsed.environment.remove) || !Array.isArray(parsed.environment.strengthen) || parsed.environment.remove.length !== 3 || parsed.environment.strengthen.length !== 3) {
            throw new Error('future_path invalid')
          }
        } else if (t === 'epilogue') {
          if (typeof parsed?.overall_score !== 'number') {
            throw new Error('epilogue invalid')
          }
        } else {
          if (!parsed.markdown || parsed.markdown.length < 10) {
            throw new Error(`empty or too short content for type ${t}`)
          }
        }
    await supabaseServer
      .from('reports')
      .upsert({ session_id: sessionId, type: t, content: parsed }, { onConflict: 'session_id,type' })
        lastErr = null
        break
      } catch (e) {
        lastErr = e
        console.warn(`Report generation attempt ${attempt + 1} failed for type=${t}`, e)
        await sleep(400 * (attempt + 1))
      }
    }
    if (lastErr) {
      console.error(`❌ Failed to generate report for type=${t} after retries`, lastErr)
    }
  }
}

async function markSessionCompleted(sessionId: string, whyMd?: string) {
  try {
    const baseTime = new Date().toISOString()
    const common: any = { status: 'completed', updated_at: baseTime }
    const withSummary: any = { ...common, counseling_phase: 'summary' }
    if (whyMd) withSummary.generated_why = whyMd
    // 1차: summary로 업데이트 시도
    const { error: err1 } = await supabaseServer
      .from('sessions')
      .update(withSummary)
      .eq('id', sessionId)
    if (!err1) return
    // 2차: 스키마가 summary를 허용하지 않는 경우 → completed로 고정
    const withCompleted: any = { ...common, counseling_phase: 'completed' }
    if (whyMd) withCompleted.generated_why = whyMd
    const { error: err2 } = await supabaseServer
      .from('sessions')
      .update(withCompleted)
      .eq('id', sessionId)
    if (!err2) return
    // 3차: counseling_phase 갱신을 생략하고 상태만 완료 처리
    const withStatusOnly: any = { ...common }
    if (whyMd) withStatusOnly.generated_why = whyMd
    await supabaseServer
      .from('sessions')
      .update(withStatusOnly)
      .eq('id', sessionId)
  } catch (e) {
    console.warn('세션 완료 업데이트 실패(무시 가능):', e)
  }
}


