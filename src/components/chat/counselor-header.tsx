'use client'

import { CounselorInfo } from '@/lib/counselor-info'

interface CounselorHeaderProps {
  counselor: CounselorInfo
  currentQuestion: string
  isLoading?: boolean
}

export default function CounselorHeader({ counselor, currentQuestion, isLoading = false }: CounselorHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 질문자 정보 */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center">
            <span className="text-lg">{counselor.emoji}</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{counselor.name}</h3>
              {isLoading && (
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">{counselor.role}</p>
          </div>
        </div>

        {/* 현재 질문 */}
        <div className="text-right">
          <p className="text-xs text-gray-500">현재 질문</p>
          <p className="text-sm font-medium text-gray-700">{currentQuestion}</p>
        </div>
      </div>

      {/* 질문자 설명 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-600 leading-relaxed">
          {counselor.description}
        </p>
      </div>
    </div>
  )
}
