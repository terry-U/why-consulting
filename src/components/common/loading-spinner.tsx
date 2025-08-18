'use client'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  color?: string
  message?: string
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#facc15',
  message 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 border-t-transparent animate-spin`}
        style={{ 
          borderColor: `${color}40`, 
          borderTopColor: color 
        }}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-600 text-center">
          {message}
        </p>
      )}
    </div>
  )
}

// 전체 화면 로딩 컴포넌트
interface FullScreenLoadingProps {
  message?: string
  subMessage?: string
}

export function FullScreenLoading({ 
  message = "로딩 중...", 
  subMessage 
}: FullScreenLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl animate-pulse">
          🌟
        </div>
        <LoadingSpinner size="large" message={message} />
        {subMessage && (
          <p className="text-gray-500 text-sm mt-2">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  )
}

// 인라인 로딩 컴포넌트
interface InlineLoadingProps {
  text?: string
}

export function InlineLoading({ text = "처리 중..." }: InlineLoadingProps) {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <LoadingSpinner size="small" />
      <span className="text-gray-600 text-sm">{text}</span>
    </div>
  )
}
