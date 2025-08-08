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

    // OpenAI Thread 생성
    const threadId = await createThread()

    // 새 세션 생성 (thread_id 포함)
    const session = await createSession(userId, threadId)

    if (!session) {
      console.error('❌ 세션 생성 실패')
      return NextResponse.json(
        { success: false, error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 세션 생성 API 성공:', session.id)
    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('❌ 세션 생성 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
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