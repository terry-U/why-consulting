import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(req: Request, context: any) {
  const sessionId = context?.params?.id || new URL(req.url).pathname.split('/').filter(Boolean).pop()
  const { searchParams } = new URL(req.url)
  const type = (searchParams.get('type') || 'my_why') as 'my_why' | 'value_map' | 'style_pattern' | 'master_manager_spectrum' | 'fit_triggers'
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
      return NextResponse.json({ success: true, report: existing.content, cached: true })
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

    const transcript = (messages || [])
      .map(m => `${m.role === 'assistant' ? `[${m.counselor_id || 'assistant'}]` : '[user]'} ${m.content}`)
      .join('\n')

    // 3) 이전에 생성된 1번 Why 보고서(있다면) 로드하여 2~5번 입력에 합산
    let whyReportContent: any = null
    if (type !== 'my_why') {
      const { data: whyExisting } = await supabaseServer
        .from('reports')
        .select('content')
        .eq('session_id', sessionId)
        .eq('type', 'my_why')
        .single()
      if (whyExisting?.content) {
        whyReportContent = whyExisting.content
      }
    }

    // 4) 선행 조건: 2~5 타입은 my_why 보고서가 이미 있어야 함
    if (type !== 'my_why' && !whyReportContent) {
      return NextResponse.json({ success: false, error: '먼저 My Why 보고서를 생성해 주세요' }, { status: 400 })
    }

    // 5) 타입별 프롬프트 구성 (요구 포맷은 각 타입별로 분리, JSON만 반환)
    const prompts: Record<typeof type, string> = {
      my_why: `역할: 당신은 상담 대화 전체를 해석해 핵심 동기와 패턴을 정성적으로 도출하는 보고서 작성자입니다.

규칙:
- 아래 템플릿을 "마크다운" 그대로 사용해 한국어로만 작성합니다.
- 수집 방식/상담사/캐릭터/모델/프롬프트/메타는 본문에 일절 드러내지 않습니다.
- 전체 대화의 모든 맥락을 반영하되, 단정적 결정론은 피하고 근거 중심으로 서술합니다.

템플릿(그대로 출력):
# My 'Why'
- Why: [스타일/방법]함으로써 [궁극 감정]을 [누구/어디에] [어떻게 확산]한다.
- 가치 Top3: [3개]
- 스타일 3개: [3개]
- 자기/타자 경향 한줄 해석: (예: “자기 영향에 약간 더 치우친 편으로, 성취-안정 축을 선호하십니다.”)

## 해석(사주처럼 읽히되 결정론 금지, 자세히)
- 당신은 어떤 스타일의 사람인지(핵심 습관·선택 기준).
- 지금까지 어떻게 살아왔는지(반복 패턴·의미).
- 그 결과 어떤 일이 생겼는지(강점·리스크·전환점).
- 앞으로 어떻게 살아가면 좋은지(핵심 조언 3가지: 구체·측정 가능).

입력 Transcript(전체 대화):\n${transcript}`,
      value_map: `아래 전체 대화와, 주어진 Why 보고서를 함께 바탕으로 개인의 가치 지도를 만듭니다.

입력:
- Transcript (전체 대화):\n${transcript}
- WhyReport(JSON): ${whyReportContent ? JSON.stringify(whyReportContent) : 'null'}

요구 포맷(JSON만):
{
  "coreValues": string[],
  "supportingValues": string[],
  "conflicts": string[]
}`,
      style_pattern: `아래 전체 대화와 Why 보고서를 바탕으로 말과 행동의 패턴을 도출합니다.

입력:
- Transcript:\n${transcript}
- WhyReport(JSON): ${whyReportContent ? JSON.stringify({ whySentence: whyReportContent.whySentence }) : 'null'}

요구 포맷(JSON만):
{
  "communicationStyle": string[],
  "decisionPatterns": string[],
  "stressResponses": string[]
}`,
      master_manager_spectrum: `아래 전체 대화와 Why 보고서를 바탕으로 Master–Manager 스펙트럼 상 위치와 이유를 작성합니다.

입력:
- Transcript:\n${transcript}
- WhyReport(JSON): ${whyReportContent ? JSON.stringify({ whySentence: whyReportContent.whySentence }) : 'null'}

요구 포맷(JSON만):
{
  "position": "Master"|"Manager"|"Hybrid",
  "score": number, 
  "explanation": string
}`,
      fit_triggers: `아래 전체 대화와 Why 보고서를 바탕으로 잘 맞는 환경과 트리거를 도출합니다.

입력:
- Transcript:\n${transcript}
- WhyReport(JSON): ${whyReportContent ? JSON.stringify({ whySentence: whyReportContent.whySentence }) : 'null'}

요구 포맷(JSON만):
{
  "bestFit": string[],
  "antiFit": string[],
  "positiveTriggers": string[],
  "negativeTriggers": string[]
}`
    }

    const prompt = prompts[type]

    const systemMessage = type === 'my_why'
      ? '한국어로만 작성. 지정된 마크다운 템플릿 그대로, 불필요한 텍스트 금지. 마크다운만 반환.'
      : 'Return ONLY valid JSON. No markdown, no extra text.'

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
      parsed = { markdown: content.trim() }
    } else {
      try {
        parsed = JSON.parse(content)
      } catch {
        // 재시도: JSON만 추출
        const start = content.indexOf('{')
        const end = content.lastIndexOf('}')
        parsed = JSON.parse(content.slice(start, end + 1))
      }
    }

    // 6) 저장(UPSERT)
    const { error: upErr } = await supabaseServer
      .from('reports')
      .upsert({ session_id: sessionId, type, content: parsed }, { onConflict: 'session_id,type' })

    if (upErr) {
      console.error('❌ 보고서 저장 실패', upErr)
    }

    return NextResponse.json({ success: true, report: parsed })
  } catch (e) {
    console.error('❌ Report generation error', e)
    return NextResponse.json({ success: false, error: '보고서 생성 실패' }, { status: 500 })
  }
}


