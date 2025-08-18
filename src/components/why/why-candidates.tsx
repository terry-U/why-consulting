'use client'

import { useState } from 'react'
import { WhyCandidate } from '@/types/characters'

interface WhyCandidatesProps {
  candidates: WhyCandidate[]
  onFinalize: (text: string) => void
}

export default function WhyCandidates({ candidates, onFinalize }: WhyCandidatesProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [customWhy, setCustomWhy] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleSelectCandidate = (candidate: WhyCandidate) => {
    setSelectedCandidate(candidate.text)
    setShowCustom(false)
  }

  const handleCustomSubmit = () => {
    if (customWhy.trim()) {
      setSelectedCandidate(customWhy.trim())
    }
  }

  const handleFinalize = () => {
    if (selectedCandidate) {
      onFinalize(selectedCandidate)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl mb-4">
          🌟
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          당신의 Why를 발견했습니다!
        </h1>
        <p className="text-gray-600">
          아래 후보 중에서 가장 마음에 와 닿는 문장을 선택해주세요
        </p>
      </div>

      {/* Why 후보들 */}
      <div className="space-y-4 mb-8">
        {candidates.map((candidate, index) => (
          <div
            key={index}
            onClick={() => handleSelectCandidate(candidate)}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              selectedCandidate === candidate.text
                ? 'border-yellow-500 bg-yellow-50 shadow-lg transform scale-105'
                : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md'
            }`}
          >
            <div className="text-center">
              <p className="text-xl font-medium text-gray-900 mb-3">
                "{candidate.text}"
              </p>
              {candidate.evidence && candidate.evidence.length > 0 && (
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-1">이 문장을 선택한 근거:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {candidate.evidence.map((evidence, idx) => (
                      <li key={idx}>{evidence}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 직접 작성 옵션 */}
        <div
          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
            showCustom
              ? 'border-purple-500 bg-purple-50 shadow-lg'
              : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
          }`}
          onClick={() => setShowCustom(true)}
        >
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-3">
              💭 직접 작성하기
            </p>
            <p className="text-sm text-gray-600">
              제시된 문장이 마음에 들지 않으신다면 직접 작성해보세요
            </p>
            
            {showCustom && (
              <div className="mt-4">
                <textarea
                  value={customWhy}
                  onChange={(e) => setCustomWhy(e.target.value)}
                  placeholder="당신만의 Why 문장을 작성해주세요..."
                  className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                />
                <button
                  onClick={handleCustomSubmit}
                  disabled={!customWhy.trim()}
                  className="mt-3 px-6 py-2 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:opacity-50"
                >
                  이 문장으로 선택
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 선택된 Why 문장 확인 */}
      {selectedCandidate && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl mb-8">
          <h3 className="text-xl font-bold text-center mb-3">선택하신 Why 문장</h3>
          <p className="text-2xl font-medium text-center mb-4">
            "{selectedCandidate}"
          </p>
          <p className="text-yellow-100 text-center text-sm">
            말없이 고개가 끄덕여지면, 그 문장이 맞아요.
          </p>
        </div>
      )}

      {/* 확정 버튼 */}
      <div className="text-center">
        <button
          onClick={handleFinalize}
          disabled={!selectedCandidate}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xl font-semibold py-4 px-12 rounded-full hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이 문장으로 확정하기
        </button>
        
        <p className="text-gray-500 text-sm mt-4">
          확정 후에도 언제든 수정할 수 있습니다
        </p>
      </div>
    </div>
  )
}
