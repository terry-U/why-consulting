import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function POST(req: Request, context: any) {
  const sessionId = context?.params?.id || new URL(req.url).pathname.split('/').filter(Boolean).slice(-2, -1)[0]
  if (!sessionId) return NextResponse.json({ success: false, error: 'sessionId가 필요합니다' }, { status: 400 })
  const body = await req.json().catch(() => ({} as any))
  const items = Array.isArray(body?.items) ? body.items : []
  if (items.length !== 3) return NextResponse.json({ success: false, error: 'items는 정확히 3개여야 합니다' }, { status: 400 })

  const normalize = (it: any) => ({
    head: typeof it?.head === 'string' ? it.head.trim() : '',
    heart: typeof it?.heart === 'string' ? it.heart.trim() : '',
    gapLevel: (['high','medium','low'] as const).includes(it?.gapLevel) ? it.gapLevel : 'medium',
    headDetail: typeof it?.headDetail === 'string' ? it.headDetail.trim() : '',
    heartDetail: typeof it?.heartDetail === 'string' ? it.heartDetail.trim() : '',
    scene: typeof it?.scene === 'string' ? it.scene.trim() : '',
    bridge: typeof it?.bridge === 'string' ? it.bridge.trim() : ''
  })

  const normItems = items.slice(0,3).map(normalize)
  const payload = { items: normItems }

  try {
    const { data: existing } = await supabaseServer
      .from('reports')
      .select('content')
      .eq('session_id', sessionId)
      .eq('type', 'value_map')
      .single()

    const content = existing?.content || {}
    const nextContent = { ...content, ...payload }

    const { error: upErr } = await supabaseServer
      .from('reports')
      .upsert({ session_id: sessionId, type: 'value_map', content: nextContent }, { onConflict: 'session_id,type' })

    if (upErr) return NextResponse.json({ success: false, error: upErr.message }, { status: 500 })
    return NextResponse.json({ success: true, report: nextContent })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: String(e?.message || e) }, { status: 500 })
  }
}


