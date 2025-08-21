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
    <div className="flex items-start mb-6">
      {/* 캐릭터 아바타 */}
      <div className="w-10 h-10 rounded-full border bg-white flex items-center justify-center mr-3">
        <span className="text-lg">{character.emoji}</span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 max-w-[80%]">
        {/* 캐릭터 이름 */}
        <div className="mb-2 text-sm text-gray-600">
          <span className="font-semibold text-gray-900 mr-1">{character.name}</span>
        </div>

        {/* 메시지 내용 */}
        <div className="p-4 rounded-2xl border border-gray-200 bg-white">
          {isTyping ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-gray-500 text-sm ml-2">생각하는 중…</span>
            </div>
          ) : (
            <div className="text-gray-900 leading-relaxed">
              <HighlightedMessage content={displayedText} />
              {showTypingEffect && !isComplete && (
                <span className="inline-block w-2 h-5 bg-gray-300 ml-1 animate-pulse"></span>
              )}
            </div>
          )}
        </div>
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
    <div className="flex items-start mb-6 justify-end">
      <div className="max-w-[80%]">
        <div className="p-4 rounded-2xl border border-gray-200 bg-white">
          <div className="text-gray-900 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}
