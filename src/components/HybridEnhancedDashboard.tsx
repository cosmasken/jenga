import React, { useState } from 'react'
import { useParams } from 'wouter'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import {
  Cloud,
  Database,
  Zap,
  Users,
  Activity,
  Settings,
  RefreshCw,
  Eye,
  Layers,
  Rocket,
  Timer,
  Bell
} from 'lucide-react'
import { type Address } from 'viem'

// Import our new hybrid components
import { HybridChamaDashboard } from '@/components/HybridChamaDashboard'
import { ActivityFeed, LiveStatusIndicator } from '@/components/ActivityFeed'
import { ReactivityTest } from '@/components/ReactivityTest'
import { ChamaShareInviteCard, ChamaInviteManager } from '@/components/ChamaShareInvite'

// Import existing hooks for comparison
import { useComprehensiveChamaData } from '@/hooks/useChamaData'
import { useHybridChamaData } from '@/hooks/useHybridChamaData'
import { useChamaActions } from '@/hooks/useChamaActions'

interface HybridEnhancedDashboardProps {
  chamaAddress: Address
  isTestMode?: boolean
}

export function HybridEnhancedDashboard({
  chamaAddress,
  isTestMode = false
}: HybridEnhancedDashboardProps) {
  const { primaryWallet } = useDynamicContext()
  const userAddress = primaryWallet?.address as Address

  const [viewMode, setViewMode] = useState<'hybrid' | 'comparison' | 'testing'>('hybrid')
  const [showDevTools, setShowDevTools] = useState(false)

  // Get both hybrid and traditional data for comparison
  const hybridData = useHybridChamaData(chamaAddress, userAddress)
  const traditionalData = useComprehensiveChamaData(chamaAddress)
  const actions = useChamaActions(chamaAddress, userAddress)

  if (!userAddress) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-gray-600 mb-4">
              Please connect your wallet to view the hybrid dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with Mode Switcher */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Cloud className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-semibold">Hybrid Chama Dashboard</h1>
              </div>
              <LiveStatusIndicator
                isConnected={!!hybridData.data}
                lastUpdate={hybridData.data?.lastUpdate}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={showDevTools ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDevTools(!showDevTools)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Dev Tools
              </Button>

              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 p-1">
                <Button
                  variant={viewMode === 'hybrid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('hybrid')}
                  className="gap-2"
                >
                  <Layers className="h-4 w-4" />
                  Hybrid
                </Button>
                <Button
                  variant={viewMode === 'comparison' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('comparison')}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Compare
                </Button>
                {isTestMode && (
                  <Button
                    variant={viewMode === 'testing' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('testing')}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    Testing
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Tools Panel */}
      {showDevTools && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-900 text-white p-4 border-b"
        >
          <div className="max-w-7xl mx-auto">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Developer Tools
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium mb-1">Hybrid Data Status:</p>
                <p className="text-gray-300">
                  Loading: {hybridData.isLoading ? '✅' : '❌'} |
                  Error: {hybridData.error ? '❌' : '✅'} |
                  Data: {hybridData.data ? '✅' : '❌'}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Real-time Updates:</p>
                <p className="text-gray-300">
                  Last Update: {hybridData.data?.lastUpdate?.toLocaleTimeString() || 'Never'}
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Actions Available:</p>
                <p className="text-gray-300">
                  Join: {actions.joinChama.isPending ? '⏳' : '✅'} |
                  Contribute: {actions.contribute.isPending ? '⏳' : '✅'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'hybrid' && (
          <HybridView
            chamaAddress={chamaAddress}
            userAddress={userAddress}
            hybridData={hybridData}
            actions={actions}
          />
        )}

        {viewMode === 'comparison' && (
          <ComparisonView
            chamaAddress={chamaAddress}
            userAddress={userAddress}
            hybridData={hybridData}
            traditionalData={traditionalData}
          />
        )}

        {viewMode === 'testing' && isTestMode && (
          <TestingView
            chamaAddress={chamaAddress}
            userAddress={userAddress}
          />
        )}
      </div>
    </div>
  )
}

// Hybrid View - Main Dashboard
function HybridView({
  chamaAddress,
  userAddress,
  hybridData,
  actions
}: {
  chamaAddress: Address
  userAddress: Address
  hybridData: any
  actions: any
}) {
  return (
    <div className="space-y-8">
      {/* Status Banner */}
      <Alert>
        <Cloud className="h-4 w-4" />
        <AlertDescription>
          <strong>Hybrid Mode Active:</strong> Off-chain operations are enabled for instant updates.
          Batch operations will be deployed to the blockchain automatically.
        </AlertDescription>
      </Alert>

      {/* Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HybridChamaDashboard chamaAddress={chamaAddress} />
        </div>

        <div className="space-y-6">
          {/* Sharing & Invite Actions */}
          <ChamaShareInviteCard chamaAddress={chamaAddress} userAddress={userAddress} />

          {/* Activity Feed */}
          <ActivityFeed
            userAddress={userAddress}
            showNotifications={true}
            maxItems={5}
          />
        </div>
      </div>

      {/* Additional Sections */}
      <Tabs defaultValue="sharing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sharing" className="gap-2">
            <Users className="h-4 w-4" />
            Share & Invite
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Full Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sharing" className="space-y-6">
          <ChamaInviteManager
            chamaAddress={chamaAddress}
            userAddress={userAddress}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <ActivityFeed
            userAddress={userAddress}
            showNotifications={true}
            maxItems={20}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Comparison View - Side by side traditional vs hybrid
function ComparisonView({
  chamaAddress,
  userAddress,
  hybridData,
  traditionalData
}: {
  chamaAddress: Address
  userAddress: Address
  hybridData: any
  traditionalData: any
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Data Source Comparison</h2>
        <p className="text-gray-600">
          Compare hybrid off-chain data with traditional on-chain only data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hybrid Data Column */}
        <div className="space-y-6">
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Hybrid (Off-chain + On-chain)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Update Speed:</span>
                  <Badge variant="default">Instant</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gas Cost:</span>
                  <Badge variant="secondary">Batched</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Loading:</span>
                  <Badge variant={hybridData.isLoading ? "destructive" : "default"}>
                    {hybridData.isLoading ? 'Loading...' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <HybridChamaDashboard chamaAddress={chamaAddress} />
        </div>

        {/* Traditional Data Column */}
        <div className="space-y-6">
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-orange-500" />
                Traditional (On-chain Only)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Update Speed:</span>
                  <Badge variant="secondary">Block Confirmation</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gas Cost:</span>
                  <Badge variant="destructive">Per Transaction</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Loading:</span>
                  <Badge variant={traditionalData.isLoading ? "destructive" : "default"}>
                    {traditionalData.isLoading ? 'Loading...' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traditional dashboard components would go here */}
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Traditional on-chain dashboard view
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  This would show the existing ChamaDashboard component
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Testing View - For reactivity testing
function TestingView({ chamaAddress, userAddress }: {
  chamaAddress: Address
  userAddress: Address
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Reactivity Testing</h2>
        <p className="text-gray-600">
          Test real-time updates and off-chain operations
        </p>
      </div>

      <ReactivityTest />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Real-time Dashboard
          </h3>
          <HybridChamaDashboard chamaAddress={chamaAddress} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Live Activity
          </h3>
          <ActivityFeed
            userAddress={userAddress}
            showNotifications={true}
            maxItems={10}
          />
        </div>
      </div>
    </div>
  )
}

// Route wrapper component that gets address from URL params
export function HybridEnhancedDashboardRoute() {
  const params = useParams<{ address: string }>();

  if (!params.address) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invalid Chama Address</h3>
            <p className="text-gray-600 mb-4">
              No chama address provided in URL
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <HybridEnhancedDashboard
      chamaAddress={params.address as Address}
      isTestMode={false}
    />
  );
}

// Export the main component and the route wrapper
export default HybridEnhancedDashboardRoute;
