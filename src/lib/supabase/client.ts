import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types'; // If you have types, otherwise remove

// Singleton pattern - only create ONE client ever
let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (client) {
    return client;
  }

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}