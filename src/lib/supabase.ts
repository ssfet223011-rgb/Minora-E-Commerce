import { createClient } from '@supabase/supabase-js';

// Default Supabase project credentials for MINORA (Pure Natural Healthy)
// Using defaults so Vercel deployments connect automatically even if env vars are omitted
const DEFAULT_SUPABASE_URL = 'https://nqzxcklsubkodturmkrt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xenhja2xzdWJrb2R0dXJta3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzM0MDcsImV4cCI6MjEwODY0OTQwN30.wpJwsbRIWc9eQ4avi4_fAmmCS8pSMq1Y0uQ8R764yhs';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const rawAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabaseUrl = rawUrl.trim();
export const supabaseAnonKey = rawAnon.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Connected Supabase Client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
