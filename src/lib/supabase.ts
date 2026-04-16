import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.error(
    '❌ Supabase configuration is missing!\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.\n' +
    'You can find these in your Supabase Project Settings > API.'
  );
}

// Create a dummy client if not configured to prevent crash on initialization
// The Proxy will intercept calls and provide a helpful error message
const client = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {} as SupabaseClient;

export const supabase = new Proxy(client, {
  get(target, prop, receiver) {
    if (!isConfigured) {
      throw new Error(
        `Supabase client is not configured. Cannot access property "${String(prop)}". ` +
        'Please check your environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).'
      );
    }
    return Reflect.get(target, prop, receiver);
  }
});
