import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request, context: any) {
  const sessionId = context?.params?.id || new URL(req.url).pathname.split('/').filter(Boolean).pop()
  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'sessionId가 필요합니다' }, { status: 400 })
  }
  try {
    const { one_line, why_state, ts } = await req.json()
    const text = (one_line || '').toString().trim()
    if (!text || text.length < 8) {
      return NextResponse.json({ success: false, error: '내용이 너무 짧습니다' }, { status: 400 })
    }
    const payload = {
      session_id: sessionId,
      type: 'prologue_entry',
      content: {
        one_line: text,
        why_state: (why_state === 'OFF' ? 'OFF' : 'ON'),
        ts: ts || new Date().toISOString(),
      }
    }
    const { error } = await supabaseServer.from('reports').insert([payload])
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('one-line 저장 실패', e)
    return NextResponse.json({ success: false, error: '저장 실패' }, { status: 500 })
  }
}


