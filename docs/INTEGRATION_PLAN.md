# Off-Chain Chama Integration Plan

## Overview
This document provides a step-by-step plan to integrate the off-chain chama system with the existing ChamaDashboard, ensuring reactive UI updates and seamless on-chain synchronization.

## Phase 1: Database & Service Setup (Day 1-2)

### Step 1.1: Set up Supabase Instance
```bash
# 1. Create Supabase project
# 2. Run the schema.sql file
# 3. Configure environment variables
```

**Actions:**
1. Create new Supabase project at [supabase.com](https://supabase.com)
2. Copy project URL and anon key
3. Execute schema.sql in Supabase SQL editor
4. Set up Row Level Security policies
5. Configure real-time subscriptions

**Environment Setup:**
```typescript
// .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 1.2: Install Dependencies
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install @supabase/auth-helpers-react
```

### Step 1.3: Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
```

## Phase 2: Core Service Integration (Day 2-3)

### Step 2.1: Implement Off-Chain Service
Copy the `offchainChamaService.ts` file and fix imports:

```typescript
// src/services/offchainChamaService.ts
// (Use the provided file with these additions)

import { useEffect } from 'react';

// Add missing useEffect import for React hooks
```

### Step 2.2: Create Hybrid Data Hooks
Create new hooks that combine off-chain and on-chain data:

```typescript
// src/hooks/useHybridChamaData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { offchainChamaService, type OffchainChama } from '@/services/offchainChamaService';
import { blockchainService } from '@/services/blockchainService';
import { useEffect, useState } from 'react';

export function useHybridChamaData(chamaId: string) {
  const { primaryWallet } = useDynamicContext();
  const queryClient = useQueryClient();
  const userAddress = primaryWallet?.address;

  // Off-chain data (primary source)
  const offchainQuery = useQuery({
    queryKey: ['chama-offchain', chamaId],
    queryFn: () => offchainChamaService.getChama(chamaId),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });

  // Members data
  const membersQuery = useQuery({
    queryKey: ['chama-members', chamaId],
    queryFn: () => offchainChamaService.getChamaMembers(chamaId),
    enabled: !!chamaId,
    staleTime: 15000,
  });

  // Current user's membership
  const membershipQuery = useQuery({
    queryKey: ['user-membership', chamaId, userAddress],
    queryFn: () => userAddress ? offchainChamaService.getMember(chamaId, userAddress) : null,
    enabled: !!userAddress && !!chamaId,
    staleTime: 10000,
  });

  // Current round
  const currentRoundQuery = useQuery({
    queryKey: ['current-round', chamaId],
    queryFn: () => offchainChamaService.getCurrentRound(chamaId),
    enabled: !!chamaId,
    staleTime: 15000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!chamaId) return;

    const subscription = offchainChamaService.subscribeToChamaUpdates(chamaId, (payload) => {
      console.log('Real-time update:', payload);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
      
      if (userAddress) {
        queryClient.invalidateQueries({ queryKey: ['user-membership', chamaId, userAddress] });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chamaId, userAddress, queryClient]);

  // Computed state
  const isLoading = offchainQuery.isLoading || membersQuery.isLoading;
  const error = offchainQuery.error || membersQuery.error;
  
  const chama = offchainQuery.data;
  const members = membersQuery.data || [];
  const userMembership = membershipQuery.data;
  const currentRound = currentRoundQuery.data;

  // Access level computation
  const accessLevel = (() => {
    if (!userAddress) return 'GUEST';
    if (!userMembership) {
      if (chama?.status === 'recruiting' && members.length < chama.member_target) {
        return 'CAN_JOIN';
      }
      return 'VIEWER';
    }
    if (chama?.creator_address === userAddress) return 'CREATOR';
    if (['active', 'confirmed'].includes(userMembership.status)) return 'MEMBER';
    return 'VIEWER';
  })() as 'GUEST' | 'CREATOR' | 'MEMBER' | 'CAN_JOIN' | 'VIEWER';

  // Available actions
  const availableActions = {
    canJoin: accessLevel === 'CAN_JOIN',
    canPayDeposit: accessLevel === 'CREATOR' && userMembership?.deposit_status === 'pending',
    canContribute: accessLevel === 'MEMBER' && currentRound?.status === 'active' && !userMembership?.has_received_payout,
    canStartROSCA: (accessLevel === 'CREATOR' || accessLevel === 'MEMBER') && chama?.status === 'waiting',
    canInvite: accessLevel === 'CREATOR' && chama?.status === 'recruiting',
  };

  return {
    // Data
    chama,
    members,
    userMembership,
    currentRound,
    
    // Loading states
    isLoading,
    error,
    
    // Computed state
    accessLevel,
    availableActions,
    
    // User state
    userState: {
      isLoggedIn: !!userAddress,
      address: userAddress,
      isMember: !!userMembership,
      isCreator: chama?.creator_address === userAddress,
      hasContributed: userMembership?.rounds_contributed > 0,
    },
  };
}
```

### Step 2.3: Create Action Hooks
```typescript
// src/hooks/useChamaActions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { offchainChamaService } from '@/services/offchainChamaService';
import { toast } from '@/hooks/use-toast';

export function useChamaActions(chamaId: string) {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['chama-offchain', chamaId] });
    queryClient.invalidateQueries({ queryKey: ['chama-members', chamaId] });
    queryClient.invalidateQueries({ queryKey: ['current-round', chamaId] });
  };

  // Join chama (off-chain first)
  const joinMutation = useMutation({
    mutationFn: async (userAddress: string) => {
      return offchainChamaService.addMember(chamaId, userAddress, 'direct_join');
    },
    onSuccess: () => {
      toast({
        title: '✅ Joined Successfully!',
        description: 'You have joined the chama. Deposit payment is pending.',
      });
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Failed to Join',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Record contribution (off-chain first)
  const contributeMutation = useMutation({
    mutationFn: async ({ userAddress, amount }: { userAddress: string; amount: string }) => {
      const currentRound = await offchainChamaService.getCurrentRound(chamaId);
      if (!currentRound) throw new Error('No active round');
      
      return offchainChamaService.recordContribution(chamaId, currentRound.id, userAddress, amount);
    },
    onSuccess: () => {
      toast({
        title: '💰 Contribution Recorded!',
        description: 'Your contribution has been recorded. Chain confirmation pending.',
      });
      invalidateQueries();
    },
    onError: (error: Error) => {
      toast({
        title: '❌ Contribution Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update chama status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, metadata }: { status: any; metadata?: any }) => {
      return offchainChamaService.updateChamaStatus(chamaId, status, metadata);
    },
    onSuccess: () => {
      invalidateQueries();
    },
  });

  return {
    join: joinMutation.mutate,
    contribute: contributeMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    
    isJoining: joinMutation.isPending,
    isContributing: contributeMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
  };
}
```

## Phase 3: Dashboard Integration (Day 3-4)

### Step 3.1: Create New Dashboard Component
```typescript
// src/components/HybridChamaDashboard.tsx
import { useParams } from 'wouter';
import { useHybridChamaData } from '@/hooks/useHybridChamaData';
import { useChamaActions } from '@/hooks/useChamaActions';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  Clock, 
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export function HybridChamaDashboard() {
  const params = useParams();
  const chamaId = params.id as string;
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const userAddress = primaryWallet?.address;

  const {
    chama,
    members,
    userMembership,
    currentRound,
    isLoading,
    error,
    accessLevel,
    availableActions,
    userState,
  } = useHybridChamaData(chamaId);

  const {
    join,
    contribute,
    updateStatus,
    isJoining,
    isContributing,
  } = useChamaActions(chamaId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !chama) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <Card className="text-center py-8">
          <CardContent>
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Chama</h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Chama not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJoin = () => {
    if (!userAddress) {
      setShowAuthFlow(true);
      return;
    }
    join(userAddress);
  };

  const handleContribute = () => {
    if (!userAddress) return;
    contribute({
      userAddress,
      amount: chama.contribution_amount,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-500' },
      recruiting: { label: 'Recruiting', className: 'bg-blue-500' },
      waiting: { label: 'Waiting to Start', className: 'bg-yellow-500' },
      active: { label: 'Active', className: 'bg-green-500' },
      completed: { label: 'Completed', className: 'bg-purple-500' },
      cancelled: { label: 'Cancelled', className: 'bg-red-500' },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{chama.name}</h1>
          <p className="text-gray-600">{chama.description}</p>
        </div>
        {getStatusBadge(chama.status)}
      </div>

      {/* Real-time Status Indicator */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700">
              Real-time updates active • Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Members</p>
                <p className="text-2xl font-bold">{members.length}/{chama.member_target}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Contribution</p>
                <p className="text-2xl font-bold">{chama.contribution_amount} cBTC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium">Security Deposit</p>
                <p className="text-2xl font-bold">{chama.security_deposit} cBTC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Round Duration</p>
                <p className="text-2xl font-bold">{chama.round_duration_hours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Members</span>
              <span>{members.length} / {chama.member_target}</span>
            </div>
            <Progress value={(members.length / chama.member_target) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Join Action */}
            {availableActions.canJoin && (
              <Button 
                onClick={handleJoin} 
                disabled={isJoining}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isJoining ? 'Joining...' : 'Join Chama'}
              </Button>
            )}

            {/* Contribute Action */}
            {availableActions.canContribute && (
              <Button 
                onClick={handleContribute}
                disabled={isContributing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isContributing ? 'Contributing...' : 'Make Contribution'}
              </Button>
            )}

            {/* User Status */}
            {userMembership && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Member Status: {userMembership.status}</p>
                    <p className="text-sm text-gray-600">
                      Deposit Status: {userMembership.deposit_status}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium">
                    {member.user_address.slice(0, 6)}...{member.user_address.slice(-4)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Joined: {new Date(member.joined_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{member.status}</Badge>
                  <p className="text-sm text-gray-600">
                    {member.deposit_status === 'paid' ? '✅' : '⏳'} Deposit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug Information */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Info (Development Only)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto">
            {JSON.stringify({
              chamaId,
              accessLevel,
              availableActions,
              userState,
              membershipStatus: userMembership?.status,
              depositStatus: userMembership?.deposit_status,
            }, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 3.2: Update App Router
```typescript
// src/App.tsx or your routing file
import { HybridChamaDashboard } from '@/components/HybridChamaDashboard';

// Add route
<Route path="/chama/:id/hybrid" component={HybridChamaDashboard} />
```

## Phase 4: Testing Reactivity (Day 4-5)

### Step 4.1: Create Test Utilities
```typescript
// src/utils/testHelpers.ts
import { offchainChamaService } from '@/services/offchainChamaService';

export const createTestChama = async (creatorAddress: string) => {
  return offchainChamaService.createChama(creatorAddress, {
    name: `Test Chama ${Date.now()}`,
    description: 'A test chama for reactive UI testing',
    contribution_amount: '0.01',
    security_deposit: '0.005',
    member_target: 5,
    round_duration_hours: 168,
    is_private: false,
  });
};

export const simulateMemberJoin = async (chamaId: string, userAddress: string) => {
  return offchainChamaService.addMember(chamaId, userAddress, 'direct_join');
};

export const simulateContribution = async (chamaId: string, userAddress: string) => {
  const round = await offchainChamaService.getCurrentRound(chamaId);
  if (!round) {
    // Create a round for testing
    const newRound = await offchainChamaService.createRound(chamaId, 1);
    return offchainChamaService.recordContribution(chamaId, newRound.id, userAddress, '0.01');
  }
  return offchainChamaService.recordContribution(chamaId, round.id, userAddress, '0.01');
};
```

### Step 4.2: Create Test Component
```typescript
// src/components/ReactivityTest.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createTestChama, simulateMemberJoin, simulateContribution } from '@/utils/testHelpers';
import { toast } from '@/hooks/use-toast';

export function ReactivityTest({ userAddress }: { userAddress: string }) {
  const [testChamaId, setTestChamaId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTestChama = async () => {
    setIsCreating(true);
    try {
      const chama = await createTestChama(userAddress);
      setTestChamaId(chama.id);
      toast({
        title: '✅ Test Chama Created',
        description: `Chama ID: ${chama.id}`,
      });
    } catch (error) {
      toast({
        title: '❌ Failed to Create Test Chama',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSimulateJoin = async () => {
    if (!testChamaId) return;
    
    try {
      // Generate a fake address for testing
      const fakeAddress = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
      await simulateMemberJoin(testChamaId, fakeAddress);
      toast({
        title: '✅ Simulated Member Join',
        description: `Member ${fakeAddress.slice(0, 8)}... joined`,
      });
    } catch (error) {
      toast({
        title: '❌ Failed to Simulate Join',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSimulateContribution = async () => {
    if (!testChamaId) return;
    
    try {
      await simulateContribution(testChamaId, userAddress);
      toast({
        title: '✅ Simulated Contribution',
        description: 'Contribution recorded off-chain',
      });
    } catch (error) {
      toast({
        title: '❌ Failed to Simulate Contribution',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reactivity Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleCreateTestChama} 
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Creating...' : 'Create Test Chama'}
        </Button>

        {testChamaId && (
          <>
            <div className="p-2 bg-gray-100 rounded">
              <p className="text-sm">Test Chama ID: {testChamaId}</p>
              <p className="text-xs text-gray-600">
                Open /chama/{testChamaId}/hybrid in another tab to see real-time updates
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button onClick={handleSimulateJoin} variant="outline">
                Simulate Member Join
              </Button>
              <Button onClick={handleSimulateContribution} variant="outline">
                Simulate Contribution
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

### Step 4.3: Add Test Route
```typescript
// Add to your router
<Route path="/test-reactivity" component={() => {
  const { primaryWallet } = useDynamicContext();
  if (!primaryWallet?.address) {
    return <div>Connect wallet to test</div>;
  }
  return <ReactivityTest userAddress={primaryWallet.address} />;
}} />
```

## Phase 5: Blockchain Integration (Day 5-6)

### Step 5.1: Create Batch Operation Processor
```typescript
// src/services/batchProcessor.ts
import { offchainChamaService } from './offchainChamaService';
import { blockchainService } from './blockchainService';
import { toast } from '@/hooks/use-toast';

export class BatchProcessor {
  private isProcessing = false;

  async processPendingOperations() {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    console.log('🔄 Processing pending batch operations...');

    try {
      const pendingOps = await offchainChamaService.getPendingBatchOperations();
      
      for (const op of pendingOps) {
        try {
          await this.processOperation(op);
        } catch (error) {
          console.error(`Failed to process operation ${op.id}:`, error);
          await offchainChamaService.updateBatchOperation(op.id, 'failed', {
            error_message: error.message,
            retry_count: op.retry_count + 1,
          });
        }
      }
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processOperation(op: any) {
    console.log(`🚀 Processing ${op.operation_type} for chama ${op.chama_id}`);
    
    await offchainChamaService.updateBatchOperation(op.id, 'executing');

    switch (op.operation_type) {
      case 'deploy_chama':
        return this.deployChama(op);
      case 'batch_join':
        return this.batchJoin(op);
      case 'batch_contribute':
        return this.batchContribute(op);
      case 'start_rosca':
        return this.startRosca(op);
      default:
        throw new Error(`Unknown operation type: ${op.operation_type}`);
    }
  }

  private async deployChama(op: any) {
    // Deploy chama to blockchain
    const { chama_data } = op.operation_data;
    
    const txHash = await blockchainService.createNativeROSCA(
      chama_data.contribution_amount,
      chama_data.round_duration_hours * 3600,
      chama_data.member_target,
      chama_data.name
    );

    if (txHash) {
      // Extract contract address from receipt
      const contractAddress = await blockchainService.extractROSCAAddressFromReceipt(txHash);
      
      if (contractAddress) {
        // Update off-chain record with contract address
        await supabase
          .from('chamas')
          .update({
            chain_address: contractAddress,
            chain_tx_hash: txHash,
            chain_deployed_at: new Date().toISOString(),
          })
          .eq('id', op.chama_id);
      }

      await offchainChamaService.updateBatchOperation(op.id, 'completed', {
        tx_hash: txHash,
      });

      toast({
        title: '🎉 Chama Deployed!',
        description: 'Your chama is now live on the blockchain',
      });
    }
  }

  private async batchJoin(op: any) {
    // Implement batch join logic
    const { members, deposits } = op.operation_data;
    
    // This would call a batch join function on the smart contract
    // For now, we'll simulate individual joins
    for (let i = 0; i < members.length; i++) {
      const txHash = await blockchainService.joinROSCA(op.chama_id);
      if (txHash) {
        // Update member status
        await offchainChamaService.recordDepositPayment(members[i].id, txHash);
      }
    }

    await offchainChamaService.updateBatchOperation(op.id, 'completed');
  }

  private async batchContribute(op: any) {
    // Implement batch contribution logic
    const { contributions } = op.operation_data;
    
    for (const contribution of contributions) {
      const txHash = await blockchainService.contribute(op.chama_id);
      if (txHash) {
        // Update contribution status
        await supabase
          .from('contributions')
          .update({
            status: 'confirmed',
            chain_tx_hash: txHash,
            chain_confirmed: true,
            chain_sync_at: new Date().toISOString(),
          })
          .eq('id', contribution.id);
      }
    }

    await offchainChamaService.updateBatchOperation(op.id, 'completed');
  }

  private async startRosca(op: any) {
    const txHash = await blockchainService.startRosca(op.chama_id);
    
    if (txHash) {
      await offchainChamaService.updateBatchOperation(op.id, 'completed', {
        tx_hash: txHash,
      });

      // Update chama status
      await offchainChamaService.updateChamaStatus(op.chama_id, 'active');
    }
  }
}

export const batchProcessor = new BatchProcessor();
```

### Step 5.2: Add Chain Sync Buttons
```typescript
// Add to HybridChamaDashboard.tsx

const handleDeployToChain = async () => {
  if (!chama || chama.chain_address) return;
  
  try {
    const operation = await offchainChamaService.scheduleBatchOperation(
      'deploy_chama',
      chamaId,
      {
        chama_data: {
          contribution_amount: chama.contribution_amount,
          round_duration_hours: chama.round_duration_hours,
          member_target: chama.member_target,
          name: chama.name,
        }
      }
    );
    
    toast({
      title: '📅 Deployment Scheduled',
      description: 'Your chama will be deployed to the blockchain shortly',
    });

    // Process immediately for testing
    await batchProcessor.processPendingOperations();
    
  } catch (error) {
    toast({
      title: '❌ Deployment Failed',
      description: error.message,
      variant: 'destructive',
    });
  }
};

// Add this button in the actions section:
{accessLevel === 'CREATOR' && chama.status === 'waiting' && !chama.chain_address && (
  <Button 
    onClick={handleDeployToChain}
    className="w-full bg-purple-600 hover:bg-purple-700"
  >
    Deploy to Blockchain
  </Button>
)}
```

## Phase 6: Testing & Validation (Day 6-7)

### Step 6.1: Create Integration Tests
```typescript
// src/__tests__/integration.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { offchainChamaService } from '@/services/offchainChamaService';

describe('Off-chain Integration', () => {
  let testChamaId: string;
  const testUserAddress = '0x742d35Cc6648C4532B16D08B2a35B2e7F5a7B16f';

  beforeEach(async () => {
    // Create test chama
    const chama = await offchainChamaService.createChama(testUserAddress, {
      name: 'Integration Test Chama',
      contribution_amount: '0.01',
      security_deposit: '0.005',
      member_target: 3,
      round_duration_hours: 24,
    });
    testChamaId = chama.id;
  });

  it('should create chama and add creator as member', async () => {
    const chama = await offchainChamaService.getChama(testChamaId);
    const members = await offchainChamaService.getChamaMembers(testChamaId);
    
    expect(chama).toBeTruthy();
    expect(chama?.status).toBe('draft');
    expect(members).toHaveLength(1);
    expect(members[0].user_address).toBe(testUserAddress);
  });

  it('should allow members to join', async () => {
    const newMemberAddress = '0x123d35Cc6648C4532B16D08B2a35B2e7F5a7B123';
    
    await offchainChamaService.addMember(testChamaId, newMemberAddress);
    const members = await offchainChamaService.getChamaMembers(testChamaId);
    
    expect(members).toHaveLength(2);
  });

  it('should handle contributions', async () => {
    // Add a member first
    const memberAddress = '0x456d35Cc6648C4532B16D08B2a35B2e7F5a7B456';
    await offchainChamaService.addMember(testChamaId, memberAddress);
    
    // Create a round
    const round = await offchainChamaService.createRound(testChamaId, 1);
    
    // Record contribution
    const contribution = await offchainChamaService.recordContribution(
      testChamaId,
      round.id,
      memberAddress,
      '0.01'
    );
    
    expect(contribution).toBeTruthy();
    expect(contribution.status).toBe('pending');
  });
});
```

### Step 6.2: Manual Testing Checklist

Create a testing checklist:

```markdown
# Manual Testing Checklist

## Setup
- [ ] Supabase project created and configured
- [ ] Schema deployed successfully
- [ ] Environment variables set
- [ ] Real-time subscriptions working

## Basic Functionality
- [ ] Create chama (off-chain)
- [ ] Join chama (off-chain)
- [ ] View member list
- [ ] Real-time updates when member joins
- [ ] Status changes reflect immediately

## Reactive UI
- [ ] Open chama in two browser tabs
- [ ] Join in one tab, see update in other tab immediately
- [ ] Member count updates across tabs
- [ ] Status badges update in real-time
- [ ] No manual refresh needed

## Actions
- [ ] Join button works and shows loading state
- [ ] Contribute button works and shows loading state
- [ ] Status updates reflect in UI immediately
- [ ] Toast notifications appear for actions
- [ ] Error handling works properly

## Edge Cases
- [ ] Handle full chama (cannot join)
- [ ] Handle already joined user
- [ ] Handle network errors gracefully
- [ ] Handle invalid chama IDs
- [ ] Handle expired invitations

## Performance
- [ ] Initial load is fast (< 2 seconds)
- [ ] Real-time updates are instant (< 500ms)
- [ ] No memory leaks in subscriptions
- [ ] Queries are cached appropriately
```

## Phase 7: Smart Contract Updates (Day 7-8)

### Step 7.1: Update Smart Contract (if needed)
Based on testing, update the ROSCA contract to support batch operations:

```solidity
// Add to ROSCA.sol
function batchJoinROSCA(
    address[] calldata members,
    uint256[] calldata deposits
) external payable onlyAuthorized {
    require(members.length == deposits.length, "Array length mismatch");
    require(members.length <= 10, "Too many members in batch");
    
    uint256 totalDeposits = 0;
    for (uint256 i = 0; i < deposits.length; i++) {
        totalDeposits += deposits[i];
    }
    require(msg.value == totalDeposits, "Incorrect total deposit amount");
    
    for (uint256 i = 0; i < members.length; i++) {
        _joinROSCA(members[i], deposits[i]);
    }
}

function batchContribute(
    address[] calldata contributors,
    uint256[] calldata amounts
) external payable onlyAuthorized {
    require(contributors.length == amounts.length, "Array length mismatch");
    
    uint256 totalAmount = 0;
    for (uint256 i = 0; i < amounts.length; i++) {
        totalAmount += amounts[i];
    }
    require(msg.value == totalAmount, "Incorrect total amount");
    
    for (uint256 i = 0; i < contributors.length; i++) {
        _contribute(contributors[i], amounts[i]);
    }
}

mapping(address => bool) public authorizedOperators;

modifier onlyAuthorized() {
    require(authorizedOperators[msg.sender] || msg.sender == owner(), "Not authorized");
    _;
}

function setOperator(address operator, bool authorized) external onlyOwner {
    authorizedOperators[operator] = authorized;
}
```

### Step 7.2: Deploy Updated Contracts
```bash
# If contracts were updated
cd contract
npm run compile
npm run deploy:testnet

# Update contract addresses in environment
# Test batch operations
npm run test
```

## Phase 8: Production Deployment (Day 8)

### Step 8.1: Environment Setup
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

### Step 8.2: Deployment Checklist
- [ ] Supabase production instance configured
- [ ] Database schema deployed to production
- [ ] RLS policies tested and secure
- [ ] Smart contracts deployed to mainnet
- [ ] Frontend deployed with correct environment variables
- [ ] Real-time subscriptions working in production
- [ ] Performance monitoring set up
- [ ] Error tracking configured

## Success Metrics

By the end of this implementation, you should have:

1. ✅ **Instant UI Updates**: All chama actions reflect immediately in UI
2. ✅ **Real-time Sync**: Multiple users see changes instantly
3. ✅ **Reduced Gas Costs**: Batch operations for on-chain commits
4. ✅ **Better UX**: Preview actions before chain commitment  
5. ✅ **Scalable Architecture**: Clean separation of off-chain/on-chain logic
6. ✅ **Comprehensive Testing**: Both automated and manual test coverage

## Next Steps

After successful implementation:
1. Migrate existing chamas to the hybrid system
2. Add advanced features (notifications, analytics)
3. Implement more sophisticated batch operations
4. Add support for multiple payment methods
5. Scale to handle thousands of concurrent users

This plan provides a complete path from the current blockchain-heavy system to a responsive, user-friendly hybrid application that maintains security while dramatically improving user experience.
