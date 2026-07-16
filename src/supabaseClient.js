// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'bombshelter'
    }
  }
});

// Test connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count');
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error);
  }
};

// Test storage
const testStorage = async () => {
  try {
    console.log('🔍 Testing storage connection...');
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('❌ Storage test failed:', error);
    } else {
      console.log('✅ Storage connected! Buckets:', data.map(b => b.name));
    }
  } catch (error) {
    console.error('❌ Storage test error:', error);
  }
};

// Run tests
testConnection();
setTimeout(testStorage, 1000);

export default supabase;