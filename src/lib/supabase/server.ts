import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://apdpeyvuhdawuftsxtku.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZHBleXZ1aGRhd3VmdHN4dGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzMwOTEsImV4cCI6MjA5MTY0OTA5MX0.zgIqLG-UMvnhv_oSzd1x4B0NF89D32v1nNyd1hNepsE';

export async function createSupabaseServerClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}