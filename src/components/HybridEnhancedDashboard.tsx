import React, { useState } from 'react'
import { useParams } from 'wouter'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { motion } from 'framer-motion'
import { InviteModal } from '@/components/InviteModal'
import { useQuery } from '@tanstack/react-query'
import { offchainChamaService } from '@/services/offchainChamaService'
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
  Bell,
  Crown,
  Shield,
  UserCheck
} from 'lucide-react'
import { type Address } from 'viem'

// Import our new hybrid components
import { HybridChamaDashboard } from '@/components/HybridChamaDashboard'
import { ActivityFeed, LiveStatusIndicator } from '@/components/ActivityFeed'
import { ReactivityTest } from '@/components/ReactivityTest'
import { ChamaShareInviteCard, ChamaInviteManager } from '@/components/ChamaShareInvite'

// Import existing hooks
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

  const [viewMode, setViewMode] = useState<'hybrid' | 'testing'>('hybrid')
  const [showDevTools, setShowDevTools] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)

  // Get hybrid data and actions
  const hybridData = useHybridChamaData(chamaAddress, userAddress)
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
                variant="outline"
                size="sm"
                onClick={() => hybridData.refresh()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

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


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'hybrid' && (
          <HybridView
            chamaAddress={chamaAddress}
            userAddress={userAddress}
            hybridData={hybridData}
            actions={actions}
            showInviteModal={showInviteModal}
            setShowInviteModal={setShowInviteModal}
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
  actions,
  showInviteModal,
  setShowInviteModal,
}: {
  chamaAddress: Address
  userAddress: Address
  hybridData: any
  actions: any
  showInviteModal: boolean
  setShowInviteModal: (show: boolean) => void
}) {
  const [showStatusTransition, setShowStatusTransition] = useState(false)

  // Get user context for this chama
  const { data: userContext } = useQuery({
    queryKey: ['chama-user-context', chamaAddress, userAddress],
    queryFn: async () => {
      if (!userAddress) return null;
      return offchainChamaService.getUserChamaContext(chamaAddress, userAddress);
    },
    enabled: !!userAddress
  });

  // Get chama data for status management
  const { data: chamaData } = useQuery({
    queryKey: ['chama-offchain', chamaAddress],
    queryFn: () => offchainChamaService.getChama(chamaAddress),
    enabled: !!chamaAddress
  });

  const handleStatusTransition = (newStatus: string) => {
    actions.transitionStatus({ newStatus });
    setShowStatusTransition(false);
  };

  const getAvailableStatusTransitions = (currentStatus: string) => {
    const transitions = {
      'draft': [{ value: 'recruiting', label: 'Start Recruiting', color: 'blue' }],
      'recruiting': [
        { value: 'waiting', label: 'Mark as Full', color: 'orange' }
      ],
      'waiting': [
        { value: 'recruiting', label: 'Reopen Recruiting', color: 'blue' }
      ],
    };
    return transitions[currentStatus as keyof typeof transitions] || [];
  };

  return (
    <div className="space-y-8">
      {/* User Context Banner */}
      {userContext && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className={userContext.isCreator ? 'border-yellow-200 bg-yellow-50' : userContext.isMember ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}>
            {userContext.isCreator ? (
              <Crown className="h-4 w-4 text-yellow-600" />
            ) : userContext.isMember ? (
              <UserCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-600" />
            )}
            <AlertDescription className='text-black'>
              {userContext.isCreator && (
                <span><strong>Creator Mode:</strong> You have full management access to this chama.</span>
              )}
              {userContext.isMember && !userContext.isCreator && (
                <span><strong>Member Access:</strong> You are a member of this chama with {userContext.memberCount - 1} other members.</span>
              )}
              {!userContext.isMember && (
                <span><strong>Viewer Mode:</strong> You can view this chama but cannot participate.</span>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Member Actions - Show for all members based on chama status */}
      {userContext?.isMember && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" />
                Member Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {/* Pay Deposit - Show for registered chamas when user hasn't paid */}
                {chamaData?.status === 'registered' && userContext?.memberInfo?.deposit_status !== 'paid' && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!actions.isPayingDeposit) {
                        actions.payDeposit();
                      }
                    }}
                    disabled={actions.isPayingDeposit}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    {actions.isPayingDeposit ? 'Paying...' : 'Pay Deposit'}
                  </Button>
                )}
                
                {/* Contribute - Show for active chamas when user has paid deposit */}
                {chamaData?.status === 'active' && userContext?.memberInfo?.deposit_status === 'paid' && (
                  <Button
                    size="sm"
                    onClick={() => actions.contribute({ 
                      userAddress: userAddress!, 
                      amount: chamaData.contribution_amount 
                    })}
                    disabled={actions.isContributing}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {actions.isContributing ? 'Contributing...' : 'Contribute'}
                  </Button>
                )}
                
                {/* Status messages when no actions available */}
                {chamaData?.status === 'registered' && userContext?.memberInfo?.deposit_status === 'paid' && (
                  <p className="text-sm text-gray-600">✅ Deposit paid. Waiting for ROSCA to start...</p>
                )}
                
                {chamaData?.status === 'waiting' && (
                  <p className="text-sm text-gray-600">⏳ Waiting for deployment to blockchain...</p>
                )}
                
                {chamaData?.status === 'recruiting' && (
                  <p className="text-sm text-gray-600">📢 Chama is still recruiting members</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Creator Status Management */}
      {userContext?.isCreator && chamaData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-bitcoin/20 bg-bitcoin/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Crown className="h-4 w-4 text-bitcoin" />
                Creator Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-bitcoin text-bitcoin">
                    {chamaData.status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {userContext.memberCount}/{chamaData.member_target} members
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getAvailableStatusTransitions(chamaData.status).map((transition) => (
                    <Button
                      key={transition.value}
                      size="sm"
                      onClick={() => handleStatusTransition(transition.value)}
                      disabled={actions.isTransitioningStatus}
                      className={`bg-${transition.color}-600 hover:bg-${transition.color}-700`}
                    >
                      {actions.isTransitioningStatus ? 'Updating...' : transition.label}
                    </Button>
                  ))}

                  {chamaData.status === 'recruiting' && (
                    <Button
                      size="sm"
                      onClick={() => setShowInviteModal(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Bell className="w-4 h-4 mr-1" />
                      Send Invites
                    </Button>
                  )}

                  {chamaData.status === 'waiting' && (
                    <Button
                      size="sm"
                      onClick={actions.deployToChain}
                      disabled={actions.isDeployingToChain}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Rocket className="w-4 h-4 mr-1" />
                      {actions.isDeployingToChain ? 'Deploying...' : 'Deploy to Chain'}
                    </Button>
                  )}

                  {chamaData.status === 'registered' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusTransition('active')}
                      disabled={actions.isTransitioningStatus}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {actions.isTransitioningStatus ? 'Starting...' : 'Start ROSCA'}
                    </Button>
                  )}

                </div>
              </div>

              {/* Status Description */}
              <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                {chamaData.status === 'draft' && (
                  <p>💡 <strong>Draft:</strong> Start recruiting when ready to invite members</p>
                )}
                {chamaData.status === 'recruiting' && (
                  <p>📢 <strong>Recruiting:</strong> Members can join. Auto-transitions to waiting when full</p>
                )}
                {chamaData.status === 'waiting' && (
                  <p>⏳ <strong>Ready:</strong> All members joined! Deploy to blockchain to enable contributions</p>
                )}
                {chamaData.status === 'registered' && (
                  <p>🔗 <strong>On-chain:</strong> Deployed! Members can now pay deposits</p>
                )}
                {chamaData.status === 'active' && (
                  <p>🚀 <strong>Active:</strong> ROSCA is running! Members can contribute</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}


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

      {/* Invite Modal */}
      <InviteModal
        chamaId={chamaAddress}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />
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
