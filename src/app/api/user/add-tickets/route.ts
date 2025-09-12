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

    // 안전하게 증가: NULL이면 0으로 간주
    const { data, error } = await supabaseServer
      .from('users')
      .update({
        remaining_tickets: supabaseServer.rpc ? undefined : undefined,
        is_paid_user: true,
      })
      .eq('id', userId)
      .select('id, remaining_tickets')
      .single()

    // 위 update로는 증가 연산 불가하므로 RPC로 처리 (있으면), 없으면 수동 쿼리
    if (error || !data) {
      // Fallback: run raw query via RPC defined in migrations (if any)
      const { data: incRes, error: incErr } = await supabaseServer.rpc('add_tickets', {
        p_user_id: userId,
        p_amount: delta,
      })
      if (incErr) {
        // 최후 수단: 두 단계 업데이트
        const { data: cur, error: getErr } = await supabaseServer
          .from('users')
          .select('remaining_tickets')
          .eq('id', userId)
          .single()
        if (getErr) return NextResponse.json({ success: false, error: '조회 실패' }, { status: 500 })
        const next = (cur?.remaining_tickets ?? 0) + delta
        const { error: updErr, data: upd } = await supabaseServer
          .from('users')
          .update({ remaining_tickets: next, is_paid_user: true })
          .eq('id', userId)
          .select('remaining_tickets')
          .single()
        if (updErr) return NextResponse.json({ success: false, error: '증가 실패' }, { status: 500 })
        return NextResponse.json({ success: true, remaining: upd?.remaining_tickets ?? next })
      }
      return NextResponse.json({ success: true, remaining: incRes })
    }

    // If simple update path returned, follow up with increment via select/update chain
    const { data: cur2 } = await supabaseServer
      .from('users')
      .select('remaining_tickets')
      .eq('id', userId)
      .single()
    const next2 = (cur2?.remaining_tickets ?? 0) + delta
    const { data: upd2, error: updErr2 } = await supabaseServer
      .from('users')
      .update({ remaining_tickets: next2, is_paid_user: true })
      .eq('id', userId)
      .select('remaining_tickets')
      .single()
    if (updErr2) return NextResponse.json({ success: false, error: '증가 실패' }, { status: 500 })
    return NextResponse.json({ success: true, remaining: upd2?.remaining_tickets ?? next2 })
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}


