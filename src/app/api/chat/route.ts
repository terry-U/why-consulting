import { NextRequest, NextResponse } from 'next/server'
import { sendCounselingMessage } from '@/lib/openai'
import { addMessage, getSessionById, updateSession } from '@/lib/database'
import { CounselingManager } from '@/lib/counseling-logic'
import { INTRO_MESSAGES, COUNSELING_QUESTIONS } from '@/lib/counseling-types'

export async function POST(request: NextRequest) {
  console.log('💬 상담 채팅 API 호출')
  
  try {
    const { message, sessionId, userId } = await request.json()

    if (!message || !sessionId || !userId) {
      console.error('❌ 필수 정보 누락:', { message: !!message, sessionId: !!sessionId, userId: !!userId })
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    console.log('📝 사용자 메시지:', message)
    console.log('🆔 세션 ID:', sessionId)
    console.log('👤 사용자 ID:', userId)

    // 세션 정보 조회
    console.log('🔍 세션 정보 조회 중...')
    const session = await getSessionById(sessionId)
    
    if (!session?.thread_id) {
      console.error('❌ Thread ID 없음:', session)
      return NextResponse.json(
        { success: false, error: 'Thread ID가 없습니다.' },
        { status: 400 }
      )
    }

    console.log('📍 현재 상담 단계:', session.counseling_phase)
    console.log('🧵 Thread ID 확인:', session.thread_id)

    // 사용자 메시지 저장
    console.log('💾 사용자 메시지 DB 저장 중...')
    const userMessage = await addMessage(sessionId, userId, 'user', message)

    // 현재 상담 상태 분석
    const currentPhase = session.counseling_phase
    const currentCounselor = CounselingManager.getCurrentCounselor(session)
    
    console.log('🎭 현재 상담사:', currentCounselor.name)

    let assistantResponse: string
    let nextPhaseData = null

    // 상담 단계별 처리
    if (currentPhase === 'intro') {
      // 인트로 단계 처리
      console.log('🌟 인트로 단계 처리 중...')
      
      const isNextSignal = message === '__NEXT__' || CounselingManager.isProgressSignal(message, currentPhase)
      if (isNextSignal) {
        // 다음 단계로 진행
        nextPhaseData = CounselingManager.getNextPhaseData(session)
        const firstQuestion = COUNSELING_QUESTIONS[0]
        assistantResponse = CounselingManager.generateQuestionMessage(firstQuestion)
      } else {
        // 다음 인트로 메시지 또는 진행 유도
        const nextIntroIndex = (session.current_question_index || 0) + 1
        if (nextIntroIndex < INTRO_MESSAGES.length) {
          assistantResponse = CounselingManager.generateIntroMessage(nextIntroIndex)
          nextPhaseData = {
            newPhase: 'intro' as const,
            newQuestionIndex: nextIntroIndex,
            newAnswers: session.answers,
            shouldGenerateWhy: false
          }
        } else {
          assistantResponse = "준비되셨다면 '시작할게요'라고 말씀해 주세요! 😊"
        }
      }
    } else if (currentPhase === 'questions') {
      // 질문 단계 처리
      console.log('❓ 질문 단계 처리 중...')
      
      // 다음 단계 데이터 계산
      nextPhaseData = CounselingManager.getNextPhaseData(session, message)
      
      if (nextPhaseData.shouldGenerateWhy) {
        // Why 생성 단계로
        assistantResponse = "정말 소중한 답변들을 들려주셔서 감사해요. 이제 이 모든 이야기를 바탕으로 당신만의 특별한 Why 문장을 함께 만들어보겠습니다. 잠시만 기다려주세요... ✨"
      } else {
        // 다음 질문으로
        const nextQuestion = COUNSELING_QUESTIONS[nextPhaseData.newQuestionIndex]
        assistantResponse = CounselingManager.generateQuestionMessage(nextQuestion)
      }
    } else if (currentPhase === 'why_generation') {
      // Why 생성 단계
      console.log('🎯 Why 생성 단계 처리 중...')
      const whyPrompt = CounselingManager.generateWhyPrompt(session.answers)
      assistantResponse = await sendCounselingMessage(
        session.thread_id, 
        whyPrompt,
        currentCounselor.id,
        currentPhase
      )
      nextPhaseData = CounselingManager.getNextPhaseData(session)
    } else {
      // 완료 단계
      assistantResponse = "상담이 완료되었습니다. 새로운 상담을 시작하려면 '새 상담' 버튼을 눌러주세요."
    }

    // 질문 단계에서는 컨텍스트를 포함해 GPT 호출
    if (currentPhase === 'questions') {
      const currentQuestion = CounselingManager.getCurrentQuestion(session)
      assistantResponse = await sendCounselingMessage(
        session.thread_id, 
        message,
        currentCounselor.id,
        currentPhase,
        currentQuestion?.question
      )
    }

    // AI 응답 저장
    console.log('💾 AI 응답 DB 저장 중...')
    const assistantMessage = await addMessage(
      sessionId, 
      userId, 
      'assistant', 
      assistantResponse,
      currentCounselor.id
    )

    // 세션 상태 업데이트
    if (nextPhaseData) {
      console.log('🔄 세션 상태 업데이트 중...')
      await updateSession(sessionId, {
        counseling_phase: nextPhaseData.newPhase,
        current_question_index: nextPhaseData.newQuestionIndex,
        answers: nextPhaseData.newAnswers,
        updated_at: new Date().toISOString()
      })
    } else {
      await updateSession(sessionId, { updated_at: new Date().toISOString() })
    }

    console.log('✅ 상담 채팅 API 성공 완료')
    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage,
      sessionUpdated: !!nextPhaseData
    })

  } catch (error) {
    console.error('❌ 상담 채팅 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 