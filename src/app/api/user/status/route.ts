import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 })
    }
    // 우선 시도: 온보딩 플래그 포함 조회
    let user: any = null
    let { data, error } = await supabaseServer
      .from('users')
      .select('id, is_paid_user, onboarding_completed, remaining_tickets')
      .eq('id', userId)
      .single()
    if (error) {
      // 레거시 스키마: onboarding_completed 컬럼이 없으면 기본 false로 재조회
      const fallback = await supabaseServer
        .from('users')
        .select('id, is_paid_user, remaining_tickets')
        .eq('id', userId)
        .single()
      if (fallback.error) {
        return NextResponse.json({ success: false, error: '사용자 조회 실패' }, { status: 500 })
      }
      user = { ...fallback.data, onboarding_completed: false }
    } else {
      user = data
      if (typeof user.onboarding_completed !== 'boolean') user.onboarding_completed = false
    }
    return NextResponse.json({ success: true, user })
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}


