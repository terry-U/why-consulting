'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/characters'
import HighlightedMessage from './highlighted-message'
import { Sparkles, Heart, Star, Smile } from 'lucide-react'

interface CharacterMessageProps {
  character: Character
  message: string
  isTyping?: boolean
  showTypingEffect?: boolean
  timestamp?: string
  emotion?: 'positive' | 'neutral' | 'supportive'
}

export default function CharacterMessage({ 
  character, 
  message, 
  isTyping = false,
  showTypingEffect = false,
  timestamp,
  emotion
}: CharacterMessageProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!showTypingEffect) {
      setDisplayedText(message)
      setIsComplete(true)
      return
    }

    setDisplayedText('')
    setIsComplete(false)
    
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex < message.length) {
        setDisplayedText(message.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        setIsComplete(true)
        clearInterval(typingInterval)
      }
    }, 30) // 30ms마다 한 글자씩 (더 자연스럽게)

    return () => clearInterval(typingInterval)
  }, [message, showTypingEffect])

  const from = (character as any)?.gradientFrom || '#60a5fa'
  const to = (character as any)?.gradientTo || '#a78bfa'

  return (
    <div className="flex flex-col md:flex-row items-start mb-10">
      {/* 메시지 영역: 모바일 좌측 밀착, 데스크탑 기존 너비 */}
      <div className="flex-1 max-w-full md:max-w-[85%]">
        <div className="mb-3 text-sm text-blue-700/80 font-medium flex items-center gap-2">
          <span className="text-black">{character.name}</span>
          {/* 캐릭터 컬러 점: 모바일 상단, 데스크탑 우측 정렬을 위한 유연 배치 */}
          <span className="ml-auto md:ml-2 inline-flex items-center">
            <span
              className="inline-block rounded-full"
              style={{ width: '1em', height: '1em', background: `linear-gradient(135deg, ${from}, ${to})` }}
              aria-hidden
            />
          </span>
        </div>
        {isTyping ? (
          <div className="flex items-center space-x-2 text-blue-700/70">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-base shimmer-text">생각하는 중…</span>
          </div>
        ) : (
          <div className="text-blue-700 leading-relaxed whitespace-pre-wrap font-medium text-base md:text-lg">
            <HighlightedMessage content={displayedText} />
            {showTypingEffect && !isComplete && (
              <span className="inline-block w-2 h-6 bg-blue-300 ml-1 animate-pulse"></span>
            )}
          </div>
        )}
        {timestamp && (
          <div className="mt-2 text-xs text-gray-500">{new Date(timestamp).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  )
}

// 사용자 메시지 컴포넌트
interface UserMessageProps {
  message: string
  timestamp?: string
}

export function UserMessage({ message, timestamp }: UserMessageProps) {
  return (
    <div className="flex items-start mb-10 justify-end">
      <div className="max-w-[85%]">
        <div className="mb-2 text-sm text-purple-700/80 font-medium text-right">나</div>
        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap text-base md:text-lg text-right md:text-right">
          {message}
        </div>
        {timestamp && (
          <div className="mt-2 text-xs text-gray-500 text-right">{new Date(timestamp).toLocaleTimeString()}</div>
        )}
      </div>
    </div>
  )
}
