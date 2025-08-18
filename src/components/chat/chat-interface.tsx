'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Message, Session, supabase } from '@/lib/supabase'
// import { getSessionMessages } from '@/lib/messages' // 현재 사용하지 않음
import CharacterMessage, { UserMessage } from './character-message'
import { CounselingManager } from '@/lib/counseling-manager'
import { getCharacter } from '@/lib/characters'
import { CharacterType } from '@/types/characters'

interface ChatInterfaceProps {
  session: Session
  initialMessages: Message[]
}

export default function ChatInterface({ session, initialMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 초기 환영 메시지 설정
  useEffect(() => {
    const setupWelcomeMessage = async () => {
      if (initialMessages.length === 0) {
        const welcomeMessage: Message = {
          id: `welcome-${Date.now()}`,
          session_id: session.id,
          user_id: session.user_id,
          role: 'assistant',
          content: '안녕하세요! 저는 상담사 지혜입니다. 오늘 이 시간을 통해 당신의 내면을 탐색하고, 삶의 목적을 함께 찾아보는 시간을 갖고 싶어요. 편안한 마음으로 대화를 시작해볼까요?',
          counselor_id: 'main',
          created_at: new Date().toISOString()
        }
        
        // 환영 메시지를 DB에 저장
        await supabase
          .from('messages')
          .insert({
            session_id: session.id,
            user_id: session.user_id,
            role: 'assistant',
            content: welcomeMessage.content,
            counselor_id: 'main'
          })
        
        setMessages([welcomeMessage])
      }
    }

    setupWelcomeMessage()
  }, [session, initialMessages.length])
  
  // 성능 최적화: 메모이제이션
  const counselingManager = useMemo(() => new CounselingManager(session), [session])
  const currentCounselor = useMemo(() => counselingManager.getCurrentCounselor(), [counselingManager])
  const currentQuestion = useMemo(() => counselingManager.getCurrentQuestion(), [counselingManager])
  const progress = useMemo(() => counselingManager.getProgress(), [counselingManager])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    try {
      // 사용자 메시지를 즉시 UI에 추가
      const newUserMessage: Message = {
        id: `temp-${Date.now()}`,
        session_id: session.id,
        user_id: session.user_id,
        role: 'user',
        content: userMessage,
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, newUserMessage])

      // 실제 채팅 API 호출
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: session.id, 
          message: userMessage,
          userId: session.user_id 
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: Message = {
          id: `ai-${Date.now()}`,
          session_id: session.id,
          user_id: session.user_id,
          role: 'assistant',
          content: data.response,
          counselor_id: data.counselor.type,
          created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, aiResponse])

        // 다음 단계로 진행해야 하는 경우
        if (data.shouldAdvance && data.nextPhaseData) {
          console.log('⏭️ 다음 단계 진행:', data.nextPhaseData)
          // TODO: 세션 상태 업데이트 및 UI 반영
        }
      } else {
        throw new Error(data.error)
      }

    } catch (error) {
      console.error('메시지 전송 오류:', error)
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* 상담 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: currentCounselor.color }}
            >
              <span className="text-sm">{currentCounselor.emoji}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{currentCounselor.name}</h3>
              <p className="text-xs text-gray-600">{currentCounselor.role}</p>
            </div>
          </div>
          
          {/* 진행률 */}
          <div className="text-right">
            <div className="text-sm text-gray-600">진행률</div>
            <div className="text-lg font-semibold text-gray-900">{Math.round(progress)}%</div>
          </div>
        </div>
        
        {/* 질문 진행 점들 */}
        {session.counseling_phase === 'questions' && (
          <div className="flex justify-center space-x-2 mt-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < session.current_question_index 
                    ? 'bg-green-500' 
                    : index === session.current_question_index
                    ? currentCounselor.color === '#FDE047' ? 'bg-yellow-400' :
                      currentCounselor.color === '#22C55E' ? 'bg-green-400' :
                      currentCounselor.color === '#A78BFA' ? 'bg-purple-400' : 'bg-gray-400'
                    : 'bg-gray-300'
                }`}
                style={{
                  backgroundColor: index === session.current_question_index ? currentCounselor.color : undefined
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          if (message.role === 'user') {
            return <UserMessage key={message.id} message={message.content} />
          } else {
            const character = getCharacter((message.counselor_id as CharacterType) || 'main')
            return (
              <CharacterMessage
                key={message.id}
                character={character}
                message={message.content}
                showTypingEffect={false}
              />
            )
          }
        })}
        
        {/* 로딩 상태 */}
        {isLoading && (
          <CharacterMessage
            character={currentCounselor}
            message=""
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 현재 질문 표시 */}
      {currentQuestion && (
        <div className="bg-gray-50 border-t border-gray-200 p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">현재 질문</p>
            <p className="font-medium text-gray-900">{currentQuestion.text}</p>
            {currentQuestion.helpText && (
              <p className="text-sm text-gray-500 mt-2">{currentQuestion.helpText}</p>
            )}
          </div>
        </div>
      )}

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="솔직한 마음을 편하게 말해주세요..."
              className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Enter로 전송 • Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}
