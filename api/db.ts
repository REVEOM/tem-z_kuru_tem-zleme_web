import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

// If they are missing, we don't throw immediately to avoid crashing the Vercel edge function (which causes HTML 500 pages).
// Instead, createClient will either fail or we handle it in the routes.
export const supabase = createClient(
  SUPABASE_URL || 'https://missing-url.supabase.co',
  SUPABASE_ANON_KEY || 'missing-key'
);
