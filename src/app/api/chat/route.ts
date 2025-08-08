import { NextRequest, NextResponse } from 'next/server'
import { sendMessageToAssistant } from '@/lib/openai'
import { addMessage, getSessionById, updateSession } from '@/lib/database'

export async function POST(request: NextRequest) {
  console.log('💬 채팅 API 호출')
  
  try {
    const { message, sessionId, userId } = await request.json()

    if (!message || !sessionId || !userId) {
      console.error('❌ 필수 정보 누락:', { message: !!message, sessionId: !!sessionId, userId: !!userId })
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    console.log('📝 사용자 메시지:', message)
    console.log('🆔 세션 ID:', sessionId)
    console.log('👤 사용자 ID:', userId)

    // 사용자 메시지 저장
    console.log('💾 사용자 메시지 DB 저장 중...')
    const userMessage = await addMessage(sessionId, userId, 'user', message)

    // 세션에서 thread_id 가져오기
    console.log('🔍 세션 정보 조회 중...')
    const session = await getSessionById(sessionId)
    
    if (!session?.thread_id) {
      console.error('❌ Thread ID 없음:', session)
      return NextResponse.json(
        { success: false, error: 'Thread ID가 없습니다.' },
        { status: 400 }
      )
    }

    console.log('🧵 Thread ID 확인:', session.thread_id)

    // OpenAI Assistant API로 응답 생성
    console.log('🤖 Assistant API 호출 시작...')
    const assistantResponse = await sendMessageToAssistant(session.thread_id, message)

    // AI 응답 저장
    console.log('💾 AI 응답 DB 저장 중...')
    const assistantMessage = await addMessage(sessionId, userId, 'assistant', assistantResponse)

    // 세션 업데이트
    console.log('🔄 세션 업데이트 중...')
    await updateSession(sessionId, { updated_at: new Date().toISOString() })

    console.log('✅ 채팅 API 성공 완료')
    return NextResponse.json({
      success: true,
      userMessage,
      assistantMessage
    })

  } catch (error) {
    console.error('❌ 채팅 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '응답 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 