import { NextRequest, NextResponse } from 'next/server'
import { generateCounselingResponse, ChatMessage } from '@/lib/openai'
import { addMessage, getRecentMessages, updateSession } from '@/lib/database'

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