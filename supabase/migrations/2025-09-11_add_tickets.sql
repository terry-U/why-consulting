-- Add remaining_tickets and transactional RPC for starting a session
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'remaining_tickets'
  ) THEN
    ALTER TABLE public.users ADD COLUMN remaining_tickets INTEGER NOT NULL DEFAULT 10;
  END IF;
END $$;

-- Ensure new users start with 10 tickets
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, is_paid_user, remaining_tickets)
  VALUES (new.id, new.email, false, 10);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transactional function: consume 1 ticket and create session
CREATE OR REPLACE FUNCTION public.start_new_session(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id uuid;
  v_remaining integer;
BEGIN
  SELECT remaining_tickets INTO v_remaining FROM public.users WHERE id = p_user_id FOR UPDATE;
  IF v_remaining IS NULL THEN
    RAISE EXCEPTION 'USER_NOT_FOUND';
  END IF;
  IF v_remaining <= 0 THEN
    RAISE EXCEPTION 'NO_TICKETS';
  END IF;

  INSERT INTO public.sessions (user_id, status, counseling_phase, current_question_index, answers)
  VALUES (p_user_id, 'active', 'questions', 1, '{}'::jsonb)
  RETURNING id INTO v_session_id;

  UPDATE public.users
  SET remaining_tickets = remaining_tickets - 1, updated_at = NOW()
  WHERE id = p_user_id;

  RETURN v_session_id;
END;
$$;


