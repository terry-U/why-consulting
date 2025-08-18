import { NextRequest, NextResponse } from 'next/server'
import { generateWhyStatement, saveWhyStatement, parseWhyCandidates } from '@/lib/why-generation'
import { supabaseServer } from '@/lib/supabase-server'

// 메시지 추가 함수
async function addMessage(sessionId: string, userId: string, role: 'user' | 'assistant', content: string, counselorId: string) {
  const { error } = await supabaseServer
    .from('messages')
    .insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      counselor_id: counselorId
    })

  if (error) {
    throw new Error('메시지 저장에 실패했습니다')
  }
}

export async function POST(request: NextRequest) {
  console.log('🎯 Why 문장 생성 API 호출')
  
  try {
    const { sessionId, userId } = await request.json()

    if (!sessionId || !userId) {
      console.error('❌ 필수 파라미터 누락')
      return NextResponse.json(
        { success: false, error: '세션 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('🎯 Why 문장 생성 시작:', { sessionId, userId })

    // Why 문장 생성
    const whyResponse = await generateWhyStatement(sessionId)
    console.log('✅ AI 응답 수신:', whyResponse.substring(0, 100) + '...')

    // 후보 문장들 파싱
    const candidates = parseWhyCandidates(whyResponse)
    console.log('📝 파싱된 후보 개수:', candidates.length)

    // 생성된 Why 응답을 메시지로 저장
    await addMessage(sessionId, userId, 'assistant', whyResponse, 'main')

    // 첫 번째 후보를 기본 Why 문장으로 저장 (사용자가 나중에 선택 가능)
    if (candidates.length > 0) {
      await saveWhyStatement(sessionId, candidates[0].text)
    }

    console.log('✅ Why 문장 생성 API 성공')
    return NextResponse.json({
      success: true,
      whyResponse,
      candidates,
      defaultWhy: candidates[0]?.text
    })

  } catch (error) {
    console.error('❌ Why 문장 생성 API 오류:', error)
    return NextResponse.json(
      { success: false, error: `Why 문장 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}
