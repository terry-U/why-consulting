import { supabase } from '@/lib/supabase'
import { Session } from '@/lib/supabase'

/**
 * 사용자의 세션 목록을 가져옵니다 (최신 메시지 포함)
 */
export async function getUserSessions(userId: string): Promise<Session[]> {
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      *,
      messages (
        content,
        created_at,
        role
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('세션 목록 가져오기 오류:', error)
    throw new Error('세션 목록을 불러올 수 없습니다')
  }

  return sessions || []
}

/**
 * 특정 세션의 상세 정보를 가져옵니다
 */
export async function getSessionById(sessionId: string): Promise<Session | null> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('세션 조회 오류:', error)
    return null
  }

  return session
}

/**
 * 사용자의 활성 세션을 가져옵니다
 */
export async function getActiveSession(userId: string): Promise<Session | null> {
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    // 활성 세션이 없는 경우는 정상적인 상황
    return null
  }

  return session
}

/**
 * 새로운 상담 세션을 생성합니다
 */
export async function createNewSession(userId: string): Promise<Session> {
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      status: 'active',
      counseling_phase: 'intro',
      current_question_index: 0,
      answers: {}
    })
    .select()
    .single()

  if (error) {
    console.error('세션 생성 오류:', error)
    throw new Error('새 상담 세션을 생성할 수 없습니다')
  }

  return session
}
