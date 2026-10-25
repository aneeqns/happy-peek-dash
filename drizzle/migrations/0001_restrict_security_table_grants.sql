REVOKE ALL ON TABLE public.user_roles FROM anon, authenticated;
GRANT SELECT ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;
REVOKE ALL ON TABLE public.request_limits FROM anon, authenticated;
GRANT ALL ON TABLE public.request_limits TO service_role;
REVOKE TRUNCATE, REFERENCES, TRIGGER, MAINTAIN ON TABLE public.profiles, public.bank_accounts, public.holdings FROM authenticated;
REVOKE ALL ON TABLE public.profiles, public.bank_accounts, public.holdings FROM anon;
COMMENT ON TABLE public.request_limits IS 'Service-only durable request counters; intentionally no user RLS policies.';