import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Uses @supabase/ssr which stores session in COOKIES
// This makes it visible to the middleware on all devices including mobile
export const createSupabaseBrowserClient = () => {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};