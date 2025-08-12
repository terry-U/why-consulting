import React from 'react'
import { Message } from '@/lib/supabase'
import { COUNSELOR_CHARACTERS } from '@/lib/counseling-types'

interface CounselorMessageProps {
  message: Message
  pagedForMain?: boolean
  onNextPage?: () => void
}

export default function CounselorMessage({ message, pagedForMain = true, onNextPage }: CounselorMessageProps) {
  const counselor = message.counselor_id ? COUNSELOR_CHARACTERS[message.counselor_id] : COUNSELOR_CHARACTERS.main
  
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
          {message.content}
        </div>
      </div>
    )
  }

  // 메인 상담사: 한 페이지 한 문장 페이징 옵션
  if (pagedForMain && (message.counselor_id ?? 'main') === 'main') {
    const sentences = message.content.split(/(?<=[.!?]|\n)/).filter(Boolean)
    const [idx, setIdx] = React.useState(0)
    const next = () => {
      if (idx < sentences.length - 1) setIdx(idx + 1)
      else onNextPage?.()
    }
    return (
      <div className="flex flex-col items-stretch mb-4">
        <div className={`bg-gradient-to-r ${counselor.color.gradient} text-white px-5 py-6 rounded-xl shadow-lg text-[18px] leading-8`}>{sentences[idx]}</div>
        <div className="mt-3 flex justify-end">
          <button onClick={next} className={`px-4 py-2 rounded-md bg-gradient-to-r ${counselor.color.gradient} text-white shadow`}>다음</button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
        {/* 상담사 아바타 */}
        <div 
          className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r ${counselor.color.gradient} flex items-center justify-center text-white font-bold shadow-lg`}
        >
          <span className="text-lg">{counselor.emoji}</span>
        </div>
        
        {/* 메시지 내용 */}
        <div className="flex flex-col">
          <div className="text-xs text-gray-500 mb-1">
            {counselor.name}
          </div>
          <div 
            className={`bg-gradient-to-r ${counselor.color.gradient} text-white px-4 py-2 rounded-lg shadow-lg`}
          >
            {message.content}
          </div>
        </div>
      </div>
    </div>
  )
}
