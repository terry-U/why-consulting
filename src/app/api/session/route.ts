import { NextRequest, NextResponse } from 'next/server'
import { createSession, getActiveSession, getSessionMessages } from '@/lib/database'
import { createThread } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // OpenAI Thread 생성
    const threadId = await createThread()

    // 새 세션 생성 (thread_id 포함)
    const session = await createSession(userId, threadId)

    if (!session) {
      return NextResponse.json(
        { success: false, error: '세션 생성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error) {
    console.error('세션 생성 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 활성 세션 조회
    const session = await getActiveSession(userId)
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: '활성 세션이 없습니다.'
      })
    }

    // 세션의 메시지들 조회
    const messages = await getSessionMessages(session.id)

    return NextResponse.json({
      success: true,
      session,
      messages
    })

  } catch (error) {
    console.error('세션 조회 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 