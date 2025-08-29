# App Flow & Gate Policy

본 문서는 인증/결제/온보딩/세션 생성·진입까지의 의존성과 분기 정책을 정의합니다.

## 용어
- auth: Supabase `auth.users` (로그인 계정)
- users: `public.users` (앱 사용자 확장, `is_paid_user` 포함)
- paid: `users.is_paid_user === true`

## 게이트 요약
1) 미들웨어
   - 로그인(session 존재) & 미결제(paid=false) → 대부분 경로에서 `/pay`로 리디렉션
   - 예외: `/pay`, `/auth`, `/auth/kakao-callback`, `/api/*`
   - 완료/요약 세션의 `/session/[id]`는 `/session/[id]/report`로 리디렉션

2) 세션 생성 API (`POST /api/session`)
   - 서버에서 `users.is_paid_user` 검증. 미결제면 402 응답.

3) 채팅 API (`POST /api/chat`)
   - 세션 상태가 `completed/summary/generated_why`면 409 + 리디렉션 정보 반환.

4) 클라이언트 UI 가드
   - 랜딩 CTA → `/auth?next=/pay`
   - 홈 CTA: 미결제면 `/pay`로 이동. 홈 진입 시 자동 세션 생성 금지.
   - 온보딩(`autoStart=1`) 종료 시에만 첫 세션 생성/진입.

## 시나리오
### A. 비회원(최초 방문)
1. 랜딩 `/` → CTA 클릭 → `/auth?next=/pay`
2. 카카오 로그인 완료 → 콜백에서 `auth_next`에 따라 `/pay` 이동
3. `/pay`에서 결제(모의: `/api/pay/mock`) → `users.is_paid_user=true` → `/onboarding?autoStart=1`
4. 온보딩 종료 시: 활성 세션 유무 확인 → 없으면 `POST /api/session`으로 생성 → `/session/[id]`

### B. 회원(과거 결제 없음)
1. 로그인 후 어떤 경로든 미들웨어가 `/pay`로 강제 이동
2. 결제 완료 → 온보딩 → 첫 세션 자동 시작

### C. 회원(과거 결제 있음)
1. 로그인 → `/home`
2. 사용자가 명시적으로 CTA 눌러야 새 세션 시작(홈은 자동 시작 금지)

## 상태 고정 정책
- `summary` 시작(`POST /api/session/[id]/advance` with `nextPhase=summary`) 시: 
  - 최소 `status='completed'` 고정, `counseling_phase='summary'` 시도(스키마 제약 시 questions/8 폴백)
- `my_why` 생성(`GET /api/session/[id]/report?type=my_why`) 시:
  - 저장 경로와 무관하게 `markSessionCompleted` 호출 → 완료 상태 고정

## 되돌아가기 방지
- 미들웨어: `/session/[id]` → 완료/요약이면 `/report`로 리디렉션
- 세션 페이지: `pageshow/popstate` 시 서버 재조회 후 즉시 `/report`로 교정
- 채팅 API: 완료 세션 409 차단 → 클라이언트가 즉시 `/report`

## 체크리스트
- [x] 홈 자동 세션 생성 제거
- [x] 온보딩 종료 시에만 첫 세션 자동 생성
- [x] 미들웨어 결제 게이트 적용
- [x] 세션 생성 API 결제 검증
- [x] 채팅/세션 완료 차단
- [x] 랜딩/홈 CTA 가드


