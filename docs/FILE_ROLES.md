# 파일/디렉터리 역할 가이드

이 문서는 프로젝트 내 주요 디렉터리와 대표 파일들의 역할을 빠르게 파악하기 위한 참고서입니다.
각 항목은 다음 포맷으로 정리됩니다: 무엇을 한다 / 언제 호출된다 / 누가 사용한다 / 주의사항.

## 루트

- `middleware.ts`
  - 무엇: 라우팅 가드. 로그인/결제 상태에 따라 접근 제어 및 리디렉션.
  - 언제: 모든 요청 시 Next.js 미들웨어 체인에서 실행.
  - 누가: 모든 페이지/라우트 진입 사용자.
  - 주의: `/pay`, `/auth`, `/api/*` 예외 유지. 완료 세션은 `/session/[id]/report`로 유도.

- `database-schema.sql`
  - 무엇: Supabase(PSQL) 스키마 정의.
  - 언제: 초기 세팅, 마이그레이션 참고 시.
  - 누가: DBA/개발자.
  - 주의: 실제 배포는 `supabase/migrations` 파일 사용 권장.

- `supabase/migrations/*.sql`
  - 무엇: 버전 관리되는 DB 마이그레이션.
  - 언제: DB 변경 배포 시.
  - 누가: 개발자/배포 파이프라인.
  - 주의: 변경 간 충돌 및 다운타임 고려.

## 앱 라우터 (`src/app`)

- `src/app/page.tsx`
  - 무엇: 랜딩(인증 분기) 페이지.
  - 언제: 루트 경로 접근 시.
  - 누가: 비회원/회원 모두.
  - 주의: CTA 경로가 미들웨어 정책과 일치해야 함.

- `src/app/home/page.tsx`
  - 무엇: 홈/대시보드. 상담 히스토리와 새 상담 시작.
  - 언제: 로그인 후 기본 진입.
  - 누가: 결제 완료 사용자 중심.
  - 주의: 자동 세션 생성 금지(CTA로만 시작). 미결제자 가드.

- `src/app/onboarding/page.tsx`
  - 무엇: 온보딩(튜토리얼). 종료 시 첫 세션 생성 트리거 가능.
  - 언제: 결제 직후 혹은 메뉴에서 진입.
  - 누가: 신규 사용자.
  - 주의: `autoStart` 파라미터 처리와 세션 생성 정책 일치.

- `src/app/session/[id]/page.tsx`
  - 무엇: 상담 세션 진행 화면.
  - 언제: 활성 세션 진입 시.
  - 누가: 결제 완료 사용자.
  - 주의: 완료/요약 상태면 미들웨어/클라이언트에서 `/report`로 유도.

- `src/app/session/[id]/report/page.tsx`
  - 무엇: 세션 결과/리포트 표시.
  - 언제: 세션 완료 또는 요약 단계 진입 후.
  - 누가: 해당 세션 사용자.
  - 주의: 서버 재조회로 상태 일관성 보장.

- `src/app/session/[id]/why/page.tsx`
  - 무엇: Why 문장 생성/표시(있다면).
  - 언제: 요약/완료 단계에서.
  - 누가: 해당 세션 사용자.
  - 주의: 생성 API와 상태 고정 정책 연계.

- `src/app/auth/page.tsx`, `src/app/auth/kakao-callback/page.tsx`
  - 무엇: 로그인/가입 및 카카오 콜백 처리.
  - 언제: 인증 플로우 중.
  - 누가: 모든 사용자.
  - 주의: 콜백 후 `auth_next`에 따른 리디렉션.

- `src/app/pay/page.tsx`
  - 무엇: 결제 화면.
  - 언제: 미들웨어에 의해 미결제 사용자가 유도됨.
  - 누가: 미결제 사용자.
  - 주의: 실제 결제/모의 결제 API 동작 확인.

### API Routes (`src/app/api`)

- `src/app/api/chat/route.ts`
  - 무엇: 대화 처리(OpenAI 연동) 백엔드.
  - 언제: 채팅 전송 시 클라이언트에서 호출.
  - 누가: 세션 페이지의 채팅 UI.
  - 주의: 완료 세션 차단(409) 및 리디렉션 힌트 반환.

- `src/app/api/session/route.ts`
  - 무엇: 세션 생성/조회 엔드포인트.
  - 언제: 온보딩 종료 시 또는 홈에서 새 상담 시작 시.
  - 누가: 온보딩/홈 페이지.
  - 주의: `users.is_paid_user` 확인. 미결제면 402.

- `src/app/api/session/[id]/advance/route.ts`
  - 무엇: 세션 단계 전환(questions → summary 등).
  - 언제: 요약 단계 진입 시 호출.
  - 누가: 세션 진행 UI/리포트 준비 로직.
  - 주의: 상태 고정 정책 반영.

- `src/app/api/session/[id]/report/route.ts`
  - 무엇: 리포트/Why 생성 및 조회.
  - 언제: 보고서 화면 진입/갱신 시.
  - 누가: 보고서/Why 페이지.
  - 주의: 생성 성공 시 완료 상태 고정.

- `src/app/api/user/status/route.ts`
  - 무엇: 사용자 결제/상태 조회.
  - 언제: 미들웨어/클라이언트 초기화 시.
  - 누가: 전역 상태 초기화 로직.
  - 주의: 캐시 정책 및 보안 헤더.

