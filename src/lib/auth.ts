import { supabase } from './supabase'
import { signOutFromKakao } from './auth-kakao'

// Supabase 클라이언트 re-export
export { supabase }

/**
 * 카카오 로그인 - auth-kakao.ts에서 처리
 * @deprecated 이메일 회원가입은 더 이상 사용하지 않습니다
 */
export async function signUp(email: string, password: string) {
  throw new Error('이메일 회원가입은 지원하지 않습니다. 카카오 로그인을 사용해주세요.')
}

/**
 * 카카오 로그인 - auth-kakao.ts에서 처리  
 * @deprecated 이메일 로그인은 더 이상 사용하지 않습니다
 */
export async function signIn(email: string, password: string) {
  throw new Error('이메일 로그인은 지원하지 않습니다. 카카오 로그인을 사용해주세요.')
}

/**
 * 로그아웃 (카카오 + Supabase)
 */
export async function signOut() {
  try {
    // 카카오 로그아웃
    await signOutFromKakao()
    
    // Supabase 로그아웃
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw new Error(error.message)
    }
    
    console.log('✅ Logout successful')
  } catch (error) {
    console.error('❌ Logout error:', error)
    throw error
  }
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    throw new Error(error.message)
  }
  
  return user
}

/**
 * 인증 상태 변경 리스너
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}
