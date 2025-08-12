import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export interface User {
  id: string
  email: string
  is_paid_user: boolean
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  method: string
  status: 'paid' | 'failed'
  amount: number
  paid_at: string
  valid_until: string
}

export interface Session {
  id: string
  user_id: string
  thread_id?: string  // OpenAI Assistant API Thread ID
  status: 'active' | 'completed' | 'paused'
  // 상담 구조 관련 필드
  counseling_phase: 'intro' | 'questions' | 'why_generation' | 'completed'
  current_question_index: number
  answers: Record<string, string> // 질문별 답변 저장
  generated_why?: string // 최종 도출된 Why 문장
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  counselor_id?: string // 메시지를 보낸 상담사 ID
  created_at: string
} 