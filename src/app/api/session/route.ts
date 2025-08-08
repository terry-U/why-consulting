import { NextRequest, NextResponse } from 'next/server'
import { createSession, getActiveSession, getSessionMessages } from '@/lib/database'
import { createThread } from '@/lib/openai'

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
    const threadId = await createThread()
    console.log('✅ Thread 생성 성공:', threadId)

    // 새 세션 생성 (thread_id 포함)
    console.log('🗄️ 데이터베이스 세션 생성 시도...')
    const session = await createSession(userId, threadId)

    if (!session) {
      console.error('❌ 세션 생성 실패 - createSession이 null 반환')
      return NextResponse.json(
        { success: false, error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 상담사 첫 인사 메시지 추가
    console.log('👋 상담사 첫 인사 메시지 생성...')
    try {
      const { sendMessageToAssistant } = await import('@/lib/openai')
      const welcomeMessage = await sendMessageToAssistant(threadId, "상담을 시작해주세요. 따뜻한 인사와 함께 현재 상황을 자연스럽게 물어보세요.")
      
      // 상담사 첫 메시지를 DB에 저장
      const { addMessage } = await import('@/lib/database')
      await addMessage(session.id, userId, 'assistant', welcomeMessage)
      
      console.log('✅ 상담사 첫 인사 완료')
    } catch (error) {
      console.error('⚠️ 첫 인사 메시지 생성 실패:', error)
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

    if (!userId) {
      console.error('❌ 사용자 ID 누락 (GET)')
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('👤 조회 사용자 ID:', userId)

    // 활성 세션 조회
    const session = await getActiveSession(userId)
    
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