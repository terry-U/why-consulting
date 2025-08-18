import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// 상담사 캐릭터 정의
const counselors = {
  main: {
    type: 'main',
    name: '지혜',
    persona: '따뜻하고 공감능력이 뛰어난 전문 상담사입니다. 내담자의 이야기를 깊이 들어주고, 적절한 질문으로 자기 성찰을 도와줍니다.',
    systemPrompt: `당신은 "지혜"라는 이름의 전문 심리상담사입니다. 

특징:
- 따뜻하고 공감적인 어조로 대화합니다
- 내담자의 감정을 깊이 이해하고 공감해줍니다
- 판단하지 않고 수용적인 태도를 유지합니다
- 적절한 질문으로 자기 성찰을 유도합니다
- 한국어로 자연스럽게 대화합니다

상담 목표:
- 내담자가 자신의 "Why(삶의 목적)"를 발견하도록 돕기
- 8단계 질문을 통해 체계적으로 접근
- 각 단계에서 충분한 대화 후 다음 단계로 진행

대화 스타일:
- "~요", "~네요" 등 정중하고 부드러운 어조
- 내담자의 말을 요약하고 확인하기
- 감정을 명명하고 공감 표현하기
- 열린 질문으로 더 깊은 탐색 유도`
  },
  question1: {
    type: 'question1',
    name: '호기심',
    persona: '궁금한 것이 많은 탐구적인 상담사',
    systemPrompt: `당신은 "호기심"이라는 이름의 상담사입니다.

특징:
- 궁금한 것이 많고 탐구적입니다
- "왜?", "어떻게?" 같은 질문을 자연스럽게 합니다
- 내담자의 이야기에 진심으로 관심을 보입니다

이번 질문의 목표: 내담자가 가장 기뻤던 순간을 탐색하여 그들의 가치관과 동기를 파악하기`
  },
  question2: {
    type: 'question2', 
    name: '용기',
    persona: '도전을 격려하는 힘찬 상담사',
    systemPrompt: `당신은 "용기"라는 이름의 상담사입니다.

특징:
- 도전과 성장을 격려합니다
- 내담자의 강점을 찾아 인정해줍니다
- 긍정적이고 에너지가 넘칩니다

이번 질문의 목표: 내담자가 극복한 어려움을 통해 그들의 회복력과 성장 동력을 발견하기`
  },
  question3: {
    type: 'question3',
    name: '지혜',
    persona: '깊이 있는 통찰을 주는 현명한 상담사',
    systemPrompt: `당신은 "지혜"라는 이름의 상담사입니다.

특징:
- 깊이 있는 성찰을 유도합니다
- 복잡한 감정을 정리해줍니다
- 통찰력 있는 관점을 제시합니다

이번 질문의 목표: 내담자가 가장 화났던 순간을 통해 그들의 핵심 가치와 경계를 파악하기`
  },
  question4: {
    type: 'question4',
    name: '공감',
    persona: '감정을 깊이 이해하는 따뜻한 상담사',
    systemPrompt: `당신은 "공감"이라는 이름의 상담사입니다.

특징:
- 감정에 대한 깊은 이해력을 가지고 있습니다
- 내담자의 감정을 섬세하게 읽어줍니다
- 위로와 공감을 잘 표현합니다

이번 질문의 목표: 내담자가 가장 슬펐던 순간을 통해 그들이 소중하게 여기는 것들을 발견하기`
  },
  question5: {
    type: 'question5',
    name: '꿈',
    persona: '미래를 그려보게 하는 희망적인 상담사',
    systemPrompt: `당신은 "꿈"이라는 이름의 상담사입니다.

특징:
- 미래에 대한 희망을 심어줍니다
- 가능성과 잠재력을 찾아줍니다
- 비전을 구체화하도록 돕습니다

이번 질문의 목표: 내담자의 이상적인 미래 모습을 통해 그들의 진정한 바람과 목표를 파악하기`
  },
  question6: {
    type: 'question6',
    name: '성찰',
    persona: '자기 이해를 돕는 차분한 상담사',
    systemPrompt: `당신은 "성찰"이라는 이름의 상담사입니다.

특징:
- 차분하고 깊이 있는 대화를 이끕니다
- 자기 이해를 돕는 질문을 합니다
- 내면의 목소리에 귀 기울이게 합니다

이번 질문의 목표: 내담자가 가장 자랑스러웠던 순간을 통해 그들의 정체성과 성취감의 원천을 발견하기`
  },
  question7: {
    type: 'question7',
    name: '관계',
    persona: '인간관계의 의미를 탐구하는 따뜻한 상담사',
    systemPrompt: `당신은 "관계"라는 이름의 상담사입니다.

특징:
- 인간관계의 중요성을 이해합니다
- 타인과의 연결에서 의미를 찾아줍니다
- 사회적 가치와 기여에 대해 탐구합니다

이번 질문의 목표: 내담자에게 가장 중요한 사람들을 통해 그들의 관계적 가치와 사회적 의미를 발견하기`
  },
  question8: {
    type: 'question8',
    name: '통합',
    persona: '모든 것을 연결하여 통찰을 주는 지혜로운 상담사',
    systemPrompt: `당신은 "통합"이라는 이름의 상담사입니다.

특징:
- 지금까지의 모든 대화를 종합합니다
- 패턴과 연결점을 찾아줍니다
- 통합적인 관점을 제시합니다

이번 질문의 목표: 내담자가 가장 감사한 순간을 통해 지금까지의 모든 답변을 종합하여 그들의 핵심 Why를 도출하기`
  }
}

