import { useState, useEffect } from 'react'
import { supabase, type Database, handleSupabaseError, getCurrentUser } from '@/lib/supabase'

type StackingRecord = Database['public']['Tables']['stacking_records']['Row']
type StackingRecordInsert = Database['public']['Tables']['stacking_records']['Insert']

export const useSupabaseStacking = () => {
  const [stackingRecords, setStackingRecords] = useState<StackingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch user's stacking records
  const fetchStackingRecords = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        setStackingRecords([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('stacking_records')
        .select('*')
        .eq('user_id', user.id)
        .order('stacking_date', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setStackingRecords(data || [])
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      console.error('Error fetching stacking records:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add new stacking record
  const addStackingRecord = async (recordData: Omit<StackingRecordInsert, 'user_id'>) => {
    try {
      setError(null)

      const user = await getCurrentUser()
      if (!user) {
        throw new Error('No authenticated user found')
      }

      const { data, error: insertError } = await supabase
        .from('stacking_records')
        .insert({
          ...recordData,
          user_id: user.id
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Add to local state
      setStackingRecords(prev => [data, ...prev])

      return { data, error: null }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Get stacking statistics
  const getStackingStats = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return null

      const { data, error: fetchError } = await supabase
        .from('stacking_records')
        .select('amount, stacking_date, is_goal_achieved, vault_type')
        .eq('user_id', user.id)

      if (fetchError) {
        throw fetchError
      }

      const records = data || []
      
      // Calculate statistics
      const totalStacked = records.reduce((sum, record) => sum + record.amount, 0)
      const goalsAchieved = records.filter(record => record.is_goal_achieved).length
      const totalRecords = records.length
      const goalAchievementRate = totalRecords > 0 ? (goalsAchieved / totalRecords) * 100 : 0

      // Calculate current streak
      const sortedRecords = records
        .sort((a, b) => new Date(b.stacking_date).getTime() - new Date(a.stacking_date).getTime())
      
      let currentStreak = 0
      const today = new Date()
      
      for (const record of sortedRecords) {
        const recordDate = new Date(record.stacking_date)
        const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff <= currentStreak + 1) {
          currentStreak++
        } else {
          break
        }
      }

      // Vault breakdown
      const vaultBreakdown = records.reduce((acc, record) => {
        const vault = record.vault_type || 'general'
        acc[vault] = (acc[vault] || 0) + record.amount
        return acc
      }, {} as Record<string, number>)

      return {
        totalStacked,
        totalRecords,
        goalsAchieved,
        goalAchievementRate,
        currentStreak,
        vaultBreakdown,
        lastStackingDate: sortedRecords[0]?.stacking_date || null
      }
    } catch (err) {
      console.error('Error calculating stacking stats:', err)
      return null
    }
  }

  // Get daily stacking goal progress
  const getDailyProgress = async (date: string = new Date().toISOString().split('T')[0]) => {
    try {
      const user = await getCurrentUser()
      if (!user) return null

      const { data, error: fetchError } = await supabase
        .from('stacking_records')
        .select('amount, is_goal_achieved')
        .eq('user_id', user.id)
        .eq('stacking_date', date)

      if (fetchError) {
        throw fetchError
      }

      const records = data || []
      const totalToday = records.reduce((sum, record) => sum + record.amount, 0)
      const goalAchieved = records.some(record => record.is_goal_achieved)

      return {
        totalToday,
        goalAchieved,
        recordCount: records.length
      }
    } catch (err) {
      console.error('Error fetching daily progress:', err)
      return null
    }
  }

  // Get stacking history for charts
  const getStackingHistory = async (days: number = 30) => {
    try {
      const user = await getCurrentUser()
      if (!user) return []

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error: fetchError } = await supabase
        .from('stacking_records')
        .select('amount, stacking_date')
        .eq('user_id', user.id)
        .gte('stacking_date', startDate.toISOString().split('T')[0])
        .order('stacking_date', { ascending: true })

      if (fetchError) {
        throw fetchError
      }

      // Group by date and sum amounts
      const groupedData = (data || []).reduce((acc, record) => {
        const date = record.stacking_date
        acc[date] = (acc[date] || 0) + record.amount
        return acc
      }, {} as Record<string, number>)

      // Convert to array format for charts
      return Object.entries(groupedData).map(([date, amount]) => ({
        date,
        amount
      }))
    } catch (err) {
      console.error('Error fetching stacking history:', err)
      return []
    }
  }

  // Update stacking record (e.g., add transaction hash after confirmation)
  const updateStackingRecord = async (recordId: string, updates: Partial<StackingRecord>) => {
    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from('stacking_records')
        .update(updates)
        .eq('id', recordId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      // Update local state
      setStackingRecords(prev => 
        prev.map(record => 
          record.id === recordId ? { ...record, ...updates } : record
        )
      )

      return { data, error: null }
    } catch (err) {
      const errorMessage = handleSupabaseError(err)
      setError(errorMessage)
      return { data: null, error: errorMessage }
    }
  }

  // Initialize on mount
  useEffect(() => {
    fetchStackingRecords()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchStackingRecords()
        } else if (event === 'SIGNED_OUT') {
          setStackingRecords([])
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    stackingRecords,
    loading,
    error,
    addStackingRecord,
    updateStackingRecord,
    getStackingStats,
    getDailyProgress,
    getStackingHistory,
    refetch: fetchStackingRecords
  }
}
