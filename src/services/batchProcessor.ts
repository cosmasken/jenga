import React from 'react'
import { useRosca } from '@/hooks/useRosca'
import { offchainChamaService } from './offchainChamaService'
import { toast } from '@/hooks/use-toast'
import { parseEther } from 'viem'

export interface BatchOperation {
  id: string
  type: 'create_chama' | 'batch_join' | 'batch_contribute'
  chama_address: string
  operations: Array<{
    user_address: string
    amount?: number
    operation_type: string
    timestamp: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
  }>
  total_operations: number
  estimated_gas: string
  created_at: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export interface BatchProcessorService {
  // Get pending batch operations for a chama
  getPendingBatches: (chamaAddress: string) => Promise<BatchOperation[]>
  
  // Process a batch operation
  processBatch: (batchId: string) => Promise<{ success: boolean; txHash?: string; error?: string }>
  
  // Create a new batch from pending operations
  createBatch: (chamaAddress: string, operationType: string) => Promise<BatchOperation | null>
  
  // Auto-process batches when threshold is reached
  autoProcessBatches: (chamaAddress: string) => Promise<void>
}

class BatchProcessorImplementation implements BatchProcessorService {
  private readonly BATCH_SIZE_THRESHOLD = 5 // Process when 5+ operations are pending
  private readonly MAX_BATCH_AGE_MS = 5 * 60 * 1000 // 5 minutes
  
  async getPendingBatches(chamaAddress: string): Promise<BatchOperation[]> {
    try {
      const batches = await offchainChamaService.getPendingBatchOperations()
      return batches.map(batch => ({
        id: batch.id,
        type: batch.operation_type as any,
        chama_address: batch.chama_address,
        operations: batch.operations as any,
        total_operations: batch.total_operations,
        estimated_gas: batch.estimated_gas || '0',
        created_at: batch.created_at,
        status: batch.status as any
      }))
    } catch (error) {
      console.error('Error fetching pending batches:', error)
      return []
    }
  }

