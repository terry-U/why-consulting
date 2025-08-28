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
      my_why: `당신은 심리상담 내용을 구조화하는 분석가입니다. 아래 전체 대화(transcript)를 바탕으로 클라이언트의 본질적 Why 한 문장을 도출하고, 왜에 대한 요약 보고서를 JSON으로 작성하세요.

요구 포맷(JSON만):
{
  "whySentence": string,
  "rationale": string,
  "evidence": string[]
}

원칙:
- 왜 문장은 1문장, 사용자 어휘를 보존, 과장/판단 금지
- rationale은 2~4문장, evidence는 실제 발화 근거 3~6개

Transcript:\n${transcript}`,
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return ONLY valid JSON. No markdown, no extra text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    })

    const content = completion.choices[0]?.message?.content || '{}'
    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      // 재시도: JSON만 추출
      const start = content.indexOf('{')
      const end = content.lastIndexOf('}')
      parsed = JSON.parse(content.slice(start, end + 1))
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


