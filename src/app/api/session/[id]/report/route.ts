import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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
  const items = Array.isArray(input?.items) ? input.items.slice(0, 6).map(toItem) : []
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
  return { scores, current_type, types, scenes }
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
  const strengths = Array.isArray(input?.strengths) ? input.strengths.slice(0, 5).map(normalizeStrength) : []
  const shadows = Array.isArray(input?.shadows) ? input.shadows.slice(0, 5).map(normalizeShadow) : []
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
    items: Array.isArray(e?.items) ? e.items.slice(0, 10).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : [],
    impact: typeof e?.impact === 'string' ? e.impact.trim() : ''
  })
  const environment = {
    remove: Array.isArray(input?.environment?.remove) ? input.environment.remove.slice(0, 5).map(normalizeEnv) : [],
    strengthen: Array.isArray(input?.environment?.strengthen) ? input.environment.strengthen.slice(0, 5).map(normalizeEnv) : []
  }
  const roadmap = Array.isArray(input?.roadmap)
    ? input.roadmap.slice(0, 8).map((r: any) => ({
        phase: typeof r?.phase === 'string' ? r.phase.trim() : '',
        duration: typeof r?.duration === 'string' ? r.duration.trim() : '',
        actions: Array.isArray(r?.actions) ? r.actions.slice(0, 10).map((s: any) => (typeof s === 'string' ? s.trim() : '')) : [],
        milestone: typeof r?.milestone === 'string' ? r.milestone.trim() : ''
      }))
    : []
  return { environment, roadmap }
}

