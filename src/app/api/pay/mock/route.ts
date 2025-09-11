import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 })
    }

    // 결제 레코드 추가(모의)
    const { error: payErr } = await supabaseServer
      .from('payments')
      .insert({ user_id: userId, method: 'mock', status: 'paid', amount: 299000, paid_at: new Date().toISOString() })
    if (payErr) {
      return NextResponse.json({ success: false, error: '결제 기록 저장 실패' }, { status: 500 })
    }

    // 사용자 결제 상태 플래그
    const { error: userErr } = await supabaseServer
      .from('users')
      .update({ is_paid_user: true, remaining_tickets: (supabaseServer as any).rpc ? undefined : undefined })
      .eq('id', userId)
      .select('id')
      .single()
    if (userErr) {
      return NextResponse.json({ success: false, error: '사용자 결제 상태 업데이트 실패' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}


