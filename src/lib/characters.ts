import { Character, CharacterType, CounselingQuestion } from '@/types/characters'

// PRD에 명시된 색상 토큰 기반 캐릭터 정의
export const CHARACTERS: Record<CharacterType, Character> = {
  main: {
    type: 'main',
    emoji: '🌟',
    name: '메인 상담사',
    description: '인트로, Why 생성, 전체 진행 관리',
    color: '#111827', // black
    gradientFrom: '#374151', // gray-700
    gradientTo: '#111827', // gray-900
    tone: '친절하고 안내하는 톤',
    role: '전체 상담 진행과 Why 도출을 담당합니다'
  },
  yellow: {
    type: 'yellow',
    emoji: '🌞',
    name: '옐로',
    description: '뿌듯함, 보람 관련 질문',
    color: '#FDE047', // PRD 명시 yellow
    gradientFrom: '#FEF3C7', // yellow-100
    gradientTo: '#F59E0B', // yellow-500
    tone: '밝고 긍정적인 톤',
    role: '성취감과 보람을 느꼈던 순간들을 탐구합니다'
  },
  bibi: {
    type: 'bibi',
    emoji: '🦋',
    name: '비비',
    description: '감정, 좋은/힘든 순간 탐구',
    color: '#A78BFA', // PRD 명시 purple
    gradientFrom: '#DDD6FE', // purple-200
    gradientTo: '#7C3AED', // purple-600
    tone: '차분하고 깊이 있는 톤',
    role: '깊은 감정과 인생의 중요한 순간들을 함께 살펴봅니다'
  },
  green: {
    type: 'green',
    emoji: '🌿',
    name: '그린',
    description: '꿈과 비전 탐구',
    color: '#22C55E', // PRD 명시 green
    gradientFrom: '#BBF7D0', // green-200
    gradientTo: '#16A34A', // green-600
    tone: '자연스럽고 안정적인 톤',
    role: '미래의 꿈과 비전을 함께 그려봅니다'
  }
}

// 8단계 질문 시스템 (PRD 기반)
export const COUNSELING_QUESTIONS: CounselingQuestion[] = [
  {
    id: 'q1',
    text: '최근 1년 동안 가장 뿌듯했던 순간이 언제였나요?',
    counselor: 'yellow',
    phase: 1,
    helpText: '작은 일이라도 괜찮아요. 그때의 기분을 떠올려보세요.'
  },
  {
    id: 'q2', 
    text: '그때 어떤 감정을 느끼셨나요?',
    counselor: 'bibi',
    phase: 2,
    helpText: '정확한 단어를 찾지 못해도 괜찮아요. 느낌 그대로 표현해보세요.'
  },
  {
    id: 'q3',
    text: '반대로 가장 힘들었던 순간은 언제였나요?',
    counselor: 'bibi', 
    phase: 3,
    helpText: '괜찮아요. 천천히 말씀해주세요.'
  },
  {
    id: 'q4',
    text: '그 순간에 정말로 원했던 것은 무엇이었나요?',
    counselor: 'green',
    phase: 4,
    helpText: '겉으로 드러난 것이 아닌, 마음 깊은 곳의 진짜 바람을 말해보세요.'
  },
  {
    id: 'q5',
    text: '10년 후 어떤 모습이 되고 싶으신가요?',
    counselor: 'green',
    phase: 5,
    helpText: '구체적인 모습보다는 어떤 느낌으로 살고 있을지 상상해보세요.'
  },
  {
    id: 'q6',
    text: '주변 사람들에게 어떤 사람으로 기억되고 싶으신가요?',
    counselor: 'yellow',
    phase: 6,
    helpText: '타인의 평가가 아닌, 진정으로 전하고 싶은 당신의 모습을 말해보세요.'
  },
  {
    id: 'q7',
    text: '지금까지 살아오면서 가장 자주 반복되는 패턴이 있다면 무엇인가요?',
    counselor: 'bibi',
    phase: 7,
    helpText: '좋은 패턴이든 힘든 패턴이든 상관없어요. 자주 반복되는 것들을 떠올려보세요.'
  },
  {
    id: 'q8',
    text: '지금 이 순간, 가장 간절히 바라는 것은 무엇인가요?',
    counselor: 'main',
    phase: 8,
    helpText: '마음 깊은 곳에서 올라오는 진짜 바람을 솔직하게 말해보세요.'
  }
]

// 캐릭터 가져오기 함수
export function getCharacter(type: CharacterType): Character {
  return CHARACTERS[type]
}

// 질문 가져오기 함수
export function getQuestion(phase: number): CounselingQuestion | null {
  return COUNSELING_QUESTIONS.find(q => q.phase === phase) || null
}

// 현재 단계의 상담사 가져오기
export function getCurrentCounselor(phase: number): Character {
  const question = getQuestion(phase)
  if (question) {
    return getCharacter(question.counselor)
  }
  // 기본값은 메인 상담사
  return getCharacter('main')
}
