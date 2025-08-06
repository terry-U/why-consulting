import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 개발용 API - 프로덕션에서는 제거해야 함
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    // 사용자를 유료 사용자로 변경
    const { error } = await supabase
      .from('users')
      .update({ is_paid_user: true })
      .eq('id', userId)

    if (error) {
      console.error('유료 사용자 변경 오류:', error)
      return NextResponse.json(
        { error: '업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '유료 사용자로 변경되었습니다.'
    })

  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 