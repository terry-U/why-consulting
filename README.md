# 🧠 Why 상담사 앱

> LLM 기반 심층 상담 서비스 - 당신의 진정한 동기를 찾아드립니다

## ✨ 주요 기능

- 🔐 **Supabase 인증**: 이메일 기반 로그인/회원가입
- 💬 **AI 상담**: OpenAI GPT를 활용한 전문적인 심리 상담
- 💾 **대화 저장**: 상담 내용 자동 저장 및 이어하기
- 🎯 **Why 도출**: 개인화된 동기 문장 생성
- 💳 **결제 연동**: Toss Payments 연동 (추후 구현)

## 🛠 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o
- **UI Components**: Radix UI, Lucide React

## 🚀 시작하기

### 1. 프로젝트 클론

\`\`\`bash
git clone <repository-url>
cd why-consulting
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env.local\` 파일을 생성하고 다음 변수들을 설정하세요:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 \`database-schema.sql\` 파일 실행
3. Authentication > Settings에서 이메일 인증 활성화

### 4. OpenAI API 키 발급

1. [OpenAI Platform](https://platform.openai.com)에서 API 키 생성
2. 충분한 크레딧 확인

### 5. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📱 사용 방법

### 회원가입/로그인
1. 이메일과 비밀번호로 계정 생성
2. 이메일 인증 완료

### 상담 시작
1. 로그인 후 "상담 시작하기" 클릭
2. 현재 상황이나 고민을 자유롭게 입력
3. AI 상담사와 대화 진행

### 이어서 상담하기
1. 이전 세션이 있으면 자동으로 불러옴
2. "새 상담" 버튼으로 새로운 세션 시작 가능

## 🗄 데이터베이스 구조

### users
- 사용자 기본 정보 및 결제 상태

### sessions
- 상담 세션 정보 및 완료 상태

### messages
- 사용자와 AI의 모든 대화 내용

### payments
- 결제 정보 (추후 구현)

## 🔒 보안

- Row Level Security (RLS) 활성화
- 사용자별 데이터 격리
- JWT 토큰 기반 인증
- API 키 환경 변수 관리

## 📝 개발 계획

- [x] 기본 인증 시스템
- [x] AI 상담 기능
- [x] 대화 저장 및 이어하기
- [ ] Toss Payments 결제 연동
- [ ] 상담 완료 시 Why 문장 도출
- [ ] 관리자 대시보드
- [ ] 모바일 앱 (React Native/Flutter)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request

## 📄 라이센스

This project is licensed under the MIT License.
