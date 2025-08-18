'use client'

import { useState, useEffect } from 'react'

export function useKeyboardAware() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      // 모바일에서 키보드가 올라오면 viewport 높이가 줄어듦
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.innerHeight
      
      // 키보드가 올라왔다고 판단할 수 있는 임계값 (예: 30%)
      const isVisible = viewportHeight < windowHeight * 0.75
      setIsKeyboardVisible(isVisible)
      
      if (isVisible) {
        setKeyboardHeight(windowHeight - viewportHeight)
      } else {
        setKeyboardHeight(0)
      }
    }

    // 초기 상태 설정
    handleResize()

    // 이벤트 리스너 등록
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => window.visualViewport?.removeEventListener('resize', handleResize)
    } else {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { 
    isKeyboardVisible, 
    keyboardHeight,
    // 키보드가 올라왔을 때 적용할 스타일
    keyboardAwareStyle: isKeyboardVisible ? {
      paddingBottom: `${keyboardHeight}px`
    } : {}
  }
}
