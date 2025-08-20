# Supabase Edge Function 배포 가이드

## Edge Function 위치
- **파일**: `.supabase-functions/auth-kakao/index.ts`
- **Next.js 빌드에서 제외됨**: 별도 배포 필요

## 수동 배포 방법

### 1. Supabase Dashboard 사용 (권장)
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Edge Functions** 메뉴 클릭
4. **"New Function"** 버튼 클릭
5. Function Name: `auth-kakao`
6. `.supabase-functions/auth-kakao/index.ts` 내용 복사하여 붙여넣기
7. **Deploy** 클릭

### 2. 환경 변수 설정
Dashboard에서 **Settings** > **Environment variables**:
```
KAKAO_REST_API_KEY=762c4095691cbabbd05f57e3756c6096
KAKAO_CLIENT_SECRET=9qpm94gInPCfnQWAXLQkUX5tBJy3yshf
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 함수 URL
배포 후 Edge Function URL:
```
https://your-project-id.supabase.co/functions/v1/auth-kakao
```

## 테스트
1. Vercel 배포 완료 후
2. 카카오 콘솔에서 Redirect URI 업데이트
3. 웹사이트에서 카카오 로그인 테스트
