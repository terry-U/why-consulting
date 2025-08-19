'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Message, Session } from '@/lib/supabase'
// import { getSessionMessages } from '@/lib/messages' // 현재 사용하지 않음
import CharacterMessage, { UserMessage } from './character-message'
import { CounselingManager } from '@/lib/counseling-manager'
import { getCharacter, COUNSELING_QUESTIONS } from '@/lib/characters'
import { CharacterType } from '@/types/characters'


interface ChatInterfaceProps {
  session: Session
  initialMessages: Message[]
  onSessionUpdate?: (session: Session) => void
}

export default function ChatInterface({ session, initialMessages, onSessionUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAdvanceButtons, setShowAdvanceButtons] = useState(false)
  const [nextPhaseData, setNextPhaseData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 현재 질문 정보
  const currentQuestion = useMemo(() => {
    if (session.counseling_phase === 'questions' && session.current_question_index >= 1) {
      const questionIndex = session.current_question_index - 1
      return COUNSELING_QUESTIONS[questionIndex] || null
    }
    return null
  }, [session.counseling_phase, session.current_question_index])

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
          content: '', // 처음에는 빈 내용으로 시작
          counselor_id: data.counselor.type,
          created_at: new Date().toISOString()
        }
        
        // 타이핑 애니메이션과 함께 메시지 추가
        setMessages([{
          ...aiResponse,
          content: '' // 처음에는 빈 내용으로 시작
        }])
        
        // 타이핑 애니메이션 시뮬레이션
        let currentIndex = 0
        const typingInterval = setInterval(() => {
          if (currentIndex <= data.response.length) {
            // [ANSWER_READY] 태그를 임시로 숨기고 타이핑
            let displayText = data.response.slice(0, currentIndex)
            
            // 타이핑 중에는 [ANSWER_READY] 태그 숨김
            if (displayText.includes('**[ANSWER_READY]**') && currentIndex < data.response.length) {
              const beforeAnswerReady = displayText.split('**[ANSWER_READY]**')[0]
              displayText = beforeAnswerReady
            }
            
            setMessages([{
              ...aiResponse,
              content: displayText
            }])
            currentIndex++
          } else {
            clearInterval(typingInterval)
            
            // 타이핑 완료 후 전체 내용 표시
            setMessages([{
              ...aiResponse,
              content: data.response
            }])
            
            // 타이핑 완료 후 다음 단계 진행 신호 처리
            console.log('🔍 첫 인사 API 응답:', { shouldAdvance: data.shouldAdvance, nextPhaseData: data.nextPhaseData })
            if (data.shouldAdvance && data.nextPhaseData) {
              console.log('⏭️ 첫 인사에서 진행 신호 수신:', data.nextPhaseData)
              setShowAdvanceButtons(true)
              setNextPhaseData(data.nextPhaseData)
            } else {
              // 포커스 설정
              setTimeout(() => {
                inputRef.current?.focus()
              }, 100)
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

  // 초기 메시지 로딩
  useEffect(() => {
    if (initialMessages.length === 0) {
      // 메시지가 없으면 상담사가 먼저 인사
      handleFirstCounselorGreeting()
    }
  }, [initialMessages, handleFirstCounselorGreeting])
  
  // 성능 최적화: 메모이제이션 (향후 사용 예정)

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

      // API 호출
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
            // [ANSWER_READY] 태그를 임시로 숨기고 타이핑
            let displayText = data.response.slice(0, currentIndex)
            
            // 타이핑 중에는 [ANSWER_READY] 태그 숨김
            if (displayText.includes('**[ANSWER_READY]**') && currentIndex < data.response.length) {
              // 아직 타이핑 중이면 [ANSWER_READY] 부분은 표시하지 않음
              const beforeAnswerReady = displayText.split('**[ANSWER_READY]**')[0]
              displayText = beforeAnswerReady
            }
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiResponse.id 
                  ? { ...msg, content: displayText }
                  : msg
              )
            )
            currentIndex++
          } else {
            clearInterval(typingInterval)
            
            // 타이핑 완료 후 전체 내용 표시
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiResponse.id 
                  ? { ...msg, content: data.response }
                  : msg
              )
            )
            
            // 타이핑 완료 후 다음 단계 진행 신호 처리
            console.log('🔍 API 응답 데이터:', { shouldAdvance: data.shouldAdvance, nextPhaseData: data.nextPhaseData })
            if (data.shouldAdvance && data.nextPhaseData) {
              console.log('⏭️ 다음 단계 진행 신호 수신:', data.nextPhaseData)
              setShowAdvanceButtons(true)
              setNextPhaseData(data.nextPhaseData)
            } else {
              console.log('❌ 진행 신호 없음 - shouldAdvance:', data.shouldAdvance, 'nextPhaseData:', data.nextPhaseData)
              // 포커스 설정
              setTimeout(() => {
                inputRef.current?.focus()
              }, 100)
            }
          }
        }, 30) // 30ms마다 한 글자씩
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      alert('메시지 전송에 실패했습니다.')
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
          // 세션 상태 업데이트를 부모에게 알림
          if (onSessionUpdate) {
            const updatedSession = {
              ...session,
              counseling_phase: nextPhaseData.nextPhase,
              current_question_index: nextPhaseData.nextQuestionIndex
            }
            onSessionUpdate(updatedSession)
          }
          
          // 채팅창 비우기
          setMessages([])
          
          // 상태 초기화
          setShowAdvanceButtons(false)
          setNextPhaseData(null)
          
          // 입력창에 포커스
          setTimeout(() => {
            inputRef.current?.focus()
          }, 100)
          
          // 새로운 상담사의 첫 인사 요청
          handleFirstCounselorGreeting()
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
          const encouragementMessage: Message = {
            id: `encouragement-${Date.now()}`,
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
      alert('단계 진행에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 현재 상담사 결정 로직
  const getCurrentCounselor = () => {
    if (session.counseling_phase === 'summary' || session.counseling_phase === 'completed') {
      return 'main'
    }
    
    // questions 단계에서는 질문 인덱스에 따라 결정
    const questionIndex = session.current_question_index
    if (questionIndex >= 1 && questionIndex <= 8) {
      const question = COUNSELING_QUESTIONS[questionIndex - 1]
      return question.counselor
    }
    return 'yellow'
  }

  

  return (
    <div className="flex flex-col h-full">
      {/* 현재 질문 헤더 */}
      {currentQuestion && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 shadow-sm">
          <div className="text-center">
            <p className="text-sm opacity-90 mb-1">질문 {session.current_question_index}/8</p>
            <p className="font-medium text-lg">{currentQuestion.text}</p>
          </div>
        </div>
      )}
      
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
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                답변이 정리되었나요?
              </h3>
              <p className="text-sm text-gray-600">
                확인해주시면 다음 질문으로 넘어갑니다
              </p>
            </div>
            {nextPhaseData.nextQuestion && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-700 mb-1">다음 질문</p>
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

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
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