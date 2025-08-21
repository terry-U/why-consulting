'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// 온보딩 메시지(한 줄씩)
const ONBOARDING_MESSAGES = [
  "안녕하세요. 여기까지 온 당신, 이미 절반은 해냈습니다.",
  "이 여정은 당신을 더 당신답게 만드는 한 문장을 찾는 과정입니다.",
  "우리는 8개의 질문으로, 감정과 장면을 하나씩 밝혀갈 거예요.",
  "대단한 해답보다 중요한 건, 당신의 진짜 목소리입니다.",
  "괜찮다면, 지금 잠시 호흡을 고르고 마음이 편안한 지점에 머물러 볼까요?",
  "준비되었다면, 함께 시작해요."
]

function OnboardingRunner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [step, setStep] = useState(0)
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isShrinking, setIsShrinking] = useState(false)
  const typingTimer = useRef<NodeJS.Timeout | null>(null)
  const afterTypeTimer = useRef<NodeJS.Timeout | null>(null)
  const shrinkTimer = useRef<NodeJS.Timeout | null>(null)

  const finish = () => {
    try { localStorage.setItem('onboarding_seen', 'true') } catch {}
    // 요구사항: 상담 시작 시에는 온보딩을 보여줄 필요 없음 → 기본은 홈으로 복귀
    if (sessionId) {
      router.push(`/session/${sessionId}`)
    } else {
      router.push('/home')
    }
  }

  useEffect(() => {
    // 타이핑 시작
    setText('')
    setIsTyping(true)
    const content = ONBOARDING_MESSAGES[step]
    let i = 0
    typingTimer.current = setInterval(() => {
      i += 1
      setText(content.slice(0, i))
      if (i >= content.length) {
        if (typingTimer.current) clearInterval(typingTimer.current)
        setIsTyping(false)
        // 잠깐 머물렀다가 빠르게 축소
        afterTypeTimer.current = setTimeout(() => {
          setIsShrinking(true)
          shrinkTimer.current = setTimeout(() => {
            setIsShrinking(false)
            if (step >= ONBOARDING_MESSAGES.length - 1) {
              finish()
            } else {
              setStep(prev => prev + 1)
            }
          }, 180) // 빠르게 줄어듦
        }, 900) // 잠깐 머무름
      }
    }, 18) // 타자 속도

    return () => {
      if (typingTimer.current) clearInterval(typingTimer.current)
      if (afterTypeTimer.current) clearTimeout(afterTypeTimer.current)
      if (shrinkTimer.current) clearTimeout(shrinkTimer.current)
    }
  }, [step])

  return (
    <div className="min-h-screen ui-container flex items-center justify-center">
      <div className="max-w-4xl w-full px-6">
        {/* 상단 액션 */}
        <div className="flex justify-end mb-8">
          <button
            onClick={finish}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            건너뛰기
          </button>
        </div>

        {/* 중앙 메시지 */}
        <div className="flex items-center justify-center">
          <div
            aria-live="polite"
            className={`text-center font-semibold leading-tight select-none transition-all duration-200 ease-out ${
              isShrinking ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            } ${isTyping ? 'tracking-normal' : 'tracking-tight'} text-3xl md:text-5xl`}
          >
            {text}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen ui-container flex items-center justify-center"><div className="text-gray-500">로딩 중…</div></div>}>
      <OnboardingRunner />
    </Suspense>
  )
}
