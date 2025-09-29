const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ Supabase URL atau KEY tidak ditemukan. Cek file .env");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
