import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    'https://apdpeyvuhdawuftsxtku.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );