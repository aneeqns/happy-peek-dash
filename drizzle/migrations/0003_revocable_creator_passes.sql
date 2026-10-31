CREATE TABLE public.creator_passes (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL,
 expires_at timestamptz NOT NULL
);
REVOKE ALL ON TABLE public.creator_passes FROM anon, authenticated;
GRANT ALL ON TABLE public.creator_passes TO service_role;
ALTER TABLE public.creator_passes ENABLE ROW LEVEL SECURITY;
CREATE INDEX creator_passes_user_idx ON public.creator_passes(user_id);
COMMENT ON TABLE public.creator_passes IS 'Service-only registry of signed Creator passes; deleting a record revokes retained cookie copies.';