import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function GET(_req: Request, context: { params: { id: string } }) {
  const { params } = context
  const sessionId = params.id
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId가 필요합니다' }, { status: 400 })
  }

  try {
    // 세션 및 메시지 로드
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

    const prompt = `당신은 심리상담 내용을 구조화하는 분석가입니다. 아래 대화(transcript)를 바탕으로 클라이언트의 본질적 Why 한 문장을 도출하고, 요약 보고서를 JSON으로 작성하세요.

요구 포맷(JSON만):
{
  "whySentence": string,
  "categories": {
    "values": string[],
    "strengths": string[],
    "emotionalTriggers": string[],
    "narratives": string[],
    "risks": string[],
    "actionSteps": [{ "title": string, "description": string, "timeframe": "today"|"this_week"|"this_month" }]
  }
}

원칙:
- 왜 문장은 1문장, 사용자 어휘를 최대한 보존, 과장/판단 금지
- 카테고리는 3~6개 항목으로 간결하게
- actionSteps는 실행 가능한 동사로 시작

Transcript:\n${transcript}`

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

    return NextResponse.json({ success: true, report: parsed })
  } catch (e) {
    console.error('❌ Report generation error', e)
    return NextResponse.json({ success: false, error: '보고서 생성 실패' }, { status: 500 })
  }
}


