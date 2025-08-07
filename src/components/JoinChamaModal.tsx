import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRosca } from '../hooks/useRosca';
import { useSupabase } from '../hooks/useSupabase';
import { useRoscaToast } from '../hooks/use-rosca-toast';
import { useUnitDisplay } from '../contexts/UnitDisplayContext';
import { formatAmount, formatDuration, parseCbtcToWei } from '../lib/unitConverter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Bitcoin,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JoinChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  initialGroupData?: any; // Pre-fetched group data from parent (optional)
  onGroupJoined?: () => void; // Callback for when group is successfully joined
}

// Define a more precise interface for group data within the modal
interface ModalGroupDetails {
  id: string;
  name: string;
  contribution: bigint; // Store as bigint internally for calculations
  roundLength: number; // In seconds
  maxMembers: number;
  memberCount: number;
  currentRound: number;
  nextRecipient: string | null;
  isActive: boolean;
  isClosed: boolean;
  // Add other fields if needed for display or logic
}

export const JoinChamaModal: React.FC<JoinChamaModalProps> = ({
  open,
  onOpenChange,
  groupId,
  initialGroupData,
  onGroupJoined
}) => {
  const [currentStep, setCurrentStep] = useState<'details' | 'preview' | 'transaction'>('details');
  const [groupInfo, setGroupInfo] = useState<ModalGroupDetails | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [maxSpendableFormatted, setMaxSpendableFormatted] = useState<string>('0'); // Formatted string
  const [canAfford, setCanAfford] = useState(false);

  const { primaryWallet } = useDynamicContext();
  const {
    joinGroup,
    getGroupInfo,
    isLoading: isTransactionLoading, // Renamed to avoid conflict with local isLoadingGroup
    isConnected,
    balance, // This is already a formatted string from useRosca
    isLoadingBalance,
    refreshBalance,
    getMaxSpendableAmount, // This returns a formatted string
    isGroupMember
  } = useRosca();
  const {
    logActivity,
    createNotification,
    awardAchievement
  } = useSupabase();
  const { memberJoined, error: showError, transactionPending } = useRoscaToast();
  const { displayUnit } = useUnitDisplay();

  // Reset modal state when it closes
  const resetModal = useCallback(() => {
    setGroupInfo(null);
    setCurrentStep('details');
    onOpenChange(false);
  }, [onOpenChange]);

  // Load group information when modal opens or groupId/connection changes
  useEffect(() => {
    const loadGroupData = async () => {
      console.log('🚀 JoinChamaModal useEffect triggered with:', {
        open,
        groupId,
        hasInitialData: !!initialGroupData,
        isConnected,
        primaryWallet: !!primaryWallet
      });

      if (!open || !groupId) {
        console.log('❌ Modal conditions not met:', { open, groupId });
        resetModal(); // Ensure modal is closed and state reset if conditions aren't met
        return;
      }

      if (!isConnected || !primaryWallet) {
        console.log('⚠️ Wallet not connected or not primary wallet available. Cannot load group info.');
        setIsLoadingGroup(false);
        setGroupInfo(null); // Clear group info if wallet is not ready
        showError('Wallet Not Connected', 'Please connect your wallet to view group details.');
        return;
      }

      setIsLoadingGroup(true);
      setGroupInfo(null); // Clear previous group info

      try {
        let rawGroupData: any;

        if (initialGroupData) {
          console.log('📦 Using pre-fetched initial group data');
          // Validate essential fields in initialGroupData
          const requiredFields = ['contribution', 'roundLength', 'maxMembers', 'memberCount', 'currentRound', 'isActive'];
          const missingFields = requiredFields.filter(field => initialGroupData[field] === undefined);

          if (missingFields.length > 0) {
            throw new Error(`Missing required fields in initial data: ${missingFields.join(', ')}`);
          }
          rawGroupData = initialGroupData;
        } else {
          console.log('🌐 No initial data, fetching from blockchain...');
          const numericId = parseInt(groupId);
          if (isNaN(numericId)) {
            throw new Error(`Invalid group ID: ${groupId}`);
          }
          rawGroupData = await getGroupInfo(numericId);
          if (!rawGroupData) {
            throw new Error('No group info returned from blockchain for ID: ' + numericId);
          }
        }

        console.log('📥 Raw group data:', rawGroupData);

        // Process raw group data into ModalGroupDetails format
        const processedGroupInfo: ModalGroupDetails = {
          id: groupId,
          name: `Group ${groupId}`, // Name is derived, not from contract directly
          contribution: rawGroupData.contribution, // Keep as BigInt
          roundLength: Number(rawGroupData.roundLength), // Keep as number (seconds)
          maxMembers: Number(rawGroupData.maxMembers),
          memberCount: Number(rawGroupData.memberCount),
          currentRound: Number(rawGroupData.currentRound),
          nextRecipient: rawGroupData.members?.[Number(rawGroupData.currentRound) % Number(rawGroupData.maxMembers)] || null,
          isActive: Boolean(rawGroupData.isActive),
          isClosed: !Boolean(rawGroupData.isActive)
        };

        setGroupInfo(processedGroupInfo);
        setCurrentStep('details'); // Always start at details step after loading

      } catch (error: any) {
        console.error('❌ ERROR loading group info:', error);
        showError('Failed to Load Group', error.message || 'Could not load group information. Please try again.');
        resetModal(); // Close modal on critical error
      } finally {
        setIsLoadingGroup(false);
      }
    };

    loadGroupData();
  }, [open, groupId, initialGroupData, isConnected, primaryWallet, getGroupInfo, showError, resetModal]);

  // Recalculate max spendable and affordability when groupInfo or balance changes
  useEffect(() => {
    const updateAffordability = async () => {
      if (!groupInfo || !isConnected) {
        setCanAfford(false);
        setMaxSpendableFormatted('0');
        return;
      }

      const maxSpendable = await getMaxSpendableAmount(); // This returns formatted string
      setMaxSpendableFormatted(maxSpendable);

      // Compare BigInt contribution with parsed BigInt maxSpendable
      const contributionBigInt = groupInfo.contribution;
      const maxSpendableBigInt = parseCbtcToWei(maxSpendable); // Convert formatted string back to BigInt

      setCanAfford(maxSpendableBigInt >= contributionBigInt);
    };
    updateAffordability();
  }, [groupInfo, isConnected, balance, getMaxSpendableAmount]);

  // Check if group is joinable (based on loaded groupInfo)
  const isGroupJoinable = useMemo(() => {
    if (!groupInfo) return false;
    return groupInfo.isActive && (groupInfo.memberCount < groupInfo.maxMembers);
  }, [groupInfo]);

  // Handle moving to preview step
  const handleProceedToPreview = useCallback(() => {
    if (!isConnected || !canAfford || !isGroupJoinable || !groupInfo) {
      return;
    }
    setCurrentStep('preview');
  }, [isConnected, canAfford, isGroupJoinable, groupInfo]);

  // Handle actual transaction submission
  const handleTransactionSubmit = useCallback(async () => {
    if (!isConnected || !primaryWallet?.address || !groupInfo) return;

    try {
      setCurrentStep('transaction');
      const numericId = parseInt(groupId); // groupId is already validated as string
      
      const isMember = await isGroupMember(numericId);
      if (isMember) {
        showError('Already a member', 'You are already a member of this group.');
        resetModal();
        return;
      }

      const pendingToast = transactionPending("group join");

      console.log('🔄 Joining group on blockchain with ID:', numericId);
      const hash = await joinGroup(numericId);

      if (!hash) {
        throw new Error('Failed to get transaction hash.');
      }

      console.log('✅ Transaction hash received:', hash);
      pendingToast.dismiss();

      memberJoined(
        groupInfo.name || `Group ${groupId}`,
        groupInfo.contribution, // Pass BigInt to toast for formatting
        hash
      );

      // Optional logging, achievements, notifications (non-critical)
      try {
        await logActivity(
          'group_joined',
          'chama',
          groupId,
          `Joined ROSCA group "${groupInfo.name || `Group ${groupId}`}"`,
          {
            group_name: groupInfo.name || `Group ${groupId}`,
            contribution_amount: formatAmount(groupInfo.contribution, displayUnit), // Format for logging
            transaction_hash: hash
          }
        );
      } catch (activityError) {
        console.warn('⚠️ Could not log activity:', activityError);
      }

      try {
        await awardAchievement('first-group', {
          transaction_hash: hash,
          group_id: groupId
        });
        console.log('✅ First group achievement awarded');
      } catch (achievementError) {
        console.warn('⚠️ Could not award achievement:', achievementError);
      }

      try {
        await createNotification(
          primaryWallet.address,
          'Successfully Joined Group! 🎉',
          `You have successfully joined "${groupInfo.name || `Group ${groupId}`}". Your first contribution is due soon.`,
          'success',
          {
            group_name: groupInfo.name || `Group ${groupId}`,
            transaction_hash: hash,
            contribution_amount: formatAmount(groupInfo.contribution, displayUnit), // Format for notification
            group_id: groupId
          }
        );
        console.log('✅ Group join notification sent');
      } catch (notificationError) {
        console.warn('⚠️ Could not create notification:', notificationError);
      }

      if (onGroupJoined) {
        onGroupJoined();
      }

      setTimeout(() => resetModal(), 2000);
    } catch (err: any) {
      console.error('❌ Error joining group:', err);
      showError("Failed to Join Group", err.message || "Please try again or check your wallet connection.");
      setCurrentStep('preview'); // Go back to preview step on error
    }
  }, [isConnected, primaryWallet, groupInfo, groupId, isGroupMember, showError, transactionPending, joinGroup, memberJoined, logActivity, awardAchievement, createNotification, onGroupJoined, displayUnit, resetModal]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={resetModal}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-md mx-4 bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-border">
              <div className="w-8 h-8 bg-gradient-to-br from-bitcoin-orange to-bitcoin-yellow rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">₿</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                  {currentStep === 'details' && 'Join Chama'}
                  {currentStep === 'preview' && 'Review Details'}
                  {currentStep === 'transaction' && 'Joining Chama'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStep === 'details' && 'View group details before joining'}
                  {currentStep === 'preview' && 'Confirm your participation'}
                  {currentStep === 'transaction' && 'Please wait...'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetModal}
                disabled={isTransactionLoading}
                className="ml-auto h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${currentStep === 'details'
                ? 'bg-bitcoin-orange text-white shadow-bitcoin'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                1
              </div>
              <div className={`w-8 h-1 rounded transition-all ${['preview', 'transaction'].includes(currentStep)
                ? 'bg-bitcoin-orange'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${currentStep === 'preview'
                ? 'bg-bitcoin-orange text-white shadow-bitcoin'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                2
              </div>
              <div className={`w-8 h-1 rounded transition-all ${currentStep === 'transaction'
                ? 'bg-bitcoin-orange'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${currentStep === 'transaction'
                ? 'bg-bitcoin-orange text-white shadow-bitcoin'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                3
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {/* Details Step */}
                {currentStep === 'details' && (
                  <motion.div
                    key="details-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {isLoadingGroup ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-bitcoin-orange mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading group information...</p>
                      </div>
                    ) : groupInfo ? (
                      <>
                        {/* Group Status */}
                        {!isGroupJoinable && (
                          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2">
                              <span className="text-red-500">⚠️</span>
                              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {groupInfo.isClosed ? 'This group has been closed' : 'This group is full'}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Group Information Card */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Group Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Name:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {groupInfo.name || `Group ${groupId}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Contribution:</span>
                              <span className="font-mono text-gray-900 dark:text-white">
                                {formatAmount(groupInfo.contribution, displayUnit)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Round Duration:</span>
                              <span className="text-gray-900 dark:text-white">
                                {formatDuration(groupInfo.roundLength)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Members:</span>
                              <span className="text-gray-900 dark:text-white">
                                {groupInfo.memberCount.toString()} / {groupInfo.maxMembers.toString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-400">Current Round:</span>
                              <span className="text-gray-900 dark:text-white">
                                Round {groupInfo.currentRound.toString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Security Deposit Info */}
                        <div className="p-4 bg-bitcoin-orange/10 border border-bitcoin-orange/20 rounded-lg">
                          <div className="flex items-start gap-2">
                            <span className="w-4 h-4 text-bitcoin-orange mt-0.5">ℹ️</span>
                            <div className="text-sm text-bitcoin-orange">
                              <div className="font-medium mb-1">Security Deposit Required</div>
                              <div className="space-y-1 text-xs">
                                <div>• You'll deposit <strong>{formatAmount(groupInfo.contribution, displayUnit)}</strong> as collateral</div>
                                <div>• Returned after completing all rounds</div>
                                <div>• Ensures commitment from all members</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Balance Check */}
                        {!canAfford && (
                          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                            <div className="flex items-start gap-2">
                              <span className="text-orange-500">⚠️</span>
                              <div>
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                                  Insufficient Balance
                                </p>
                                <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                                  You need {formatAmount(groupInfo.contribution, displayUnit)} to join. Your available balance is {maxSpendableFormatted}.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Your Balance */}
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <span>Your Balance:</span>
                            {isLoadingBalance ? (
                              <span className="animate-pulse">Loading...</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span className="font-mono">{formatAmount(parseCbtcToWei(balance), displayUnit)}</span>
                                <Button
                                  type="button"
                                  onClick={refreshBalance}
                                  className="text-bitcoin hover:text-bitcoin-dark transition-colors"
                                  disabled={isLoadingBalance}
                                  title="Refresh balance"
                                  variant="ghost"
                                  size="sm"
                                >
                                  🔄
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span>Available:</span>
                            <span className="font-mono text-bitcoin">
                              {maxSpendableFormatted}
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">Unable to load group information</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Preview Step */}
                {currentStep === 'preview' && groupInfo && (
                  <motion.div
                    key="preview-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Confirm Your Participation
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Review the details before joining this chama
                      </p>
                    </div>

                    {/* Transaction Summary */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Participation Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Joining:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {groupInfo.name || `Group ${groupId}`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Monthly Contribution:</span>
                          <span className="font-mono text-gray-900 dark:text-white">
                            {formatAmount(groupInfo.contribution, displayUnit)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Total Cycles:</span>
                          <span className="text-gray-900 dark:text-white">
                            {groupInfo.maxMembers.toString()} rounds
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expected Payout:</span>
                          <span className="font-mono text-bitcoin-orange">
                            {formatAmount(groupInfo.contribution * BigInt(groupInfo.maxMembers), displayUnit)}
                          </span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                          <div className="flex justify-between font-medium">
                            <span className="text-gray-600 dark:text-gray-400">Initial Deposit:</span>
                            <span className="font-mono text-bitcoin-orange">
                              {formatAmount(groupInfo.contribution, displayUnit)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This serves as your security deposit
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Commitment Info */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <span>ℹ️</span>
                        Your Commitment
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <div>• Make contributions on time each round</div>
                        <div>• Stay until all members receive their payouts</div>
                        <div>• Your turn for payout will be assigned randomly</div>
                        <div>• Security deposit returned after all rounds complete</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Transaction Step */}
                {currentStep === 'transaction' && (
                  <motion.div
                    key="transaction-step"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Joining Chama
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please confirm the transaction in your wallet
                      </p>
                    </div>

                    {/* Loading State */}
                    <div className="p-6 bg-bitcoin-orange/10 rounded-lg border border-bitcoin-orange/20">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <Loader2 className="h-8 w-8 animate-spin text-bitcoin-orange" />
                        <span className="font-medium text-bitcoin-orange">
                          {isTransactionLoading ? 'Processing transaction...' : 'Waiting for confirmation...'}
                        </span>
                      </div>

                      <div className="text-center text-sm text-bitcoin-orange/80">
                        This may take a few moments. Please don't close this window.
                      </div>
                    </div>

                    {/* Summary */}
                    {groupInfo && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Transaction Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Joining:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {groupInfo.name || `Group ${groupId}`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Deposit:</span>
                            <span className="font-mono text-bitcoin-orange">
                              {formatAmount(groupInfo.contribution, displayUnit)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-border">
              {currentStep === 'details' && (
                <>
                  <Button
                    type="button"
                    onClick={resetModal}
                    className="flex-1"
                    variant="outline"
                    disabled={isLoadingGroup || isTransactionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleProceedToPreview}
                    className="flex-1"
                    variant="bitcoin"
                    disabled={isLoadingGroup || !isConnected || !canAfford || !isGroupJoinable || isTransactionLoading}
                  >
                    {!isConnected ? (
                      <>🔗 Connect Wallet</>
                    ) : !canAfford ? (
                      <>❌ Insufficient Balance</>
                    ) : !isGroupJoinable ? (
                      <>❌ Cannot Join</>
                    ) : (
                      <>Continue →</>
                    )}
                  </Button>
                </>
              )}

              {currentStep === 'preview' && (
                <>
                  <Button
                    type="button"
                    onClick={() => setCurrentStep('details')}
                    className="flex-1"
                    variant="outline"
                    disabled={isTransactionLoading}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleTransactionSubmit}
                    className="flex-1"
                    variant="bitcoin"
                    disabled={isTransactionLoading}
                  >
                    ✓ Confirm & Join
                  </Button>
                </>
              )}

              {currentStep === 'transaction' && (
                <Button
                  type="button"
                  onClick={resetModal}
                  className="flex-1"
                  variant="outline"
                  disabled={isTransactionLoading}
                >
                  Close
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};