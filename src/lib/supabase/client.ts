import { createBrowserClient } from '@supabase/ssr';

// This is the "Engine" that talks to your database
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This helps your other pages find the engine easily
export const createSupabaseBrowserClient = () => supabase;