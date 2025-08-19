import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const sessionId = resolvedParams.id

  try {
    const { nextPhase, nextQuestionIndex, userAnswer } = await request.json()

    console.log('⏭️ 세션 단계 진행:', { sessionId, nextPhase, nextQuestionIndex })

    // 세션 상태 업데이트
    const updateData: any = {
      counseling_phase: nextPhase,
      current_question_index: nextQuestionIndex
    }

    // 사용자 답변이 있다면 answers에 저장
    if (userAnswer && nextQuestionIndex > 0) {
      const { data: session } = await supabaseServer
        .from('sessions')
        .select('answers')
        .eq('id', sessionId)
        .single()

      const currentAnswers = session?.answers || {}
      updateData.answers = {
        ...currentAnswers,
        [`q${nextQuestionIndex - 1}`]: userAnswer
      }
    }

    const { error } = await supabaseServer
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)

    if (error) {
      console.error('❌ 세션 상태 업데이트 실패:', error)
      return NextResponse.json(
        { success: false, error: '세션 상태 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    console.log('✅ 세션 단계 진행 완료')
    return NextResponse.json({
      success: true,
      message: '다음 단계로 진행되었습니다.'
    })

  } catch (error) {
    console.error('❌ 세션 진행 API 오류:', error)
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
