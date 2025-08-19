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
  orange: {
    type: 'orange',
    emoji: '🧡',
    name: '오렌지',
    description: '보람과 의미 탐구',
    color: '#FB923C', // orange-400
    gradientFrom: '#FED7AA', // orange-200
    gradientTo: '#EA580C', // orange-600
    tone: '따뜻하고 격려하는 톤',
    role: '깊은 보람과 삶의 의미를 함께 발견합니다'
  },
  purple: {
    type: 'purple',
    emoji: '💜',
    name: '퍼플',
    description: '고난과 성장 탐구',
    color: '#A855F7', // purple-500
    gradientFrom: '#E9D5FF', // purple-200
    gradientTo: '#7C2D12', // purple-800
    tone: '깊이 있고 공감하는 톤',
    role: '어려운 순간을 통한 성장과 깨달음을 함께 찾습니다'
  },
  green: {
    type: 'green',
    emoji: '🌿',
    name: '그린',
    description: '이상향과 가치관 탐구',
    color: '#22C55E', // PRD 명시 green
    gradientFrom: '#BBF7D0', // green-200
    gradientTo: '#16A34A', // green-600
    tone: '자연스럽고 안정적인 톤',
    role: '이상적인 세상에 대한 비전을 함께 그려봅니다'
  },
  blue: {
    type: 'blue',
    emoji: '💙',
    name: '블루',
    description: '꿈과 진정한 욕구 탐구',
    color: '#3B82F6', // blue-500
    gradientFrom: '#DBEAFE', // blue-200
    gradientTo: '#1E40AF', // blue-800
    tone: '차분하고 깊이 있는 톤',
    role: '진정한 꿈과 내면의 욕구를 함께 탐구합니다'
  },
  pink: {
    type: 'pink',
    emoji: '💖',
    name: '핑크',
    description: '감정 전파와 사명감 탐구',
    color: '#EC4899', // pink-500
    gradientFrom: '#FBCFE8', // pink-200
    gradientTo: '#BE185D', // pink-700
    tone: '따뜻하고 감성적인 톤',
    role: '소중한 감정을 다른 사람들과 나누는 방법을 함께 찾습니다'
  }
}

// 8단계 질문 시스템 - 각 질문마다 고유한 상담사 1:1 매칭
export const COUNSELING_QUESTIONS: CounselingQuestion[] = [
  {
    id: 'q1',
    text: '당신이 가장 뿌듯했던 경험은 무엇인가요?',
    counselor: 'yellow',
    phase: 1,
    helpText: '크고 작은 일 모두 괜찮아요. 그때의 기분을 떠올려보세요.'
  },
  {
    id: 'q2', 
    text: '가장 보람 있었던 경험은요?',
    counselor: 'orange',
    phase: 2,
    helpText: '뿌듯함과는 다른, 깊은 만족감을 느꼈던 순간을 말해보세요.'
  },
  {
    id: 'q3',
    text: '인생에서 가장 좋았던 순간은 언제였나요?',
    counselor: 'bibi',
    phase: 3,
    helpText: '행복했던 그 순간을 자세히 떠올려보세요.'
  },
  {
    id: 'q4',
    text: '가장 괴로웠던/힘들었던 순간은요?',
    counselor: 'purple',
    phase: 4,
    helpText: '괜찮아요. 천천히 말씀해주세요.'
  },
  {
    id: 'q5',
    text: '전지전능하다면, 어떤 세상을 만들고 싶으세요?',
    counselor: 'green',
    phase: 5,
    helpText: '상상력을 발휘해서 자유롭게 말해보세요.'
  },
  {
    id: 'q6',
    text: '돈과 시간이 무한하다면, 무엇을 하고 싶으세요?',
    counselor: 'blue',
    phase: 6,
    helpText: '현실적인 제약 없이 진정으로 하고 싶은 것을 말해보세요.'
  },
  {
    id: 'q7',
    text: '당신의 감정 중 남에게도 전파하고 싶은 감정은 무엇인가요?',
    counselor: 'pink',
    phase: 7,
    helpText: '다른 사람들도 느꼈으면 하는 감정을 생각해보세요.'
  },
  {
    id: 'q8',
    text: '당신과 성격이 비슷한 후배 룸메이트가 있다면, 그 친구에게 꼭 해주고 싶은 인생 조언은?',
    counselor: 'main',
    phase: 8,
    helpText: '과거의 자신에게 해주고 싶었던 조언을 떠올려보세요.'
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
