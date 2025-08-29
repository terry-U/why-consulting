import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: Request, context: any) {
  const sessionId = context?.params?.id || new URL(request.url).pathname.split('/').filter(Boolean).slice(-2, -1)[0]

  try {
    const body = await request.json()
    const nextPhase = body?.nextPhase ?? null
    const nextQuestionIndex = Number.isFinite(body?.nextQuestionIndex) ? body.nextQuestionIndex : null

    console.log('⏭️ 세션 단계 진행:', { sessionId, nextPhase, nextQuestionIndex })

    // 세션 상태 업데이트 데이터 구성
    const updateData: Record<string, any> = {}
    const allowedPhases = new Set(['questions', 'summary', 'completed'])
    const wantPhase = (nextPhase && allowedPhases.has(nextPhase)) ? (nextPhase as any) : null

    if (wantPhase) updateData.counseling_phase = wantPhase
    if (typeof nextQuestionIndex === 'number') {
      let idx = nextQuestionIndex
      if (wantPhase === 'questions') {
        if (!Number.isFinite(idx) || idx < 1) idx = 1
        if (idx > 8) idx = 8
      } else if (wantPhase === 'completed') {
        idx = 0
      }
      updateData.current_question_index = idx
    }

    // 요약 시작 시에는 즉시 채팅을 봉인하기 위해 status를 completed로 고정
    if (wantPhase === 'summary') {
      updateData.status = 'completed'
      updateData.counseling_phase = 'summary'
      updateData.current_question_index = 8
    }

    // answers 저장은 추후 안정화 후 재도입

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, error: '업데이트할 필드가 없습니다.' }, { status: 400 })
    }

    let { error } = await supabaseServer
      .from('sessions')
      .update(updateData as any)
      .eq('id', sessionId)

    // 일부 DB 스키마에서 counseling_phase가 'summary'를 허용하지 않는 경우를 대비한 폴백 시도
    if (error && wantPhase === 'summary') {
      console.warn('⚠️ summary 적용 실패, 폴백 시도:', (error as any).message || error)
      const fallback = {
        status: 'completed',
        counseling_phase: 'questions',
        current_question_index: 8,
      } as const
      const retry = await supabaseServer
        .from('sessions')
        .update(fallback as any)
        .eq('id', sessionId)
      error = retry.error as any
    }

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
