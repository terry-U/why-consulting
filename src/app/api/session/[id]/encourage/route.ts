import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 망설임 대응 프롬프트
const encouragementPrompts = {
  yellow: `사용자가 "조금 더 생각해볼게"를 선택했습니다. 부드럽게 기억을 떠올릴 수 있도록 도와주세요.

다음 중 하나의 방식으로 격려해주세요:
- "괜찮아요, 천천히 생각해보세요. 혹시 작은 일이라도 '아, 내가 잘했구나' 하고 느꼈던 순간이 있었나요?"
- "뿌듯함이 크지 않아도 괜찮아요. 혹시 누군가에게 고마움을 받았던 기억은 어떠세요?"
- "그 순간을 색깔로 표현하면 어떤 색일까요?"

따뜻하고 격려하는 톤으로, 짧게 한 문장으로 말해주세요.`,

  bibi: `사용자가 "조금 더 생각해볼게"를 선택했습니다. 감정을 부드럽게 떠올릴 수 있도록 도와주세요.

다음 중 하나의 방식으로 격려해주세요:
- "괜찮아요. 마음이 편한 때 떠올려보세요. 아주 작은 순간이라도 '좋다'고 느꼈던 기억이 있나요?"
- "혹시 그 감정을 온도로 표현하면 어떨까요?"
- "비슷한 감정을 느꼈던 다른 때도 있었을까요?"

섬세하고 공감하는 톤으로, 짧게 한 문장으로 말해주세요.`,

  green: `사용자가 "조금 더 생각해볼게"를 선택했습니다. 꿈을 부드럽게 떠올릴 수 있도록 도와주세요.

다음 중 하나의 방식으로 격려해주세요:
- "괜찮아요. 어릴 때 꿨던 소소한 꿈이라도 좋아요. 혹시 '이런 세상이면 좋겠다' 하고 생각해본 적 있나요?"
- "마법이 있다면 첫 번째로 뭘 하고 싶어요?"
- "사랑하는 사람들을 위해서라면 뭘 하고 싶으실까요?"

자연스럽고 격려하는 톤으로, 짧게 한 문장으로 말해주세요.`,

  main: `사용자가 "조금 더 생각해볼게"를 선택했습니다. 인생 조언을 부드럽게 떠올릴 수 있도록 도와주세요.

다음 중 하나의 방식으로 격려해주세요:
- "천천히 생각해보세요. 혹시 누군가에게 '이렇게 살았으면 좋겠다' 하고 바랐던 적이 있나요?"
- "과거의 나에게 해주고 싶었던 말이 있다면요?"
- "가장 힘들었을 때 누군가 해줬으면 좋았을 말은 뭘까요?"

따뜻하고 지혜로운 톤으로, 짧게 한 문장으로 말해주세요.`
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const sessionId = resolvedParams.id

  try {
    const { counselorType } = await request.json()

    console.log('🤗 격려 메시지 생성:', { sessionId, counselorType })

    // 세션 정보 조회
    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 격려 메시지 생성
    const encouragementPrompt = encouragementPrompts[counselorType as keyof typeof encouragementPrompts]
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: encouragementPrompt
        }
      ],
      temperature: 0.8,
      max_tokens: 200,
    })

    const encouragementMessage = completion.choices[0]?.message?.content

    if (!encouragementMessage) {
      return NextResponse.json(
        { success: false, error: '격려 메시지를 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 격려 메시지 저장
    await supabaseServer
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: session.user_id,
        role: 'assistant',
        content: encouragementMessage,
        counselor_id: counselorType
      })

    console.log('✅ 격려 메시지 생성 완료')
    return NextResponse.json({
      success: true,
      message: encouragementMessage
    })

  } catch (error) {
    console.error('❌ 격려 메시지 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
