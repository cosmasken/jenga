/**
 * JoinGroupModal Component
 * Handles the group joining flow with contribution payment
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRosca, type RoscaGroup } from '@/hooks/useRosca';
import { useSupabase } from '@/hooks/useSupabase';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Bitcoin, 
  Clock, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Info
} from 'lucide-react';
import { formatEther } from 'viem';

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: number | null;
}

export function JoinGroupModal({ isOpen, onClose, groupId }: JoinGroupModalProps) {
  const { primaryWallet } = useDynamicContext();
  const { 
    joinGroup, 
    getGroupInfo, 
    isLoading, 
    balance, 
    formatContribution,
    getMaxSpendableAmount 
  } = useRosca();
  const { 
    joinGroup: joinSupabaseGroup,
    logActivity,
    createNotification 
  } = useSupabase();
  const { success, error: showError, transactionPending } = useRoscaToast();

  const [groupInfo, setGroupInfo] = useState<RoscaGroup | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [currentStep, setCurrentStep] = useState<'loading' | 'review' | 'joining' | 'success'>('loading');
  const [maxSpendable, setMaxSpendable] = useState<string>('0');
  const [canAfford, setCanAfford] = useState(false);

  // Load group information when modal opens
  useEffect(() => {
    if (isOpen && groupId) {
      loadGroupInfo();
    }
  }, [isOpen, groupId]);

  const loadGroupInfo = async () => {
    if (!groupId) return;

    try {
      setIsLoadingGroup(true);
      setCurrentStep('loading');

      const info = await getGroupInfo(groupId);
      if (!info) {
        throw new Error('Group not found');
      }

      setGroupInfo(info);
      
      // Check if user can afford to join
      const maxSpend = await getMaxSpendableAmount();
      setMaxSpendable(maxSpend);
      
      const contributionAmount = parseFloat(formatContribution(info.contribution));
      const canAffordJoin = parseFloat(maxSpend) >= contributionAmount;
      setCanAfford(canAffordJoin);
      
      setCurrentStep('review');
    } catch (error) {
      console.error('❌ Failed to load group info:', error);
      showError('Failed to Load Group', 'Could not load group information.');
      onClose();
    } finally {
      setIsLoadingGroup(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupInfo || !primaryWallet?.address) return;

    try {
      setCurrentStep('joining');
      
      const pendingToast = transactionPending("joining group");
      
      // Step 1: Join group on blockchain
      console.log('🔄 Joining group on blockchain...');
      const hash = await joinGroup(groupInfo.id);
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Join transaction hash:', hash);

      // Step 2: Update Supabase (only after transaction hash is returned)
      console.log('🔄 Updating Supabase group membership...');
      const supabaseSuccess = await joinSupabaseGroup(groupInfo.id.toString());
      
      if (!supabaseSuccess) {
        console.warn('⚠️ Failed to update Supabase membership');
        // Don't fail the entire process for this
      }

      // Step 3: Log activity
      await logActivity(
        'group_joined',
        'group',
        groupInfo.id.toString(),
        `Joined ROSCA group: ${groupInfo.id}`,
        {
          group_id: groupInfo.id,
          transaction_hash: hash,
          contribution_amount: formatContribution(groupInfo.contribution)
        }
      );

      // Step 4: Create notification
      try {
        await createNotification({
          user_wallet_address: primaryWallet.address,
          title: 'Successfully Joined Group! 🎉',
          message: `You have joined the ROSCA group and your contribution has been processed.`,
          type: 'success',
          category: 'group',
          group_id: groupInfo.id.toString(),
          data: {
            group_id: groupInfo.id,
            transaction_hash: hash,
            contribution_amount: formatContribution(groupInfo.contribution)
          }
        });
      } catch (notificationError) {
        console.warn('⚠️ Could not create notification:', notificationError);
      }

      pendingToast.dismiss();
      success('Joined Group!', `You have successfully joined the ROSCA group.`);
      
      setCurrentStep('success');
      setTimeout(() => onClose(), 2000);
      
    } catch (error) {
      console.error('❌ Failed to join group:', error);
      showError('Join Failed', 'Could not join the group. Please try again.');
      setCurrentStep('review');
    }
  };

  const handleClose = () => {
    if (currentStep !== 'joining') {
      onClose();
      // Reset state
      setTimeout(() => {
        setCurrentStep('loading');
        setGroupInfo(null);
      }, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-bitcoin-orange to-bitcoin-yellow rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Join ROSCA Group
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={currentStep === 'joining'}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {currentStep === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-bitcoin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading group information...</p>
              </motion.div>
            )}

            {currentStep === 'review' && groupInfo && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Group Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Group Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Group ID:</span>
                      <Badge variant="secondary">#{groupInfo.id}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Members:</span>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {groupInfo.memberCount} / {groupInfo.maxMembers}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Contribution:</span>
                      <div className="flex items-center gap-2">
                        <Bitcoin className="h-4 w-4 text-bitcoin" />
                        <span className="text-sm font-medium">
                          {formatContribution(groupInfo.contribution)} cBTC
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Round Length:</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {Math.floor(groupInfo.roundLength / (24 * 60 * 60))} days
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={groupInfo.isActive ? "default" : "secondary"}>
                          {groupInfo.isActive ? "Accepting Members" : "Closed"}
                        </Badge>
                        {!groupInfo.isActive && (
                          <Info 
                            className="h-4 w-4 text-orange-500 cursor-help" 
                            title="This group has been closed by the creator. Contact the group creator to request access."
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Group Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Members Joined</span>
                        <span>{groupInfo.memberCount} / {groupInfo.maxMembers}</span>
                      </div>
                      <Progress 
                        value={(groupInfo.memberCount / groupInfo.maxMembers) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-gray-500">
                        {groupInfo.maxMembers - groupInfo.memberCount} spots remaining
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Balance Check */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      {canAfford ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {canAfford ? 'Sufficient Balance' : 'Insufficient Balance'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Your balance: {balance} cBTC
                          <br />
                          Required: {formatContribution(groupInfo.contribution)} cBTC
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                {!groupInfo.isActive && (
                  <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            Group Not Accepting Members
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                            This group has been closed by the creator. The group may be full, completed, or temporarily closed for new members.
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                            Creator: {groupInfo.creator.slice(0, 6)}...{groupInfo.creator.slice(-4)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {currentStep === 'joining' && (
              <motion.div
                key="joining"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-bitcoin mb-4" />
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                  Joining Group...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Please confirm the transaction in your wallet
                </p>
              </motion.div>
            )}

            {currentStep === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                  Successfully Joined!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  You are now a member of this ROSCA group
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {currentStep === 'review' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleJoinGroup}
              disabled={!canAfford || !groupInfo?.isActive || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Join Group
                </>
              )}
            </Button>
          </div>
        )}
      </motion.div>
    </>
  );
}
