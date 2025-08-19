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
  const [showAdvanceButtons, setShowAdvanceButtons] = useState(false)
  const [nextPhaseData, setNextPhaseData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 첫 상담사 인사 함수
  const handleFirstCounselorGreeting = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // 빈 메시지로 API 호출하여 상담사가 먼저 말하게 함
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          message: '', // 빈 메시지
          userId: session.user_id
        }),
      })

      const data = await response.json()

      if (data.success) {
        const aiResponse: Message = {
          id: `greeting-${Date.now()}`,
          session_id: session.id,
          user_id: session.user_id,
          role: 'assistant',
          content: data.response,
          counselor_id: data.counselor.type,
          created_at: new Date().toISOString()
        }
        
        // 타이핑 애니메이션과 함께 메시지 추가
        const tempMessage: Message = {
          ...aiResponse,
          content: ''
        }
        setMessages([tempMessage])
        
        // 타이핑 애니메이션
        let currentIndex = 0
        const typingInterval = setInterval(() => {
          if (currentIndex <= data.response.length) {
            setMessages([{
              ...aiResponse,
              content: data.response.slice(0, currentIndex)
            }])
            currentIndex++
          } else {
            clearInterval(typingInterval)
            
            // 타이핑 완료 후 다음 단계 진행 신호 처리
            if (data.shouldAdvance && data.nextPhaseData) {
              console.log('⏭️ 다음 단계 진행 신호 수신:', data.nextPhaseData)
              setShowAdvanceButtons(true)
              setNextPhaseData(data.nextPhaseData)
            }
          }
        }, 30)
      }
    } catch (error) {
      console.error('첫 인사 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [session.id, session.user_id])

  // 초기 메시지 설정 및 첫 상담사 인사
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages)
    } else {
      // 메시지가 없으면 상담사가 먼저 인사
      handleFirstCounselorGreeting()
    }
  }, [initialMessages, handleFirstCounselorGreeting])
  
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
        // 타이핑 애니메이션과 함께 메시지 추가
        const tempMessage: Message = {
          ...aiResponse,
          content: '' // 처음에는 빈 내용으로 시작
        }
        setMessages(prev => [...prev, tempMessage])
        
        // 타이핑 애니메이션 시뮬레이션
        let currentIndex = 0
        const typingInterval = setInterval(() => {
          if (currentIndex <= data.response.length) {
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiResponse.id 
                  ? { ...msg, content: data.response.slice(0, currentIndex) }
                  : msg
              )
            )
            currentIndex++
          } else {
            clearInterval(typingInterval)
            
            // 타이핑 완료 후 다음 단계 진행 신호 처리
            if (data.shouldAdvance && data.nextPhaseData) {
              console.log('⏭️ 다음 단계 진행 신호 수신:', data.nextPhaseData)
              setShowAdvanceButtons(true)
              setNextPhaseData(data.nextPhaseData)
            }
          }
        }, 30) // 30ms마다 한 글자씩
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

  const handleAdvanceToNext = async (confirmed: boolean) => {
    if (!nextPhaseData) return

    try {
      setIsLoading(true)
      
      if (confirmed) {
        // "응, 맞아!" - 다음 단계로 진행
        const response = await fetch(`/api/session/${session.id}/advance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nextPhase: nextPhaseData.nextPhase,
            nextQuestionIndex: nextPhaseData.nextQuestionIndex,
            userAnswer: messages[messages.length - 2]?.content // 마지막 사용자 메시지
          }),
        })

        const data = await response.json()

        if (data.success) {
          setShowAdvanceButtons(false)
          setNextPhaseData(null)
          
          // 페이지 새로고침으로 새로운 세션 상태 반영
          window.location.reload()
        } else {
          throw new Error(data.error)
        }
      } else {
        // "조금 더 생각해볼게" - 격려 메시지 받기
        const currentCounselor = getCurrentCounselor()
        const response = await fetch(`/api/session/${session.id}/encourage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            counselorType: currentCounselor
          }),
        })

        const data = await response.json()

        if (data.success) {
          // 격려 메시지를 채팅에 추가
          const encouragementMessage: Message = {
            id: `encourage-${Date.now()}`,
            session_id: session.id,
            user_id: session.user_id,
            role: 'assistant',
            content: data.message,
            counselor_id: currentCounselor,
            created_at: new Date().toISOString()
          }
          setMessages(prev => [...prev, encouragementMessage])
          setShowAdvanceButtons(false)
          setNextPhaseData(null)
        } else {
          throw new Error(data.error)
        }
      }
    } catch (error) {
      console.error('단계 진행 오류:', error)
      alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentCounselor = () => {
    if (session.counseling_phase === 'questions' && session.current_question_index >= 1) {
      const questionIndex = session.current_question_index // 인덱스 수정: -1 제거
      const counselingQuestions = [
        { counselor: 'yellow' },   // 질문 1
        { counselor: 'yellow' },   // 질문 2
        { counselor: 'bibi' },     // 질문 3
        { counselor: 'bibi' },     // 질문 4
        { counselor: 'green' },    // 질문 5
        { counselor: 'green' },    // 질문 6
        { counselor: 'bibi' },     // 질문 7
        { counselor: 'main' }      // 질문 8
      ]
      return counselingQuestions[questionIndex - 1]?.counselor || 'yellow'
    }
    return 'yellow'
  }

  

  return (
    <div className="flex flex-col h-full">
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
            character={getCharacter(getCurrentCounselor() as CharacterType)}
            message=""
            isTyping={true}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 답변 확인 버튼들 */}
      {showAdvanceButtons && nextPhaseData && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200 p-6">
          <div className="text-center space-y-4">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm text-yellow-800 font-medium">
              이 답변이 맞나요?
            </p>
            {nextPhaseData.nextQuestion && (
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-600 mb-1">다음 질문</p>
                <p className="text-sm font-medium text-gray-800">"{nextPhaseData.nextQuestion}"</p>
              </div>
            )}
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={() => handleAdvanceToNext(true)}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-medium hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                네, 맞아요! 🎯
              </button>
              <button
                onClick={() => handleAdvanceToNext(false)}
                disabled={isLoading}
                className="bg-white text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 border border-gray-200 shadow-sm hover:shadow-md"
              >
                좀 더 생각해볼게요 🤔
              </button>
            </div>
          </div>
        </div>
      )}

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
            💬
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Enter로 전송 • Shift+Enter로 줄바꿈
        </div>
      </div>
    </div>
  )
}
