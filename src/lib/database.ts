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
export async function createSession(userId: string, threadId: string): Promise<{ session: Session | null; error?: string }> {
  console.log('🗄️ 데이터베이스에 세션 생성 시작')
  console.log('👤 사용자 ID:', userId)
  console.log('🧵 Thread ID:', threadId)
  
  try {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .insert([
        {
          user_id: userId,
          thread_id: threadId,
          status: 'active',
          counseling_phase: 'intro',
          current_question_index: 0,
          answers: {}
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('❌ 세션 생성 오류:', error)
      return { session: null, error: error.message }
    }

    console.log('✅ 세션 생성 완료:', data.id)
    return { session: data }
  } catch (error) {
    console.error('❌ 세션 생성 중 예외:', error)
    return { session: null, error: (error as Error)?.message || 'Unknown error' }
  }
}

export async function getActiveSession(userId: string): Promise<Session | null> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
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

export async function getSessionById(sessionId: string): Promise<Session | null> {
  console.log('🔍 세션 ID로 조회:', sessionId)
  
  try {
    const { data, error } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (error) {
      console.error('❌ 세션 조회 오류:', error)
      return null
    }

    console.log('✅ 세션 조회 완료:', data?.id)
    return data
  } catch (error) {
    console.error('❌ 세션 조회 중 예외:', error)
    return null
  }
}

// 사용자 세션 목록 조회 (최근 업데이트 순)
export async function listUserSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('사용자 세션 목록 조회 오류:', error)
    return []
  }
  return data || []
}

// 메시지 관련 함수들
export async function addMessage(
  sessionId: string, 
  userId: string, 
  role: 'user' | 'assistant', 
  content: string,
  counselorId?: string
): Promise<Message | null> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      counselor_id: counselorId,
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