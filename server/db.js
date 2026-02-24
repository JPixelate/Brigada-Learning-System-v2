import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

// We use the SERVICE_ROLE_KEY to bypass Row Level Security (RLS) policies 
// since the backend is a trusted environment acting as an admin.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase credentials missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server/.env file.');
}

// Create a single supabase client for interacting with your database at the backend level
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);
