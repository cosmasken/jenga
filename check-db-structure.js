#!/usr/bin/env node

/**
 * Script to check Supabase database structure
 * Run with: node check-db-structure.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Structure...\n');
  console.log(`📍 URL: ${supabaseUrl}`);
  console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test basic connection
  try {
    console.log('1️⃣  Testing basic connection...');
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('\n🔧 Possible issues:');
      console.log('   • Database not created yet');
      console.log('   • Wrong credentials');
      console.log('   • RLS policies blocking access');
      return;
    }
    console.log('✅ Connection successful\n');
  } catch (err) {
    console.error('❌ Connection error:', err.message);
    return;
  }

  // List all tables
  try {
    console.log('2️⃣  Listing all tables...');
    const { data: tables, error } = await supabase
      .rpc('get_table_info'); // Custom function, fallback to manual check

    if (error) {
      // Fallback: try to query specific tables we expect
      console.log('⚠️  RPC failed, checking specific tables...\n');
      
      const expectedTables = ['users', 'notifications', 'achievements', 'user_achievements', 'activities'];
      
      for (const tableName of expectedTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (tableError) {
            if (tableError.code === '42P01') {
              console.log(`❌ Table '${tableName}' does not exist`);
            } else if (tableError.code === '42501') {
              console.log(`🔒 Table '${tableName}' exists but access denied (RLS policy)`);
            } else {
              console.log(`⚠️  Table '${tableName}' - Error: ${tableError.message}`);
            }
          } else {
            console.log(`✅ Table '${tableName}' exists and accessible`);
          }
        } catch (err) {
          console.log(`❌ Table '${tableName}' - Exception: ${err.message}`);
        }
      }
    } else {
      console.log('✅ Tables found:');
      tables.forEach(table => {
        console.log(`   • ${table.table_name}`);
      });
    }
  } catch (err) {
    console.error('❌ Error listing tables:', err.message);
  }

  // Check users table structure specifically
  try {
    console.log('\n3️⃣  Checking users table structure...');
    
    // Try to insert a test record to see what columns are expected
    const testWallet = '0x0000000000000000000000000000000000000000';
    const { data, error } = await supabase
      .from('users')
      .upsert({
        wallet_address: testWallet,
        display_name: 'TEST_USER',
        preferred_language: 'en',
        trust_score: 5.0,
        total_contributions: 0,
        successful_rounds: 0,
        groups_created: 0,
        groups_joined: 0,
        notification_preferences: { email: true, push: true, sms: false },
        privacy_settings: { profile_public: true, stats_public: true },
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active_at: new Date().toISOString()
      }, { 
        onConflict: 'wallet_address',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      console.log('❌ Test insert failed:', error.message);
      if (error.details) console.log('   Details:', error.details);
      if (error.hint) console.log('   Hint:', error.hint);
    } else {
      console.log('✅ Test insert successful, users table structure is correct');
      
      // Clean up test record
      await supabase
        .from('users')
        .delete()
        .eq('wallet_address', testWallet);
    }
  } catch (err) {
    console.error('❌ Error checking users table:', err.message);
  }

  // Check RLS policies
  try {
    console.log('\n4️⃣  Checking RLS (Row Level Security) status...');
    
    // This query might not work with anon key, but let's try
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public');

    if (error) {
      console.log('⚠️  Cannot check RLS status (requires elevated permissions)');
      console.log('   If you\'re getting 401 errors, RLS might be enabled without proper policies');
    } else {
      console.log('✅ RLS status checked');
      data?.forEach(table => {
        console.log(`   • ${table.tablename}: RLS ${table.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
      });
    }
  } catch (err) {
    console.log('⚠️  Cannot check RLS:', err.message);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 Recommendations:');
  console.log('   1. If tables don\'t exist, run the database migration');
  console.log('   2. If getting 401 errors, disable RLS or create policies');
  console.log('   3. Check that your Supabase project is active');
  console.log('   4. Verify your API keys are correct');
}

// Run the check
checkDatabase().catch(console.error);
