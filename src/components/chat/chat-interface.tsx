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

  // 온보딩형 타이핑 상태
  const [typedText, setTypedText] = useState('')
  const [segments, setSegments] = useState<string[]>([])
  const [segmentIndex, setSegmentIndex] = useState(0)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const waitingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [showTypingPanel, setShowTypingPanel] = useState(true)
  const [isScrolledUp, setIsScrolledUp] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const TYPE_MS = 28
  const WAIT_MS = 2600

  const splitIntoSentences = useCallback((content: string) => {
    const result: string[] = []
    const matches = content.match(/[^.?!]+[.?!]/g)
    if (matches && matches.length) {
      matches.forEach(s => { const t = s.trim(); if (t) result.push(t) })
      const tail = content.replace(/[^.?!]+[.?!]/g, '').trim()
      if (tail) result.push(tail)
    } else {
      const t = content.trim(); if (t) result.push(t)
    }
    return result
  }, [])

  const clearTypingTimers = useCallback(() => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
    if (waitingTimeoutRef.current) clearTimeout(waitingTimeoutRef.current)
  }, [])

  const startTypewriter = useCallback((content: string, onComplete?: () => void) => {
    // 패널용 텍스트는 [ANSWER_READY] 블록을 숨김
    const sanitizeForTyping = (raw: string) => {
      try {
        // **[ANSWER_READY]** ... **[ANSWER_READY]** 구간 제거
        const removed = raw.replace(/\*\*\[ANSWER_READY\]\*\*[\s\S]*?\*\*\[ANSWER_READY\]\*\*/g, '')
        return removed
      } catch {
        return raw
      }
    }
    const display = sanitizeForTyping(content)
    clearTypingTimers()
    const segs = splitIntoSentences(display)
    setSegments(segs)
    setSegmentIndex(0)
    setTypedText('')
    setIsTyping(true)
    setShowTypingPanel(true)

    const typeSegment = (idx: number) => {
      const current = segs[idx] || ''
      let i = 0
      typingIntervalRef.current = setInterval(() => {
        i += 1
        const before = segs.slice(0, idx).join(' ')
        const currentTyped = current.slice(0, i)
        setTypedText(before ? `${before} ${currentTyped}` : currentTyped)
        if (i >= current.length) {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current)
          setIsTyping(false)
          if (idx >= segs.length - 1) {
            waitingTimeoutRef.current = setTimeout(() => { if (onComplete) onComplete() }, 0)
          } else {
            waitingTimeoutRef.current = setTimeout(() => {
              setSegmentIndex(prev => prev + 1)
              setIsTyping(true)
              typeSegment(idx + 1)
            }, WAIT_MS)
          }
        }
      }, TYPE_MS)
    }

    typeSegment(0)
  }, [WAIT_MS, TYPE_MS, clearTypingTimers, splitIntoSentences])

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
      setIsTyping(true)
      
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
        
        // 온보딩형 문장 단위 타이핑. 타이핑 완료 시 중앙 패널은 사라지고 기록만 남김
        startTypewriter(data.response, () => {
          setMessages([{ ...aiResponse, content: data.response }])
          setShowTypingPanel(false)
          console.log('🔍 첫 인사 API 응답:', { shouldAdvance: data.shouldAdvance, nextPhaseData: data.nextPhaseData })
          if (data.shouldAdvance && data.nextPhaseData) {
            console.log('⏭️ 첫 인사에서 진행 신호 수신:', data.nextPhaseData)
            setShowAdvanceButtons(true)
            setNextPhaseData(data.nextPhaseData)
          } else {
            setTimeout(() => { inputRef.current?.focus() }, 100)
          }
        })
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
        
        // 온보딩형 문장 단위 타이핑. 타이핑 완료 시 중앙 패널은 사라지고 기록만 남김
        startTypewriter(data.response, () => {
          setMessages(prev => prev.map(msg => msg.id === aiResponse.id ? { ...msg, content: data.response } : msg))
          setShowTypingPanel(false)
          console.log('🔍 API 응답 데이터:', { shouldAdvance: data.shouldAdvance, nextPhaseData: data.nextPhaseData })
          if (data.shouldAdvance && data.nextPhaseData) {
            console.log('⏭️ 다음 단계 진행 신호 수신:', data.nextPhaseData)
            setShowAdvanceButtons(true)
            setNextPhaseData(data.nextPhaseData)
          } else {
            setTimeout(() => { inputRef.current?.focus() }, 100)
          }
        })
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
    setShowTypingPanel(atBottom)
  }, [])

  

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* 상단 프레임: 질문 텍스트를 좌측 고정 영역에 미니멀 표시 */}
      {currentQuestion && (
        <div className="border-b border-transparent bg-transparent">
          <div className="max-w-4xl w-full px-6 py-4 mx-auto">
            <p className="text-xs text-gray-500 mb-1">질문 {session.current_question_index}/8</p>
            <p className="text-base font-semibold text-gray-900 text-left">{currentQuestion.text}</p>
          </div>
        </div>
      )}

      {/* 온보딩형 메인 메시지 영역 (상담사 최신 메시지를 온보딩 스타일로 렌더) */}
      <div className="flex-1 overflow-y-auto bg-transparent" ref={scrollRef} onScroll={handleScroll}>
        <div
          role="button"
          onClick={() => {
            if (isTyping && typingIntervalRef.current) {
              const seg = segments[segmentIndex] || ''
              setTypedText([...segments.slice(0, segmentIndex), seg].join(' '))
              clearInterval(typingIntervalRef.current)
              setIsTyping(false)
            } else if (!isTyping && waitingTimeoutRef.current) {
              clearTimeout(waitingTimeoutRef.current)
              setSegmentIndex(prev => Math.min(prev + 1, Math.max(segments.length - 1, 0)))
            }
          }}
          aria-live="polite"
          className={`max-w-4xl w-full px-6 pt-8 pb-8 mx-auto font-semibold leading-tight select-none transition-all duration-200 ease-out text-left text-3xl md:text-5xl min-h-[5.5rem] md:min-h-[8rem] ${showTypingPanel ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
        >
          {typedText || getLatestAssistantText()}
        </div>

        {/* 과거 대화(간결히) */}
        <div className="max-w-4xl w-full px-6 pb-32 mx-auto space-y-3">
          {messages.slice(0, -1).map((message) => {
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
                <p className="text-sm text-gray-600">현재 질문과 방금 정리된 한 줄을 확인해주세요.</p>
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
                const answerReadyMatch = lastMessage.content.match(/\*\*\[ANSWER_READY\]\*\*(.*?)\*\*\[ANSWER_READY\]\*\*/);
                return answerReadyMatch ? (
                  <div className="border border-gray-200 rounded-xl p-6 mb-8 bg-white">
                    <p className="text-xs text-gray-500 mb-2">내 답변</p>
                    <p className="text-xl text-gray-900 leading-relaxed">💡 {answerReadyMatch[1]}</p>
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

      {/* 하단 고정 바 (온보딩 스타일) */}
      <div className={`fixed bottom-0 left-0 right-0 px-4 py-3 border-t ${isScrolledUp ? 'border-gray-300 bg-white/70' : 'border-transparent bg-transparent'} backdrop-blur-md transition-colors`}>
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
        <div className="mt-2 text-[11px] text-gray-500 text-center">
          {isScrolledUp ? (
            <button
              onClick={() => {
                const el = scrollRef.current
                if (!el) return
                el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
              }}
              className="underline"
            >
              맨 아래로
            </button>
          ) : (
            <>Enter 전송 • Shift+Enter 줄바꿈</>
          )}
        </div>
      </div>
    </div>
  )
}