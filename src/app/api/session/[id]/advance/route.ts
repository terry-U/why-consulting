import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request, context: any) {
  const sessionId = context?.params?.id || new URL(request.url).pathname.split('/').filter(Boolean).slice(-2, -1)[0]

  try {
    const body = await request.json()
    const nextPhase = body?.nextPhase ?? null
    const nextQuestionIndex = Number.isFinite(body?.nextQuestionIndex) ? body.nextQuestionIndex : null

    console.log('⏭️ 세션 단계 진행:', { sessionId, nextPhase, nextQuestionIndex })

    // 세션 상태 업데이트
    const updateData: Record<string, any> = {}
    const allowedPhases = new Set(['questions', 'summary', 'completed'])

    // DB 제약 회피: summary로의 전환은 DB에는 questions/8로 유지
    let phaseForDb: 'questions' | 'summary' | 'completed' | null = null
    if (nextPhase && allowedPhases.has(nextPhase)) {
      phaseForDb = nextPhase as any
    }

    if (phaseForDb === 'summary') {
      updateData.counseling_phase = 'questions'
      updateData.current_question_index = 8
    } else {
      if (phaseForDb) {
        updateData.counseling_phase = phaseForDb
      }
      if (typeof nextQuestionIndex === 'number') {
        let idx = nextQuestionIndex
        if (updateData.counseling_phase === 'questions') {
          if (!Number.isFinite(idx) || idx < 1) idx = 1
          if (idx > 8) idx = 8
        } else if (updateData.counseling_phase === 'completed') {
          idx = 0
        }
        updateData.current_question_index = idx
      }
    }

    // answers 저장은 추후 안정화 후 재도입

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '업데이트할 필드가 없습니다.' }, { status: 400 })
    }

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

    console.log('✅ 세션 단계 진행 완료', { updateData })
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