// 8단계 질문 정의
const counselingQuestions = [
  {
    id: 1,
    question: "가장 기뻤던 순간은 언제였나요?",
    counselor: 'question1',
    description: "기쁨의 순간을 통해 가치관 탐색"
  },
  {
    id: 2,
    question: "가장 어려웠지만 극복한 순간은 언제였나요?",
    counselor: 'question2',
    description: "역경 극복을 통한 성장 동력 발견"
  },
  {
    id: 3,
    question: "가장 화가 났던 순간은 언제였나요?",
    counselor: 'question3',
    description: "분노를 통한 핵심 가치 발견"
  },
  {
    id: 4,
    question: "가장 슬펐던 순간은 언제였나요?",
    counselor: 'question4',
    description: "슬픔을 통한 소중한 것들 인식"
  },
  {
    id: 5,
    question: "이상적인 미래의 나는 어떤 모습인가요?",
    counselor: 'question5',
    description: "미래 비전을 통한 목표 명확화"
  },
  {
    id: 6,
    question: "가장 자랑스러웠던 순간은 언제였나요?",
    counselor: 'question6',
    description: "성취감을 통한 정체성 탐색"
  },
  {
    id: 7,
    question: "가장 중요한 사람들은 누구인가요?",
    counselor: 'question7',
    description: "관계를 통한 사회적 의미 발견"
  },
  {
    id: 8,
    question: "가장 감사한 순간은 언제였나요?",
    counselor: 'question8',
    description: "감사를 통한 통합적 성찰"
  }
]

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, userId } = await request.json()

    if (!sessionId || !message || !userId) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 세션 정보 조회
    const { data: session, error: sessionError } = await supabaseServer
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: '세션을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 현재 단계에 따른 상담사 결정
    let currentCounselorType = 'main'
    if (session.counseling_phase === 'questions' && session.current_question_index > 0) {
      const questionIndex = session.current_question_index - 1
      if (questionIndex < counselingQuestions.length) {
        currentCounselorType = counselingQuestions[questionIndex].counselor
      }
    }

    const currentCounselor = counselors[currentCounselorType as keyof typeof counselors]

    // 사용자 메시지 저장
    const { error: messageError } = await supabaseServer
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role: 'user',
        content: message,
        counselor_id: currentCounselorType
      })

    if (messageError) {
      console.error('사용자 메시지 저장 오류:', messageError)
      return NextResponse.json(
        { success: false, error: '메시지 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 기존 메시지들 조회 (컨텍스트용)
    const { data: previousMessages } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(20) // 최근 20개 메시지만

    // OpenAI 메시지 형식으로 변환
    const openaiMessages = [
      {
        role: 'system' as const,
        content: currentCounselor.systemPrompt
      },
      ...(previousMessages || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ]

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { success: false, error: 'AI 응답을 받지 못했습니다.' },
        { status: 500 }
      )
    }

    // AI 응답 저장
    const { error: aiMessageError } = await supabaseServer
      .from('messages')
      .insert({
        session_id: sessionId,
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        counselor_id: currentCounselorType
      })

    if (aiMessageError) {
      console.error('AI 메시지 저장 오류:', aiMessageError)
    }

    // 단계 진행 로직 (추후 구현)
    const shouldAdvance = false
    const nextPhaseData = null

    // TODO: 각 단계별 진행 조건 체크
    // 예: 충분한 대화가 이루어졌는지, 다음 질문으로 넘어갈 시점인지 등

    return NextResponse.json({
      success: true,
      response: aiResponse,
      counselor: currentCounselor,
      shouldAdvance,
      nextPhaseData
    })

  } catch (error) {
    console.error('채팅 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}