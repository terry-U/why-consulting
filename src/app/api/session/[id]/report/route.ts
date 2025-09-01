import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(req: Request, context: any) {
  const sessionId = context?.params?.id || new URL(req.url).pathname.split('/').filter(Boolean).pop()
  const { searchParams } = new URL(req.url)
  const type = (searchParams.get('type') || 'my_why') as 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers'
  const checkOnly = (searchParams.get('check') === '1' || searchParams.get('check') === 'true')
  const cascade = (searchParams.get('cascade') === '1' || searchParams.get('cascade') === 'true') && type === 'my_why'
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId가 필요합니다' }, { status: 400 })
  }

  try {
    // 1) 기존 저장된 보고서가 있으면 반환 (캐싱)
    const { data: existing, error: existingErr } = await supabaseServer
      .from('reports')
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', type)
      .single()

    if (!existingErr && existing?.content) {
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

    const buildPrompt = (t: 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers', transcript: string, whyMarkdown?: string) => {
      const prompts: Record<typeof t, string> = {
      my_why: `역할: 상담 대화 전체를 해석해 Why 한 문장과 상세 해석 보고서를 작성합니다.

출력 형식: 반드시 JSON만 출력합니다. 프리텍스트 금지. 다음 스키마를 지키세요.
{
  "headline": string, // Why 한 줄 문장만. 따옴표·불릿 금지
  "markdown": string  // 아래 마크다운 템플릿을 그대로 채워 반환
}

Why 한 줄(headline) 생성 규칙:
- 다음 구조로, 자연스러운 한국어 문장 한 줄:
  "[남들을 위해 적극적으로 하는 일을 함]으로써 [그런 기여가 이뤄졌을 때 실제로 일어나는 일] 한다."
- 기여 파트: "[대상]을[에게] [스타일/방법] 함으로"
- 영향력 파트: 내가 중요하게 여기는 좋은 것을 타인도 느끼게 되는 실제 결과(예: 행복, 성취감, 안도감, 성장 등).

보고서(markdown) 템플릿(그대로 출력)

:
# My 'Why'
- Why 한 줄: [headline 그대로]
- 가치 Top3: [3개]
- 스타일 3개: [3개]
- 자기/타자 경향 한줄 해석: (예: "자기 영향에 약간 더 치우친 편…")

## 해석(결정론 금지, 근거 중심)
- 당신은 어떤 스타일의 사람인지(핵심 습관·선택 기준)
- 지금까지 어떻게 살아왔는지(반복 패턴·의미)
- 그 결과 어떤 일이 생겼는지(강점·리스크·전환점)
- 앞으로 어떻게 살아가면 좋은지(핵심 조언 3가지: 구체·측정 가능)

입력 Transcript(전체 대화):\n${transcript}`,

      value_map: `역할: 전체 대화와 Why 보고서를 바탕으로 가치의 "생각 vs 실제" 간극까지 분석하고 해소 지침을 제시하는 보고서 작성자입니다.

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
- WhyReport(Markdown)\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,

      style_pattern: `역할: 가치를 만들어내는 스타일의 일치/불일치를 진단하고 정교한 조언을 제시합니다.

규칙:
- 아래 템플릿을 마크다운 그대로 사용하여 한국어로만 작성합니다.
- 강점/주의/보완 팁은 구체적으로, 전환 방법에는 작은 실험과 성공 지표를 포함합니다.

템플릿(그대로 출력):
# Style Pattern
## 나의 핵심 스타일(3~5)
- 스타일명: 설명 (강점 / 주의 / 보완 팁)
- 권장 상황: …
- 피해야 할 상황: …

## 현재 스타일이 나와 ‘맞는지’ 평가
- 적합 포인트 2~3개, 부적합 포인트 1~2개.

## 더 잘 어울릴 수 있는 스타일 제안
- 대안 스타일 1~2개 + 전환 방법(작은 실험 2개, 성공지표 포함).

입력:
- Transcript(전체 대화)\n${transcript}
- WhyReport(Markdown)\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`,

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

      fit_triggers: `역할: 켜짐/꺼짐 조건을 정교화하고 예방·회복 프로토콜을 제시합니다.

규칙:
- 아래 템플릿을 마크다운 그대로 사용하여 한국어로만 작성합니다.
- 각 항목은 가능한 한 구체적인 단서/지표를 포함합니다.

템플릿(그대로 출력):
# Fit & Triggers
## On(켜짐) 조건
- 환경/사람/리듬/업무 유형별로 5~7개(짧은 근거 단서 포함).

## Off(꺼짐) 조건
- 방해 요인 5~7개 + 초기 경고 신호(행동/신체/생각).

## Do more / Do less
- 각 3개(실행 체크박스 + 주간 점검 지표).

## Recovery Protocol
- 90초 루틴: 호흡(30s) → 감정 라벨(30s) → ‘다음 한 걸음’(30s).
- 확장 루틴(3단계): 환경 정리 → 연결 요청 → 작은 성취(측정 포함).

## 경계 문장(Boundary Phrases)
- 스스로/타인에게 말하기 좋은 문장 3개(회의·마감·우선순위 맥락).

입력:
- Transcript(전체 대화)\n${transcript}
- WhyReport(Markdown)\n${whyMarkdown || (whyReportContent?.markdown || 'null')}`
      }
      return prompts[t]
    }

    const prompt = buildPrompt(type, transcriptBuilder())

    const systemMessage = '한국어로만 작성. 지정된 마크다운 템플릿 그대로, 불필요한 텍스트 금지. 마크다운만 반환.'

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
      } catch {
        // JSON 실패 시 전체를 마크다운으로 간주
        parsed = { headline: '', markdown: content.trim() }
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
    }

    return NextResponse.json({ success: true, report: parsed })
  } catch (e) {
    console.error('❌ Report generation error', e)
    return NextResponse.json({ success: false, error: '보고서 생성 실패' }, { status: 500 })
  }
}

async function generateOthersIfMissing(sessionId: string, whyMd?: string) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const types: Array<'value_map'|'style_pattern'|'master_manager_spectrum'|'fit_triggers'> = [
    'value_map','style_pattern','master_manager_spectrum','fit_triggers'
  ]
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
      prompt = `역할: 가치를 만들어내는 스타일의 일치/불일치를 진단하고 정교한 조언을 제시합니다.

규칙:
- 아래 템플릿을 마크다운 그대로 사용하여 한국어로만 작성합니다.
- 강점/주의/보완 팁은 구체적으로, 전환 방법에는 작은 실험과 성공 지표를 포함합니다.

템플릿(그대로 출력):
# Style Pattern
## 나의 핵심 스타일(3~5)
- 스타일명: 설명 (강점 / 주의 / 보완 팁)
- 권장 상황: …
- 피해야 할 상황: …

## 현재 스타일이 나와 ‘맞는지’ 평가
- 적합 포인트 2~3개, 부적합 포인트 1~2개.

## 더 잘 어울릴 수 있는 스타일 제안
- 대안 스타일 1~2개 + 전환 방법(작은 실험 2개, 성공지표 포함).

입력:
- Transcript(전체 대화)\n${transcript}
- WhyReport(Markdown)\n${whyMd || 'null'}`
    } else if (t === 'master_manager_spectrum') {
      prompt = `역할: Master–Manager 스펙트럼 개념을 요약하고, 개인 성향을 해석하여 운영 가이드를 제시합니다.

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
- WhyReport(Markdown)\n${whyMd || 'null'}`
    } else {
      prompt = `역할: 켜짐/꺼짐 조건을 정교화하고 예방·회복 프로토콜을 제시합니다.

규칙:
- 아래 템플릿을 마크다운 그대로 사용하여 한국어로만 작성합니다.
- 각 항목은 가능한 한 구체적인 단서/지표를 포함합니다.

템플릿(그대로 출력):
# Fit & Triggers
## On(켜짐) 조건
- 환경/사람/리듬/업무 유형별로 5~7개(짧은 근거 단서 포함).

## Off(꺼짐) 조건
- 방해 요인 5~7개 + 초기 경고 신호(행동/신체/생각).

## Do more / Do less
- 각 3개(실행 체크박스 + 주간 점검 지표).

## Recovery Protocol
- 90초 루틴: 호흡(30s) → 감정 라벨(30s) → ‘다음 한 걸음’(30s).
- 확장 루틴(3단계): 환경 정리 → 연결 요청 → 작은 성취(측정 포함).

## 경계 문장(Boundary Phrases)
- 스스로/타인에게 말하기 좋은 문장 3개(회의·마감·우선순위 맥락).

입력:
- Transcript(전체 대화)\n${transcript}
- WhyReport(Markdown)\n${whyMd || 'null'}`
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: '한국어로만 작성. 지정된 마크다운 템플릿 그대로, 불필요한 텍스트 금지. 마크다운만 반환.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4
    })
    const content = completion.choices[0]?.message?.content || ''
    const parsed: any = { markdown: content.trim() }
    await supabaseServer
      .from('reports')
      .upsert({ session_id: sessionId, type: t, content: parsed }, { onConflict: 'session_id,type' })
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


