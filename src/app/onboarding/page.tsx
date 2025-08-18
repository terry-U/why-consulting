'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// PRD에 명시된 정확한 온보딩 문구들
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

function OnboardingContent() {
  const [currentStep, setCurrentStep] = useState(0)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const isLastStep = currentStep === ONBOARDING_MESSAGES.length - 1
  const isTicketStep = currentStep === 9 // "상담권을 10장 충전해드릴거에요" 다음

  const handleNext = () => {
    if (isTicketStep && !showTicketModal) {
      // 티켓 모달 표시
      setShowTicketModal(true)
      return
    }

    if (isLastStep) {
      // 온보딩 완료 - 실제 상담으로 이동
      if (sessionId) {
        router.push(`/session/${sessionId}`)
      } else {
        router.push('/home')
      }
      return
    }

    setCurrentStep(prev => prev + 1)
  }

  const handleSkip = () => {
    if (sessionId) {
      router.push(`/session/${sessionId}`)
    } else {
      router.push('/home')
    }
  }

  const handleExit = () => {
    router.push('/home')
  }

  const closeTicketModal = () => {
    setShowTicketModal(false)
    setCurrentStep(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center relative">
      {/* 메인 온보딩 화면 */}
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* 심볼 영역 - 피크민/젤다 스타일 */}
        <div className="mb-12">
          <div className="w-48 h-48 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-8xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
            🌟
          </div>
        </div>

        {/* 메시지 영역 */}
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl max-w-2xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium">
              {ONBOARDING_MESSAGES[currentStep]}
            </p>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="mb-8">
          <div className="flex justify-center space-x-2">
            {ONBOARDING_MESSAGES.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-yellow-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-gray-600 mt-2">
            {currentStep + 1} / {ONBOARDING_MESSAGES.length}
          </p>
        </div>

        {/* 컨트롤 버튼들 */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* 다음 버튼 */}
          <button
            onClick={handleNext}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg font-semibold py-4 px-12 rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {isLastStep ? '준비 됐어!' : '다음'}
          </button>

          {/* 나가기/건너뛰기 버튼 */}
          <div className="flex space-x-4">
            <button
              onClick={handleExit}
              className="text-gray-500 hover:text-gray-700 text-sm underline"
            >
              나중에 하기
            </button>
            
            {currentStep > 3 && (
              <button
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700 text-sm underline"
              >
                건너뛰기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 티켓 지급 모달 */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              상담권 10장 지급!
            </h3>
            <p className="text-gray-600 mb-6">
              충분한 시간을 가지고<br />
              자신을 탐색해보세요
            </p>
            <button
              onClick={closeTicketModal}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-3 px-8 rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-2xl text-gray-600">로딩 중...</div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
