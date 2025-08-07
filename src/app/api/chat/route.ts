import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToAssistant } from '@/lib/openai'
import { addMessage, getSessionById, updateSession } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json()

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 사용자 메시지 저장
    const userMessage = await addMessage(sessionId, userId, 'user', message)

    // 세션에서 thread_id 가져오기
    const session = await getSessionById(sessionId)
    
    if (!session?.thread_id) {
      return NextResponse.json(
        { success: false, error: 'Thread ID가 없습니다.' },
        { status: 400 }
      )
    }

    // OpenAI Assistant API로 응답 생성
    const assistantResponse = await sendMessageToAssistant(session.thread_id, message)

    // AI 응답 저장
    const assistantMessage = await addMessage(sessionId, userId, 'assistant', assistantResponse)

    // 세션 업데이트
    await updateSession(sessionId, { updated_at: new Date().toISOString() })

    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage
    })

  } catch (error) {
    console.error('채팅 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 