# 🔄 Jenga Data Synchronization Strategy

## 🎯 **Single Source of Truth: Blockchain First**

### **Architecture Principle**
```
Blockchain (Source of Truth) ↔ Database (Performance Cache) ↔ UI (User Experience)
```

## 🏗️ **Three-Layer Sync Strategy**

### **Layer 1: Optimistic Updates (Immediate UX)**
```typescript
// User clicks "Stack 1000 sats"
1. Update UI immediately (optimistic)
2. Update database immediately (cache)
3. Submit blockchain transaction (authoritative)
4. Monitor transaction status
5. Reconcile any discrepancies
```

### **Layer 2: Event-Driven Sync (Real-time)**
```typescript
// Blockchain events → Database updates
1. Listen for smart contract events
2. Parse event data
3. Update database records
4. Trigger UI updates via real-time subscriptions
```

### **Layer 3: Periodic Reconciliation (Consistency)**
```typescript
// Every 10 minutes or on-demand
1. Compare database vs blockchain state
2. Identify discrepancies
3. Resolve conflicts (blockchain wins)
4. Update database to match chain
```

## 🔧 **Implementation Details**

### **1. Transaction State Management**

```typescript
// src/lib/transactionManager.ts
export enum TransactionStatus {
  DRAFT = 'draft',           // Created in DB, not yet submitted
  PENDING = 'pending',       // Submitted to blockchain, waiting confirmation
  CONFIRMED = 'confirmed',   // Confirmed on blockchain
  FAILED = 'failed',         // Transaction failed or reverted
  RECONCILED = 'reconciled'  // Verified against blockchain state
}

export class TransactionManager {
  async createTransaction(type: 'contribution' | 'payout' | 'stacking', data: any) {
    // Step 1: Create database record (optimistic)
    const dbRecord = await this.createDatabaseRecord(type, {
      ...data,
      status: TransactionStatus.DRAFT,
      created_at: new Date().toISOString()
    })

    // Step 2: Submit to blockchain
    try {
      const txHash = await this.submitToBlockchain(type, data)
      
      // Step 3: Update with transaction hash
      await this.updateDatabaseRecord(dbRecord.id, {
        transaction_hash: txHash,
        status: TransactionStatus.PENDING
      })

      // Step 4: Monitor transaction
      this.monitorTransaction(txHash, dbRecord.id)

      return { success: true, recordId: dbRecord.id, txHash }
    } catch (error) {
      // Mark as failed if blockchain submission fails
      await this.updateDatabaseRecord(dbRecord.id, {
        status: TransactionStatus.FAILED,
        error_message: error.message
      })
      
      throw error
    }
  }

  private async monitorTransaction(txHash: string, recordId: string) {
    const maxRetries = 20 // ~10 minutes with 30s intervals
    let retries = 0

    const checkStatus = async () => {
      try {
        const receipt = await this.getTransactionReceipt(txHash)
        
        if (receipt) {
          const status = receipt.status === 'success' 
            ? TransactionStatus.CONFIRMED 
            : TransactionStatus.FAILED

          await this.updateDatabaseRecord(recordId, {
            status,
            block_number: Number(receipt.blockNumber),
            gas_used: Number(receipt.gasUsed),
            confirmed_at: new Date().toISOString()
          })

          // Trigger UI update
          this.notifyStatusChange(recordId, status)
        } else if (retries < maxRetries) {
          // Still pending, check again in 30 seconds
          setTimeout(checkStatus, 30000)
          retries++
        } else {
          // Timeout - mark as failed
          await this.updateDatabaseRecord(recordId, {
            status: TransactionStatus.FAILED,
            error_message: 'Transaction timeout'
          })
        }
      } catch (error) {
        console.error('Transaction monitoring error:', error)
        if (retries < maxRetries) {
          setTimeout(checkStatus, 30000)
          retries++
        }
      }
    }

    // Start monitoring
    setTimeout(checkStatus, 5000) // First check after 5 seconds
  }
}
```

### **2. Event-Driven Synchronization**

