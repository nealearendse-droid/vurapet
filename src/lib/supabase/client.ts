import { createBrowserClient } from '@supabase/ssr';

// 1. Get the values directly from the environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 2. Export a simple, single client
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);

// 3. Keep this for your other pages so they don't break
export const createSupabaseBrowserClient = () => supabase;