function futurePathToMarkdown(f: { environment?: any; roadmap?: any[] }) {
  const lines: string[] = []
  lines.push('# Future Path')
  lines.push('')
  if (f.environment) {
    lines.push('## 환경')
    if (Array.isArray(f.environment.remove) && f.environment.remove.length) lines.push('- 제거: ' + f.environment.remove.map((x: any) => x.category).join(', '))
    if (Array.isArray(f.environment.strengthen) && f.environment.strengthen.length) lines.push('- 강화: ' + f.environment.strengthen.map((x: any) => x.category).join(', '))
    lines.push('')
  }
  if (Array.isArray(f.roadmap) && f.roadmap.length) {
    lines.push('## 로드맵')
    for (const r of f.roadmap) {
      lines.push(`- ${r.phase} (${r.duration || ''})`) 
      if (Array.isArray(r.actions) && r.actions.length) for (const a of r.actions) lines.push(`  - ${a}`)
      if (r.milestone) lines.push(`  - 마일스톤: ${r.milestone}`)
    }
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
  const sessionId = context?.params?.id || new URL(req.url).pathname.split('/').filter(Boolean).pop()
  const { searchParams } = new URL(req.url)
  const type = (searchParams.get('type') || 'my_why') as 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers' | 'light_shadow' | 'philosophy' | 'action_recipe' | 'future_path' | 'epilogue'
  const checkOnly = (searchParams.get('check') === '1' || searchParams.get('check') === 'true')
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
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', type)
      .single()

    if (!force && !existingErr && existing?.content) {
      // 캐시 즉시 반환 + 요청 시 연쇄 생성 보장
      if (type === 'my_why') {
        await markSessionCompleted(sessionId, existing.content?.markdown)
        if (cascade) await generateOthersIfMissing(sessionId)
      }
      return NextResponse.json({ success: true, report: existing.content, cached: true })
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

    const buildPrompt = (
      t: 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers' | 'light_shadow' | 'philosophy' | 'action_recipe' | 'future_path' | 'epilogue',
      transcript: string,
      whyMarkdown?: string,
      whyHeadline?: string,
      userName?: string
    ) => {
      const prompts: Record<string, string> = {
        my_why: `역할: 당신은 공감형 스토리텔러이자 동기심리 코치입니다. 이 출력은 서비스의 '나의 Why' 섹션(JSON 전용)에 그대로 사용됩니다.

규칙:
- 한국어만 사용. 임상적 진단/라벨링/교정 어휘 금지.
- 프리텍스트 없이 JSON 객체 1개만 반환.
- 상투어(확산, 전달, 임팩트, 영향, 세상을 바꾸, 가치를 전)는 TRANSCRIPT에 실제 등장한 경우에만 허용.

입력:
- USER_NAME: ${userName || '사용자'}
- WHY_REFINED(headline): ${whyHeadline || '(미정)'}
- TRANSCRIPT(대화 전체):\n${transcript}

출력 형식(JSON만):
{
  "headline": "${whyHeadline || ''}",
  "markdown": "# My 'Why'\\n- Why 한 줄: [headline 그대로]\\n- 가치 Top3: [3개]\\n- 스타일 3개: [3개]\\n- 자기/타자 경향 한줄 해석: (예: \\\"자기 영향에 약간 더 치우친 편…\\\")\\n\\n## 해석(결정론 금지, 근거 중심)\\n- 당신은 어떤 스타일의 사람인지(핵심 습관·선택 기준)\\n- 지금까지 어떻게 살아왔는지(반복 패턴·의미)\\n- 그 결과 어떤 일이 생겼는지(강점·리스크·전환점)\\n- 앞으로 어떻게 살아가면 좋은지(핵심 조언 3가지: 구체·측정 가능)",
  "off_why_main": "<담백 1문장(18~40자)>",
  "off_why_alternatives": ["<대안1>", "<대안2>"],
  "narrative": ["<단락1(2~4문장)>", "<단락2(2~4문장)>", "<단락3(선택)>"] ,
  "reflection_questions": ["<질문1>", "<질문2>", "<질문3>"],
  "one_line_template": "어제 나는 ______ 때문에 _____해졌고, ______ 때문에 _____해졌다.",
  "cta_label": "엔터",
  "post_prompt": "어때요. 나의 Why와 비슷한 모습인가요?"
}

품질 체크:
- narrative는 2~3단락, 단락당 2~4문장.
- reflection_questions는 정확히 3개.
- TRANSCRIPT 어휘 1~2개 자연스럽게 포함.`,

        value_map: `역할: 전체 대화와 Why 보고서를 바탕으로 Value Map을 JSON 객체 1개로만 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- TRANSCRIPT: ${transcript}
- WHY_MD: ${whyMarkdown || (whyReportContent?.markdown || 'null')}

출력(JSON 스키마):
{
  "items": [
    {
      "head": "지표가 중요하다",
      "heart": "사람의 표정과 감사가 더 오래 남는다",
      "gapLevel": "high|medium|low",
      "headDetail": "문장",
      "heartDetail": "문장",
      "scene": "장면 설명 2~4문장",
      "bridge": "작은 실천 1문장"
    }
  ],
  "today_actions": ["실천 1", "실천 2", "실천 3"],
  "summary": "간단 요약 1~2문장"
}

품질 체크:
- items는 3~6개.
- gapLevel은 high/medium/low 중 하나.
- scene은 실제 대화의 단서 1~2개 포함.`,

        style_pattern: `역할: 대화와 Why를 바탕으로 Style Pattern을 JSON 객체 1개로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || (whyReportContent?.markdown || 'null')}

출력(JSON 스키마):
{
  "styles": [
    {
      "title": "사람들과 함께 일하기",
      "subtitle": "중간 공유와 피드백",
      "fitLevel": "high|medium|conditional",
      "what": "문장",
      "example": "문장",
      "why": "문장",
      "caution": "문장",
      "story": "2~5문장"
    }
  ],
  "quick_tips": [ { "id": "A", "title": "제목", "method": "방법", "tip": "팁" } ],
  "today_checklist": ["체크 1", "체크 2"],
  "summary": "요약 1~2문장"
}

품질 체크:
- styles는 3~5개.
- fitLevel은 high/medium/conditional 중 하나.
- story는 실제 장면 설명 포함.`,

        master_manager_spectrum: `역할: Master–Manager 스펙트럼 개념을 요약하고, 개인 성향을 해석하여 운영 가이드를 제시합니다.

규칙:
- 아래 템플릿을 마크다운 그대로 사용하여 한국어로만 작성합니다.
- 루틴/브릿지 언어/성장 과제에는 지표 또는 확인 방법을 포함합니다.

템플릿(그대로 출력):
# Master–Manager Spectrum
## 개념 요약
- 마스터: 스스로 가치를 만들어내려는 경향(자율·성취·변화 주도).
- 매니저: 타인/환경에 영향 주어 가치를 만들려는 경향(관계·기여·확산).

## 나의 성향과 해석
- 어디에 치우쳐 있는지, 맥락별로 어떻게 달라지는지(3~5문장).

## 앞으로의 운영 가이드
- 일하는 법(핵심 루틴 3개, 지표 포함).
- 협업 팁(브릿지 언어 2개 예: “목표→방법→마감”, “역할→책임→완료정의”).
- 성장 과제 3가지 & 리스크/완충 장치 1줄씩.

입력:
- Transcript(전체 대화)\n${transcript}
- WhyReport(Markdown)\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,

        fit_triggers: `역할: 켜짐/꺼짐 조건과 회복 프로토콜을 JSON 하나로 구조화합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMarkdown || (whyReportContent?.markdown || 'null')}

출력(JSON 스키마):
{
  "on": ["환경/사람/리듬/업무 유형별 5~7개"],
  "off": ["방해 요인 5~7개 + 초기 경고 신호"],
  "do_more": ["3개"],
  "do_less": ["3개"],
  "recovery": { "quick90": "호흡→라벨→다음 한 걸음", "extended": ["3단계"] },
  "boundary_phrases": ["회의/마감/우선순위 맥락 3문장"]
}

품질 체크:
- on/off 항목에 실제 대화 근거 1~2개 포함.`,

        light_shadow: `# Light & Shadow\n\nTranscript 기반으로 강점이 과도할 때의 그림자와 균형 전략을 제시하세요.\n\n입력:\n- Transcript\n${transcript}\n- WhyReport\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,
        philosophy: `# Philosophy\n\nTranscript 기반으로 삶의 철학/가치 지향을 요약하고 사례 근거를 3~5줄로 작성하세요.\n\n입력:\n- Transcript\n${transcript}\n- WhyReport\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,
        action_recipe: `# Action Recipe\n\n이번 주 실험 3개와 성공지표를 작성하세요.\n\n입력:\n- Transcript\n${transcript}\n- WhyReport\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,
        future_path: `# Future Path\n\n6~12개월 방향/마일스톤/리스크와 완충 장치를 요약하세요.\n\n입력:\n- Transcript\n${transcript}\n- WhyReport\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,
        epilogue: `# Epilogue\n\n이번 리포트의 핵심 전환점을 3줄로 요약하세요.\n\n입력:\n- Transcript\n${transcript}\n- WhyReport\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`
      }
      return prompts[t]
    }

    // WHY headline 확보 (prologue 등에서 활용)
    let whyHeadline: string | undefined
    if (!whyHeadline) {
      const { data: whyExisting } = await supabaseServer
        .from('reports')
        .select('content')
        .eq('session_id', sessionId)
        .eq('type', 'my_why')
        .single()
      if (whyExisting?.content?.headline) whyHeadline = whyExisting.content.headline
    }

    const prompt = buildPrompt(type as any, transcriptBuilder(), undefined, whyHeadline, (sessionData as any)?.user_name)

    const systemMessage = '한국어만 사용. my_why, value_map, style_pattern, master_manager_spectrum, fit_triggers, light_shadow, philosophy, action_recipe, future_path, epilogue는 반드시 JSON 하나만 반환(프리텍스트 금지). 상투어·진단 어휘 금지.'

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })

    const content = completion.choices[0]?.message?.content || ''
    let parsed: any
    if (type === 'my_why') {
      try {
        parsed = JSON.parse(content)
        // 안전 가드
        if (typeof parsed?.headline !== 'string' || typeof parsed?.markdown !== 'string') {
          throw new Error('invalid json shape')
        }
        parsed = validateAndFillMyWhy(parsed)
      } catch {
        // JSON 실패 시 전체를 마크다운으로 간주
        parsed = validateAndFillMyWhy({ headline: '', markdown: content.trim() } as any)
      }
    } else if (type === 'value_map') {
      // JSON 선호 파서 → 실패 시 마크다운으로 폴백
      try {
        const json = JSON.parse(content)
        const vm = validateAndFillValueMap(json)
        parsed = { ...vm, markdown: valueMapToMarkdown(vm) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'style_pattern') {
      try {
        const json = JSON.parse(content)
        const sp = validateAndFillStylePattern(json)
        parsed = { ...sp, markdown: stylePatternToMarkdown(sp) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'master_manager_spectrum') {
      try {
        const json = JSON.parse(content)
        const mm = validateAndFillMasterManager(json)
        parsed = { ...mm, markdown: masterManagerToMarkdown(mm) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'fit_triggers') {
      try {
        const json = JSON.parse(content)
        const ft = validateAndFillFitTriggers(json)
        parsed = { ...ft, markdown: fitTriggersToMarkdown(ft) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'light_shadow') {
      try {
        const json = JSON.parse(content)
        const ls = validateAndFillLightShadow(json)
        parsed = { ...ls, markdown: lightShadowToMarkdown(ls) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'philosophy') {
      try {
        const json = JSON.parse(content)
        const ph = validateAndFillPhilosophy(json)
        parsed = { ...ph, markdown: philosophyToMarkdown(ph) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'action_recipe') {
      try {
        const json = JSON.parse(content)
        const ar = validateAndFillActionRecipe(json)
        parsed = { ...ar, markdown: actionRecipeToMarkdown(ar) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'future_path') {
      try {
        const json = JSON.parse(content)
        const fp = validateAndFillFuturePath(json)
        parsed = { ...fp, markdown: futurePathToMarkdown(fp) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else if (type === 'epilogue') {
      try {
        const json = JSON.parse(content)
        const ep = validateAndFillEpilogue(json)
        parsed = { ...ep, markdown: epilogueToMarkdown(ep) }
      } catch {
        parsed = { markdown: content.trim() }
      }
    } else {
      parsed = { markdown: content.trim() }
    }

    // 6) 저장(UPSERT)
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

    // my_why 생성 시에는 성공/실패와 무관하게 세션 상태를 완료 처리하여 후속 흐름이 막히지 않도록 보장
    if (type === 'my_why') {
      await markSessionCompleted(sessionId, parsed?.markdown)
    }

    // cascade: my_why 생성 완료 시 2~5 자동 생성 (이미 존재하면 스킵)
    if (cascade && type === 'my_why') {
      const whyMd = (parsed?.markdown as string | undefined)
      await generateOthersIfMissing(sessionId, whyMd)
      return NextResponse.json({ success: true, report: parsed, first: true })
    }

    return NextResponse.json({ success: true, report: parsed })
  } catch (e) {
    console.error('❌ Report generation error', e)
    return NextResponse.json({ success: false, error: '보고서 생성 실패' }, { status: 500 })
  }
}

async function generateOthersIfMissing(sessionId: string, whyMd?: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const types: Array<'value_map'|'style_pattern'|'master_manager_spectrum'|'fit_triggers'|'light_shadow'|'philosophy'|'action_recipe'|'future_path'|'epilogue'> = [
    'value_map','style_pattern','master_manager_spectrum','fit_triggers','light_shadow','philosophy','action_recipe','future_path','epilogue'
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

    let prompt = ''
    if (t === 'value_map') {
      prompt = `역할: 전체 대화와 Why 보고서를 바탕으로 가치의 "생각 vs 실제" 간극까지 분석하고 해소 지침을 제시하는 보고서 작성자입니다.

규칙:
- 아래 템플릿을 마크다운 그대로 사용하여 한국어로만 작성합니다.
- 수집 방식/상담사/캐릭터 등 메타는 본문에 드러내지 않습니다.
- 실제 장면 근거를 간결히 제시하고, 간극 메우는 방법은 실험/지표를 포함합니다.

템플릿(그대로 출력):
# Value Map
## 나의 가장 큰 가치(우선순위)
- 1) …
- 2) …
- 3) …

## 생각하는 가치 vs 실제로 드러난 가치
| 가치 | 내가 가치 있다고 ‘생각’하는 것 | 실제 행동·장면 ‘근거’ | 간극(원인) | 메우는 방법(실험/지표) |
|---|---|---|---|---|
| 예시 | 자율성 | 의사결정 선호, 단독 시 빠른 실행 | 협업 시 갈등 | 회의 전 DoD 합의(리워크 -20%) |

## 간극에서 발생하는 일(메커니즘)
- 트리거 → 감정/사고 → 행동 → 결과를 3~5줄로 설명.
- 단기/중기 개선안 각각 1~2개(측정지표 포함).

입력:
- Transcript(전체 대화)\n${transcript}
- WhyReport(Markdown)\n${whyMd || 'null'}`
    } else if (t === 'style_pattern') {
      prompt = `역할: 대화와 Why를 바탕으로 Style Pattern을 JSON 객체 1개로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMd || 'null'}

출력(JSON 스키마):
{
  "styles": [
    {
      "title": "사람들과 함께 일하기",
      "subtitle": "중간 공유와 피드백",
      "fitLevel": "high|medium|conditional",
      "what": "문장",
      "example": "문장",
      "why": "문장",
      "caution": "문장",
      "story": "2~5문장"
    }
  ],
  "quick_tips": [
    { "id": "A", "title": "제목", "method": "방법", "tip": "팁" }
  ],
  "today_checklist": ["체크 1", "체크 2"],
  "summary": "요약 1~2문장"
}

품질 체크:
- styles는 3~5개.
- fitLevel은 high/medium/conditional 중 하나.
- story는 실제 장면 설명 포함.`
    } else if (t === 'master_manager_spectrum') {
      prompt = `역할: 대화와 Why를 바탕으로 Master–Manager Spectrum을 JSON 1개로 생성합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.
- 스키마를 반드시 준수합니다.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMd || 'null'}

출력(JSON 스키마):
{
  "scores": { "others": 0-100, "master": 0-100 },
  "current_type": { "id": "id", "name": "이름", "position": "설명", "description": "문장", "traits": ["특성1", "특성2"] },
  "types": [ { "id": "id", "name": "이름", "position": "설명", "description": "문장", "traits": ["특성"] } ],
  "scenes": [ { "category": "맥락", "evidence": ["근거"], "analysis": "해석", "conclusion": "결론" } ]
}

품질 체크:
- scores는 0~100 정수.
- scenes는 실제 대화 근거를 1~2개 포함.`
    } else if (t === 'fit_triggers') {
      prompt = `역할: 켜짐/꺼짐 조건과 회복 프로토콜을 JSON 하나로 구조화합니다.

규칙:
- 한국어만 사용. 프리텍스트 금지. JSON 1개만 반환.

입력:
- Transcript: ${transcript}
- WhyReport: ${whyMd || 'null'}

출력(JSON 스키마):
{
  "on": ["환경/사람/리듬/업무 유형별 5~7개"],
  "off": ["방해 요인 5~7개 + 초기 경고 신호"],
  "do_more": ["3개"],
  "do_less": ["3개"],
  "recovery": { "quick90": "호흡→라벨→다음 한 걸음", "extended": ["3단계"] },
  "boundary_phrases": ["회의/마감/우선순위 맥락 3문장"]
}

품질 체크:
- on/off 항목에 실제 대화 근거 1~2개 포함.`
    } else if (t === 'light_shadow') {
      prompt = `# Light & Shadow

Transcript 기반으로 강점이 과도할 때의 그림자와 균형 전략을 제시하세요.

입력:
- Transcript
${transcript}
- WhyReport
${whyMd || 'null'}`
    } else if (t === 'philosophy') {
      prompt = `# Philosophy

Transcript 기반으로 삶의 철학/가치 지향을 요약하고 사례 근거를 3~5줄로 작성하세요.

입력:
- Transcript
${transcript}
- WhyReport
${whyMd || 'null'}`
    } else if (t === 'action_recipe') {
      prompt = `# Action Recipe

이번 주 실험 3개와 성공지표를 작성하세요.

입력:
- Transcript
${transcript}
- WhyReport
${whyMd || 'null'}`
    } else if (t === 'future_path') {
      prompt = `# Future Path

6~12개월 방향/마일스톤/리스크와 완충 장치를 요약하세요.

입력:
- Transcript
${transcript}
- WhyReport
${whyMd || 'null'}`
    } else if (t === 'epilogue') {
      prompt = `# Epilogue

이번 리포트의 핵심 전환점을 3줄로 요약하세요.

입력:
- Transcript
${transcript}
- WhyReport
${whyMd || 'null'}`
    }

    // Retry up to 3 attempts with incremental backoff
    let lastErr: any = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: '한국어로만 작성. 지정된 마크다운 템플릿 그대로, 불필요한 텍스트 금지. 마크다운만 반환.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4
        })
        const content = completion.choices[0]?.message?.content || ''
        let parsed: any
        // JSON 스키마 출력 타입은 JSON→검증→Markdown 변환
        if (t === 'style_pattern') {
          try {
            const json = JSON.parse(content)
            const sp = validateAndFillStylePattern(json)
            parsed = { ...sp, markdown: stylePatternToMarkdown(sp) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'master_manager_spectrum') {
          try {
            const json = JSON.parse(content)
            const mm = validateAndFillMasterManager(json)
            parsed = { ...mm, markdown: masterManagerToMarkdown(mm) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else if (t === 'fit_triggers') {
          try {
            const json = JSON.parse(content)
            const ft = validateAndFillFitTriggers(json)
            parsed = { ...ft, markdown: fitTriggersToMarkdown(ft) }
          } catch {
            parsed = { markdown: content.trim() }
          }
        } else {
          // 나머지는 마크다운 템플릿 그대로
          parsed = { markdown: content.trim() }
        }
        if (!parsed.markdown || parsed.markdown.length < 10) {
          throw new Error(`empty or too short content for type ${t}`)
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
    const updates: any = { counseling_phase: 'summary', status: 'completed', updated_at: new Date().toISOString() }
    if (whyMd) updates.generated_why = whyMd
    await supabaseServer
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
  } catch (e) {
    console.warn('세션 완료 업데이트 실패(무시 가능):', e)
  }
}


