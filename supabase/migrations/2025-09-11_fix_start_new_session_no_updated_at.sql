-- Fix RPC: remove reference to users.updated_at (column does not exist)
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
  SET remaining_tickets = remaining_tickets - 1
  WHERE id = p_user_id;

  RETURN v_session_id;
END;
$$;


