import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseAnonKey || 'placeholder-anon-key'
);

// Helper function to check connection status
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // A simple query to test connection. Assuming there's a table named 'modules' eventually.
    // However, calling 'auth.getSession()' operates safely without specific tables.
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    console.log('✅ Successfully connected to Supabase!');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err);
    return false;
  }
};
