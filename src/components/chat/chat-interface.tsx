'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Message, Session } from '@/lib/supabase'
// import { getSessionMessages } from '@/lib/messages' // 현재 사용하지 않음
import CharacterMessage, { UserMessage } from './character-message'
import { useRouter } from 'next/navigation'

import { getCharacter, COUNSELING_QUESTIONS } from '@/lib/characters'
import { CharacterType } from '@/types/characters'


interface ChatInterfaceProps {
  session: Session
  initialMessages: Message[]
  onSessionUpdate?: (session: Session) => void
}

export default function ChatInterface({ session, initialMessages, onSessionUpdate }: ChatInterfaceProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [showAdvanceButtons, setShowAdvanceButtons] = useState(false)
  const [nextPhaseData, setNextPhaseData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const typingControllerRef = useRef<null | (() => void)>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const typingMessageIdRef = useRef<string | null>(null)
  const typingCounselorRef = useRef<CharacterType>('main')
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const clearTypingTimers = useCallback(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
    if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current)
  }, [])

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
      // 첫 상담 시작 즉시 타이핑 말풍선 표시(서버 응답 전)
      setIsTyping(true)
      typingMessageIdRef.current = `typing-greeting-${Date.now()}`
      typingCounselorRef.current = (getCurrentCounselor() as CharacterType) || 'yellow'
      
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
        
        // 일반 채팅 타이핑: 한 글자씩 빠르게 출력 후 완료
        let i = 0
        const full = data.response
        const finishTyping = () => { i = full.length + 1 }
        typingControllerRef.current = finishTyping
        const tempId = aiResponse.id
        typingMessageIdRef.current = tempId
        typingCounselorRef.current = (data.counselor.type as CharacterType) || 'main'
        typingIntervalRef.current = setInterval(() => {
          if (i <= full.length) {
            const display = full.slice(0, i)
            setMessages([{ ...aiResponse, id: tempId, content: display }])
            i++
          } else {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
            typingControllerRef.current = null
            setMessages([{ ...aiResponse, id: tempId, content: full }])
            setIsTyping(false)
            typingMessageIdRef.current = null
            setTimeout(() => { inputRef.current?.focus() }, 100)
          }
        }, 16)
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
    // 사용자가 전송하는 즉시 상담사 타이핑 말풍선 표시
    try {
      setIsTyping(true)
      typingMessageIdRef.current = `typing-${Date.now()}`
      typingCounselorRef.current = (getCurrentCounselor() as CharacterType) || 'main'
    } catch {}

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
        setIsTyping(true)
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
        
        // 일반 채팅 타이핑(응답): 한 글자씩 출력 후 완료
        let i = 0
        const full = data.response
        const tempId = aiResponse.id
        const finishTyping = () => { i = full.length + 1 }
        typingControllerRef.current = finishTyping
        const tempCounselor = (data.counselor.type as CharacterType) || 'main'
        typingMessageIdRef.current = tempId
        typingCounselorRef.current = tempCounselor
        typingIntervalRef.current = setInterval(() => {
          if (i <= full.length) {
            const display = full.slice(0, i)
            setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, content: display } : msg))
            i++
          } else {
            if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
            typingControllerRef.current = null
            setMessages(prev => prev.map(msg => msg.id === tempId ? { ...msg, content: full } : msg))
            setIsTyping(false)
            typingMessageIdRef.current = null
            setTimeout(() => { inputRef.current?.focus() }, 100)
            console.log('🔍 API 응답 데이터:', { shouldAdvance: data.shouldAdvance, nextPhaseData: data.nextPhaseData })
            if (data.shouldAdvance && data.nextPhaseData) {
              setShowAdvanceButtons(true)
              setNextPhaseData(data.nextPhaseData)
            }
          }
        }, 16)
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      alert('메시지 전송에 실패했습니다.')
    } finally {
      setIsLoading(false)
      if (typingControllerRef.current === null && typingIntervalRef.current === null) {
        // 실패 등으로 응답이 오지 않은 경우 타이핑 말풍선 정리
        setIsTyping(false)
        typingMessageIdRef.current = null
      }
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
          
          // 요약 단계면 즉시 리포트 화면으로 이동
          if (nextPhaseData.nextPhase === 'summary') {
            setShowAdvanceButtons(false)
            setNextPhaseData(null)
            router.push(`/session/${session.id}/report`)
            return
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

  // 최신 상담사 문장 (온보딩 스타일 표시용)
  const getLatestAssistantText = useCallback(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].content || ''
    }
    return ''
  }, [messages])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distanceFromBottom <= 8
    setIsScrolledUp(!atBottom)
  }, [])

  

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* 메인 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto bg-transparent pt-20" ref={scrollRef} onScroll={handleScroll} style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="max-w-4xl w-full px-6 pb-32 mx-auto space-y-3">
          {messages.map((message) => {
            if (message.role === 'user') {
              return <UserMessage key={message.id} message={message.content} />
            } else {
              const character = getCharacter((message.counselor_id as CharacterType) || 'main')
              return <CharacterMessage key={message.id} character={character} message={message.content} showTypingEffect={false} />
            }
          })}
          {/* 상담사 타이핑 표시 말풍선 */}
          {(() => {
            if (!isTyping || !typingMessageIdRef.current) return null
            const inProgress = messages.find(m => m.id === typingMessageIdRef.current)
            const hasStarted = !!(inProgress && inProgress.content && inProgress.content.length > 0)
            if (hasStarted) return null
            return (
              <CharacterMessage
                key={`${typingMessageIdRef.current}-typing`}
                character={getCharacter(typingCounselorRef.current)}
                message=""
                isTyping={true}
                showTypingEffect={false}
              />
            )
          })()}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 답변 확인 버튼들 - 전체 화면 */}
      {showAdvanceButtons && nextPhaseData && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">답변 확인</h3>
                <p className="text-sm text-gray-600">현재 질문과 방금 정리된 내용을 확인해주세요.</p>
              </div>

              {/* 현재 질문 */}
              {currentQuestion && (
                <div className="border border-gray-200 rounded-xl p-6 mb-6 bg-white">
                  <p className="text-xs text-gray-500 mb-2">현재 질문</p>
                  <p className="text-lg font-medium text-gray-900">"{currentQuestion.text}"</p>
                </div>
              )}

              {/* 마지막에 하이라이트 된 답변 */}
              {messages.length > 0 && (() => {
                const lastMessage = messages[messages.length - 1];
                const answerReadyMatch = lastMessage.content.match(/\*\*\[ANSWER_READY\]\*\*([\s\S]*?)\*\*\[ANSWER_READY\]\*\*/);
                return answerReadyMatch ? (
                  <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white">
                    <p className="text-xs text-gray-500 mb-2">내 답변</p>
                    <div className="text-xl text-gray-900 leading-relaxed whitespace-pre-line">💡 {answerReadyMatch[1]}</div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>

          {/* 하단 버튼 영역 */}
          <div className="border-t border-gray-200 p-6 bg-white">
            <div className="max-w-md mx-auto flex justify-center gap-3">
              <button
                onClick={() => handleAdvanceToNext(true)}
                disabled={isLoading}
                className="btn btn-primary text-white px-8 py-3 rounded-full text-base disabled:opacity-50"
              >
                네, 맞아요! 🎯
              </button>
              <button
                onClick={() => handleAdvanceToNext(false)}
                disabled={isLoading}
                className="btn px-8 py-3 rounded-full text-base disabled:opacity-50"
              >
                좀 더 생각해볼게요 🤔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하단 고정 바: 스크롤 업 시 숨김 (바깥 레이아웃 영향 없도록) */}
      <div className={`fixed bottom-0 left-0 right-0 px-4 py-3 border-t border-white/30 bg-white/60 backdrop-blur-md transition-transform transition-opacity duration-200 will-change-transform ${isScrolledUp ? 'opacity-0 pointer-events-none translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="솔직한 마음을 편하게 말해주세요..."
            className="input resize-none flex-1"
            rows={2}
            disabled={isLoading || isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading || isTyping}
            className="btn btn-primary text-white px-4"
            aria-label="메시지 전송"
          >
            💬
          </button>
        </div>
        {!isScrolledUp && (
          <div className="mt-2 text-[11px] text-gray-500 text-center">Enter 전송 • Shift+Enter 줄바꿈</div>
        )}
      </div>

      {/* 스크롤 업 시 떠있는 맨 아래로 버튼 */}
      {isScrolledUp && (
        <button
          onClick={() => {
            const el = scrollRef.current
            if (!el) return
            el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 btn px-4 py-2 rounded-full"
        >
          맨 아래로
        </button>
      )}
    </div>
  )
}