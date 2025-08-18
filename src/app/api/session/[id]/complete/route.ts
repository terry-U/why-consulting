import { NextRequest, NextResponse } from 'next/server'
import { saveWhyStatement } from '@/lib/why-generation'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  console.log('🏁 세션 완료 API 호출:', resolvedParams.id)
  
  try {
    const { finalWhy } = await request.json()
    const sessionId = resolvedParams.id

    if (!finalWhy) {
      console.error('❌ Why 문장 누락')
      return NextResponse.json(
        { success: false, error: 'Why 문장이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('💾 최종 Why 문장 저장:', finalWhy)

    // Why 문장 저장 및 세션 완료 처리
    await saveWhyStatement(sessionId, finalWhy)

    console.log('✅ 세션 완료 처리 성공')
    return NextResponse.json({
      success: true,
      message: '상담이 성공적으로 완료되었습니다.',
      finalWhy
    })

  } catch (error) {
    console.error('❌ 세션 완료 API 오류:', error)
    return NextResponse.json(
      { success: false, error: `세션 완료 처리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    )
  }
}
