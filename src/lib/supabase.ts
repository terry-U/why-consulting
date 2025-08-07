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
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
} 