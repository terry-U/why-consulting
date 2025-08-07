import { supabase } from './supabase'
import { User, Session, Message } from './supabase'

// 클라이언트 사이드용 함수들 (RLS 정책 적용)
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
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

export async function getActiveSession(userId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')  // is_completed -> status로 변경
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

export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
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