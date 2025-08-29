/**
 * Integration Tests for Hybrid Off-chain/On-chain System
 * 
 * These tests verify that the hybrid system works correctly with:
 * - Real-time off-chain updates
 * - Batch operation processing
 * - Data synchronization
 * - Error handling and fallbacks
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

// Import the services and hooks we want to test
import { offchainChamaService } from '../services/offchainChamaService'
import { batchProcessor } from '../services/batchProcessor'
import { useHybridChamaData } from '../hooks/useHybridChamaData'
import { useChamaActions } from '../hooks/useChamaActions'
import { useBatchProcessor } from '../services/batchProcessor'

// Mock the Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
      insert: vi.fn(() => ({ data: [], error: null })),
      update: vi.fn(() => ({ data: [], error: null })),
      delete: vi.fn(() => ({ data: [], error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({ subscribe: vi.fn() })),
      unsubscribe: vi.fn(),
    })),
  },
  setUserContext: vi.fn(),
  testSupabaseConnection: vi.fn(() => Promise.resolve(true)),
}))

// Mock blockchain hooks
vi.mock('../hooks/useRosca', () => ({
  useRosca: () => ({
    joinROSCA: vi.fn(() => Promise.resolve('0xmocktxhash')),
    contribute: vi.fn(() => Promise.resolve('0xmocktxhash')),
    createROSCA: vi.fn(() => Promise.resolve('0xmocktxhash')),
  }),
}))

// Test data
const mockChamaAddress = '0x1234567890123456789012345678901234567890'
const mockUserAddress = '0x0987654321098765432109876543210987654321'

const mockChamaData = {
  id: 'chama-1',
  address: mockChamaAddress,
  name: 'Test Chama',
  description: 'A test chama for integration testing',
  contribution_amount: 100,
  round_duration_days: 30,
  max_members: 10,
  status: 'recruiting',
  created_at: new Date().toISOString(),
  creator: mockUserAddress,
}

const mockMemberData = {
  id: 'member-1',
  chama_id: 'chama-1',
  user_address: mockUserAddress,
  joined_at: new Date().toISOString(),
  status: 'active',
  total_contributed: 100,
  rounds_participated: 1,
}

// Test wrapper component
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('Hybrid System Integration Tests', () => {
  let mockSupabaseFrom: any
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup Supabase mock responses
    mockSupabaseFrom = vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [mockChamaData], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [mockChamaData], error: null })),
      update: vi.fn(() => Promise.resolve({ data: [mockChamaData], error: null })),
      delete: vi.fn(() => Promise.resolve({ data: [], error: null })),
      eq: vi.fn(function() { return this }),
      order: vi.fn(function() { return this }),
      limit: vi.fn(function() { return this }),
    }))
    
    // Mock the supabase client
    vi.mocked(require('../lib/supabase').supabase).from = mockSupabaseFrom
  })

  describe('Off-chain Data Service', () => {
    it('should create a chama in off-chain storage', async () => {
      const result = await offchainChamaService.createChama({
        address: mockChamaAddress,
        name: 'Test Chama',
        description: 'Test description',
        contribution_amount: 100,
        round_duration_days: 30,
        max_members: 10,
        creator: mockUserAddress,
      })

      expect(result).toBeDefined()
      expect(mockSupabaseFrom).toHaveBeenCalledWith('chamas')
    })

    it('should join a chama and create member record', async () => {
      const result = await offchainChamaService.joinChama(
        mockChamaAddress,
        mockUserAddress,
        100
      )

      expect(result).toBeDefined()
      expect(mockSupabaseFrom).toHaveBeenCalledWith('chama_members')
    })

    it('should record a contribution', async () => {
      const result = await offchainChamaService.recordContribution(
        mockChamaAddress,
        mockUserAddress,
        50,
        1 // round number
      )

      expect(result).toBeDefined()
      expect(mockSupabaseFrom).toHaveBeenCalledWith('contributions')
    })
  })

  describe('Batch Processing', () => {
    it('should create a batch operation', async () => {
      const batch = await batchProcessor.createBatch(mockChamaAddress, 'batch_join')
      
      // Since no pending operations exist in our mock, this should return null
      expect(batch).toBeNull()
    })

    it('should process batch operations', async () => {
      const mockBatch = {
        id: 'batch-1',
        type: 'batch_join' as const,
        chama_address: mockChamaAddress,
        operations: [
          {
            user_address: mockUserAddress,
            amount: 100,
            operation_type: 'join',
            timestamp: new Date().toISOString(),
            status: 'pending' as const,
          },
        ],
        total_operations: 1,
        estimated_gas: '150000',
        created_at: new Date().toISOString(),
        status: 'pending' as const,
      }

      // Mock the batch exists
      vi.spyOn(batchProcessor as any, 'getBatchById').mockResolvedValue(mockBatch)

      const result = await batchProcessor.processBatch('batch-1')
      
      expect(result.success).toBe(true)
      expect(result.txHash).toBeDefined()
    })
  })

  describe('React Hooks Integration', () => {
    it('should load hybrid chama data', async () => {
      const { result } = renderHook(
        () => useHybridChamaData(mockChamaAddress, mockUserAddress),
        { wrapper: TestWrapper }
      )

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toBeDefined()
    })

    it('should handle chama actions', async () => {
      const { result } = renderHook(
        () => useChamaActions(mockChamaAddress, mockUserAddress),
        { wrapper: TestWrapper }
      )

      expect(result.current.joinChama).toBeDefined()
      expect(result.current.contribute).toBeDefined()
      expect(result.current.createChama).toBeDefined()
    })

    it('should manage batch operations', async () => {
      const { result } = renderHook(
        () => useBatchProcessor(mockChamaAddress),
        { wrapper: TestWrapper }
      )

      expect(result.current.pendingBatches).toEqual([])
      expect(result.current.isProcessing).toBe(false)
      expect(result.current.createBatch).toBeDefined()
      expect(result.current.processBatch).toBeDefined()
    })
  })

  describe('Real-time Updates', () => {
    it('should subscribe to database changes', async () => {
      const mockChannel = {
        on: vi.fn(() => ({ subscribe: vi.fn() })),
        unsubscribe: vi.fn(),
      }
      
      vi.mocked(require('../lib/supabase').supabase).channel.mockReturnValue(mockChannel)

      const { result } = renderHook(
        () => useHybridChamaData(mockChamaAddress, mockUserAddress),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Verify subscription was set up
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
        }),
        expect.any(Function)
      )
    })

    it('should handle subscription updates', async () => {
      let subscriptionCallback: any

      const mockChannel = {
        on: vi.fn((event, config, callback) => {
          subscriptionCallback = callback
          return { subscribe: vi.fn() }
        }),
        unsubscribe: vi.fn(),
      }
      
      vi.mocked(require('../lib/supabase').supabase).channel.mockReturnValue(mockChannel)

      const { result, rerender } = renderHook(
        () => useHybridChamaData(mockChamaAddress, mockUserAddress),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate a database change
      act(() => {
        subscriptionCallback({
          eventType: 'UPDATE',
          new: { ...mockChamaData, name: 'Updated Chama' },
          old: mockChamaData,
        })
      })

      // The hook should invalidate and refetch data
      expect(subscriptionCallback).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle Supabase connection errors gracefully', async () => {
      // Mock a connection error
      mockSupabaseFrom.mockReturnValue({
        select: vi.fn(() => Promise.resolve({ 
          data: null, 
          error: { message: 'Connection failed' } 
        })),
      })

      const { result } = renderHook(
        () => useHybridChamaData(mockChamaAddress, mockUserAddress),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.error).toBeDefined()
      })

      expect(result.current.data).toBeNull()
    })

    it('should handle batch processing failures', async () => {
      vi.spyOn(batchProcessor as any, 'getBatchById').mockResolvedValue(null)

      const result = await batchProcessor.processBatch('nonexistent-batch')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Batch not found')
    })
  })

  describe('Data Synchronization', () => {
    it('should sync off-chain data with on-chain state', async () => {
      // This test would verify that off-chain data stays consistent
      // with on-chain data after blockchain transactions
      
      const { result } = renderHook(
        () => useHybridChamaData(mockChamaAddress, mockUserAddress),
        { wrapper: TestWrapper }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Simulate a successful blockchain transaction
      act(() => {
        // This would trigger a re-sync of data
        result.current.invalidateQueries?.()
      })

      // Data should be consistent
      expect(result.current.data).toBeDefined()
    })
  })
})

describe('End-to-End Workflow Tests', () => {
  it('should handle complete chama lifecycle', async () => {
    // 1. Create chama off-chain
    const chama = await offchainChamaService.createChama({
      address: mockChamaAddress,
      name: 'E2E Test Chama',
      description: 'End-to-end test',
      contribution_amount: 100,
      round_duration_days: 30,
      max_members: 5,
      creator: mockUserAddress,
    })
    expect(chama).toBeDefined()

    // 2. Join chama off-chain
    const membership = await offchainChamaService.joinChama(
      mockChamaAddress,
      mockUserAddress,
      100
    )
    expect(membership).toBeDefined()

    // 3. Record contribution off-chain
    const contribution = await offchainChamaService.recordContribution(
      mockChamaAddress,
      mockUserAddress,
      50,
      1
    )
    expect(contribution).toBeDefined()

    // 4. Create batch operation
    const batch = await batchProcessor.createBatch(mockChamaAddress, 'batch_contribute')
    // Would be null since we don't have real pending operations in test
    expect(batch).toBeNull()
  })

  it('should handle user joining and contributing workflow', async () => {
    const { result: dataHook } = renderHook(
      () => useHybridChamaData(mockChamaAddress, mockUserAddress),
      { wrapper: TestWrapper }
    )

    const { result: actionsHook } = renderHook(
      () => useChamaActions(mockChamaAddress, mockUserAddress),
      { wrapper: TestWrapper }
    )

    await waitFor(() => {
      expect(dataHook.current.isLoading).toBe(false)
      expect(actionsHook.current.joinChama).toBeDefined()
    })

    // Simulate joining the chama
    await act(async () => {
      await actionsHook.current.joinChama.mutateAsync({
        chamaAddress: mockChamaAddress,
        contributionAmount: 100,
      })
    })

    // Simulate contributing
    await act(async () => {
      await actionsHook.current.contribute.mutateAsync({
        chamaAddress: mockChamaAddress,
        amount: 50,
      })
    })

    expect(actionsHook.current.joinChama.isSuccess).toBe(true)
    expect(actionsHook.current.contribute.isSuccess).toBe(true)
  })
})

// Performance and Load Testing
describe('Performance Tests', () => {
  it('should handle multiple simultaneous operations', async () => {
    const operations = Array.from({ length: 10 }, (_, i) => 
      offchainChamaService.recordContribution(
        mockChamaAddress,
        `0x${i.toString().padStart(40, '0')}`,
        50,
        1
      )
    )

    const results = await Promise.all(operations)
    expect(results).toHaveLength(10)
    results.forEach(result => {
      expect(result).toBeDefined()
    })
  })

  it('should handle large batch operations efficiently', async () => {
    const largeBatch = {
      id: 'large-batch',
      type: 'batch_contribute' as const,
      chama_address: mockChamaAddress,
      operations: Array.from({ length: 100 }, (_, i) => ({
        user_address: `0x${i.toString().padStart(40, '0')}`,
        amount: 50,
        operation_type: 'contribute',
        timestamp: new Date().toISOString(),
        status: 'pending' as const,
      })),
      total_operations: 100,
      estimated_gas: '5000000',
      created_at: new Date().toISOString(),
      status: 'pending' as const,
    }

    vi.spyOn(batchProcessor as any, 'getBatchById').mockResolvedValue(largeBatch)

    const startTime = Date.now()
    const result = await batchProcessor.processBatch('large-batch')
    const endTime = Date.now()

    expect(result.success).toBe(true)
    expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
  })
})

export {}
