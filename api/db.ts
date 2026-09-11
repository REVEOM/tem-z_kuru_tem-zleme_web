import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(
  SUPABASE_URL || 'https://missing-url.supabase.co',
  SUPABASE_ANON_KEY || 'missing-key'
);