  async processBatch(batchId: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const batch = await this.getBatchById(batchId)
      if (!batch) {
        return { success: false, error: 'Batch not found' }
      }

      // Update batch status to processing
      await this.updateBatchStatus(batchId, 'processing')

      let txHash: string
      
      switch (batch.type) {
        case 'create_chama':
          txHash = await this.processCreateChamaBatch(batch)
          break
        case 'batch_join':
          txHash = await this.processBatchJoin(batch)
          break
        case 'batch_contribute':
          txHash = await this.processBatchContribute(batch)
          break
        default:
          throw new Error(`Unknown batch type: ${batch.type}`)
      }

      // Update batch status to completed
      await this.updateBatchStatus(batchId, 'completed', txHash)
      
      // Update individual operations status
      for (const op of batch.operations) {
        await offchainChamaService.updateOperationStatus(op.user_address, batch.chama_address, 'completed', txHash)
      }

      toast({
        title: "✅ Batch Processed Successfully",
        description: `${batch.total_operations} operations deployed to blockchain`,
      })

      return { success: true, txHash }
    } catch (error) {
      console.error('Error processing batch:', error)
      
      await this.updateBatchStatus(batchId, 'failed')
      
      toast({
        title: "❌ Batch Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      })

      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createBatch(chamaAddress: string, operationType: string): Promise<BatchOperation | null> {
    try {
      const pendingOps = await offchainChamaService.getPendingOperations(chamaAddress, operationType)
      
      if (pendingOps.length === 0) {
        return null
      }

      const batch = await offchainChamaService.createBatchOperation({
        chama_address: chamaAddress,
        operation_type: operationType,
        operations: pendingOps,
        total_operations: pendingOps.length,
        estimated_gas: this.estimateGas(operationType, pendingOps.length).toString(),
        status: 'pending'
      })

      return {
        id: batch.id,
        type: operationType as any,
        chama_address: chamaAddress,
        operations: pendingOps as any,
        total_operations: pendingOps.length,
        estimated_gas: batch.estimated_gas || '0',
        created_at: batch.created_at,
        status: 'pending'
      }
    } catch (error) {
      console.error('Error creating batch:', error)
      return null
    }
  }

  async autoProcessBatches(chamaAddress: string): Promise<void> {
    try {
      const pendingBatches = await this.getPendingBatches(chamaAddress)
      
      for (const batch of pendingBatches) {
        const shouldProcess = this.shouldAutoProcess(batch)
        if (shouldProcess) {
          console.log(`Auto-processing batch ${batch.id} with ${batch.total_operations} operations`)
          await this.processBatch(batch.id)
        }
      }
    } catch (error) {
      console.error('Error in auto-process batches:', error)
    }
  }

  private async getBatchById(batchId: string): Promise<BatchOperation | null> {
    try {
      const batch = await offchainChamaService.getBatchOperation(batchId)
      if (!batch) return null

      return {
        id: batch.id,
        type: batch.operation_type as any,
        chama_address: batch.chama_address,
        operations: batch.operations as any,
        total_operations: batch.total_operations,
        estimated_gas: batch.estimated_gas || '0',
        created_at: batch.created_at,
        status: batch.status as any
      }
    } catch (error) {
      console.error('Error fetching batch:', error)
      return null
    }
  }

  private async updateBatchStatus(batchId: string, status: string, txHash?: string): Promise<void> {
    try {
      await offchainChamaService.updateBatchOperation(batchId, { 
        status,
        ...(txHash && { transaction_hash: txHash })
      })
    } catch (error) {
      console.error('Error updating batch status:', error)
    }
  }

  private async processCreateChamaBatch(batch: BatchOperation): Promise<string> {
    // For create chama, we deploy a new ROSCA contract
    const roscaHook = useRosca()
    const firstOp = batch.operations[0]
    
    if (!firstOp.amount) {
      throw new Error('Contribution amount required for chama creation')
    }

    const contributionAmount = parseEther(firstOp.amount.toString())
    const roundDuration = 30 * 24 * 60 * 60 // 30 days in seconds
    const maxMembers = 10 // Default max members
    const chamaName = `Chama ${batch.chama_address.slice(0, 8)}...`

    const txHash = await roscaHook.createROSCA(
      contributionAmount,
      roundDuration,
      maxMembers,
      chamaName
    )

    return txHash
  }

  private async processBatchJoin(batch: BatchOperation): Promise<string> {
    // For batch joins, we call a batch join function on the smart contract
    // This would require implementing batch functions in the smart contract
    const roscaHook = useRosca()
    
    const members = batch.operations.map(op => op.user_address)
    const amounts = batch.operations.map(op => parseEther((op.amount || 0).toString()))
    
    // Note: This would require implementing batchJoin in the smart contract
    // For now, we'll process joins individually
    let lastTxHash = ''
    for (const op of batch.operations) {
      if (op.amount) {
        lastTxHash = await roscaHook.joinROSCA(batch.chama_address)
      }
    }
    
    return lastTxHash
  }

  private async processBatchContribute(batch: BatchOperation): Promise<string> {
    // For batch contributions, we call a batch contribute function
    const roscaHook = useRosca()
    
    // Process contributions individually for now
    let lastTxHash = ''
    for (const op of batch.operations) {
      if (op.amount) {
        lastTxHash = await roscaHook.contribute(batch.chama_address)
      }
    }
    
    return lastTxHash
  }

  private shouldAutoProcess(batch: BatchOperation): boolean {
    const now = Date.now()
    const batchAge = now - new Date(batch.created_at).getTime()
    
    // Process if batch has enough operations or is old enough
    return batch.total_operations >= this.BATCH_SIZE_THRESHOLD || batchAge >= this.MAX_BATCH_AGE_MS
  }

  private estimateGas(operationType: string, operationCount: number): number {
    // Rough gas estimates
    const baseGas = {
      'create_chama': 500000,
      'batch_join': 150000,
      'batch_contribute': 100000
    }
    
    const perOperationGas = {
      'create_chama': 0,
      'batch_join': 50000,
      'batch_contribute': 30000
    }
    
    const base = baseGas[operationType] || 200000
    const perOp = perOperationGas[operationType] || 50000
    
    return base + (perOp * operationCount)
  }
}

// Export singleton instance
export const batchProcessor = new BatchProcessorImplementation()

// React hook for batch operations
export function useBatchProcessor(chamaAddress: string) {
  const [pendingBatches, setPendingBatches] = React.useState<BatchOperation[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  
  // Load pending batches
  React.useEffect(() => {
    if (chamaAddress) {
      loadPendingBatches()
    }
  }, [chamaAddress])
  
  const loadPendingBatches = async () => {
    try {
      const batches = await batchProcessor.getPendingBatches(chamaAddress)
      setPendingBatches(batches)
    } catch (error) {
      console.error('Error loading pending batches:', error)
    }
  }
  
  const processBatch = async (batchId: string) => {
    setIsProcessing(true)
    try {
      const result = await batchProcessor.processBatch(batchId)
      if (result.success) {
        await loadPendingBatches() // Refresh the list
      }
      return result
    } finally {
      setIsProcessing(false)
    }
  }
  
  const createBatch = async (operationType: string) => {
    try {
      const batch = await batchProcessor.createBatch(chamaAddress, operationType)
      if (batch) {
        await loadPendingBatches() // Refresh the list
      }
      return batch
    } catch (error) {
      console.error('Error creating batch:', error)
      return null
    }
  }
  
  const autoProcess = async () => {
    try {
      await batchProcessor.autoProcessBatches(chamaAddress)
      await loadPendingBatches() // Refresh the list
    } catch (error) {
      console.error('Error in auto-process:', error)
    }
  }
  
  return {
    pendingBatches,
    isProcessing,
    processBatch,
    createBatch,
    autoProcess,
    refreshBatches: loadPendingBatches
  }
}
