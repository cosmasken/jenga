import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Cloud,
  CloudUpload, 
  Timer, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Users,
  DollarSign,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Bell,
  BellOff
} from 'lucide-react'
import { useBatchProcessor, BatchOperation } from '@/services/batchProcessor'
import { toast } from '@/hooks/use-toast'
import { formatEther } from 'viem'
import { motion, AnimatePresence } from 'framer-motion'

interface BatchStatusTrackerProps {
  chamaAddress: string
  showNotifications?: boolean
  autoRefresh?: boolean
  refreshIntervalMs?: number
}

export function BatchStatusTracker({
  chamaAddress,
  showNotifications = true,
  autoRefresh = true,
  refreshIntervalMs = 30000 // 30 seconds
}: BatchStatusTrackerProps) {
  const { 
    pendingBatches, 
    isProcessing, 
    processBatch, 
    autoProcess,
    refreshBatches 
  } = useBatchProcessor(chamaAddress)
  
  const [notifications, setNotifications] = useState(showNotifications)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [processingBatchIds, setProcessingBatchIds] = useState<Set<string>>(new Set())

  // Auto-refresh batches
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshBatches()
      setLastUpdate(new Date())
    }, refreshIntervalMs)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshIntervalMs, refreshBatches])

  // Auto-process eligible batches
  useEffect(() => {
    if (!autoRefresh) return

    const checkAndProcess = async () => {
      try {
        await autoProcess()
      } catch (error) {
        console.error('Auto-process error:', error)
      }
    }

    const interval = setInterval(checkAndProcess, refreshIntervalMs * 2) // Less frequent auto-processing
    return () => clearInterval(interval)
  }, [autoRefresh, refreshIntervalMs, autoProcess])

  const handleProcessBatch = async (batchId: string) => {
    setProcessingBatchIds(prev => new Set([...prev, batchId]))
    
    try {
      const result = await processBatch(batchId)
      
      if (result.success) {
        if (notifications) {
          toast({
            title: "🚀 Batch Deployed Successfully",
            description: `Transaction: ${result.txHash?.slice(0, 12)}...`,
          })
        }
      }
    } finally {
      setProcessingBatchIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(batchId)
        return newSet
      })
    }
  }

  const getBatchStatusIcon = (status: string, isProcessingLocal?: boolean) => {
    if (isProcessingLocal) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
    }

    switch (status) {
      case 'pending':
        return <Timer className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getBatchTypeIcon = (type: string) => {
    switch (type) {
      case 'create_chama':
        return <Cloud className="h-4 w-4" />
      case 'batch_join':
        return <Users className="h-4 w-4" />
      case 'batch_contribute':
        return <DollarSign className="h-4 w-4" />
      default:
        return <CloudUpload className="h-4 w-4" />
    }
  }

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatBatchAge = (createdAt: string) => {
    const now = new Date()
    const created = new Date(createdAt)
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just created'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const openTransactionInExplorer = (txHash: string) => {
    const explorerUrl = `https://explorer.testnet.citrea.xyz/tx/${txHash}`
    window.open(explorerUrl, '_blank')
  }

  const totalOperations = pendingBatches.reduce((sum, batch) => sum + batch.total_operations, 0)
  const completedBatches = pendingBatches.filter(b => b.status === 'completed').length
  const failedBatches = pendingBatches.filter(b => b.status === 'failed').length

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Batch Operations Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className="gap-2"
              >
                {notifications ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refreshBatches()
                  setLastUpdate(new Date())
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{pendingBatches.length}</p>
              <p className="text-sm text-gray-600">Total Batches</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedBatches}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{totalOperations}</p>
              <p className="text-sm text-gray-600">Total Operations</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{failedBatches}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            {autoRefresh && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Auto-refresh enabled
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch List */}
      {pendingBatches.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Batch Operations</h3>
              <p className="text-gray-600 mb-4">
                All operations are processed or no operations are pending
              </p>
              <Button onClick={autoProcess} variant="outline" className="gap-2">
                <Timer className="h-4 w-4" />
                Check for Operations
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {pendingBatches.map((batch, index) => {
              const isProcessingLocal = processingBatchIds.has(batch.id)
              const canProcess = batch.status === 'pending' && !isProcessingLocal
              
              return (
                <motion.div
                  key={batch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`border-l-4 ${
                    batch.status === 'completed' ? 'border-l-green-500' :
                    batch.status === 'failed' ? 'border-l-red-500' :
                    batch.status === 'processing' ? 'border-l-blue-500' :
                    'border-l-yellow-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getBatchTypeIcon(batch.type)}
                          <div>
                            <h3 className="font-medium capitalize">
                              {batch.type.replace('_', ' ')}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {batch.total_operations} operations • {formatBatchAge(batch.created_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getBatchStatusIcon(batch.status, isProcessingLocal)}
                          <Badge className={getBatchStatusColor(batch.status)}>
                            {isProcessingLocal ? 'Deploying...' : batch.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <Progress
                          value={
                            batch.status === 'completed' ? 100 :
                            batch.status === 'processing' || isProcessingLocal ? 50 :
                            batch.status === 'failed' ? 0 :
                            25
                          }
                          className="h-2"
                        />
                      </div>

                      {/* Batch Details */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Gas: {parseInt(batch.estimated_gas).toLocaleString()}</span>
                          <span>ID: {batch.id.slice(0, 8)}...</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {canProcess && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessBatch(batch.id)}
                              disabled={isProcessing}
                              className="gap-2"
                            >
                              <CloudUpload className="h-4 w-4" />
                              Deploy
                            </Button>
                          )}

                          {batch.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // This would need the actual transaction hash from the batch
                                toast({
                                  title: "ℹ️ Transaction Hash",
                                  description: "Transaction hash would be shown here",
                                })
                              }}
                              className="gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View Tx
                            </Button>
                          )}

                          {batch.status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessBatch(batch.id)}
                              disabled={isProcessingLocal}
                              className="gap-2"
                            >
                              <RefreshCw className="h-4 w-4" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Status Alerts */}
      {failedBatches > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Attention:</strong> {failedBatches} batch operation{failedBatches > 1 ? 's have' : ' has'} failed. 
            You can retry processing them manually.
          </AlertDescription>
        </Alert>
      )}

      {autoRefresh && pendingBatches.some(b => b.status === 'pending') && (
        <Alert>
          <Timer className="h-4 w-4" />
          <AlertDescription>
            <strong>Auto-processing:</strong> Eligible batches will be automatically processed based on size and age thresholds.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Compact version for sidebar or dashboard widgets
export function BatchStatusWidget({ chamaAddress }: { chamaAddress: string }) {
  const { pendingBatches, autoProcess } = useBatchProcessor(chamaAddress)
  
  const pendingCount = pendingBatches.filter(b => b.status === 'pending').length
  const processingCount = pendingBatches.filter(b => b.status === 'processing').length
  const completedCount = pendingBatches.filter(b => b.status === 'completed').length

  if (pendingBatches.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <Cloud className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No pending batches</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Batch Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {pendingCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Timer className="h-3 w-3 text-yellow-500" />
                Pending
              </span>
              <Badge variant="secondary">{pendingCount}</Badge>
            </div>
          )}
          
          {processingCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                Processing
              </span>
              <Badge variant="secondary">{processingCount}</Badge>
            </div>
          )}
          
          {completedCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Completed
              </span>
              <Badge variant="secondary">{completedCount}</Badge>
            </div>
          )}
        </div>

        {pendingCount > 0 && (
          <Button
            size="sm"
            onClick={autoProcess}
            className="w-full mt-3 gap-2"
          >
            <CloudUpload className="h-3 w-3" />
            Process All
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
