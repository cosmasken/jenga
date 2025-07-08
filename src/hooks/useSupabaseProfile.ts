import { useState, useEffect } from 'react'
import { supabase, type Database, handleSupabaseError, getCurrentUser } from '@/lib/supabase'

type UserProfile = Database['public']['Tables']['users']['Row']
type UserProfileUpdate = Database['public']['Tables']['users']['Update']

export const useSupabaseProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        setProfile(null)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        // If profile doesn't exist, create it
        if (fetchError.code === 'PGRST116') {
          await createProfile(user.id, user.email || '')
          return
        }
        throw fetchError
      }

      setProfile(data)
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create user profile
  const createProfile = async (userId: string, email: string, walletAddress?: string) => {
    try {
      const { data, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          wallet_address: walletAddress,
          preferred_language: 'en',
          reputation_score: 0,
          total_contributions: 0,
          total_payouts: 0,
          chamas_joined: 0,
          stacking_streak: 0,
          is_verified: false
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Update user profile
  const updateProfile = async (updates: UserProfileUpdate) => {
    try {
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Update reputation score
  const updateReputationScore = async (newScore: number) => {
    return updateProfile({ reputation_score: newScore })
  }

  // Update stacking streak
  const updateStackingStreak = async (newStreak: number) => {
    return updateProfile({ stacking_streak: newStreak })
  }

  // Update language preference
  const updateLanguage = async (language: string) => {
    return updateProfile({ preferred_language: language })
  }

  // Connect wallet address
  const connectWallet = async (walletAddress: string) => {
    return updateProfile({ wallet_address: walletAddress })
  }

  // Get user statistics
  const getUserStats = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return null

      // Get contribution stats
      const { data: contributions } = await supabase
        .from('contributions')
        .select('amount, status')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')

      // Get stacking stats
      const { data: stackingRecords } = await supabase
        .from('stacking_records')
        .select('amount, stacking_date')
        .eq('user_id', user.id)
        .order('stacking_date', { ascending: false })

      // Get chama memberships
      const { data: memberships } = await supabase
        .from('chama_members')
        .select('chama_id, status, total_contributed, total_received')
        .eq('user_id', user.id)

      const totalContributions = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0
      const totalStacked = stackingRecords?.reduce((sum, s) => sum + s.amount, 0) || 0
      const activeMemberships = memberships?.filter(m => m.status === 'active').length || 0

      return {
        totalContributions,
        totalStacked,
        activeMemberships,
        contributionCount: contributions?.length || 0,
        stackingCount: stackingRecords?.length || 0,
        lastStackingDate: stackingRecords?.[0]?.stacking_date || null
      }
    } catch (err) {
      console.error('Error fetching user stats:', err)
      return null
    }
  }

  // Initialize profile on mount
  useEffect(() => {
    fetchProfile()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchProfile()
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateReputationScore,
    updateStackingStreak,
    updateLanguage,
    connectWallet,
    getUserStats,
    refetch: fetchProfile
  }
}
