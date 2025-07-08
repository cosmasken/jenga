import { useState, useEffect } from 'react'
import { supabase, type Database, handleSupabaseError } from '@/lib/supabase'
import { useTranslation } from 'react-i18next'

type Chama = Database['public']['Tables']['chamas']['Row']
type ChamaInsert = Database['public']['Tables']['chamas']['Insert']
type ChamaUpdate = Database['public']['Tables']['chamas']['Update']

export const useSupabaseChamas = () => {
  const [chamas, setChamas] = useState<Chama[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  // Fetch all public chamas
  const fetchChamas = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('chamas')
        .select(`
          *,
          creator:users!creator_id(username, wallet_address),
          members:chama_members(count)
        `)
        .eq('is_active', true)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setChamas(data || [])
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      console.error('Error fetching chamas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create a new chama
  const createChama = async (chamaData: ChamaInsert) => {
    try {
      setError(null)

      const { data, error: createError } = await supabase
        .from('chamas')
        .insert(chamaData)
        .select()
        .single()

      if (createError) {
        throw createError
      }

      // Add to local state
      setChamas(prev => [data, ...prev])
      
      return { data, error: null }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Join a chama
  const joinChama = async (chamaId: string, userId: string) => {
    try {
      setError(null)

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('chama_members')
        .select('id')
        .eq('chama_id', chamaId)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        throw new Error(t('chamas.alreadyMember'))
      }

      // Add user as member
      const { error: joinError } = await supabase
        .from('chama_members')
        .insert({
          chama_id: chamaId,
          user_id: userId,
          status: 'active'
        })

      if (joinError) {
        throw joinError
      }

      // Update chama member count
      const { error: updateError } = await supabase.rpc('increment_chama_members', {
        chama_id: chamaId
      })

      if (updateError) {
        console.warn('Failed to update member count:', updateError)
      }

      // Refresh chamas list
      await fetchChamas()

      return { success: true, error: null }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Get user's chamas
  const getUserChamas = async (userId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('chama_members')
        .select(`
          *,
          chama:chamas(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')

      if (fetchError) {
        throw fetchError
      }

      return data?.map(member => member.chama) || []
    } catch (err) {
      console.error('Error fetching user chamas:', err)
      return []
    }
  }

  // Search chamas
  const searchChamas = async (query: string, filters?: {
    category?: string
    location?: string
    minAmount?: number
    maxAmount?: number
  }) => {
    try {
      let queryBuilder = supabase
        .from('chamas')
        .select('*')
        .eq('is_active', true)
        .eq('is_public', true)

      // Text search
      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      }

      // Apply filters
      if (filters?.category) {
        queryBuilder = queryBuilder.eq('category', filters.category)
      }

      if (filters?.location) {
        queryBuilder = queryBuilder.ilike('location', `%${filters.location}%`)
      }

      if (filters?.minAmount) {
        queryBuilder = queryBuilder.gte('contribution_amount', filters.minAmount)
      }

      if (filters?.maxAmount) {
        queryBuilder = queryBuilder.lte('contribution_amount', filters.maxAmount)
      }

      const { data, error: searchError } = await queryBuilder
        .order('created_at', { ascending: false })

      if (searchError) {
        throw searchError
      }

      return data || []
    } catch (err) {
      console.error('Error searching chamas:', err)
      return []
    }
  }

  // Set up real-time subscription
  useEffect(() => {
    fetchChamas()

    // Subscribe to chama changes
    const subscription = supabase
      .channel('chamas_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamas'
        },
        (payload) => {
          console.log('Chama change received:', payload)
          fetchChamas() // Refetch data
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    chamas,
    loading,
    error,
    createChama,
    joinChama,
    getUserChamas,
    searchChamas,
    refetch: fetchChamas
  }
}
