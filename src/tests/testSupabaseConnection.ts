import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nqzxcklsubkodturmkrt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xenhja2xzdWJrb2R0dXJta3J0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwNzM0MDcsImV4cCI6MjEwODY0OTQwN30.wpJwsbRIWc9eQ4avi4_fAmmCS8pSMq1Y0uQ8R764yhs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing connection to Supabase:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.log('Query result error (tables might not be migrated yet):', error.message);
    } else {
      console.log('Successfully connected and queried categories! Row count:', data.length);
    }
  } catch (err) {
    console.error('Connection exception:', err);
  }
}

checkConnection();
