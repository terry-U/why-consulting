'use client'

interface HighlightedMessageProps {
  content: string
}

export default function HighlightedMessage({ content }: HighlightedMessageProps) {
  // [ANSWER_READY] 태그를 찾아서 하이라이트 처리
  const processContent = (text: string) => {
    // **[ANSWER_READY]** 패턴을 찾아서 처리
    const answerReadyRegex = /\*\*\[ANSWER_READY\]\*\*(.*?)\*\*\[ANSWER_READY\]\*\*/g
    
    if (!answerReadyRegex.test(text)) {
      // [ANSWER_READY] 태그가 없으면 일반 텍스트로 반환
      return <span>{text}</span>
    }
    
    // 태그가 있으면 분리해서 처리
    const parts = text.split(answerReadyRegex)
    const result = []
    
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        // 일반 텍스트
        if (parts[i]) {
          result.push(<span key={`text-${i}`}>{parts[i]}</span>)
        }
      } else {
        // [ANSWER_READY] 내용 - 하이라이트
        result.push(
          <div
            key={`highlight-${i}`}
            className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 my-2 inline-block"
          >
            <span className="text-yellow-800 font-medium">💡 {parts[i]}</span>
          </div>
        )
      }
    }
    
    return result
  }

  return (
    <div className="whitespace-pre-wrap">
      {processContent(content)}
    </div>
  )
}
