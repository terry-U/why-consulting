import React from 'react'

type GapLevel = 'high' | 'medium' | 'low'

export interface ValueMapItem {
  head: string
  heart: string
  gapLevel: GapLevel
  headDetail: string
  heartDetail: string
  scene: string
  bridge: string
}

export interface ValueMapData {
  items: ValueMapItem[]
  today_actions?: string[]
  summary?: string
}

export default function ValueMapStructured({ data }: { data: ValueMapData }) {
  const { items = [], today_actions = [], summary } = data || {}

  const gapBadgeClass = (level: GapLevel) => {
    switch (level) {
      case 'high':
        return 'bg-red-500 text-white'
      case 'medium':
        return 'bg-amber-500 text-white'
      case 'low':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-2">Value Map</h2>
        {summary && <p className="text-gray-700">{summary}</p>}
      </div>

      {items.map((it, idx) => (
        <div key={idx} className="card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-xl font-semibold truncate">{it.head}</span>
              <span className="opacity-60">↔</span>
              <span className="text-xl font-semibold truncate">{it.heart}</span>
            </div>
            <span className={`px-2 py-1 rounded ${gapBadgeClass(it.gapLevel)}`}>{it.gapLevel}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border-2 border-blue-500">
              <div className="font-semibold text-blue-800">머리</div>
              <p className="mt-1">{it.headDetail}</p>
            </div>
            <div className="p-4 rounded-lg border-2 border-red-500">
              <div className="font-semibold text-red-800">마음</div>
              <p className="mt-1">{it.heartDetail}</p>
            </div>
          </div>

          {it.scene && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-lg leading-relaxed text-gray-700">{it.scene}</p>
            </div>
          )}

          {it.bridge && (
            <div className="mt-2 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-green-800 font-medium">💡 {it.bridge}</p>
            </div>
          )}
        </div>
      ))}

      {today_actions.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-3">오늘, 여기서 한 걸음</h3>
          <ul className="space-y-2 list-disc ml-5">
            {today_actions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


