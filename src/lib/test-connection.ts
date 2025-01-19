import { supabase } from './supabase';

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('generations')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

testConnection();