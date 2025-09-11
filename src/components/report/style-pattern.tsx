import React from 'react'

type FitLevel = 'high' | 'medium' | 'conditional'

export interface StyleItem {
  title: string
  subtitle?: string
  fitLevel: FitLevel
  what: string
  example: string
  why: string
  caution: string
  story?: string
}

export interface StylePatternData {
  styles: StyleItem[]
}

export default function StylePatternStructured({ data }: { data: StylePatternData }) {
  const { styles = [] } = data || {}

  const fitColor = (level: FitLevel) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-blue-600 bg-blue-100'
      case 'conditional': return 'text-amber-600 bg-amber-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-2">Style Pattern</h2>
      </div>

      {styles.map((s, idx) => (
        <div key={idx} className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <span className={`px-2 py-1 rounded text-xs ${fitColor(s.fitLevel)}`}>{s.fitLevel}</span>
          </div>
          {s.subtitle && <p className="text-muted-foreground">{s.subtitle}</p>}
          <div>
            <p className="mb-1 font-semibold">무엇</p>
            <p>{s.what}</p>
          </div>
          <div>
            <p className="mb-1 font-semibold">예시</p>
            <p className="text-muted-foreground">{s.example}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="font-semibold mb-1">왜 잘 맞나</p>
              <p>{s.why}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="font-semibold mb-1">주의할 점</p>
              <p>{s.caution}</p>
            </div>
          </div>
          {s.story && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="leading-relaxed whitespace-pre-line text-gray-700">{s.story}</p>
            </div>
          )}
        </div>
      ))}

      {/* quick tips / today checklist 제거 */}
    </div>
  )
}


