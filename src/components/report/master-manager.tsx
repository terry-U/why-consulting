import React from 'react'

export interface SpectrumScores { others: number; master: number }
export interface SpectrumTypeMeta { name: string; position: string; description: string; traits: string[] }
export interface SpectrumScene { category: string; evidence: string[]; analysis: string; conclusion: string }

export interface MasterManagerData {
  scores: SpectrumScores
  types?: SpectrumTypeMeta[]
  scenes?: SpectrumScene[]
}

export default function MasterManagerStructured({ data }: { data: MasterManagerData }) {
  const { scores, types = [], scenes = [] } = data || ({} as MasterManagerData)

  return (
    <div className="space-y-8">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-2">Master–Manager Spectrum</h2>
        <ul className="text-gray-700">
          <li>Master: {scores?.master ?? 0}%</li>
          <li>Manager(others): {scores?.others ?? 0}%</li>
        </ul>
      </div>

      {/* 현재 타입 블록 제거: scores+types로 화면 상에서 파생 */}

      {Array.isArray(types) && types.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">타입 레퍼런스</h3>
          <ul className="space-y-2">
            {types.map((t, i) => (
              <li key={i} className="border rounded p-3">
                <p className="font-medium">{t.name}</p>
                {t.position && <p className="text-sm text-gray-600">포지션: {t.position}</p>}
                {t.description && <p className="text-sm mt-1">{t.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(scenes) && scenes.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">장면 근거</h3>
          <ul className="space-y-3">
            {scenes.map((s, i) => (
              <li key={i} className="border rounded p-3">
                <p className="font-medium">카테고리: {s.category}</p>
                {Array.isArray(s.evidence) && s.evidence.length > 0 && (
                  <ul className="list-disc ml-5 mt-1">
                    {s.evidence.map((e, j) => (<li key={j}>{e}</li>))}
                  </ul>
                )}
                {s.analysis && <p className="mt-1">해석: {s.analysis}</p>}
                {s.conclusion && <p className="mt-1">결론: {s.conclusion}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


