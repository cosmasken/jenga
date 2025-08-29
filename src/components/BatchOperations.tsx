import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Cloud, 
  CloudUpload, 
  Timer, 
  Users, 
  DollarSign, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  Zap,
  ArrowRight
} from 'lucide-react'
import { useBatchProcessor, BatchOperation } from '@/services/batchProcessor'
import { toast } from '@/hooks/use-toast'
import { formatEther } from 'viem'

interface BatchOperationsProps {
  chamaAddress: string
  userAddress: string
}

export function BatchOperations({ chamaAddress, userAddress }: BatchOperationsProps) {
  const { pendingBatches, isProcessing, processBatch, createBatch, autoProcess } = useBatchProcessor(chamaAddress)
  const [selectedBatch, setSelectedBatch] = useState<BatchOperation | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleProcessBatch = async (batchId: string) => {
    const result = await processBatch(batchId)
    if (result.success) {
      toast({
        title: "✅ Batch Deployed",
        description: `Transaction hash: ${result.txHash?.slice(0, 12)}...`,
      })
    }
  }

  const handleCreateBatch = async (operationType: string) => {
    const batch = await createBatch(operationType)
    if (batch) {
      toast({
        title: "📦 Batch Created",
        description: `Created batch with ${batch.total_operations} operations`,
      })
      setShowCreateDialog(false)
    } else {
      toast({
        title: "ℹ️ No Operations to Batch",
        description: "No pending operations found for this type",
        variant: "destructive"
      })
    }
  }

  const getBatchIcon = (type: string) => {
    switch (type) {
      case 'create_chama': return <Zap className="h-4 w-4" />
      case 'batch_join': return <Users className="h-4 w-4" />
      case 'batch_contribute': return <DollarSign className="h-4 w-4" />
      default: return <Cloud className="h-4 w-4" />
    }
  }

  const getBatchStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatBatchType = (type: string) => {
    switch (type) {
      case 'create_chama': return 'Chama Creation'
      case 'batch_join': return 'Member Joins'
      case 'batch_contribute': return 'Contributions'
      default: return type
    }
  }

  if (pendingBatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-500" />
            Batch Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Cloud className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No pending batch operations</p>
            <p className="text-sm text-gray-500 mb-4">
              Operations are automatically batched for efficient blockchain deployment
            </p>
            <Button 
              variant="outline" 
              onClick={autoProcess}
              className="gap-2"
            >
              <Timer className="h-4 w-4" />
              Check for Batches
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              Pending Batch Operations
              <Badge variant="secondary">{pendingBatches.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={autoProcess}
                disabled={isProcessing}
                className="gap-2"
              >
                <Timer className="h-4 w-4" />
                Auto Process
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <CloudUpload className="h-4 w-4" />
                    Create Batch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Batch Operation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <p className="text-sm text-gray-600">
                      Select the type of operations to batch together:
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => handleCreateBatch('batch_join')}
                      >
                        <Users className="h-4 w-4" />
                        Batch Member Joins
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => handleCreateBatch('batch_contribute')}
                      >
                        <DollarSign className="h-4 w-4" />
                        Batch Contributions
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {pendingBatches.map((batch) => (
            <Card key={batch.id} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getBatchIcon(batch.type)}
                    <div>
                      <h3 className="font-medium">{formatBatchType(batch.type)}</h3>
                      <p className="text-sm text-gray-600">
                        {batch.total_operations} operations • Est. {parseInt(batch.estimated_gas).toLocaleString()} gas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getBatchStatusColor(batch.status)}>
                      {batch.status === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                      {batch.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {batch.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                      {batch.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Progress 
                    value={batch.status === 'completed' ? 100 : batch.status === 'processing' ? 50 : 0} 
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-gray-500 min-w-fit">
                    {new Date(batch.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBatch(batch)}
                      className="gap-2"
                    >
                      <Info className="h-4 w-4" />
                      Details
                    </Button>
                  </div>

                  {batch.status === 'pending' && (
                    <Button
                      onClick={() => handleProcessBatch(batch.id)}
                      disabled={isProcessing}
                      size="sm"
                      className="gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CloudUpload className="h-4 w-4" />
                          Deploy to Chain
                        </>
                      )}
                    </Button>
                  )}

                  {batch.status === 'completed' && (
                    <Badge variant="outline" className="gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Deployed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Batch Details Modal */}
      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBatch && getBatchIcon(selectedBatch.type)}
              Batch Operation Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedBatch && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium">{formatBatchType(selectedBatch.type)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <Badge className={getBatchStatusColor(selectedBatch.status)}>
                    {selectedBatch.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Operations</p>
                  <p className="font-medium">{selectedBatch.total_operations}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estimated Gas</p>
                  <p className="font-medium">{parseInt(selectedBatch.estimated_gas).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Operations</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedBatch.operations.map((op, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-mono text-sm">{op.user_address}</p>
                          <p className="text-xs text-gray-600">{op.operation_type}</p>
                        </div>
                        <div className="text-right">
                          {op.amount && (
                            <p className="font-medium">{op.amount} cBTC</p>
                          )}
                          <Badge 
                            variant="outline" 
                            className={getBatchStatusColor(op.status)}
                          >
                            {op.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedBatch.status === 'pending' && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => {
                      handleProcessBatch(selectedBatch.id)
                      setSelectedBatch(null)
                    }}
                    disabled={isProcessing}
                    className="w-full gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing Batch...
                      </>
                    ) : (
                      <>
                        <CloudUpload className="h-4 w-4" />
                        Deploy Batch to Blockchain
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Quick Actions Component for Batch Operations
export function BatchQuickActions({ chamaAddress }: { chamaAddress: string }) {
  const { autoProcess } = useBatchProcessor(chamaAddress)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAutoProcess = async () => {
    setIsProcessing(true)
    try {
      await autoProcess()
      toast({
        title: "🔄 Auto-processing Complete",
        description: "Checked and processed eligible batches",
      })
    } catch (error) {
      toast({
        title: "❌ Auto-processing Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium mb-1">Batch Operations</h3>
            <p className="text-sm text-gray-600">
              Automatically batch and deploy pending operations
            </p>
          </div>
          <Button
            onClick={handleAutoProcess}
            disabled={isProcessing}
            variant="outline"
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Timer className="h-4 w-4" />
                Auto Process
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
