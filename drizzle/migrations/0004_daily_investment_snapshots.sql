CREATE TABLE public.investment_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 source text NOT NULL CHECK (source IN ('real', 'demo')),
 source_key text NOT NULL,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(source, source_key)
);
GRANT SELECT, INSERT ON public.investment_events TO service_role;
ALTER TABLE public.investment_events ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.daily_investment_snapshots (
 day date PRIMARY KEY,
 real_holdings bigint NOT NULL DEFAULT 0 CHECK (real_holdings >= 0),
 demo_buys bigint NOT NULL DEFAULT 0 CHECK (demo_buys >= 0),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.daily_investment_snapshots TO service_role;
ALTER TABLE public.daily_investment_snapshots ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.increment_daily_investments() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.daily_investment_snapshots(day, real_holdings, demo_buys)
 VALUES ((NEW.recorded_at AT TIME ZONE 'UTC')::date, CASE WHEN NEW.source='real' THEN 1 ELSE 0 END, CASE WHEN NEW.source='demo' THEN 1 ELSE 0 END)
 ON CONFLICT(day) DO UPDATE SET
 real_holdings = daily_investment_snapshots.real_holdings + EXCLUDED.real_holdings,
 demo_buys = daily_investment_snapshots.demo_buys + EXCLUDED.demo_buys,
 updated_at = now();
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.increment_daily_investments() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER accumulate_investment_day AFTER INSERT ON public.investment_events FOR EACH ROW EXECUTE FUNCTION public.increment_daily_investments();
CREATE FUNCTION public.record_saved_holding() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.investment_events(source, source_key) VALUES ('real', NEW.id::text) ON CONFLICT DO NOTHING;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.record_saved_holding() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER snapshot_saved_holding AFTER INSERT ON public.holdings FOR EACH ROW EXECUTE FUNCTION public.record_saved_holding();
COMMENT ON TABLE public.daily_investment_snapshots IS 'Daily UTC investment activity counts. Completed days are retained; sells, removals and demo resets do not reduce counts. Demo collection starts at deployment.';
INSERT INTO public.investment_events(source, source_key, recorded_at)
SELECT 'real', id::text, created_at FROM public.holdings ON CONFLICT DO NOTHING;