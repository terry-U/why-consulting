'use client'

import { useIsMobile, useIsSmallScreen } from '@/hooks/useMediaQuery'
import { useKeyboardAware } from '@/hooks/useKeyboardAware'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export default function ResponsiveLayout({ 
  children, 
  className = '',
  maxWidth = '2xl'
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile()
  const isSmallScreen = useIsSmallScreen()
  const { isKeyboardVisible, keyboardAwareStyle } = useKeyboardAware()

  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  }[maxWidth]

  return (
    <div 
      className={`min-h-screen ${className}`}
      style={keyboardAwareStyle}
    >
      <div className={`${maxWidthClass} mx-auto ${
        // 모바일 좌우 여백 10px (px-2.5)
        isSmallScreen ? 'px-2.5 py-4' : isMobile ? 'px-2.5 py-6' : 'px-8 py-8'
      }`}>
        {children}
      </div>
      
      {/* 키보드 올라왔을 때 하단 여백 */}
      {isKeyboardVisible && (
        <div className="h-4 bg-transparent" />
      )}
    </div>
  )
}

// 터치 친화적 버튼 컴포넌트
interface TouchFriendlyButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export function TouchFriendlyButton({ 
  onClick, 
  children, 
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md'
}: TouchFriendlyButtonProps) {
  const isMobile = useIsMobile()
  
  const baseClasses = "font-medium rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
  }[variant]
  
  const sizeClasses = {
    sm: isMobile ? "py-2 px-4 text-sm" : "py-2 px-4 text-sm",
    md: isMobile ? "py-3 px-6 text-base" : "py-3 px-6 text-base", 
    lg: isMobile ? "py-4 px-8 text-lg" : "py-4 px-8 text-lg"
  }[size]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        // 모바일에서 터치 타겟 최소 크기 보장
        minHeight: isMobile ? '44px' : '40px',
        minWidth: isMobile ? '44px' : '40px'
      }}
    >
      {children}
    </button>
  )
}
