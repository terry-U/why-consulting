import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

// Dev/test-only endpoint: add tickets to a user
export async function POST(request: NextRequest) {
  try {
    const { userId, amount } = await request.json()
    const delta = Number(amount) || 10
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 })
    }

    // 안전하게 두 단계로 증가: 조회 후 업데이트
    const { data: cur, error: getErr } = await supabaseServer
      .from('users')
      .select('remaining_tickets')
      .eq('id', userId)
      .single()
    if (getErr) return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 })
    const next = (cur?.remaining_tickets ?? 0) + delta
    const { data: upd, error: updErr } = await supabaseServer
      .from('users')
      .update({ remaining_tickets: next, is_paid_user: true })
      .eq('id', userId)
      .select('remaining_tickets')
      .single()
    if (updErr) return NextResponse.json({ success: false, error: '증가 실패' }, { status: 500 })
    return NextResponse.json({ success: true, remaining: upd?.remaining_tickets ?? next })
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}


