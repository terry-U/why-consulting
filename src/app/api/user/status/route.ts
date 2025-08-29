import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId가 필요합니다.' }, { status: 400 })
    }
    const { data, error } = await supabaseServer
      .from('users')
      .select('id, is_paid_user')
      .eq('id', userId)
      .single()
    if (error) {
      return NextResponse.json({ success: false, error: '사용자 조회 실패' }, { status: 500 })
    }
    return NextResponse.json({ success: true, user: data })
  } catch (e) {
    return NextResponse.json({ success: false, error: '서버 오류' }, { status: 500 })
  }
}


