# 🚀 Why Consulting 배포 가이드

## 1. Supabase 설정 (중요!)

### 인증 설정
Supabase 대시보드 > Authentication > URL Configuration에서 다음을 설정해주세요:

**Site URL:**
- 로컬: `http://localhost:3001`
- 프로덕션: `https://your-domain.vercel.app`

**Redirect URLs (추가):**
- 로컬: `http://localhost:3001/auth/callback`
- 프로덕션: `https://your-domain.vercel.app/auth/callback`

### 이메일 템플릿 설정
Supabase 대시보드 > Authentication > Email Templates에서:

**Confirm signup** 템플릿의 확인 링크를 다음으로 수정:
```
{{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=signup
```

## 2. 환경 변수 설정

### 로컬 개발 (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Vercel 프로덕션
Vercel 대시보드 > Settings > Environment Variables에서 동일한 변수들을 설정

## 3. 데이터베이스 스키마

Supabase SQL Editor에서 다음 스키마를 실행:

```sql
-- 사용자 세션 테이블
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  counseling_phase TEXT DEFAULT 'intro' CHECK (counseling_phase IN ('intro', 'questions', 'why_generation', 'completed')),
  current_question_index INTEGER DEFAULT 0,
  answers JSONB DEFAULT '{}',
  generated_why TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 메시지 테이블
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  counselor_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 세션만 볼 수 있음
CREATE POLICY "Users can view own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- 사용자는 자신의 메시지만 볼 수 있음  
CREATE POLICY "Users can view own messages" ON messages
  FOR ALL USING (auth.uid() = user_id);
```

## 4. 배포 확인 사항

### 빌드 테스트
```bash
npm run build
```

### Git 푸시
```bash
git add .
git commit -m "fix: 이메일 인증 설정 개선"
git push origin main
```

## 5. 트러블슈팅

### 이메일 인증 오류
- Supabase 인증 설정의 Site URL과 Redirect URL 확인
- 이메일 템플릿의 확인 링크 URL 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### API 오류
- 환경 변수가 올바르게 설정되었는지 확인
- Supabase 서비스 키 권한 확인
- OpenAI API 키 유효성 확인

### 로컬 개발 시
- 포트 충돌 시 3001 포트 사용 확인
- .env.local 파일 존재 및 내용 확인
