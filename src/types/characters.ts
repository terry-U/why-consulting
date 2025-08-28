// PRD에 명시된 상담사 캐릭터 타입 정의

export type CounselorColor = 'yellow' | 'green' | 'purple' | 'red' | 'blue' | 'orange' | 'khaki' | 'black'

export type CharacterType = 'main' | 'yellow' | 'orange' | 'bibi' | 'purple' | 'green' | 'blue' | 'pink' | 'indigo'

export interface Character {
  type: CharacterType
  emoji: string
  name: string
  description: string
  color: string
  gradientFrom: string
  gradientTo: string
  tone: string
  role: string
}

export interface CounselorBadgeProps {
  color: CounselorColor
  mood?: 'calm' | 'focus' | 'rest'
}

export interface ProgressDotsProps {
  active: number
  total?: number
}

export interface AnswerConfirmSheetProps {
  qIdx: number
  candidate: string
  onConfirm: (text: string) => void
  onEdit: (text: string) => void
}

export interface WhyCandidate {
  text: string
  evidence?: string[]
}

export interface WhyCandidatesProps {
  candidates: WhyCandidate[]
  onFinalize: (text: string) => void
}

// 상담 단계 타입
export type CounselingPhase = 'questions' | 'summary' | 'completed'

// 상담 질문 인터페이스
export interface CounselingQuestion {
  id: string
  text: string
  counselor: CharacterType
  phase: number
  helpText?: string
  binaryChoices?: string[]
}
