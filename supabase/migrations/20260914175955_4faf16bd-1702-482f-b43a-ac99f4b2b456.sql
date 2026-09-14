CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, username, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
      COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', ''))
    );
  EXCEPTION
    WHEN unique_violation THEN
      INSERT INTO public.profiles (id, email, username, full_name)
      VALUES (
        NEW.id,
        NEW.email,
        NULL,
        COALESCE(NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''), NULLIF(NEW.raw_user_meta_data ->> 'name', ''))
      )
      ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;