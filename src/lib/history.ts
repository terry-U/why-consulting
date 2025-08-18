import { supabase } from '@/lib/supabase'
import { Session, Message } from '@/lib/supabase'

export interface SessionWithHistory extends Session {
  lastMessage?: string | null
  whyStatement?: string | null
  messageCount?: number
}

/**
 * 사용자의 상담 히스토리를 가져옵니다
 */
export async function getUserConsultationHistory(userId: string): Promise<SessionWithHistory[]> {
  console.log('📚 상담 히스토리 조회 시작:', userId)
  
  try {
    // 사용자의 모든 세션 가져오기
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (sessionsError) {
      throw new Error('세션 목록을 불러올 수 없습니다')
    }

    if (!sessions || sessions.length === 0) {
      return []
    }

    // 각 세션의 추가 정보 가져오기
    const sessionsWithHistory = await Promise.all(
      sessions.map(async (session) => {
        try {
          // 마지막 메시지 가져오기
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, role')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // 메시지 개수 가져오기
          const { count: messageCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id)

          return {
            ...session,
            lastMessage: lastMessage?.content || null,
            whyStatement: session.generated_why,
            messageCount: messageCount || 0
          }
        } catch (error) {
          console.error(`세션 ${session.id} 추가 정보 로딩 오류:`, error)
          return {
            ...session,
            lastMessage: null,
            whyStatement: session.generated_why,
            messageCount: 0
          }
        }
      })
    )

    console.log('✅ 히스토리 조회 완료:', sessionsWithHistory.length)
    return sessionsWithHistory

  } catch (error) {
    console.error('❌ 히스토리 조회 오류:', error)
    throw new Error('상담 히스토리를 불러올 수 없습니다')
  }
}

/**
 * 특정 상담의 상세 정보를 가져옵니다
 */
export async function getConsultationDetail(sessionId: string): Promise<{ session: Session; messages: Message[] }> {
  console.log('🔍 상담 상세 조회 시작:', sessionId)
  
  try {
    // 세션 정보 가져오기
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    // 메시지들 가져오기
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw new Error('메시지를 불러올 수 없습니다')
    }

    console.log('✅ 상담 상세 조회 완료')
    return {
      session,
      messages: messages || []
    }

  } catch (error) {
    console.error('❌ 상담 상세 조회 오류:', error)
    throw error
  }
}

/**
 * 상담 세션을 삭제합니다
 */
export async function deleteConsultationSession(sessionId: string, userId: string): Promise<void> {
  console.log('🗑️ 상담 세션 삭제 시작:', sessionId)
  
  try {
    const supabase = createSupabaseAdmin()
    
    // 세션 소유자 확인
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('세션을 찾을 수 없습니다')
    }

    if (session.user_id !== userId) {
      throw new Error('삭제 권한이 없습니다')
    }

    // 관련 메시지들 먼저 삭제
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('session_id', sessionId)

    if (messagesError) {
      throw new Error('메시지 삭제에 실패했습니다')
    }

    // 세션 삭제
    const { error: sessionDeleteError } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (sessionDeleteError) {
      throw new Error('세션 삭제에 실패했습니다')
    }

    console.log('✅ 상담 세션 삭제 완료')

  } catch (error) {
    console.error('❌ 상담 세션 삭제 오류:', error)
    throw error
  }
}

/**
 * 상담 세션 제목을 업데이트합니다
 */
export async function updateSessionTitle(sessionId: string, userId: string, title: string): Promise<void> {
  console.log('✏️ 세션 제목 업데이트:', sessionId, title)
  
  try {
    const supabase = createSupabaseAdmin()
    
    const { error } = await supabase
      .from('sessions')
      .update({ title })
      .eq('id', sessionId)
      .eq('user_id', userId)

    if (error) {
      throw new Error('제목 업데이트에 실패했습니다')
    }

    console.log('✅ 세션 제목 업데이트 완료')

  } catch (error) {
    console.error('❌ 세션 제목 업데이트 오류:', error)
    throw error
  }
}

// createSupabaseAdmin 함수 추가 (없는 경우)
function createSupabaseAdmin() {
  return supabase // 임시로 기본 클라이언트 사용
}
