// 상담 진행 로직

import { Session } from '@/lib/supabase'
import { 
  COUNSELING_QUESTIONS, 
  INTRO_MESSAGES, 
  COUNSELOR_CHARACTERS,
  CounselingQuestion,
  CounselorCharacter 
} from '@/lib/counseling-types'

export class CounselingManager {
  
  // 현재 세션의 단계 확인
  static getCurrentPhase(session: Session): 'intro' | 'questions' | 'why_generation' | 'completed' {
    return session.counseling_phase
  }

  // 현재 질문 가져오기
  static getCurrentQuestion(session: Session): CounselingQuestion | null {
    if (session.counseling_phase !== 'questions') {
      return null
    }
    
    return COUNSELING_QUESTIONS[session.current_question_index] || null
  }

  // 현재 상담사 가져오기
  static getCurrentCounselor(session: Session): CounselorCharacter {
    const phase = session.counseling_phase
    
    if (phase === 'intro') {
      return COUNSELOR_CHARACTERS.main
    } else if (phase === 'questions') {
      const question = this.getCurrentQuestion(session)
      return question?.counselor || COUNSELOR_CHARACTERS.main
    } else if (phase === 'why_generation' || phase === 'completed') {
      return COUNSELOR_CHARACTERS.main
    }
    
    return COUNSELOR_CHARACTERS.main
  }

  // 다음 단계로 진행
  static getNextPhaseData(session: Session, userMessage?: string): {
    newPhase: Session['counseling_phase']
    newQuestionIndex: number
    newAnswers: Record<string, string>
    shouldGenerateWhy: boolean
  } {
    const currentPhase = session.counseling_phase
    const currentIndex = session.current_question_index
    const answers = { ...session.answers }

    if (currentPhase === 'intro') {
      // 인트로 완료 -> 첫 번째 질문으로
      return {
        newPhase: 'questions',
        newQuestionIndex: 0,
        newAnswers: answers,
        shouldGenerateWhy: false
      }
    } else if (currentPhase === 'questions') {
      // 현재 질문에 대한 답변 저장
      if (userMessage) {
        const currentQuestion = COUNSELING_QUESTIONS[currentIndex]
        if (currentQuestion) {
          answers[currentQuestion.id.toString()] = userMessage
        }
      }

      // 다음 질문으로 이동
      const nextIndex = currentIndex + 1
      
      if (nextIndex >= COUNSELING_QUESTIONS.length) {
        // 모든 질문 완료 -> Why 생성 단계로
        return {
          newPhase: 'why_generation',
          newQuestionIndex: nextIndex,
          newAnswers: answers,
          shouldGenerateWhy: true
        }
      } else {
        // 다음 질문으로
        return {
          newPhase: 'questions',
          newQuestionIndex: nextIndex,
          newAnswers: answers,
          shouldGenerateWhy: false
        }
      }
    } else if (currentPhase === 'why_generation') {
      // Why 생성 완료 -> 상담 완료
      return {
        newPhase: 'completed',
        newQuestionIndex: currentIndex,
        newAnswers: answers,
        shouldGenerateWhy: false
      }
    }

    // 기본값 (완료 상태 유지)
    return {
      newPhase: 'completed',
      newQuestionIndex: currentIndex,
      newAnswers: answers,
      shouldGenerateWhy: false
    }
  }

  // 인트로 메시지 생성
  static generateIntroMessage(messageIndex: number): string {
    if (messageIndex < INTRO_MESSAGES.length) {
      return INTRO_MESSAGES[messageIndex].message
    }
    return "준비되셨다면 '시작할게요'라고 말씀해 주세요! 😊"
  }

  // 질문 메시지 생성
  static generateQuestionMessage(question: CounselingQuestion): string {
    const counselor = question.counselor
    return `${counselor.emoji} **${counselor.name}**: ${question.question}`
  }

  // Why 생성 프롬프트 생성
  static generateWhyPrompt(answers: Record<string, string>): string {
    const answerText = Object.entries(answers)
      .map(([questionId, answer]) => {
        const question = COUNSELING_QUESTIONS.find(q => q.id.toString() === questionId)
        return `${question?.question}: ${answer}`
      })
      .join('\n\n')

    return `다음은 사용자가 8개 질문에 대해 답변한 내용입니다. 이를 바탕으로 사용자의 핵심 동기와 가치관을 분석하여 "[방법/스타일]함으로써 [궁극적 감정 상태][세상/사람들에게][~한다]" 형태의 Why 문장을 도출해주세요.

답변 내용:
${answerText}

위 답변들을 종합하여 사용자의 깊은 동기를 담은 Why 문장을 1-2개 제시해주세요. 각 문장은 사용자의 고유한 가치관과 감정적 동기를 반영해야 합니다.`
  }

  // 사용자 입력이 다음 단계 진행 신호인지 확인
  static isProgressSignal(message: string, currentPhase: Session['counseling_phase']): boolean {
    const normalizedMessage = message.toLowerCase().trim()
    
    if (currentPhase === 'intro') {
      return normalizedMessage.includes('시작') || 
             normalizedMessage.includes('준비') ||
             normalizedMessage.includes('네') ||
             normalizedMessage.includes('좋아') ||
             normalizedMessage.includes('ok') ||
             normalizedMessage.includes('오케이')
    }
    
    return false
  }
}

// 상담사별 응답 스타일 가이드
export const getCounselorResponseStyle = (counselorId: string): string => {
  const styles = {
    main: `따뜻하고 포용적인 톤으로, 전체 상담 과정을 안내하는 역할. 
           "천천히 괜찮아요", "편하게 말씀해 주세요" 같은 안정감을 주는 표현 사용.`,
    
    yello: `밝고 긍정적인 에너지로, 성취와 보람에 대해 탐구할 때 사용.
            "정말 뿌듯하셨을 것 같아요!", "그 순간이 얼마나 특별했을까요?" 같은 활기찬 표현.`,
    
    bibi: `차분하고 깊이 있는 톤으로, 감정의 깊은 부분을 탐구할 때 사용.
           "그때 마음이 어떠셨나요?", "그 감정을 좀 더 자세히 들여다볼까요?" 같은 섬세한 표현.`,
    
    green: `자연스럽고 안정적인 톤으로, 꿈과 비전을 탐구할 때 사용.
            "어떤 모습을 그려보고 계신가요?", "그 세상은 어떤 느낌일까요?" 같은 상상력을 자극하는 표현.`
  }
  
  return styles[counselorId as keyof typeof styles] || styles.main
}
