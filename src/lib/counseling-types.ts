// 상담 구조 및 캐릭터 시스템 타입 정의

export interface CounselingQuestion {
  id: number
  question: string
  counselor: CounselorCharacter
  phase: 'intro' | 'question' | 'completed'
}

export interface CounselorCharacter {
  id: string
  name: string
  personality: string
  color: {
    primary: string
    secondary: string
    gradient: string
  }
  emoji: string
  description: string
}

export interface CounselingSession {
  currentQuestionIndex: number
  phase: 'intro' | 'questions' | 'why_generation' | 'completed'
  answers: Record<number, string> // questionId -> answer
  generatedWhy?: string
}

// 상담사 캐릭터들
export const COUNSELOR_CHARACTERS: Record<string, CounselorCharacter> = {
  main: {
    id: 'main',
    name: '메인 상담사',
    personality: '따뜻하고 포용적인 메인 진행자',
    color: {
      primary: 'blue-600',
      secondary: 'purple-600',
      gradient: 'from-blue-600 to-purple-600'
    },
    emoji: '🌟',
    description: '당신의 여정을 안내하는 메인 상담사입니다.'
  },
  yello: {
    id: 'yello',
    name: '옐로',
    personality: '밝고 긍정적인 에너지로 뿌듯함과 보람을 탐구',
    color: {
      primary: 'yellow-500',
      secondary: 'orange-500',
      gradient: 'from-yellow-500 to-orange-500'
    },
    emoji: '🌞',
    description: '밝은 에너지로 당신의 성취와 보람을 함께 탐구합니다.'
  },
  bibi: {
    id: 'bibi',
    name: '비비',
    personality: '차분하고 깊이 있는 통찰력으로 감정을 탐구',
    color: {
      primary: 'indigo-600',
      secondary: 'purple-700',
      gradient: 'from-indigo-600 to-purple-700'
    },
    emoji: '🦋',
    description: '깊은 통찰력으로 당신의 내면 감정을 함께 들여다봅니다.'
  },
  green: {
    id: 'green',
    name: '그린',
    personality: '자연스럽고 안정적인 에너지로 꿈과 비전을 탐구',
    color: {
      primary: 'green-600',
      secondary: 'emerald-600',
      gradient: 'from-green-600 to-emerald-600'
    },
    emoji: '🌿',
    description: '자연스럽고 안정적인 에너지로 당신의 꿈을 함께 그려봅니다.'
  }
}

// 8단계 상담 질문들
export const COUNSELING_QUESTIONS: CounselingQuestion[] = [
  {
    id: 1,
    question: '당신이 가장 뿌듯했던 경험은 무엇인가요?',
    counselor: COUNSELOR_CHARACTERS.yello,
    phase: 'question'
  },
  {
    id: 2,
    question: '가장 보람 있었던 경험은요?',
    counselor: COUNSELOR_CHARACTERS.yello,
    phase: 'question'
  },
  {
    id: 3,
    question: '인생에서 가장 좋았던 순간은 언제였나요?',
    counselor: COUNSELOR_CHARACTERS.bibi,
    phase: 'question'
  },
  {
    id: 4,
    question: '가장 괴로웠던/힘들었던 순간은요?',
    counselor: COUNSELOR_CHARACTERS.bibi,
    phase: 'question'
  },
  {
    id: 5,
    question: '전지전능하다면, 어떤 세상을 만들고 싶으세요?',
    counselor: COUNSELOR_CHARACTERS.green,
    phase: 'question'
  },
  {
    id: 6,
    question: '돈과 시간이 무한하다면, 무엇을 하고 싶으세요?',
    counselor: COUNSELOR_CHARACTERS.green,
    phase: 'question'
  },
  {
    id: 7,
    question: '당신의 감정 중 남에게도 전파하고 싶은 감정은 무엇인가요?',
    counselor: COUNSELOR_CHARACTERS.bibi,
    phase: 'question'
  },
  {
    id: 8,
    question: '당신과 성격이 비슷한 후배 룸메이트가 있다면, 그 친구에게 꼭 해주고 싶은 인생 조언은?',
    counselor: COUNSELOR_CHARACTERS.main,
    phase: 'question'
  }
]

// 상담 시작 시 안내 문구들
export const INTRO_MESSAGES = [
  {
    counselor: COUNSELOR_CHARACTERS.main,
    message: "안녕하세요! 저는 당신의 Why를 함께 찾아갈 메인 상담사입니다. 🌟"
  },
  {
    counselor: COUNSELOR_CHARACTERS.main,
    message: "이 상담은 당신의 핵심 감정 동기를 찾는 특별한 여정입니다. 마음이 가장 차분해지는 곳에서 좋아하는 음악을 틀고 시작해보세요. 🎵"
  },
  {
    counselor: COUNSELOR_CHARACTERS.main,
    message: "우리는 함께 8개의 질문을 통해 당신만의 인생 문장을 찾아갈 예정입니다. 한 번에 정확하게 모든 것을 찾을 수 있을 거라 생각하지 마세요."
  },
  {
    counselor: COUNSELOR_CHARACTERS.main,
    message: "적어도 5번은 깊이 생각해보고, 그 과정에서 나도 모르게 자신에게 집중하고 있다는 것을 느끼게 될 거예요. ✨"
  },
  {
    counselor: COUNSELOR_CHARACTERS.main,
    message: "준비되셨다면 '시작할게요'라고 말씀해 주세요. 각 질문마다 다른 상담사 친구들이 함께할 예정입니다! 😊"
  }
]
