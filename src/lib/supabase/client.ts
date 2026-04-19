import { createBrowserClient } from '@supabase/ssr';

// This is now a FUNCTION. It only runs when called.
export const getSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  return createBrowserClient(url, key);
};

// This is just to make sure your other pages don't break
export const createSupabaseBrowserClient = () => getSupabaseClient();