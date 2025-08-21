'use client'

import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// 온보딩 메시지(기존 스크립트 복원)
const ONBOARDING_MESSAGES = [
  "안녕하세요, 큰 결심 하셨어요. 저렴한 금액은 아니었을텐데.",
  "하지만 반대로 확실히 말씀드릴 수 있는건, 당신이 더 당신답게 살고 싶다는 마음이 매우 간절하다는거에요.",
  "지금까지의 삶은 어떠셨나요? 즐거웠나요? 지루했나요? 아니면 괴로웠나요. 혹은 참지 못 할 만큼 답답했나요?",
  "지금부터 우리가 함께 찾아볼 \"why\"는 당신의 삶이 왜 그럴 수 밖에 없었는지를 발견 해 줄거에요.",
  "그리고 사소한 습관부터 계획과 목표까지. 더 당신다운 삶으로 하나씩 조정해나갈 수 있는 절대적 기준. 동기의 원천을 찾아드릴거에요.",
  "점이나 사주같은게 아니에요. 지금부터 저희는 당신에게 딱 8가지의 질문을 던질건데, 그것을 떠올리는 과정에서 심리학, 정신분석학, 인지과학 등 여러가지 방법론을 활용해 당신을 가장 잘 설명할 수 있는 단 한마디의 문장으로 정리할거에요.",
  "그리고 이 소중한 문장을 어떻게 활용할 수 있는지는 상담이 끝나고 말씀드릴게요.",
  "아. 시작하기 전에, 그저 몇마디 질문에 당신의 복잡하고 소중한 인생을 정의할 수 있다고 생각하시는건 아니죠?",
  "이 상담은 최소 5번은 반복해서 해 보셔야 해요. 상담을 반복하면 반복할수록, 사실은 그 과정에서 나 스스로를 더 솔직하게 바라보게 된답니다. 나에게 가장 솔직해졌을 때, 진정한 나의 한 문장을 발견할 수 있을거에요. 그 문장을 바라보고 소름이 돋거나, 눈물이 핑 돌거나, 말할 수 없는 해방감이 느껴진다면. 그 때 멈추시면 돼요.",
  "그래서 상담권을 10장 충전해드릴거에요.",
  "그럼 이제 정말 시작해봅시다.",
  "우선 방해받지 않고 마음이 가장 편안해지는 곳으로 이동해주세요. 좋아하는 노래를 틀어도 좋아요.",
  "준비 됐나요?"
]