- `src/app/api/user/onboarding-complete/route.ts`
  - 무엇: 온보딩 완료 표식 업데이트.
  - 언제: 온보딩 종료 시.
  - 누가: 온보딩 페이지.
  - 주의: 인증 필요.

- `src/app/api/pay/mock/route.ts`
  - 무엇: 모의 결제 API(개발용).
  - 언제: `/pay`에서 테스트 결제 시.
  - 누가: 결제 화면.
  - 주의: 프로덕션에서 비활성화/가드.

- `src/app/api/why-generation/route.ts`
  - 무엇: Why 문장 생성 백엔드(내부).
  - 언제: 요약/리포트 생성 시.
  - 누가: 세션/리포트 로직.
  - 주의: 프롬프트/토큰 관리.

## 라이브러리/서비스 레이어 (`src/lib`)

- `supabase.ts`, `supabase-server.ts`
  - 무엇: 클라이언트/서버용 Supabase 클라이언트 초기화.
  - 언제: 데이터 작업 시 공통 사용.
  - 누가: API 라우트/컴포넌트/훅.
  - 주의: 서버/클라이언트 분리, 키 노출 금지.

- `auth.ts`, `auth-kakao.ts`
  - 무엇: 인증 유틸 및 카카오 연동.
  - 언제: 로그인/콜백 처리.
  - 누가: 인증 페이지/미들웨어.
  - 주의: 보안 파라미터 검증.

- `sessions.ts`, `messages.ts`, `history.ts`
  - 무엇: 세션/메시지/히스토리 데이터 액세스 계층.
  - 언제: 관련 API 라우트 및 페이지에서.
  - 누가: 서버 핸들러/컴포넌트.
  - 주의: 트랜잭션/상태 일관성.

- `openai.ts`, `why-generation.ts`
  - 무엇: OpenAI 초기화 및 Why 생성 로직.
  - 언제: 채팅/리포트 생성 시.
  - 누가: `api/chat`, `api/why-generation`.
  - 주의: 비용/토큰 관리, 재시도 정책.

- `characters.ts`, `counselor-info.ts`, `counseling-manager.ts`
  - 무엇: 상담사 정의/질문 흐름/상태 전이 로직.
  - 언제: 세션 진행/응답 생성 시.
  - 누가: 채팅/세션 페이지 및 API.
  - 주의: 사용자 선호/질문 인덱스 동기화.

- `cache.ts`, `database.ts`
  - 무엇: 캐시/DB 연결 헬퍼.
  - 언제: 빈번 조회 최적화 및 커넥션 관리.
  - 누가: 서버 로직 전반.
  - 주의: 서버 런타임 제약.

## 컴포넌트 (`src/components`)

- `chat/*`
  - 무엇: 채팅 UI(메시지, 헤더, 하이라이트 등).
  - 언제: 세션 화면에서 렌더링.
  - 누가: 세션 페이지.
  - 주의: 타이핑/하이라이트 타이밍 동기화.

- `common/AsyncButton.tsx`
  - 무엇: 비동기 버튼. 첫 클릭 시 비활성/스피너 처리.
  - 언제: 폼 제출/API 호출 버튼.
  - 누가: 전역.
  - 주의: 중복 클릭 방지, 오류 시 재활성화.

- `layout/*`
  - 무엇: 공통 크롬(헤더/푸터/반응형 레이아웃).
  - 언제: 전역 레이아웃에서 사용.
  - 누가: 페이지 전반.
  - 주의: 모바일 대응.

- `history/consultation-history-list.tsx`
  - 무엇: 상담 이력 목록.
  - 언제: 홈 페이지.
  - 누가: 결제 사용자.
  - 주의: 무한 스크롤/페이지네이션 고려.

- `why/why-candidates.tsx`
  - 무엇: Why 후보 문장 표시/선택.
  - 언제: 요약/리포트 단계.
  - 누가: 세션/리포트 페이지.
  - 주의: 확정 후 상태 고정.

## 훅 (`src/hooks`)

- `useAuth.ts`
  - 무엇: 클라이언트 인증 상태/유틸.
  - 언제: 보호된 화면에서.
  - 누가: 페이지/컴포넌트.
  - 주의: 세션 동기화.

- `useKeyboardAware.ts`, `useMediaQuery.ts`
  - 무엇: 키보드/미디어쿼리 대응.
  - 언제: 모바일/반응형 처리.
  - 누가: UI 컴포넌트.
  - 주의: SSR 안전성.

## 타입 (`src/types`)

- `characters.ts`
  - 무엇: 상담사 타입/상수.
  - 언제: 상담사 관련 로직 전반.
  - 누가: lib/컴포넌트.
  - 주의: enum/리터럴 동기화.

## 배포/운영

- `docs/EDGE_FUNCTION_DEPLOYMENT.md`
  - 무엇: Supabase Edge Function 배포 가이드.
  - 언제: 카카오 로그인 Edge 함수 배포 시.
  - 누가: 운영 담당/개발자.
  - 주의: 환경 변수/보안.

- `supabase/functions/auth-kakao/index.ts`
  - 무엇: 카카오 로그인 Edge Function 구현.
  - 언제: 카카오 인증 플로우 중 서버리스 호출.
  - 누가: 인증 콜백 처리.
  - 주의: 대시보드 등록/환경변수 필요.

---

연관 문서: `PROJECT_ARCHITECTURE.md`, `docs/USER_FLOW.md`, `docs/EDGE_FUNCTION_DEPLOYMENT.md`



