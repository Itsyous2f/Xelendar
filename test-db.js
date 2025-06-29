// Test script to verify Supabase connection and database setup
// Run this with: node test-db.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('events').select('count').limit(1);
    
    if (error) {
      if (error.message.includes('relation "events" does not exist')) {
        console.error('❌ Events table does not exist!');
        console.error('Please run the SQL schema from supabase-schema.sql in your Supabase dashboard');
        return;
      }
      console.error('❌ Database connection error:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('✅ Events table exists and is accessible');
    
    // Test authentication
    console.log('\n🔍 Testing authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('ℹ️  No user currently authenticated (this is normal)');
    } else if (user) {
      console.log('✅ User is authenticated:', user.email);
    } else {
      console.log('ℹ️  No user currently authenticated (this is normal)');
    }
    
    console.log('\n🎉 Database setup looks good!');
    console.log('You can now run your Next.js app with: npm run dev');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection(); 