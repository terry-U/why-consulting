import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 })
    // 컬럼이 없을 수도 있으니 try/catch로 감싸서 best-effort
    const { error } = await supabaseServer
      .from('users')
      .update({ onboarding_completed: true })
      .eq('id', userId)
    if (error) {
      // 컬럼 없거나 권한 문제는 무시(로컬 스토리지로도 판단 가능)
      return NextResponse.json({ success: true, note: 'onboarding_completed not persisted' })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}


