import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireCreatorIdentity } from './creator-auth';
import { investmentDays } from './investment-history';
import { fetchLiveQuotes, providerSymbol } from './quotes.functions';

export const getInvestmentHistory = createServerFn({ method: 'GET' })
  .middleware([requireCreatorIdentity])
  .inputValidator(z.object({ start: z.iso.date(), end: z.iso.date() }).refine(
    data => data.end >= data.start && Date.parse(data.end) - Date.parse(data.start) <= 365 * 86_400_000,
    'Choose a range of up to one year.',
  ))
  .handler(async ({ data, context }) => {
    const { hasCreatorPass } = await import('./creator-access.server');
    if (!(await hasCreatorPass(context.userId))) throw new Error('Forbidden');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: rows, error } = await supabaseAdmin.from('daily_investment_snapshots')
      .select('day, real_holdings, demo_buys').gte('day', data.start).lte('day', data.end).order('day');
    if (error) throw new Error('Investment history could not be loaded.');
    return investmentDays(rows ?? [], data.start, data.end);
  });

/** Demo activity is anonymous, bounded and deduplicated; never counted as real money. */
export const recordDemoInvestment = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.uuid(), symbol: z.string().trim().toUpperCase().regex(/^[A-Z0-9.^=-]{1,12}$/),
    quantity: z.number().finite().positive().max(10_000_000),
  }).strict())
  .handler(async ({ data }) => {
    const { enforcePublicQuota } = await import('./request-security.server');
    if (await enforcePublicQuota('quotes')) throw new Error('Investment history is busy. Please retry saving it.');
    const quote = (await fetchLiveQuotes([providerSymbol(data.symbol)]))[0];
    if (!quote || quote.currency !== 'USD' || data.quantity * quote.price > 10_000_000) {
      throw new Error('A valid USD market price is required to record this demo investment.');
    }
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin.from('investment_events').upsert(
      { source: 'demo', source_key: data.id }, { onConflict: 'source,source_key', ignoreDuplicates: true },
    );
    if (error) throw new Error('Could not save investment history. Please retry.');
    return { ok: true };
  });