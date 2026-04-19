import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn("Supabase keys are missing. This is normal during build time.");
    return null as any; 
  }

  return createBrowserClient(url, key);
};

export const supabase = createClient();

// This keeps the old name working so other pages don't break
export const createSupabaseBrowserClient = () => supabase;