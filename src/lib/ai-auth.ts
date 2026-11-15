import { supabase } from '@/integrations/supabase/client';

/** Bearer header for AI routes, which require a signed-in account. */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
