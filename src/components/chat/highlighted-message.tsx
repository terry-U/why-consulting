'use client'

import type { ReactNode } from 'react'

interface HighlightedMessageProps {
  content: string
}

export default function HighlightedMessage({ content }: HighlightedMessageProps) {
  const insertSentenceBreaks = (text: string) => {
    return text.replace(/([.!?])\s+/g, '$1\n')
  }

  const renderLines = (text: string) => {
    const lines = insertSentenceBreaks(text).split('\n')
    return (
      <div>
        {lines.map((line, idx) => (
          <p key={idx} className="mb-4 opacity-0 animate-[fadeInUp_0.5s_ease_forwards]" style={{ animationDelay: `${idx * 100}ms` }}>
            {line || '\u00A0'}
          </p>
        ))}
      </div>
    )
  }

  const processContent = (text: string) => {
    const answerReadyRegex = /\*\*\[ANSWER_READY\]\*\*([\s\S]*?)\*\*\[ANSWER_READY\]\*\*/g
    if (!answerReadyRegex.test(text)) {
      return renderLines(text)
    }
    const parts = text.split(answerReadyRegex)
    const result: ReactNode[] = []
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) result.push(<div key={`text-${i}`}>{renderLines(parts[i])}</div>)
      } else {
        result.push(
          <div key={`highlight-${i}`} className="inline-block my-2">
            <span className="px-2 py-1 rounded-2xl bg-gray-100 text-gray-900 border border-gray-200 whitespace-pre-wrap">💡 {insertSentenceBreaks(parts[i])}</span>
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
