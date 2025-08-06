import { createClient } from '@supabase/supabase-js'
import { User, Session, Message } from './supabase'

// 서버 사이드용 Supabase 클라이언트 (RLS 무시)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 사용자 관련 함수들
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('사용자 조회 오류:', error)
    return null
  }

  return data
}

export async function updateUserPaidStatus(userId: string, isPaid: boolean): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_paid_user: isPaid })
    .eq('id', userId)

  if (error) {
    console.error('사용자 결제 상태 업데이트 오류:', error)
    return false
  }

  return true
}

// 세션 관련 함수들
export async function createSession(userId: string): Promise<Session | null> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      user_id: userId,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_completed: false
    })
    .select()
    .single()

  if (error) {
    console.error('세션 생성 오류:', error)
    return null
  }

  return data
}

export async function getActiveSession(userId: string): Promise<Session | null> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null
    }
    console.error('활성 세션 조회 오류:', error)
    return null
  }

  return data
}

export async function updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', sessionId)

  if (error) {
    console.error('세션 업데이트 오류:', error)
    return false
  }

  return true
}

// 메시지 관련 함수들
export async function addMessage(
  sessionId: string, 
  userId: string, 
  role: 'user' | 'assistant', 
  content: string
): Promise<Message | null> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      created_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('메시지 추가 오류:', error)
    return null
  }

  return data
}

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('세션 메시지 조회 오류:', error)
    return []
  }

  return data || []
}

export async function getRecentMessages(sessionId: string, limit: number = 10): Promise<Message[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('최근 메시지 조회 오류:', error)
    return []
  }

  return (data || []).reverse() // 시간순으로 정렬
} 