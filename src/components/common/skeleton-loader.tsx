'use client'

interface SkeletonLoaderProps {
  count?: number
  type: 'card' | 'text' | 'circle' | 'message' | 'session'
  className?: string
}

export default function SkeletonLoader({ 
  count = 1, 
  type, 
  className = '' 
}: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  const getTypeClass = () => {
    switch (type) {
      case 'card':
        return 'h-32 rounded-xl'
      case 'text':
        return 'h-4 rounded'
      case 'circle':
        return 'h-12 w-12 rounded-full'
      case 'message':
        return 'h-20 rounded-2xl'
      case 'session':
        return 'h-24 rounded-xl'
    }
  }

  const renderSessionSkeleton = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  )

  const renderMessageSkeleton = () => (
    <div className="flex items-start space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-full h-16 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  )

  if (type === 'session') {
    return (
      <div className="space-y-4">
        {items.map(i => (
          <div key={i}>
            {renderSessionSkeleton()}
          </div>
        ))}
      </div>
    )
  }

  if (type === 'message') {
    return (
      <div className="space-y-6">
        {items.map(i => (
          <div key={i}>
            {renderMessageSkeleton()}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {items.map(i => (
        <div 
          key={i}
          className={`bg-gray-200 animate-pulse ${getTypeClass()} ${className}`}
        />
      ))}
    </div>
  )
}

// 특화된 스켈레톤 컴포넌트들
export function SessionListSkeleton() {
  return <SkeletonLoader type="session" count={3} />
}

export function ChatSkeleton() {
  return <SkeletonLoader type="message" count={4} />
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      
      {/* 심볼 스켈레톤 */}
      <div className="text-center">
        <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full animate-pulse mb-4" />
        <div className="w-64 h-4 mx-auto bg-gray-200 rounded animate-pulse" />
      </div>
      
      {/* CTA 스켈레톤 */}
      <div className="w-full h-16 bg-gray-200 rounded-2xl animate-pulse" />
      
      {/* 티켓 지갑 스켈레톤 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
            <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="text-right space-y-2">
            <div className="w-12 h-6 bg-gray-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* 세션 리스트 스켈레톤 */}
      <SessionListSkeleton />
    </div>
  )
}
