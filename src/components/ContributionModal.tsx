/**
 * ContributionModal Component
 * Handles contribution payments to ROSCA groups
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
  Bitcoin, 
  Clock, 
  Users,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  Target,
  Wallet
} from 'lucide-react';
import { formatEther } from 'viem';

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupInfo: RoscaGroup | null;
  onContributionMade?: () => void;
}

export function ContributionModal({ 
  isOpen, 
  onClose, 
  groupInfo, 
  onContributionMade 
}: ContributionModalProps) {
  const { primaryWallet } = useDynamicContext();
  const { 
    contribute, 
    isLoading, 
    balance, 
    formatContribution,
    getMaxSpendableAmount 
  } = useRosca();
  const { 
    logActivity,
    createNotification 
  } = useSupabase();
  const { success, error: showError, transactionPending } = useRoscaToast();

  const [currentStep, setCurrentStep] = useState<'review' | 'contributing' | 'success'>('review');
  const [maxSpendable, setMaxSpendable] = useState<string>('0');
  const [canAfford, setCanAfford] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Calculate affordability and time remaining
  useEffect(() => {
    if (isOpen && groupInfo) {
      checkAffordability();
      calculateTimeRemaining();
      
      // Update time remaining every minute
      const interval = setInterval(calculateTimeRemaining, 60000);
      return () => clearInterval(interval);
    }
  }, [isOpen, groupInfo, balance]);

  const checkAffordability = async () => {
    if (!groupInfo) return;

    try {
      const maxSpend = await getMaxSpendableAmount();
      setMaxSpendable(maxSpend);
      
      const contributionAmount = parseFloat(formatContribution(groupInfo.contribution));
      const canAffordContribution = parseFloat(maxSpend) >= contributionAmount;
      setCanAfford(canAffordContribution);
    } catch (error) {
      console.error('❌ Failed to check affordability:', error);
    }
  };

  const calculateTimeRemaining = () => {
    if (!groupInfo || groupInfo.nextDue === 0) return;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = groupInfo.nextDue - now;

    if (timeLeft <= 0) {
      setTimeRemaining('Overdue');
      return;
    }

    const days = Math.floor(timeLeft / (24 * 60 * 60));
    const hours = Math.floor((timeLeft % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((timeLeft % (60 * 60)) / 60);

    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m`);
    } else {
      setTimeRemaining(`${minutes}m`);
    }
  };

  const handleContribute = async () => {
    if (!groupInfo || !primaryWallet?.address) return;

    try {
      setCurrentStep('contributing');
      
      const pendingToast = transactionPending("making contribution");
      
      // Step 1: Make contribution on blockchain
      console.log('🔄 Making contribution to group:', groupInfo.id);
      const hash = await contribute(groupInfo.id);
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Contribution transaction hash:', hash);

      // Step 2: Log activity (only after transaction hash is returned)
      await logActivity(
        'contribution_made',
        'group',
        groupInfo.id.toString(),
        `Made contribution to ROSCA group ${groupInfo.id}`,
        {
          group_id: groupInfo.id,
          contribution_amount: formatContribution(groupInfo.contribution),
          round: groupInfo.currentRound,
          transaction_hash: hash
        }
      );

      // Step 3: Create notifications for group members
      try {
        if (groupInfo.members) {
          for (const member of groupInfo.members) {
            if (member !== primaryWallet.address) {
              await createNotification(
                member,
                'Member Made Contribution 💰',
                `A group member has made their contribution for round ${groupInfo.currentRound}.`,
                'success',
                {
                  group_id: groupInfo.id,
                  round: groupInfo.currentRound,
                  transaction_hash: hash
                }
              );
            }
          }
        }

        // Special notification for user
        await createNotification(
          primaryWallet.address,
          'Contribution Successful! ✅',
          `Your contribution of ${formatContribution(groupInfo.contribution)} cBTC has been processed for round ${groupInfo.currentRound}.`,
          'success',
          {
            group_id: groupInfo.id,
            contribution_amount: formatContribution(groupInfo.contribution),
            round: groupInfo.currentRound,
            transaction_hash: hash
          }
        );
      } catch (notificationError) {
        console.warn('⚠️ Could not create notifications:', notificationError);
      }

      pendingToast.dismiss();
      success('Contribution Made!', `Your contribution has been processed successfully.`);
      
      setCurrentStep('success');
      onContributionMade?.();
      setTimeout(() => onClose(), 2000);
      
    } catch (error) {
      console.error('❌ Failed to make contribution:', error);
      showError('Contribution Failed', 'Could not process your contribution. Please try again.');
      setCurrentStep('review');
    }
  };

  const handleClose = () => {
    if (currentStep !== 'contributing') {
      onClose();
      // Reset state
      setTimeout(() => {
        setCurrentStep('review');
      }, 300);
    }
  };

  const isOverdue = groupInfo && groupInfo.nextDue > 0 && groupInfo.nextDue < Math.floor(Date.now() / 1000);
  const contributionAmount = groupInfo ? formatContribution(groupInfo.contribution) : '0';

  if (!isOpen || !groupInfo) return null;

  return (
    <>
      {/* Container with centering */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
        >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-bitcoin-orange to-bitcoin-yellow rounded-lg flex items-center justify-center">
              <Bitcoin className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Make Contribution
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={currentStep === 'contributing'}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Group Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Contribution Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Group ID:</span>
                      <Badge variant="secondary">#{groupInfo.id}</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Round:</span>
                      <Badge variant="default">Round {groupInfo.currentRound}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <div className="flex items-center gap-2">
                        <Bitcoin className="h-4 w-4 text-bitcoin" />
                        <span className="text-sm font-medium">
                          {contributionAmount} cBTC
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                          {timeRemaining || 'Calculating...'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Round Progress */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Round Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Expected Payout</span>
                        <span className="font-medium">
                          {formatEther(groupInfo.contribution * BigInt(groupInfo.memberCount))} cBTC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Round Length</span>
                        <span>{Math.floor(groupInfo.roundLength / (24 * 60 * 60))} days</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Group Members</span>
                        <span>{Number(groupInfo.memberCount)}</span>
                      </div>
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
                          Required: {contributionAmount} cBTC
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Warnings */}
                {isOverdue && (
                  <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-200">
                            Contribution Overdue
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                            This contribution is past the due date. Please contribute as soon as possible.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {groupInfo.currentRound === 0 && (
                  <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            Round Not Started
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                            The first round hasn't started yet. Contributions will begin once all members have joined.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            {currentStep === 'contributing' && (
              <motion.div
                key="contributing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8"
              >
                <Loader2 className="h-8 w-8 animate-spin text-bitcoin mb-4" />
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                  Processing Contribution...
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
                  Contribution Successful!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Your contribution has been processed
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
              onClick={handleContribute}
              disabled={!canAfford || groupInfo.currentRound === 0 || isLoading}
              className="min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Contributing...
                </>
              ) : (
                <>
                  <Bitcoin className="h-4 w-4 mr-2" />
                  Contribute {contributionAmount} cBTC
                </>
              )}
            </Button>
          </div>
        )}
        </motion.div>
      </div>
    </>
  );
}
