import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://arwfeiaijllogarkmhy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyd2ZlaWFpamxsb2dhcmtibWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NDMyNzQsImV4cCI6MjA3MjAxOTI3NH0.SJs2BueQzPvJLoi0Q7DG7kq2a-_AN-iXMLsdzCNRBiM'

console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Anon Key:', supabaseAnonKey ? '***set***' : 'undefined')

// Validate URL format
if (!supabaseUrl.startsWith('http')) {
  console.error('❌ Invalid Supabase URL format. Must start with http or https')
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing. Please add to your .env file:')
  console.error('VITE_SUPABASE_URL=your_supabase_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
}

// Create client with error handling
let supabase: any

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
  console.log('✅ Supabase client created successfully')
} catch (error) {
  console.error('❌ Failed to create Supabase client:', error)
  // Create a mock client to prevent app crashes
  supabase = {
    from: () => ({ select: () => ({ data: null, error: 'Supabase not configured' }) }),
    rpc: () => Promise.resolve({ data: null, error: 'Supabase not configured' }),
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  }
}

export { supabase }

// Helper to set user context for RLS policies
export const setUserContext = async (userAddress: string) => {
  try {
    await supabase.rpc('set_config', {
      setting_name: 'app.current_user_address',
      setting_value: userAddress,
      is_local: true,
    })
  } catch (error) {
    console.warn('Could not set user context:', error)
  }
}

// Test connection
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('chamas')
      .select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection error:', error)
    return false
  }
}
