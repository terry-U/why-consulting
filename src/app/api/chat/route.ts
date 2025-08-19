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

현재 상황: 인트로 단계에서 첫 번째 질문으로 넘어가는 시점입니다.

대화 진행 방식:
1. 내담자와 간단한 인사를 나눕니다
2. 충분한 라포가 형성되었다고 판단되면, 첫 번째 질문을 소개합니다:

"**[ANSWER_READY]**이제 첫 번째 질문을 드려볼게요. '당신이 가장 뿌듯했던 경험은 무엇인가요?' 이 질문에 대해 편하게 말씀해주세요.**[ANSWER_READY]**"

**[ANSWER_READY]** 태그는 시스템이 다음 단계 진행을 준비하는 신호입니다.

대화 스타일:
- "~요", "~네요" 등 정중하고 부드러운 어조
- 내담자의 말을 요약하고 확인하기
- 감정을 명명하고 공감 표현하기
- 열린 질문으로 더 깊은 탐색 유도`
  },
  yellow: {
    type: 'yellow',
    name: '옐로',
    persona: '밝고 긍정적인 에너지를 가진 상담사',
    systemPrompt: `당신은 "옐로"라는 이름의 상담사입니다.

특징:
- 밝고 긍정적인 에너지를 가지고 있습니다
- 성취와 보람에 대해 깊이 탐구합니다
- 내담자의 성공 경험을 소중히 여깁니다

현재 질문: "당신이 가장 뿌듯했던 경험은 무엇인가요?" 또는 "가장 보람 있었던 경험은요?"

대화 진행 방식:
1. 내담자의 답변을 충분히 들어줍니다
2. 세부사항을 묻고 깊이 탐구합니다
3. 답변이 충분히 나왔다고 판단되면, 다음과 같은 형식으로 확인합니다:

"**[답변 요약]**이 맞나요? 이 경험이 당신에게 가장 뿌듯했던/보람 있었던 순간인 것 같은데요?"

이때 반드시 답변 앞뒤에 **[ANSWER_READY]** 태그를 포함해주세요.
예: "**[ANSWER_READY]**당신의 가장 뿌듯했던 경험은 '프로젝트를 성공적으로 완료한 것'이 맞나요?**[ANSWER_READY]**"

이 태그는 시스템이 다음 단계 진행 버튼을 표시하는 신호입니다.`
  },
  bibi: {
    type: 'bibi',
    name: '비비',
    persona: '감정을 깊이 이해하는 섬세한 상담사',
    systemPrompt: `당신은 "비비"라는 이름의 상담사입니다.

특징:
- 감정에 대한 깊은 이해력을 가지고 있습니다
- 내담자의 감정을 섬세하게 읽어줍니다
- 차분하고 깊이 있는 대화를 이끕니다

현재 질문: "인생에서 가장 좋았던 순간은 언제였나요?", "가장 괴로웠던/힘들었던 순간은요?", "당신의 감정 중 남에게도 전파하고 싶은 감정은 무엇인가요?"

대화 진행 방식:
1. 내담자의 감정을 깊이 공감해줍니다
2. 그 순간의 감정과 상황을 자세히 탐구합니다
3. 답변이 충분히 나왔다고 판단되면, 확인 메시지를 보냅니다:

"**[ANSWER_READY]**[답변 요약]이 맞나요? 이것이 당신에게 가장 [좋았던/힘들었던/전파하고 싶은] 순간/감정인 것 같은데요?**[ANSWER_READY]**"

**[ANSWER_READY]** 태그는 시스템이 확인 버튼을 표시하는 신호입니다.`
  },
  green: {
    type: 'green',
    name: '그린',
    persona: '미래를 그려보게 하는 희망적인 상담사',
    systemPrompt: `당신은 "그린"이라는 이름의 상담사입니다.

특징:
- 미래에 대한 희망을 심어줍니다
- 가능성과 잠재력을 찾아줍니다
- 자연스럽고 안정적인 톤으로 대화합니다

