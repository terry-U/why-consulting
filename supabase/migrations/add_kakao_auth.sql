-- 카카오 OAuth 지원을 위한 profiles 테이블 업데이트

-- profiles 테이블에 카카오 관련 컬럼 추가
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kakao_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS nickname TEXT,
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- 카카오 ID에 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_kakao_id ON profiles(kakao_id);
CREATE INDEX IF NOT EXISTS idx_profiles_provider ON profiles(provider);

-- 기존 사용자들의 provider를 'email'로 설정
UPDATE profiles SET provider = 'email' WHERE provider IS NULL;

-- 카카오 사용자 조회를 위한 함수 생성
CREATE OR REPLACE FUNCTION get_user_by_kakao_id(kakao_user_id TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  nickname TEXT,
  profile_image TEXT,
  kakao_id TEXT,
  created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.nickname,
    p.profile_image,
    p.kakao_id,
    p.created_at
  FROM profiles p
  WHERE p.kakao_id = kakao_user_id;
END;
$$;

-- 카카오 사용자 생성/업데이트 함수
CREATE OR REPLACE FUNCTION upsert_kakao_user(
  user_id UUID,
  user_email TEXT,
  kakao_user_id TEXT,
  user_nickname TEXT,
  user_profile_image TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_id UUID;
BEGIN
  INSERT INTO profiles (
    id,
    email,
    kakao_id,
    nickname,
    profile_image,
    provider,
    created_at
  ) VALUES (
    user_id,
    user_email,
    kakao_user_id,
    user_nickname,
    user_profile_image,
    'kakao',
    NOW()
  )
  ON CONFLICT (kakao_id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    nickname = EXCLUDED.nickname,
    profile_image = EXCLUDED.profile_image,
    updated_at = NOW()
  RETURNING id INTO result_id;
  
  RETURN result_id;
END;
$$;

-- RLS 정책 업데이트 (카카오 사용자도 접근 가능하도록)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 카카오 로그인 로그 테이블 생성 (선택사항 - 분석용)
CREATE TABLE IF NOT EXISTS kakao_login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  kakao_id TEXT NOT NULL,
  login_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 로그 테이블 RLS 활성화
ALTER TABLE kakao_login_logs ENABLE ROW LEVEL SECURITY;

-- 로그 테이블 정책 (관리자만 접근)
CREATE POLICY "Only service role can access logs" ON kakao_login_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
