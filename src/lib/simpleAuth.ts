import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { supabase } from './supabase'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export interface SimpleUser {
  wallet_address: string
  email?: string
  username?: string
  first_name?: string
  last_name?: string
  profile_image_url?: string
  reputation_score: number
  total_contributions: number
  total_payouts: number
  chamas_joined: number
  stacking_streak: number
  preferred_language: string
  location?: string
  phone_number?: string
  is_verified: boolean
  onboarding_completed?: boolean  // Now exists in database
  tutorial_steps_completed?: string[]  // Now exists in database
  created_at: string
  updated_at: string
}

export const useSimpleAuth = () => {
  const { 
    user: dynamicUser, 
    primaryWallet, 
    handleLogOut: dynamicLogout
  } = useDynamicContext()
  
  const { i18n } = useTranslation()
  const [dbUser, setDbUser] = useState<SimpleUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When wallet connects, sync user to database
  useEffect(() => {
    if (primaryWallet?.address) {
      syncUserToDatabase()
    } else {
      setDbUser(null)
      setIsLoading(false)
    }
  }, [primaryWallet?.address, dynamicUser])

  const syncUserToDatabase = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const walletAddress = primaryWallet?.address?.toLowerCase()
      if (!walletAddress) return

      console.log('🔄 Syncing user to database:', walletAddress)

      // First, try to find existing user
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle()

      if (fetchError) {
        console.error('❌ Fetch error:', fetchError)
        throw fetchError
      }

      if (existingUser) {
        console.log('📝 User already exists, updating...')
        // Update existing user
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            email: dynamicUser?.email,
            username: dynamicUser?.username || dynamicUser?.firstName,
            first_name: dynamicUser?.firstName,
            last_name: dynamicUser?.lastName,
            profile_image_url: dynamicUser?.profileImageUrl,
            preferred_language: i18n.language || 'en',
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', walletAddress)
          .select()
          .single()

        if (updateError) {
          console.error('❌ Update error:', updateError)
          throw updateError
        }
        
        setDbUser(updatedUser)
        console.log('✅ User updated in database:', updatedUser)
      } else {
        console.log('➕ Creating new user in database...')
        
        // Try to create new user in database (constraint should be fixed now)
        const newUserData = {
          wallet_address: walletAddress,
          email: dynamicUser?.email,
          username: dynamicUser?.username || dynamicUser?.firstName,
          first_name: dynamicUser?.firstName,
          last_name: dynamicUser?.lastName,
          profile_image_url: dynamicUser?.profileImageUrl,
          reputation_score: 0,
          total_contributions: 0,
          total_payouts: 0,
          chamas_joined: 0,
          stacking_streak: 0,
          preferred_language: i18n.language || 'en',
          is_verified: false,
          onboarding_completed: false,
          tutorial_steps_completed: []
        }

        console.log('📝 Inserting user data:', newUserData)

        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single()

        if (createError) {
          console.error('❌ Create error:', createError)
          throw createError
        }
        
        setDbUser(newUser)
        console.log('✅ User created in database:', newUser)
      }

    } catch (err) {
      console.error('❌ Database sync failed:', err)
      
      // Create temporary user object so app can still function
      const walletAddress = primaryWallet?.address?.toLowerCase()
      if (walletAddress) {
        const tempUser = {
          wallet_address: walletAddress,
          email: dynamicUser?.email,
          username: dynamicUser?.username || dynamicUser?.firstName || 'User',
          first_name: dynamicUser?.firstName,
          last_name: dynamicUser?.lastName,
          profile_image_url: dynamicUser?.profileImageUrl,
          reputation_score: 0,
          total_contributions: 0,
          total_payouts: 0,
          chamas_joined: 0,
          stacking_streak: 0,
          preferred_language: i18n.language || 'en',
          is_verified: false,
          onboarding_completed: false,
          tutorial_steps_completed: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        setDbUser(tempUser as SimpleUser)
        console.log('⚠️ Using fallback user object:', tempUser)
      }
      
      setError('Database sync failed - using temporary user data')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserProfile = async (updates: Partial<SimpleUser>) => {
    if (!primaryWallet?.address) return null

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', primaryWallet.address.toLowerCase())
        .select()
        .single()

      if (error) throw error
      
      setDbUser(data)
      return data
    } catch (err) {
      console.error('Profile update failed:', err)
      setError(err instanceof Error ? err.message : 'Profile update failed')
      return null
    }
  }

  const handleLogout = async () => {
    try {
      setDbUser(null)
      setError(null)
      await dynamicLogout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return {
    // Simple auth state
    isAuthenticated: !!primaryWallet?.address,
    isLoading,
    error,
    
    // User data
    user: dbUser,
    dynamicUser,
    walletAddress: primaryWallet?.address?.toLowerCase(),
    
    // Actions
    logout: handleLogout,
    updateProfile: updateUserProfile,
    retry: syncUserToDatabase,
    
    // Helper methods
    clearError: () => setError(null)
  }
}