function OnboardingRunner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [step, setStep] = useState(0)
  const [text, setText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isShrinking, setIsShrinking] = useState(false)
  const [showTicket, setShowTicket] = useState(false)
  const typingTimer = useRef<NodeJS.Timeout | null>(null)
  const afterTypeTimer = useRef<NodeJS.Timeout | null>(null)
  const shrinkTimer = useRef<NodeJS.Timeout | null>(null)

  // 온점 단위 분할(문장 단위 렌더) – 마침표/물음표/느낌표 유지
  const segments = useMemo(() => {
    const result: string[] = []
    ONBOARDING_MESSAGES.forEach((m) => {
      const matches = m.match(/[^.?!]+[.?!]/g)
      if (matches && matches.length) {
        matches.forEach(s => {
          const trimmed = s.trim()
          if (trimmed) result.push(trimmed)
        })
        // 남는 꼬리 문장이 있으면 추가
        const tail = m.replace(/[^.?!]+[.?!]/g, '').trim()
        if (tail) result.push(tail)
      } else {
        const t = m.trim()
        if (t) result.push(t)
      }
    })
    return result
  }, [])

  const TYPE_MS = 28
  const WAIT_MS = 2600
  const SHRINK_MS = 260

  const finish = () => {
    try { localStorage.setItem('onboarding_seen', 'true') } catch {}
    // 요구사항: 상담 시작 시에는 온보딩을 보여줄 필요 없음 → 기본은 홈으로 복귀
    if (sessionId) {
      router.push(`/session/${sessionId}`)
    } else {
      router.push('/home')
    }
  }

  const clearTimers = () => {
    if (typingTimer.current) clearInterval(typingTimer.current)
    if (afterTypeTimer.current) clearTimeout(afterTypeTimer.current)
    if (shrinkTimer.current) clearTimeout(shrinkTimer.current)
  }

  const startWaitAndShrink = (isFinal: boolean) => {
    afterTypeTimer.current = setTimeout(() => {
      setIsShrinking(true)
      shrinkTimer.current = setTimeout(() => {
        setIsShrinking(false)
        if (isFinal) {
          // 마지막은 사용자 CTA로 진행
          return
        }
        if (step >= segments.length - 1) {
          finish()
        } else {
          setStep(prev => prev + 1)
        }
      }, SHRINK_MS)
    }, WAIT_MS)
  }

  useEffect(() => {
    // 타이핑 시작
    setText('')
    setIsTyping(true)
    setShowTicket(false)
    const content = segments[step]
    let i = 0
    typingTimer.current = setInterval(() => {
      i += 1
      setText(content.slice(0, i))
      if (i >= content.length) {
        if (typingTimer.current) clearInterval(typingTimer.current)
        setIsTyping(false)
        const isTicket = content.includes('상담권을 10장')
        const isFinal = content.includes('준비 됐나요')
        if (isTicket) {
          // 사용자 확인 필요
          setShowTicket(true)
          return
        }
        // 잠깐 머물렀다가 빠르게 축소
        startWaitAndShrink(isFinal)
      }
    }, TYPE_MS)

    return () => {
      clearTimers()
    }
  }, [step])

  const handleAdvanceClick = () => {
    if (showTicket) return
    const content = segments[step]
    const isFinal = content.includes('준비 됐나요')
    if (isTyping) {
      // 타이핑 스킵 → 즉시 완성 후 대기 시작
      if (typingTimer.current) clearInterval(typingTimer.current)
      setText(content)
      setIsTyping(false)
      if (content.includes('상담권을 10장')) {
        setShowTicket(true)
        return
      }
      clearTimers()
      startWaitAndShrink(isFinal)
    } else if (!isShrinking) {
      // 대기 중 → 다음 문장으로
      clearTimers()
      setIsShrinking(true)
      shrinkTimer.current = setTimeout(() => {
        setIsShrinking(false)
        if (isFinal) return
        if (step >= segments.length - 1) finish()
        else setStep(prev => prev + 1)
      }, 180)
    }
  }

  return (
    <div className="min-h-screen ui-container">
      <div className="max-w-4xl w-full px-6 pt-24 pb-24 mx-auto">
        {/* 메인 메시지 */}
        <div
          role="button"
          onClick={handleAdvanceClick}
          aria-live="polite"
          className={`font-semibold leading-tight select-none transition-all duration-200 ease-out ${
            isShrinking ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } ${isTyping ? 'tracking-normal' : 'tracking-tight'} text-left text-3xl md:text-5xl min-h-[5.5rem] md:min-h-[8rem]`}
        >
          {text}
        </div>
      </div>

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={finish}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            건너뛰기
          </button>
          {segments[step] && segments[step].includes('준비 됐나요') && !isTyping && (
            <button
              onClick={finish}
              className="btn btn-primary text-white font-semibold px-6 py-3 rounded-full"
            >
              준비됐어요!
            </button>
          )}
        </div>
      </div>

      {/* 티켓 지급 모달 (미니멀) */}
      {showTicket && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-3">상담권 10장 지급</h3>
            <p className="text-gray-600 mb-6">여유 있게 반복 상담을 진행하실 수 있도록 준비했어요.</p>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowTicket(false)
                  // 모달 닫힘 후 바로 다음으로 진행
                  setIsShrinking(true)
                  shrinkTimer.current = setTimeout(() => {
                    setIsShrinking(false)
                    if (step >= segments.length - 1) finish()
                    else setStep(prev => prev + 1)
                  }, 200)
                }}
                className="btn btn-primary text-white px-5 py-2 rounded-full"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
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
