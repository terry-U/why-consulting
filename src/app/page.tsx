'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { getUserById } from '@/lib/database-client'
import AuthForm from '@/components/auth/auth-form'
import ChatInterface from '@/components/chat/chat-interface'
import { Button } from '@/components/ui/button'
import { User, Session, Message } from '@/lib/supabase'
import { LogOut, Plus, MessageCircle } from 'lucide-react'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [chatLoading, setChatLoading] = useState(false)
  const [authUser, setAuthUser] = useState<{ id: string; email?: string } | null>(null)

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setAuthUser(session.user)
        
        // 병렬로 사용자 정보와 세션 정보 로드
        const [userData] = await Promise.all([
          getUserById(session.user.id),
          loadExistingSession(session.user.id)
        ])
        
        setUser(userData)
      }
      
      setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user)
        
        // 병렬 처리
        const [userData] = await Promise.all([
          getUserById(session.user.id),
          loadExistingSession(session.user.id)
        ])
        
        setUser(userData)
      } else {
        setAuthUser(null)
        setUser(null)
        setSession(null)
        setMessages([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadExistingSession = async (userId: string) => {
    try {
      const response = await fetch(`/api/session?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setSession(data.session)
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('세션 로드 오류:', error)
    }
  }

  const handleAuthSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const userData = await getUserById(session.user.id)
      setUser(userData)
      setAuthUser(session.user)
      await loadExistingSession(session.user.id)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAuthUser(null)
    setSession(null)
    setMessages([])
  }

  const startNewSession = async () => {
    if (!authUser) return

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: authUser.id }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSession(data.session)
        setMessages([])
      } else {
        alert('새 상담 세션 시작에 실패했습니다.')
      }
    } catch (error) {
      console.error('새 세션 시작 오류:', error)
      alert('오류가 발생했습니다.')
    }
  }

  const handleSendMessage = async (content: string) => {
    if (!session || !authUser) return

    setChatLoading(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId: session.id,
          userId: authUser.id,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setMessages(prev => [...prev, data.userMessage, data.assistantMessage])
      } else {
        alert('메시지 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('메시지 전송 오류:', error)
      alert('오류가 발생했습니다.')
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩중...</p>
        </div>
      </div>
    )
  }

  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Why 상담사</h1>
            <p className="text-xl text-gray-600">당신의 진정한 동기를 찾아드립니다</p>
          </div>
          <AuthForm onAuthSuccess={handleAuthSuccess} />
        </div>
      </div>
    )
  }

  // 결제하지 않은 사용자
  if (user && !user.is_paid_user) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Why 상담사</h1>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4">상담 서비스 이용권이 필요합니다</h2>
              <p className="text-gray-600 mb-6">
                전문 상담사와의 깊이 있는 대화를 위해<br />
                이용권을 구매해 주세요.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">포함 서비스</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 무제한 상담 세션</li>
                  <li>• 대화 내용 저장 및 이어하기</li>
                  <li>• 개인화된 Why 문장 도출</li>
                  <li>• 24시간 언제든지 이용 가능</li>
                </ul>
              </div>
              
              <Button className="w-full mb-4" size="lg">
                이용권 구매하기 (추후 구현)
              </Button>
              
              <p className="text-xs text-gray-500">
                결제 기능은 개발 중입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Why 상담사</h1>
              {user && (
                <span className="text-sm text-gray-600">
                  {user.email}님 안녕하세요!
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {session && (
                <Button onClick={startNewSession} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  새 상담
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6">
        {session ? (
          <div className="h-[calc(100vh-200px)]">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              loading={chatLoading}
              sessionId={session.id}
            />
          </div>
        ) : (
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">상담을 시작해보세요</h2>
            <p className="text-gray-600 mb-6">
              전문 상담사가 당신의 깊은 동기를 찾아드립니다.<br />
              편안한 마음으로 시작해보세요.
            </p>
            <Button onClick={startNewSession} size="lg" className="w-full">
              상담 시작하기
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
