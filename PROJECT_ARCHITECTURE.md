# WHY Consulting - 프로젝트 아키텍처 가이드

## 🎯 프로젝트 개요
AI 기반 개인 Why 발견 상담 서비스 - 8단계 구조화된 질문을 통해 개인의 핵심 가치와 목적을 발견하도록 돕는 서비스

## 📁 핵심 디렉토리 구조

```
src/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # 랜딩 페이지 (인증 분기)
│   ├── home/              # 대시보드 (상담 히스토리)
│   ├── auth/              # 통합 인증 페이지
│   ├── session/[id]/      # 상담 세션 페이지
│   ├── onboarding/        # 튜토리얼 페이지
│   └── api/               # API Routes
│       ├── chat/          # OpenAI 통합
│       └── session/       # 세션 관리
├── components/            # React 컴포넌트
│   ├── auth/              # 인증 관련
│   ├── chat/              # 대화 인터페이스
│   ├── history/           # 상담 히스토리
│   └── common/            # 공통 컴포넌트
├── lib/                   # 유틸리티 & 로직
│   ├── supabase.ts        # DB 연결
│   ├── auth.ts            # 인증 로직
│   ├── sessions.ts        # 세션 관리
│   ├── messages.ts        # 메시지 관리
│   └── characters.ts      # 상담사 정의
├── types/                 # TypeScript 타입
└── hooks/                 # Custom Hooks
```

## 🔄 데이터 플로우

### 1. 인증 플로우
```
User → /auth → AuthForm → Supabase Auth → /home
```

### 2. 상담 세션 플로우
```
/home → "새 상담" → /onboarding → /session/[id] → ChatInterface
```

### 3. AI 대화 플로우
```
User Input → ChatInterface → /api/chat → OpenAI → Character Response
```

## 🎭 상담사 시스템

### 8개 고유 상담사 (1:1 질문 매핑)
1. **Yellow** 🌞 - 뿌듯함 탐색
2. **Orange** 🧡 - 보람 발견  
3. **Bibi** 🦋 - 행복 순간
4. **Purple** 💜 - 고난과 성장
5. **Green** 🌿 - 이상향 탐색
6. **Blue** 💙 - 진정한 욕구
7. **Pink** 💖 - 전파하고 싶은 감정
8. **Main** ⭐ - 인생 조언 정리

## 🗄️ 데이터베이스 스키마

### 주요 테이블
- **users**: Supabase Auth 기본 사용자
- **sessions**: 상담 세션 (counseling_phase, current_question_index)
- **messages**: 대화 메시지 (role, content, counselor_id)

### 세션 상태
- `counseling_phase`: "questions" | "summary" | "completed"
- `current_question_index`: 1-8 (현재 진행 중인 질문)

## 🎨 UI/UX 핵심 개념

### 답변 확인 시스템
- **전체 화면 모달**: 몰입도 극대화
- **현재 질문 표시**: 파란색 박스
- **하이라이트된 답변**: 녹색 박스 (AI가 정리한 핵심)
- **확인 버튼**: "네, 맞아요!" / "좀 더 생각해볼게요"

### 타이핑 효과
- 30ms 간격 타이핑 애니메이션
- `[ANSWER_READY]` 태그 숨김 처리
- 완료 후 하이라이트 표시

## 🔧 개발 패턴

### 1. 컴포넌트 구조
```typescript
// Props 타입 정의
interface ComponentProps {
  session: Session
  onUpdate?: (session: Session) => void
}

// 상태 관리
const [state, setState] = useState<Type>()
const memoizedValue = useMemo(() => computation, [deps])
```

### 2. API 패턴
```typescript
// Next.js 15 Route Handler
export async function POST(request: NextRequest) {
  const { data } = await request.json()
  // Supabase 작업
  return NextResponse.json({ success: true, data })
}
```

### 3. 상태 업데이트 패턴
```typescript
// 부모 컴포넌트 상태 업데이트
if (onSessionUpdate) {
  onSessionUpdate({ ...session, ...updates })
}
```

## 🚀 배포 & 환경

### 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

### 배포 플랫폼
- **Frontend**: Vercel (자동 배포)
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o

## 🎯 핵심 기능 완성도

✅ **완료된 기능들**
- [x] 사용자 인증 (이메일 기반)
- [x] 8단계 구조화된 질문 시스템
- [x] 8개 고유 상담사 캐릭터
- [x] 실시간 대화 인터페이스
- [x] 타이핑 효과 & 하이라이트
- [x] 답변 확인 전체 화면 모달
- [x] 상담 히스토리 관리
- [x] 반응형 UI
- [x] 배포 환경

🔄 **향후 개발 예정**
- [ ] Summary 단계 (Why 문장 생성)
- [ ] 상담 결과 PDF 내보내기
- [ ] 소셜 로그인 추가
- [ ] 상담사 음성 지원

## 💡 개발 팁

### 토큰 효율성
- 전체 파일 읽기 대신 특정 라인 범위 활용
- 컴포넌트별 역할 명확히 구분
- 이 문서를 참고하여 구조 파악

### 디버깅
- 브라우저 개발자 도구 콘솔 활용
- Supabase Dashboard에서 실시간 데이터 확인
- Vercel Logs에서 배포 상태 모니터링

---

*이 문서는 프로젝트의 핵심 구조와 개념을 빠르게 파악할 수 있도록 작성되었습니다. 토큰 효율성을 위해 전체 파일을 읽기 전에 이 가이드를 먼저 참조하세요.*
