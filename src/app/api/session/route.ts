import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// OpenAI Thread 생성 함수
async function createThread(): Promise<string> {
  const thread = await openai.beta.threads.create()
  return thread.id
}

// 데이터베이스 함수들
async function createSession(userId: string, threadId: string) {
  const { data, error } = await supabaseServer
    .from('sessions')
    .insert({
      user_id: userId,
      thread_id: threadId,
      status: 'active',
      counseling_phase: 'intro',
      current_question_index: 0,
      answers: {}
    })
    .select()
    .single()

  return { session: data, error }
}

async function getActiveSession(userId: string) {
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return error ? null : data
}

async function getSessionMessages(sessionId: string) {
  const { data, error } = await supabaseServer
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return data || []
}

async function listUserSessions(userId: string) {
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return data || []
}

async function listUserSessionsWithLastMessage(userId: string) {
  const sessions = await listUserSessions(userId)
  
  const sessionsWithMessages = await Promise.all(
    sessions.map(async (session) => {
      const messages = await getSessionMessages(session.id)
      const lastMessage = messages[messages.length - 1]
      return {
        ...session,
        lastMessage
      }
    })
  )

  return sessionsWithMessages
}

async function getSessionById(sessionId: string) {
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  return error ? null : data
}

export async function POST(request: NextRequest) {
  console.log('🚀 새 세션 생성 API 호출')
  
  try {
    const { userId } = await request.json()

    if (!userId) {
      console.error('❌ 사용자 ID 누락')
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('👤 요청 사용자 ID:', userId)

    // 환경 변수 확인
    console.log('🔑 환경 변수 확인:')
    console.log('- OPENAI_API_KEY 존재:', !!process.env.OPENAI_API_KEY)
    console.log('- SUPABASE_SERVICE_ROLE_KEY 존재:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    // OpenAI Thread 생성
    console.log('🧵 OpenAI Thread 생성 시도...')
    let threadId: string
    try {
      threadId = await createThread()
    } catch (e) {
      console.error('❌ Thread 생성 실패:', e)
      return NextResponse.json({ success: false, step: 'createThread', error: (e as Error)?.message || 'Thread 생성 실패' }, { status: 500 })
    }
    console.log('✅ Thread 생성 성공:', threadId)

    // 새 세션 생성 (thread_id 포함)
    console.log('🗄️ 데이터베이스 세션 생성 시도...')
    const { session, error: createSessionError } = await createSession(userId, threadId)

    if (!session || createSessionError) {
      console.error('❌ 세션 생성 실패 - createSession 오류:', createSessionError)
      return NextResponse.json(
        { success: false, step: 'createSession', error: createSessionError?.message || '세션 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 인트로 메시지 생성
    console.log('👋 인트로 메시지 생성...')
    try {
      await supabaseServer
        .from('messages')
        .insert({
          session_id: session.id,
          user_id: userId,
          role: 'assistant',
          content: '안녕하세요! 저는 상담사 지혜입니다. 오늘 이 시간을 통해 당신의 내면을 탐색하고, 삶의 목적을 함께 찾아보는 시간을 갖고 싶어요. 편안한 마음으로 대화를 시작해볼까요?',
          counselor_id: 'main'
        })
      
      console.log('✅ 인트로 메시지 완료')
    } catch (error) {
      console.error('⚠️ 인트로 메시지 생성 실패:', error)
      // 세션은 생성되었으므로 계속 진행
    }

    console.log('✅ 세션 생성 API 성공:', session.id)
    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('❌ 세션 생성 API 오류 상세:', error)
    console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { success: false, error: `서버 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  console.log('🔍 기존 세션 조회 API 호출')
  
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const mode = searchParams.get('mode') // 'list'면 목록 반환
    const sessionId = searchParams.get('sessionId')

    if (!userId && !sessionId) {
      console.error('❌ 사용자 ID 또는 세션 ID 누락 (GET)')
      return NextResponse.json(
        { success: false, error: 'userId 또는 sessionId가 필요합니다.' },
        { status: 400 }
      )
    }

    if (userId) console.log('👤 조회 사용자 ID:', userId)
    if (sessionId) console.log('🆔 조회 세션 ID:', sessionId)

    if (mode === 'list' && userId) {
      const sessions = await listUserSessions(userId)
      return NextResponse.json({ success: true, sessions })
    } else if (mode === 'listWithLast' && userId) {
      const sessions = await listUserSessionsWithLastMessage(userId)
      return NextResponse.json({ success: true, sessions })
    } else if (sessionId) {
      const session = await getSessionById(sessionId)
      if (!session) {
        return NextResponse.json({ success: false, error: '세션을 찾을 수 없습니다.' }, { status: 404 })
      }
      const messages = await getSessionMessages(sessionId)
      return NextResponse.json({ success: true, session, messages })
    }

    // 활성 세션 조회 (기본)
    const session = userId ? await getActiveSession(userId) : null
    
    if (!session) {
      console.log('ℹ️ 활성 세션 없음')
      return NextResponse.json({
        success: false,
        message: '활성 세션이 없습니다.'
      })
    }

    console.log('✅ 활성 세션 발견:', session.id)

    // 세션의 메시지들 조회
    const messages = await getSessionMessages(session.id)

    console.log('📝 메시지 개수:', messages.length)
    return NextResponse.json({
      success: true,
      session,
      messages
    })

  } catch (error) {
    console.error('❌ 세션 조회 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 