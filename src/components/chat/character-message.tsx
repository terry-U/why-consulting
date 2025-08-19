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
    }, 50) // 50ms마다 한 글자씩

    return () => clearInterval(typingInterval)
  }, [message, showTypingEffect])

  return (
    <div className="flex items-start mb-6">
      {/* 캐릭터 아바타 */}
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg"
        style={{ 
          background: `linear-gradient(135deg, ${character.gradientFrom}, ${character.gradientTo})` 
        }}
      >
        <span className="text-xl">{character.emoji}</span>
      </div>
      
      {/* 메시지 버블 */}
      <div className="flex-1 max-w-[80%]">
        {/* 캐릭터 이름 */}
        <div className="mb-2">
          <span 
            className="text-sm font-semibold px-2 py-1 rounded-full text-white"
            style={{ backgroundColor: character.color }}
          >
            {character.name}
          </span>
        </div>
        
        {/* 메시지 내용 */}
        <div 
          className="p-4 rounded-2xl shadow-sm"
          style={{ 
            background: `linear-gradient(135deg, ${character.gradientFrom}20, ${character.gradientTo}20)`,
            border: `2px solid ${character.color}20`
          }}
        >
          {isTyping ? (
            <div className="flex items-center space-x-1">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-gray-500 text-sm ml-2">생각하는 중...</span>
            </div>
          ) : (
            <div className="text-gray-800 leading-relaxed">
              <HighlightedMessage content={displayedText} />
              {showTypingEffect && !isComplete && (
                <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse"></span>
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
        <div 
          className="p-4 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm"
        >
          <div className="text-gray-800 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </div>
  )
}