```typescript
// src/lib/eventSync.ts
export class EventSynchronizer {
  private lastSyncedBlock: bigint = 0n

  async startEventSync() {
    // Get last synced block from database
    this.lastSyncedBlock = await this.getLastSyncedBlock()

    // Start polling for new events
    setInterval(() => {
      this.syncNewEvents()
    }, 30000) // Every 30 seconds
  }

  private async syncNewEvents() {
    try {
      const currentBlock = await this.getCurrentBlockNumber()
      
      if (currentBlock > this.lastSyncedBlock) {
        const events = await this.getContractEvents(
          this.lastSyncedBlock + 1n,
          currentBlock
        )

        for (const event of events) {
          await this.processEvent(event)
        }

        // Update last synced block
        await this.updateLastSyncedBlock(currentBlock)
        this.lastSyncedBlock = currentBlock
      }
    } catch (error) {
      console.error('Event sync failed:', error)
    }
  }

  private async processEvent(event: any) {
    switch (event.eventName) {
      case 'ContributionMade':
        await this.handleContributionEvent(event)
        break
      case 'PayoutProcessed':
        await this.handlePayoutEvent(event)
        break
      case 'ChamaCreated':
        await this.handleChamaCreatedEvent(event)
        break
      default:
        console.log('Unknown event:', event.eventName)
    }
  }

  private async handleContributionEvent(event: any) {
    const { chamaId, contributor, amount, timestamp } = event.args

    // Find existing database record by transaction hash
    const { data: existingRecord } = await supabase
      .from('contributions')
      .select('*')
      .eq('transaction_hash', event.transactionHash)
      .single()

    if (existingRecord) {
      // Update existing record with blockchain confirmation
      await supabase
        .from('contributions')
        .update({
          status: TransactionStatus.CONFIRMED,
          block_number: Number(event.blockNumber),
          confirmed_at: new Date(Number(timestamp) * 1000).toISOString()
        })
        .eq('id', existingRecord.id)
    } else {
      // Create new record from blockchain event (missed transaction)
      await supabase
        .from('contributions')
        .insert({
          chama_id: chamaId,
          user_id: await this.getUserIdByWallet(contributor),
          amount: Number(amount),
          transaction_hash: event.transactionHash,
          block_number: Number(event.blockNumber),
          status: TransactionStatus.CONFIRMED,
          contribution_date: new Date(Number(timestamp) * 1000).toISOString().split('T')[0],
          created_at: new Date(Number(timestamp) * 1000).toISOString()
        })
    }

    // Update user and chama statistics
    await this.updateUserStats(contributor)
    await this.updateChamaStats(chamaId)
  }
}
```

### **3. Reconciliation System**

```typescript
// src/lib/reconciliation.ts
export class DataReconciler {
  async reconcileChama(chamaId: string) {
    try {
      // Get database state
      const dbContributions = await this.getDatabaseContributions(chamaId)
      const dbPayouts = await this.getDatabasePayouts(chamaId)

      // Get blockchain state
      const chainContributions = await this.getChainContributions(chamaId)
      const chainPayouts = await this.getChainPayouts(chamaId)

      // Find discrepancies
      const contributionDiscrepancies = this.findContributionDiscrepancies(
        dbContributions, 
        chainContributions
      )
      const payoutDiscrepancies = this.findPayoutDiscrepancies(
        dbPayouts, 
        chainPayouts
      )

      // Resolve discrepancies (blockchain wins)
      await this.resolveDiscrepancies([
        ...contributionDiscrepancies,
        ...payoutDiscrepancies
      ])

      return {
        success: true,
        discrepancies: contributionDiscrepancies.length + payoutDiscrepancies.length
      }
    } catch (error) {
      console.error('Reconciliation failed:', error)
      return { success: false, error }
    }
  }

  private findContributionDiscrepancies(dbRecords: any[], chainRecords: any[]) {
    const discrepancies = []

    // Check for missing records in database
    for (const chainRecord of chainRecords) {
      const dbRecord = dbRecords.find(db => 
        db.transaction_hash === chainRecord.transactionHash
      )
      
      if (!dbRecord) {
        discrepancies.push({
          type: 'missing_in_db',
          chainRecord,
          action: 'create_db_record'
        })
      } else if (dbRecord.status !== 'confirmed') {
        discrepancies.push({
          type: 'status_mismatch',
          dbRecord,
          chainRecord,
          action: 'update_status'
        })
      }
    }

    // Check for extra records in database (shouldn't happen, but...)
    for (const dbRecord of dbRecords) {
      if (dbRecord.status === 'confirmed') {
        const chainRecord = chainRecords.find(chain => 
          chain.transactionHash === dbRecord.transaction_hash
        )
        
        if (!chainRecord) {
          discrepancies.push({
            type: 'extra_in_db',
            dbRecord,
            action: 'investigate' // This shouldn't happen
          })
        }
      }
    }

    return discrepancies
  }

  private async resolveDiscrepancies(discrepancies: any[]) {
    for (const discrepancy of discrepancies) {
      switch (discrepancy.action) {
        case 'create_db_record':
          await this.createMissingRecord(discrepancy.chainRecord)
          break
        case 'update_status':
          await this.updateRecordStatus(discrepancy.dbRecord, discrepancy.chainRecord)
          break
        case 'investigate':
          console.warn('Database record without chain confirmation:', discrepancy.dbRecord)
          // Could mark as 'needs_investigation' status
          break
      }
    }
  }
}
```

