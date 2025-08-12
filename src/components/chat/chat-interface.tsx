'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Message } from '@/lib/supabase'
import CounselorMessage from './counselor-message'

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (content: string) => Promise<void>
  loading: boolean
  onNewSession: () => void
  onLogout: () => void
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  loading, 
  sessionId,
  onNewSession,
  onLogout
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>(messages)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 타이핑 효과 적용: 마지막 assistant 메시지를 한글자씩 표기
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (!last) {
      setDisplayedMessages(messages)
      return
    }
    if (last.role !== 'assistant') {
      setDisplayedMessages(messages)
      scrollToBottom()
      return
    }
    setIsTyping(true)
    const base = messages.slice(0, -1)
    const full = last.content
    let i = 0
    const temp: Message = { ...last, content: '' }
    setDisplayedMessages([...base, temp])
    const timer = setInterval(() => {
      i += 2 // 한글자씩 느리게 보이면 1로 조정
      if (i >= full.length) {
        clearInterval(timer)
        setDisplayedMessages([...base, { ...last }])
        setIsTyping(false)
        scrollToBottom()
      } else {
        temp.content = full.slice(0, i)
        setDisplayedMessages([...base, { ...temp }])
        scrollToBottom()
      }
    }, 16)
    return () => clearInterval(timer)
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const messageContent = input.trim()
    setInput('')
    
    try {
      await onSendMessage(messageContent)
    } catch (error) {
      console.error('메시지 전송 오류:', error)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto text-[17px] leading-7">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Why 상담사</h1>
            <p className="text-blue-100 text-sm">당신의 진정한 동기를 찾아드립니다</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onNewSession}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              새 상담
            </button>
            <button
              onClick={onLogout}
              className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-5 min-h-0">
        {displayedMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg mb-2">안녕하세요! 👋</p>
            <p>저는 당신의 깊은 동기를 탐색하는 상담사입니다.</p>
            <p>편안하게 현재 상황이나 고민을 말씀해 주세요.</p>
            <div className="mt-6">
              <button
                onClick={() => onSendMessage('__NEXT__')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:shadow-md"
              >
                다음
              </button>
            </div>
          </div>
        ) : (
          displayedMessages.map((message) => (
            <CounselorMessage key={message.id} message={message} />
          ))
        )}
        
        {(loading || isTyping) && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>상담사가 응답을 작성중입니다...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <form onSubmit={handleSubmit} className="p-5 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className={`px-5 py-3 rounded-lg font-medium transition-all duration-200 ${
              loading || !input.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {loading ? '전송 중...' : '전송'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          최대 500자까지 입력 가능합니다.
        </p>
      </form>
    </div>
  )
} 