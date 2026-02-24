import 'dotenv/config';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
  host: process.env.VITE_SUPABASE_DB_HOST,
  port: parseInt(process.env.VITE_SUPABASE_DB_PORT || '5432', 10),
  database: process.env.VITE_SUPABASE_DB_DATABASE || 'postgres',
  user: process.env.VITE_SUPABASE_DB_USERNAME || 'postgres',
  password: process.env.VITE_SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function checkConnection() {
  console.log('--- Testing Postgres Direct Connection (pg) ---');
  try {
    await client.connect();
    const res = await client.query('SELECT version();');
    console.log('✅ Postgres connection successful!');
    console.log('Server version:', res.rows[0].version);
  } catch (err) {
    console.error('❌ Postgres connection failed:', err.message);
  } finally {
    await client.end();
  }

  console.log('\n--- Testing Supabase API Connection (supabase-js) ---');
  try {
     const { createClient } = await import('@supabase/supabase-js');
     const supabase = createClient(
       process.env.VITE_SUPABASE_URL || 'http://localhost',
       process.env.VITE_SUPABASE_ANON_KEY || 'default'
     );
     
     // Perform a light operation without needing tables
     const { data, error } = await supabase.auth.getSession();
     if (error) {
       console.error('❌ Supabase API connection failed:', error.message);
     } else {
       console.log('✅ Supabase API connection successful!');
     }
  } catch (e) {
     console.error('❌ Supabase API failed:', e.message);
  }
}

checkConnection();
