// 상담사 정보 및 역할 정의
export interface CounselorInfo {
  id: string
  name: string
  emoji: string
  role: string
  description: string
  color: string
  gradientFrom: string
  gradientTo: string
  questions: number[]
}

export const COUNSELOR_INFO: Record<string, CounselorInfo> = {
  yellow: {
    id: 'yellow',
    name: '옐로',
    emoji: '🌞',
    role: '성취와 뿌듯함 탐구',
    description: '당신의 성공 경험과 보람찬 순간들을 함께 되돌아봅니다',
    color: '#F59E0B',
    gradientFrom: '#FEF3C7',
    gradientTo: '#FCD34D',
    questions: [1, 2]
  },
  bibi: {
    id: 'bibi',
    name: '비비',
    emoji: '🦋',
    role: '감정과 마음 탐구',
    description: '당신의 깊은 감정과 소중한 가치들을 섬세하게 들여다봅니다',
    color: '#8B5CF6',
    gradientFrom: '#EDE9FE',
    gradientTo: '#C4B5FD',
    questions: [3, 4, 7]
  },
  green: {
    id: 'green',
    name: '그린',
    emoji: '🌿',
    role: '꿈과 이상 탐구',
    description: '당신의 미래 비전과 진정한 바람을 함께 그려봅니다',
    color: '#10B981',
    gradientFrom: '#D1FAE5',
    gradientTo: '#6EE7B7',
    questions: [5, 6]
  },
  main: {
    id: 'main',
    name: '인디고',
    emoji: '🔷',
    role: '전체 상담 진행과 Why 도출',
    description: '모든 대화를 종합해 핵심을 한 줄로 정리해드립니다',
    color: '#4F46E5',
    gradientFrom: '#E0E7FF',
    gradientTo: '#6366F1',
    questions: [8]
  }
}

export const QUESTION_TITLES = [
  '가장 뿌듯했던 경험',
  '가장 보람 있었던 경험', 
  '인생에서 가장 좋았던 순간',
  '가장 괴로웠던/힘들었던 순간',
  '전지전능하다면 만들고 싶은 세상',
  '돈과 시간이 무한하다면 하고 싶은 일',
  '남에게도 전파하고 싶은 감정',
  '후배에게 해주고 싶은 인생 조언'
]

export function getCurrentCounselorInfo(phase: string, questionIndex: number): CounselorInfo {
  if (phase === 'questions' && questionIndex >= 1 && questionIndex <= 8) {
    const counselorId = getCounselorForQuestion(questionIndex)
    return COUNSELOR_INFO[counselorId]
  }
  return COUNSELOR_INFO.main
}

export function getCounselorForQuestion(questionIndex: number): string {
  const counselorMap: Record<number, string> = {
    1: 'yellow',
    2: 'yellow', 
    3: 'bibi',
    4: 'bibi',
    5: 'green',
    6: 'green',
    7: 'bibi',
    8: 'main'
  }
  return counselorMap[questionIndex] || 'main'
}

export function getQuestionTitle(questionIndex: number): string {
  return QUESTION_TITLES[questionIndex - 1] || '상담 진행'
}
