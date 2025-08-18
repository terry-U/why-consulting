import { Character, CharacterType, CounselingPhase, CounselingQuestion } from '@/types/characters'
import { CHARACTERS, COUNSELING_QUESTIONS, getCharacter, getQuestion, getCurrentCounselor } from '@/lib/characters'
import { Session } from '@/lib/supabase'

export class CounselingManager {
  private session: Session

  constructor(session: Session) {
    this.session = session
  }

  /**
   * 현재 단계의 상담사를 가져옵니다
   */
  getCurrentCounselor(): Character {
    if (this.session.counseling_phase === 'intro' || this.session.counseling_phase === 'why_generation') {
      return getCharacter('main')
    }

    if (this.session.counseling_phase === 'questions') {
      return getCurrentCounselor(this.session.current_question_index + 1)
    }

    return getCharacter('main')
  }

  /**
   * 현재 질문을 가져옵니다
   */
  getCurrentQuestion(): CounselingQuestion | null {
    if (this.session.counseling_phase !== 'questions') {
      return null
    }

    return getQuestion(this.session.current_question_index + 1)
  }

  /**
   * 다음 단계로 진행 가능한지 확인합니다
   */
  canProceedToNext(): boolean {
    switch (this.session.counseling_phase) {
      case 'intro':
        return true // 인트로는 언제든 다음으로
      case 'questions':
        // 현재 질문에 대한 답변이 있는지 확인
        const currentQuestionId = `q${this.session.current_question_index + 1}`
        return !!this.session.answers[currentQuestionId]
      case 'why_generation':
        return !!this.session.generated_why
      case 'completed':
        return false // 이미 완료됨
      default:
        return false
    }
  }

  /**
   * 다음 단계로 진행합니다
   */
  getNextPhaseData(): { phase: CounselingPhase; questionIndex: number; counselor: Character } {
    switch (this.session.counseling_phase) {
      case 'intro':
        return {
          phase: 'questions',
          questionIndex: 0,
          counselor: getCurrentCounselor(1)
        }
      
      case 'questions':
        const nextQuestionIndex = this.session.current_question_index + 1
        
        if (nextQuestionIndex >= COUNSELING_QUESTIONS.length) {
          // 모든 질문 완료 - Why 생성 단계로
          return {
            phase: 'why_generation',
            questionIndex: nextQuestionIndex,
            counselor: getCharacter('main')
          }
        }
        
        return {
          phase: 'questions',
          questionIndex: nextQuestionIndex,
          counselor: getCurrentCounselor(nextQuestionIndex + 1)
        }
      
      case 'why_generation':
        return {
          phase: 'completed',
          questionIndex: this.session.current_question_index,
          counselor: getCharacter('main')
        }
      
      default:
        return {
          phase: this.session.counseling_phase,
          questionIndex: this.session.current_question_index,
          counselor: this.getCurrentCounselor()
        }
    }
  }

  /**
   * 답변을 저장합니다
   */
  saveAnswer(questionId: string, answer: string): Record<string, string> {
    return {
      ...this.session.answers,
      [questionId]: answer
    }
  }

  /**
   * 진행률을 계산합니다 (0-100)
   */
  getProgress(): number {
    switch (this.session.counseling_phase) {
      case 'intro':
        return 5 // 시작 단계
      case 'questions':
        const answeredQuestions = Object.keys(this.session.answers).length
        return 10 + (answeredQuestions / COUNSELING_QUESTIONS.length) * 80 // 10-90%
      case 'why_generation':
        return 95 // 거의 완료
      case 'completed':
        return 100 // 완료
      default:
        return 0
    }
  }

  /**
   * Why 문장 생성을 위한 프롬프트를 만듭니다
   */
  generateWhyPrompt(): string {
    const answers = Object.entries(this.session.answers)
      .map(([questionId, answer]) => {
        const questionNum = parseInt(questionId.replace('q', ''))
        const question = getQuestion(questionNum)
        return `질문 ${questionNum}: ${question?.text}\n답변: ${answer}`
      })
      .join('\n\n')

    return `다음은 사용자가 8개 질문에 답한 내용입니다:

${answers}

이 답변들을 종합하여 "[방법/스타일]함으로써 [궁극적 감정 상태][세상/사람들에게][~한다]" 형태의 Why 문장을 2-3개 후보로 생성해주세요.

각 후보는 다음 조건을 만족해야 합니다:
- 사용자의 답변에서 나타난 핵심 감정과 동기를 반영
- 구체적이고 실행 가능한 방법/스타일 포함
- 사용자가 추구하는 궁극적 감정 상태 명시
- 타인이나 세상에 미치고 싶은 영향 포함

따뜻하고 공감적인 톤으로 각 후보를 설명해주세요.`
  }

  /**
   * 사용자 진행 신호를 감지합니다 (예: "다음", "계속", "준비됐어" 등)
   */
  isProgressSignal(message: string): boolean {
    const progressKeywords = [
      '다음', '계속', '넘어가', '진행', '시작', '준비됐', '준비 됐', 
      '좋아', '네', '응', '오케이', 'ok', '예', '그래'
    ]
    
    const cleanMessage = message.toLowerCase().trim()
    return progressKeywords.some(keyword => cleanMessage.includes(keyword))
  }
}
