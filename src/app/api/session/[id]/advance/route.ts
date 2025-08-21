import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request, context: any) {
  const sessionId = context?.params?.id || new URL(request.url).pathname.split('/').filter(Boolean).slice(-2, -1)[0]

  try {
    const { nextPhase, nextQuestionIndex } = await request.json()

    console.log('⏭️ 세션 단계 진행:', { sessionId, nextPhase, nextQuestionIndex })

    // 세션 상태 업데이트
    const updateData: Record<string, any> = {
      counseling_phase: nextPhase
    }
    if (Number.isFinite(nextQuestionIndex)) {
      updateData.current_question_index = nextQuestionIndex
    }

    // answers 저장은 추후 안정화 후 재도입

    const { error } = await supabaseServer
      .from('sessions')
      .update(updateData as any)
      .eq('id', sessionId)

    if (error) {
      console.error('❌ 세션 상태 업데이트 실패:', error)
      return NextResponse.json(
        { success: false, error: '세션 상태 업데이트에 실패했습니다.', details: (error as any).message || JSON.stringify(error) },
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
