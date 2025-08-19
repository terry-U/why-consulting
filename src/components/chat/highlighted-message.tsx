'use client'

interface HighlightedMessageProps {
  content: string
}

export default function HighlightedMessage({ content }: HighlightedMessageProps) {
  // [ANSWER_READY] 태그를 찾아서 하이라이트 처리
  const processContent = (text: string) => {
    const parts = text.split(/(\*\*\[ANSWER_READY\]\*\*.*?\*\*\[ANSWER_READY\]\*\*)/g)
    
    return parts.map((part, index) => {
      if (part.includes('[ANSWER_READY]')) {
        // 태그 제거하고 하이라이트 처리
        const cleanText = part.replace(/\*\*\[ANSWER_READY\]\*\*/g, '')
        return (
          <span
            key={index}
            className="bg-yellow-200 border-l-4 border-yellow-500 pl-3 py-2 my-2 block rounded-r-lg font-medium text-gray-900"
          >
            💡 {cleanText}
          </span>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <div className="whitespace-pre-wrap">
      {processContent(content)}
    </div>
  )
}
