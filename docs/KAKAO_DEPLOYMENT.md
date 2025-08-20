# 카카오 로그인 배포 가이드

## 🔑 환경변수 설정

### 로컬 개발 (.env.local)
```bash
KAKAO_REST_API_KEY=762c4095691cbabbd05f57e3756c6096
KAKAO_CLIENT_SECRET=9qpm94gInPCfnQWAXLQkUX5tBJy3yshf
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=95413bc574229486ee0c543a542a53cf
```

### Vercel 프로덕션 환경변수
```bash
KAKAO_REST_API_KEY=762c4095691cbabbd05f57e3756c6096
KAKAO_CLIENT_SECRET=9qpm94gInPCfnQWAXLQkUX5tBJy3yshf
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=95413bc574229486ee0c543a542a53cf
```

### Supabase Edge Function 환경변수
```bash
KAKAO_REST_API_KEY=762c4095691cbabbd05f57e3756c6096
KAKAO_CLIENT_SECRET=9qpm94gInPCfnQWAXLQkUX5tBJy3yshf
SUPABASE_URL=https://hahbqvxcgqmjmqsqnmhb.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🚀 배포 단계

### 1. Supabase 마이그레이션
```bash
# 로컬에서 마이그레이션 실행
supabase db push

# 또는 Supabase 대시보드에서 SQL 실행
```

### 2. Edge Function 배포
```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# Edge Function 배포
supabase functions deploy auth-kakao

# 환경변수 설정
supabase secrets set KAKAO_REST_API_KEY=762c4095691cbabbd05f57e3756c6096
supabase secrets set KAKAO_CLIENT_SECRET=9qpm94gInPCfnQWAXLQkUX5tBJy3yshf
```

### 3. 카카오 개발자 콘솔 설정
- **Redirect URI 추가**:
  - `https://your-domain.vercel.app/auth/callback`
- **도메인 추가**:
  - `your-domain.vercel.app`

### 4. Vercel 배포
```bash
git add .
git commit -m "feat: 카카오 로그인 구현"
git push origin main
```

## 🔒 보안 고려사항

### 프로덕션 체크리스트
- [ ] 카카오 Client Secret이 서버에서만 사용되는지 확인
- [ ] CORS 헤더가 적절히 설정되었는지 확인
- [ ] Rate Limiting 적용 (Edge Function)
- [ ] 로그인 시도 제한 구현
- [ ] 사용자 데이터 암호화
- [ ] HTTPS 강제 적용
- [ ] CSP 헤더 설정

### 모니터링
- Supabase 대시보드에서 Edge Function 로그 확인
- 카카오 개발자 콘솔에서 API 사용량 모니터링
- Vercel Analytics로 로그인 성공률 추적

## 🐛 문제 해결

### 일반적인 오류
1. **"redirect_uri_mismatch"**: 카카오 콘솔의 Redirect URI 확인
2. **"invalid_client"**: Client ID/Secret 확인
3. **"cors error"**: Edge Function CORS 헤더 확인

### 디버깅
- Edge Function 로그: Supabase 대시보드 → Functions → Logs
- 브라우저 콘솔: 네트워크 탭에서 API 호출 확인
- Vercel 로그: Vercel 대시보드 → Functions → Logs