## 🎯 **React Hooks Integration**

### **Enhanced Stacking Hook with Sync**

```typescript
// src/hooks/useStackingWithSync.ts
import { useDataSync } from '@/lib/dataSync'
import { useSupabaseStacking } from '@/hooks/useSupabaseStacking'

export const useStackingWithSync = () => {
  const { syncContribution } = useDataSync()
  const supabaseStacking = useSupabaseStacking()

  const stackSats = async (amount: number) => {
    try {
      // Step 1: Optimistic database update
      const { data: dbRecord } = await supabaseStacking.addStackingRecord({
        amount,
        stacking_date: new Date().toISOString().split('T')[0],
        goal_type: 'daily',
        vault_type: 'general',
        is_goal_achieved: amount >= 1000 // Example goal
      })

      // Step 2: Submit to blockchain with sync monitoring
      const { txHash } = await syncContribution({
        type: 'stacking',
        recordId: dbRecord.id,
        amount,
        userId: dbRecord.user_id
      })

      return { success: true, recordId: dbRecord.id, txHash }
    } catch (error) {
      console.error('Stacking failed:', error)
      throw error
    }
  }

  return {
    ...supabaseStacking,
    stackSats
  }
}
```

## 📊 **Monitoring & Analytics**

### **Sync Health Dashboard**

```typescript
// src/components/admin/SyncHealthDashboard.tsx
export const SyncHealthDashboard = () => {
  const [syncStats, setSyncStats] = useState({
    pendingTransactions: 0,
    failedTransactions: 0,
    lastSyncTime: null,
    discrepancies: 0
  })

  useEffect(() => {
    loadSyncStats()
    const interval = setInterval(loadSyncStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadSyncStats = async () => {
    // Get sync statistics from database
    const stats = await getSyncHealthStats()
    setSyncStats(stats)
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent>
          <h3>Pending Transactions</h3>
          <p className="text-2xl font-bold">{syncStats.pendingTransactions}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <h3>Failed Transactions</h3>
          <p className="text-2xl font-bold text-red-500">{syncStats.failedTransactions}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <h3>Last Sync</h3>
          <p className="text-sm">{syncStats.lastSyncTime}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <h3>Discrepancies</h3>
          <p className="text-2xl font-bold text-yellow-500">{syncStats.discrepancies}</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 🚨 **Error Handling & Recovery**

### **Automatic Recovery Strategies**

1. **Transaction Timeout Recovery**
   - Mark as failed after 10 minutes
   - Allow user to retry
   - Investigate stuck transactions

2. **Network Disconnection**
   - Queue operations locally
   - Sync when connection restored
   - Prevent data loss

3. **Blockchain Reorg Handling**
   - Monitor for chain reorganizations
   - Re-verify recent transactions
   - Update database accordingly

4. **Database Corruption Recovery**
   - Rebuild from blockchain events
   - Verify data integrity
   - Alert administrators

## 🎯 **Best Practices**

### **Do's**
✅ Always update UI optimistically for better UX
✅ Use blockchain as the ultimate source of truth
✅ Implement comprehensive error handling
✅ Monitor sync health continuously
✅ Test reconciliation thoroughly

### **Don'ts**
❌ Never trust database over blockchain
❌ Don't ignore failed transactions
❌ Don't sync too frequently (gas costs)
❌ Don't block UI on blockchain confirmations
❌ Don't forget to handle edge cases

## 🔮 **Future Enhancements**

1. **Real-time WebSocket Updates** - Instant UI updates
2. **Predictive Sync** - Anticipate user actions
3. **Cross-chain Support** - Multi-blockchain sync
4. **Advanced Analytics** - Sync performance metrics
5. **AI-powered Reconciliation** - Smart conflict resolution

This synchronization strategy ensures your Jenga application maintains data consistency while providing excellent user experience! 🚀
