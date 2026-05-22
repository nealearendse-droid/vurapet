import { createBrowserClient } from '@supabase/ssr';

export const createSupabaseBrowserClient = () =>
  createBrowserClient(
    'https://apdpeyvuhdawuftsxtku.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwZHBleXZ1aGRhd3VmdHN4dGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNzMwOTEsImV4cCI6MjA5MTY0OTA5MX0.zgIqLG-UMvnhv_oSzd1x4B0NF89D32v1nNyd1hNepsE'
  );