import { supabase } from '@/lib/auth'
import { Message } from '@/lib/supabase'

/**
 * 세션의 모든 메시지를 가져옵니다
 */
export async function getSessionMessages(sessionId: string): Promise<Message[]> {
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('메시지 조회 오류:', error)
    throw new Error('메시지를 불러올 수 없습니다')
  }

  return messages || []
}

/**
 * 새 메시지를 추가합니다
 */
export async function addMessage(
  sessionId: string, 
  userId: string,
  role: 'user' | 'assistant', 
  content: string, 
  counselorId?: string
): Promise<Message> {
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      counselor_id: counselorId
    })
    .select()
    .single()

  if (error) {
    console.error('메시지 추가 오류:', error)
    throw new Error('메시지를 저장할 수 없습니다')
  }

  return message
}

/**
 * 세션의 마지막 메시지를 가져옵니다
 */
export async function getLastMessage(sessionId: string): Promise<Message | null> {
  const { data: message, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // 메시지가 없는 경우는 정상적인 상황
    return null
  }

  return message
}