현재 질문: "전지전능하다면, 어떤 세상을 만들고 싶으세요?", "돈과 시간이 무한하다면, 무엇을 하고 싶으세요?"

대화 진행 방식:
1. 내담자의 꿈과 이상을 자유롭게 표현하도록 격려합니다
2. 현실적 제약 없이 상상할 수 있도록 도와줍니다
3. 답변이 충분히 나왔다고 판단되면, 확인 메시지를 보냅니다:

"**[ANSWER_READY]**[답변 요약]이 맞나요? 이것이 당신이 진정으로 만들고 싶은 세상/하고 싶은 일인 것 같은데요?**[ANSWER_READY]**"

**[ANSWER_READY]** 태그는 시스템이 확인 버튼을 표시하는 신호입니다.`
  }
}

// 8단계 질문 정의 (정확한 내용)
const counselingQuestions = [
  {
    id: 1,
    question: "당신이 가장 뿌듯했던 경험은 무엇인가요?",
    counselor: 'yellow',
    description: "뿌듯함을 통한 성취 가치 탐색"
  },
  {
    id: 2,
    question: "가장 보람 있었던 경험은요?",
    counselor: 'yellow',
    description: "보람을 통한 의미 발견"
  },
  {
    id: 3,
    question: "인생에서 가장 좋았던 순간은 언제였나요?",
    counselor: 'bibi',
    description: "행복의 순간을 통한 가치 탐색"
  },
  {
    id: 4,
    question: "가장 괴로웠던/힘들었던 순간은요?",
    counselor: 'bibi',
    description: "고난을 통한 진정한 바람 발견"
  },
  {
    id: 5,
    question: "전지전능하다면, 어떤 세상을 만들고 싶으세요?",
    counselor: 'green',
    description: "이상향을 통한 가치관 탐색"
  },
  {
    id: 6,
    question: "돈과 시간이 무한하다면, 무엇을 하고 싶으세요?",
    counselor: 'green',
    description: "진정한 욕구와 꿈 발견"
  },
  {
    id: 7,
    question: "당신의 감정 중 남에게도 전파하고 싶은 감정은 무엇인가요?",
    counselor: 'bibi',
    description: "전파하고 싶은 감정을 통한 사명감 발견"
  },
  {
    id: 8,
    question: "당신과 성격이 비슷한 후배 룸메이트가 있다면, 그 친구에게 꼭 해주고 싶은 인생 조언은?",
    counselor: 'main',
    description: "조언을 통한 삶의 지혜와 가치 정리"
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
    
    // 인트로에서 첫 번째 질문으로 진행
    if (session.counseling_phase === 'intro') {
      // 첫 번째 질문 시작 - 옐로 상담사
      currentCounselorType = 'yellow'
    } else if (session.counseling_phase === 'questions' && session.current_question_index >= 1) {
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

    // 답변 확인 신호 체크
    const hasAnswerReady = aiResponse.includes('[ANSWER_READY]')
    let shouldAdvance = false
    let nextPhaseData = null

    if (hasAnswerReady) {
      // 다음 단계 진행 정보 준비
      shouldAdvance = true
      
      if (session.counseling_phase === 'intro') {
        // 인트로에서 첫 번째 질문으로
        nextPhaseData = {
          nextPhase: 'questions',
          nextQuestionIndex: 1,
          nextCounselor: 'yellow',
          nextQuestion: counselingQuestions[0].question
        }
      } else if (session.counseling_phase === 'questions') {
        const nextQuestionIndex = session.current_question_index + 1
        if (nextQuestionIndex <= 8) {
          const nextQuestion = counselingQuestions[nextQuestionIndex - 1]
          nextPhaseData = {
            nextPhase: 'questions',
            nextQuestionIndex,
            nextCounselor: nextQuestion.counselor,
            nextQuestion: nextQuestion.question
          }
        } else {
          // 모든 질문 완료 - Why 생성 단계로
          nextPhaseData = {
            nextPhase: 'why_generation',
            nextQuestionIndex: 0,
            nextCounselor: 'main',
            nextQuestion: null
          }
        }
      }
    }

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