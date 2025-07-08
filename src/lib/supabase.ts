import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string | null
          email: string | null
          username: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          reputation_score: number
          total_contributions: number
          total_payouts: number
          chamas_joined: number
          stacking_streak: number
          preferred_language: string
          location: string | null
          phone_number: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          wallet_address?: string | null
          email?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          reputation_score?: number
          total_contributions?: number
          total_payouts?: number
          chamas_joined?: number
          stacking_streak?: number
          preferred_language?: string
          location?: string | null
          phone_number?: string | null
          is_verified?: boolean
        }
        Update: {
          wallet_address?: string | null
          email?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          reputation_score?: number
          total_contributions?: number
          total_payouts?: number
          chamas_joined?: number
          stacking_streak?: number
          preferred_language?: string
          location?: string | null
          phone_number?: string | null
          is_verified?: boolean
        }
      }
      chamas: {
        Row: {
          id: string
          name: string
          description: string | null
          creator_id: string
          contribution_amount: number
          payout_frequency: 'weekly' | 'monthly' | 'quarterly'
          max_members: number
          current_members: number
          category: 'business' | 'personal' | 'education' | 'emergency' | null
          location: string | null
          is_active: boolean
          is_public: boolean
          start_date: string | null
          end_date: string | null
          next_payout_date: string | null
          current_round: number
          total_rounds: number | null
          contract_address: string | null
          total_pool_amount: number
          rules: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          creator_id: string
          contribution_amount: number
          payout_frequency: 'weekly' | 'monthly' | 'quarterly'
          max_members?: number
          current_members?: number
          category?: 'business' | 'personal' | 'education' | 'emergency' | null
          location?: string | null
          is_active?: boolean
          is_public?: boolean
          start_date?: string | null
          end_date?: string | null
          next_payout_date?: string | null
          current_round?: number
          total_rounds?: number | null
          contract_address?: string | null
          total_pool_amount?: number
          rules?: any | null
        }
        Update: {
          name?: string
          description?: string | null
          contribution_amount?: number
          payout_frequency?: 'weekly' | 'monthly' | 'quarterly'
          max_members?: number
          current_members?: number
          category?: 'business' | 'personal' | 'education' | 'emergency' | null
          location?: string | null
          is_active?: boolean
          is_public?: boolean
          start_date?: string | null
          end_date?: string | null
          next_payout_date?: string | null
          current_round?: number
          total_rounds?: number | null
          contract_address?: string | null
          total_pool_amount?: number
          rules?: any | null
        }
      }
      chama_members: {
        Row: {
          id: string
          chama_id: string
          user_id: string
          joined_at: string
          status: 'active' | 'inactive' | 'pending' | 'banned'
          position_in_queue: number | null
          total_contributed: number
          total_received: number
          missed_contributions: number
          last_contribution_date: string | null
          next_payout_date: string | null
          is_admin: boolean
        }
        Insert: {
          chama_id: string
          user_id: string
          status?: 'active' | 'inactive' | 'pending' | 'banned'
          position_in_queue?: number | null
          total_contributed?: number
          total_received?: number
          missed_contributions?: number
          last_contribution_date?: string | null
          next_payout_date?: string | null
          is_admin?: boolean
        }
        Update: {
          status?: 'active' | 'inactive' | 'pending' | 'banned'
          position_in_queue?: number | null
          total_contributed?: number
          total_received?: number
          missed_contributions?: number
          last_contribution_date?: string | null
          next_payout_date?: string | null
          is_admin?: boolean
        }
      }
      contributions: {
        Row: {
          id: string
          chama_id: string
          user_id: string
          amount: number
          transaction_hash: string | null
          block_number: number | null
          status: 'pending' | 'confirmed' | 'failed'
          contribution_date: string
          round_number: number | null
          is_late: boolean
          late_fee: number
          notes: string | null
          created_at: string
        }
        Insert: {
          chama_id: string
          user_id: string
          amount: number
          transaction_hash?: string | null
          block_number?: number | null
          status?: 'pending' | 'confirmed' | 'failed'
          contribution_date?: string
          round_number?: number | null
          is_late?: boolean
          late_fee?: number
          notes?: string | null
        }
        Update: {
          amount?: number
          transaction_hash?: string | null
          block_number?: number | null
          status?: 'pending' | 'confirmed' | 'failed'
          contribution_date?: string
          round_number?: number | null
          is_late?: boolean
          late_fee?: number
          notes?: string | null
        }
      }
      stacking_records: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_hash: string | null
          block_number: number | null
          stacking_date: string
          goal_type: 'daily' | 'weekly' | 'monthly' | 'custom' | null
          vault_type: 'general' | 'emergency' | 'vacation' | 'investment' | null
          is_goal_achieved: boolean
          streak_day: number
          notes: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          transaction_hash?: string | null
          block_number?: number | null
          stacking_date?: string
          goal_type?: 'daily' | 'weekly' | 'monthly' | 'custom' | null
          vault_type?: 'general' | 'emergency' | 'vacation' | 'investment' | null
          is_goal_achieved?: boolean
          streak_day?: number
          notes?: string | null
        }
        Update: {
          amount?: number
          transaction_hash?: string | null
          block_number?: number | null
          stacking_date?: string
          goal_type?: 'daily' | 'weekly' | 'monthly' | 'custom' | null
          vault_type?: 'general' | 'emergency' | 'vacation' | 'investment' | null
          is_goal_achieved?: boolean
          streak_day?: number
          notes?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'chama_update' | 'payment_received' | 'goal_achieved' | 'new_member' | 'payout_ready' | 'contribution_due' | 'reputation_update' | null
          is_read: boolean
          action_url: string | null
          metadata: any | null
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          message: string
          type?: 'chama_update' | 'payment_received' | 'goal_achieved' | 'new_member' | 'payout_ready' | 'contribution_due' | 'reputation_update' | null
          is_read?: boolean
          action_url?: string | null
          metadata?: any | null
        }
        Update: {
          title?: string
          message?: string
          type?: 'chama_update' | 'payment_received' | 'goal_achieved' | 'new_member' | 'payout_ready' | 'contribution_due' | 'reputation_update' | null
          is_read?: boolean
          action_url?: string | null
          metadata?: any | null
        }
      }
    }
  }
}

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error)
  
  if (error?.message) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

// Helper function to check if user is authenticated
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}
