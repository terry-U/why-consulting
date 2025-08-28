'use client'

import { useState, useEffect } from 'react'
import { Character } from '@/types/characters'
import HighlightedMessage from './highlighted-message'

interface CharacterMessageProps {
  character: Character
  message: string
  isTyping?: boolean
  showTypingEffect?: boolean
}

export default function CharacterMessage({ 
  character, 
  message, 
  isTyping = false,
  showTypingEffect = false 
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

  return (
    <div className="flex items-start mb-10">
      {/* 캐릭터 아바타 */}
      <div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center mr-3 shadow-sm">
        <span className="text-lg">{character.emoji}</span>
      </div>

      {/* 메시지 영역: 말풍선 제거, 대형 타이포그래피 */}
      <div className="flex-1 max-w-[85%]">
        <div className="mb-3 text-sm text-blue-700/80 font-medium">
          <span>{character.name}</span>
        </div>
        {isTyping ? (
          <div className="flex items-center space-x-2 text-blue-700/70">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-base">생각하는 중…</span>
          </div>
        ) : (
          <div className="text-blue-700 leading-relaxed whitespace-pre-wrap font-medium text-2xl md:text-3xl">
            <HighlightedMessage content={displayedText} />
            {showTypingEffect && !isComplete && (
              <span className="inline-block w-2 h-6 bg-blue-300 ml-1 animate-pulse"></span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// 사용자 메시지 컴포넌트
interface UserMessageProps {
  message: string
}

export function UserMessage({ message }: UserMessageProps) {
  return (
    <div className="flex items-start mb-10 justify-end">
      <div className="max-w-[85%]">
        <div className="text-gray-900 leading-relaxed whitespace-pre-wrap text-xl md:text-2xl">
          {message}
        </div>
      </div>
    </div>
  )
}
