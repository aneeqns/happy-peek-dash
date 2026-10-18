import { createMiddleware } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';

export const requireCreatorIdentity = createMiddleware({ type: 'function' })
  .middleware([requireSupabaseAuth])
  .server(async ({ context, next }) => {
    const { data, error } = await context.supabase.from('user_roles')
      .select('role').eq('user_id', context.userId).eq('role', 'creator').maybeSingle();
    if (error || !data) throw new Error('Forbidden');
    const { setResponseHeader } = await import('@tanstack/react-start/server');
    setResponseHeader('Cache-Control', 'private, no-store');
    return next();
  });