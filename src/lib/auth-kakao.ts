// 카카오 로그인 클라이언트 라이브러리

declare global {
  interface Window {
    Kakao: any
  }
}

export interface KakaoUser {
  id: string
  email: string
  nickname: string
  profile_image?: string
  kakao_id: string
}

export interface KakaoAuthResponse {
  success: boolean
  user?: KakaoUser
  session?: any
  error?: string
}

/**
 * 카카오 SDK 초기화
 */
export const initKakaoSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 카카오 SDK가 이미 로드되어 있으면 바로 초기화
    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY)
      }
      resolve()
      return
    }

    // 카카오 SDK 동적 로드
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js'
    script.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4'
    script.crossOrigin = 'anonymous'
    
    script.onload = () => {
      if (window.Kakao) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY)
        console.log('✅ Kakao SDK initialized')
        resolve()
      } else {
        reject(new Error('Failed to load Kakao SDK'))
      }
    }

    script.onerror = () => {
      reject(new Error('Failed to load Kakao SDK'))
    }

    document.head.appendChild(script)
  })
}

/**
 * 카카오 로그인 실행 - Authorization Code 방식
 */
export const signInWithKakao = async (): Promise<KakaoAuthResponse> => {
  try {
    // 카카오 SDK 초기화
    await initKakaoSDK()

    // Authorization Code 방식으로 리다이렉트
    const redirectUri = `${window.location.origin}/auth/kakao-callback`
    const kakaoClientId = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    
    // 직접 카카오 OAuth URL로 리다이렉트
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`
    
    console.log('🔄 Redirecting to Kakao OAuth:', kakaoAuthUrl)
    window.location.href = kakaoAuthUrl

    return { success: true }
  } catch (error) {
    console.error('❌ Kakao login error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 카카오 인증 코드를 처리하여 Supabase 로그인
 */
export const handleKakaoCallback = async (code: string): Promise<KakaoAuthResponse> => {
  try {
    console.log('🔄 Processing Kakao callback...')
    
    const response = await fetch('/api/auth/kakao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        redirectUri: `${window.location.origin}/auth/kakao-callback`
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ Kakao callback API error:', errorData)
      return {
        success: false,
        error: 'Failed to process Kakao login'
      }
    }

    const result: KakaoAuthResponse = await response.json()
    console.log('✅ Kakao login processed successfully')
    
    return result
  } catch (error) {
    console.error('❌ Kakao callback error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 카카오 로그아웃
 */
export const signOutFromKakao = async (): Promise<void> => {
  try {
    await initKakaoSDK()
    
    if (window.Kakao.Auth.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        console.log('✅ Kakao logout successful')
      })
    }
  } catch (error) {
    console.error('❌ Kakao logout error:', error)
  }
}
