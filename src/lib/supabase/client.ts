import { createBrowserClient } from '@supabase/ssr';

export const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("CRITICAL ERROR: Supabase keys are missing from Vercel environment variables.");
    return null;
  }

  return createBrowserClient(url, key);
};

// Export a constant for easy use
export const supabase = getSupabase();

// Export the helper for pages that use the old name
export const createSupabaseBrowserClient = () => getSupabase();