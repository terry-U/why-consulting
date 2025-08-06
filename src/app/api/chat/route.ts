import { NextRequest, NextResponse } from 'next/server'
import { generateCounselingResponse, ChatMessage } from '@/lib/openai'
import { addMessage, getRecentMessages, updateSession } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId } = await request.json()

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // 사용자 메시지 저장
    const userMessage = await addMessage(sessionId, userId, 'user', message)
    if (!userMessage) {
      return NextResponse.json(
        { error: '메시지 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 최근 메시지들 가져오기 (컨텍스트용)
    const recentMessages = await getRecentMessages(sessionId, 10)
    
    // OpenAI API용 메시지 포맷 변환
    const chatMessages: ChatMessage[] = recentMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }))

    // AI 응답 생성
    const aiResponse = await generateCounselingResponse(chatMessages)

    // AI 응답 저장
    const assistantMessage = await addMessage(sessionId, userId, 'assistant', aiResponse)
    if (!assistantMessage) {
      return NextResponse.json(
        { error: 'AI 응답 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 세션 업데이트 (마지막 활동 시간)
    await updateSession(sessionId, {})

    return NextResponse.json({
      userMessage,
      assistantMessage,
      success: true
    })

  } catch (error) {
    console.error('채팅 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 