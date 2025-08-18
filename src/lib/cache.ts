import { cache } from 'react'
import { getUserConsultationHistory, getConsultationDetail } from './history'
import { getSessionMessages } from './messages'

// React 18의 cache 함수를 사용한 데이터 캐싱
export const getCachedUserHistory = cache(async (userId: string) => {
  console.log('📚 캐시된 히스토리 조회:', userId)
  return await getUserConsultationHistory(userId)
})

export const getCachedSessionMessages = cache(async (sessionId: string) => {
  console.log('💬 캐시된 메시지 조회:', sessionId)
  return await getSessionMessages(sessionId)
})

export const getCachedConsultationDetail = cache(async (sessionId: string) => {
  console.log('🔍 캐시된 상담 상세 조회:', sessionId)
  return await getConsultationDetail(sessionId)
})

// 클라이언트 사이드 메모리 캐시
class ClientCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  set(key: string, data: any, ttlSeconds: number = 300) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    // TTL 체크
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }

  delete(key: string) {
    this.cache.delete(key)
  }
}

export const clientCache = new ClientCache()

// 캐시 키 생성 헬퍼
export const cacheKeys = {
  userHistory: (userId: string) => `user_history_${userId}`,
  sessionMessages: (sessionId: string) => `session_messages_${sessionId}`,
  sessionDetail: (sessionId: string) => `session_detail_${sessionId}`,
  userProfile: (userId: string) => `user_profile_${userId}`
}

// 캐시 무효화 헬퍼
export const invalidateCache = {
  userHistory: (userId: string) => {
    clientCache.delete(cacheKeys.userHistory(userId))
  },
  sessionMessages: (sessionId: string) => {
    clientCache.delete(cacheKeys.sessionMessages(sessionId))
  },
  allUserData: (userId: string) => {
    clientCache.delete(cacheKeys.userHistory(userId))
    clientCache.delete(cacheKeys.userProfile(userId))
  }
}
