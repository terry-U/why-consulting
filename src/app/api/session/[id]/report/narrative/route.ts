import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request, context: any) {
  const sessionId = context?.params?.id || new URL(req.url).pathname.split('/').filter(Boolean).slice(-2, -1)[0]
  if (!sessionId) return NextResponse.json({ success: false, error: 'sessionId가 필요합니다' }, { status: 400 })
  const body = await req.json().catch(() => ({} as any))
  const narrativeRaw: string = typeof body?.narrative === 'string' ? body.narrative.trim() : ''
  if (!narrativeRaw) return NextResponse.json({ success: false, error: 'narrative가 필요합니다' }, { status: 400 })

  // split into paragraphs by two newlines, or by single newlines if no two
  const paragraphs = narrativeRaw.includes('\n\n')
    ? narrativeRaw.split(/\n\n+/).map(s => s.trim()).filter(Boolean)
    : narrativeRaw.split(/\n+/).map(s => s.trim()).filter(Boolean)

  try {
    // load existing my_why
    const { data: existing } = await supabaseServer
      .from('reports')
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', 'my_why')
      .single()

    const content = existing?.content || {}
    const nextContent = { ...content, narrative: paragraphs }

    const { error: upErr } = await supabaseServer
      .from('reports')
      .upsert({ session_id: sessionId, type: 'my_why', content: nextContent }, { onConflict: 'session_id,type' })

    if (upErr) return NextResponse.json({ success: false, error: upErr.message }, { status: 500 })
    return NextResponse.json({ success: true, report: nextContent })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 })
  }
}


