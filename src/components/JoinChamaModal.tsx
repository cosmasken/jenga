import React, { useState, useEffect } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRosca } from '../hooks/useRosca';
import { useSupabase } from '../hooks/useSupabase';
import { useRoscaToast } from '../hooks/use-rosca-toast';

interface JoinChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  initialGroupData?: any; // Pre-fetched group data from parent (optional)
  onGroupJoined?: () => void; // Callback for when group is successfully joined
}

interface GroupDetails {
  id: string;
  name: string;
  contribution: string;
  roundLength: number;
  maxMembers: number;
  memberCount: number;
  currentRound: number;
  nextRecipient: string | null;
  isActive: boolean;
  isClosed: boolean;
}

export const JoinChamaModal: React.FC<JoinChamaModalProps> = ({
  open,
  onOpenChange,
  groupId,
  initialGroupData,
  onGroupJoined
}) => {
  const [currentStep, setCurrentStep] = useState<'details' | 'preview' | 'transaction'>('details');
  const [groupInfo, setGroupInfo] = useState<GroupDetails | null>(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const [maxSpendable, setMaxSpendable] = useState<string>('0');

  const { primaryWallet } = useDynamicContext();
  const {
    joinGroup,
    getGroupInfo,
    isLoading,
    isConnected,
    balance,
    isLoadingBalance,
    refreshBalance,
    getMaxSpendableAmount,
    isGroupMember
  } = useRosca();
  const {
    logActivity,
    createNotification,
    awardAchievement
  } = useSupabase();
  const { memberJoined, error: showError, transactionPending } = useRoscaToast();

  // Load group information when modal opens
  useEffect(() => {
    const loadGroupInfo = async () => {
      console.log('🚀 JoinChamaModal useEffect triggered with:', {
        open,
        groupId,
        hasInitialData: !!initialGroupData,
        isConnected,
        primaryWallet: !!primaryWallet
      });
      
      if (open && groupId) {
        console.log('✅ Modal conditions met, proceeding to load group info');
        
        // Reset any previous error state
        setGroupInfo(null);
        
        // If we have initial data, use it directly
        if (initialGroupData) {
          console.log('📦 Using pre-fetched initial group data');
          console.log('📦 Raw initialGroupData:', JSON.stringify(initialGroupData, (key, value) =>
            typeof value === 'bigint'
              ? value.toString()
              : value
          , 2));
          
          setIsLoadingGroup(true);
          try {
            // Check if initialGroupData has the required fields
            const requiredFields = ['contribution', 'roundLength', 'maxMembers', 'memberCount', 'currentRound', 'isActive'];
            const missingFields = requiredFields.filter(field => initialGroupData[field] === undefined);
            
            if (missingFields.length > 0) {
              throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
            }
            
            console.log('🔄 Processing initial group data...');
            
            // Convert contribution from Wei to cBTC (assuming 18 decimals)
            const contributionWei = initialGroupData.contribution;
            console.log('💰 Contribution Wei value:', contributionWei, typeof contributionWei);
            
            const contributionInCBTC = (parseFloat(contributionWei.toString()) / 1e18).toFixed(6);
            console.log('💰 Contribution in cBTC:', contributionInCBTC);

            const processedGroupInfo = {
              id: groupId,
              name: `Group ${groupId}`,
              contribution: contributionInCBTC,
              roundLength: Number(initialGroupData.roundLength),
              maxMembers: Number(initialGroupData.maxMembers),
              memberCount: Number(initialGroupData.memberCount),
              currentRound: Number(initialGroupData.currentRound),
              nextRecipient: initialGroupData.members?.[Number(initialGroupData.currentRound) % Number(initialGroupData.maxMembers)] || null,
              isActive: Boolean(initialGroupData.isActive),
              isClosed: !Boolean(initialGroupData.isActive)
            };
            
            console.log('✅ Successfully processed group info:', processedGroupInfo);
            setGroupInfo(processedGroupInfo);
            
          } catch (error) {
            console.error('❌ ERROR processing initial group data:', error);
            console.error('❌ Error details:', {
              message: error.message,
              stack: error.stack,
              initialGroupData
            });
            showError('Failed to load group', 'Could not process group information. Please try again.');
          } finally {
            console.log('🏁 Finished processing initial data, setting loading to false');
            setIsLoadingGroup(false);
          }
          
        } else if (isConnected && primaryWallet) {
          console.log('🌐 No initial data, fetching from blockchain...');
          setIsLoadingGroup(true);
          
          try {
            const numericId = parseInt(groupId);
            if (isNaN(numericId)) {
              throw new Error(`Invalid group ID: ${groupId}`);
            }
            
            if (!info) {
              console.error('❌ getGroupInfo returned null/undefined for ID:', numericId);
            }

            if (info) {
              const contributionInCBTC = (parseFloat(info.contribution.toString()) / 1e18).toFixed(6);
              
              const processedGroupInfo = {
                id: groupId,
                name: `Group ${groupId}`,
                contribution: contributionInCBTC,
                roundLength: Number(info.roundLength),
                maxMembers: Number(info.maxMembers),
                memberCount: Number(info.memberCount),
                currentRound: Number(info.currentRound),
                nextRecipient: info.members?.[Number(info.currentRound) % Number(info.maxMembers)] || null,
                isActive: Boolean(info.isActive),
                isClosed: !Boolean(info.isActive)
              };
              
              console.log('✅ Successfully fetched and processed blockchain data:', processedGroupInfo);
              setGroupInfo(processedGroupInfo);
            } else {
              console.error('❌ getGroupInfo returned null/undefined');
              throw new Error('No group info returned from blockchain');
            }
            
          } catch (error) {
            console.error('❌ ERROR fetching group info from blockchain:', error);
            console.error('❌ Error details:', {
              message: error.message,
              stack: error.stack,
              groupId,
              numericId: parseInt(groupId)
            });
            showError('Failed to load group', 'Could not load group information. Please try again.');
          } finally {
            console.log('🏁 Finished blockchain fetch, setting loading to false');
            setIsLoadingGroup(false);
          }
          
        } else {
          console.log('⚠️ Cannot load group info:', {
            hasInitialData: !!initialGroupData,
            isConnected,
            hasPrimaryWallet: !!primaryWallet
          });
          setIsLoadingGroup(false);
        }
      } else {
        console.log('❌ Modal conditions not met:', { open, groupId });
      }
    };

    loadGroupInfo();
  }, [open, groupId, initialGroupData, isConnected, getGroupInfo, showError, primaryWallet]);

  // Get max spendable amount when modal opens or balance changes
  useEffect(() => {
    if (open && isConnected) {
      getMaxSpendableAmount().then(setMaxSpendable);
    }
  }, [open, isConnected, balance, getMaxSpendableAmount]);

  // Check if user has enough balance
  const hasEnoughBalance = React.useMemo(() => {
    if (!groupInfo || !balance) return false;

    try {
      const contributionNum = parseFloat(groupInfo.contribution);
      const balanceNum = parseFloat(balance);
      const maxSpendableNum = parseFloat(maxSpendable);

      return contributionNum <= maxSpendableNum;
    } catch {
      return false;
    }
  }, [groupInfo, balance, maxSpendable]);

  // Check if group is joinable
  const isJoinable = React.useMemo(() => {
    if (!groupInfo) return false;

    // Check if group is closed or full
    if (groupInfo.isClosed) return false;
    if (groupInfo.memberCount >= groupInfo.maxMembers) return false;

    return true;
  }, [groupInfo]);

  // Reset modal state
  const resetModal = () => {
    setCurrentStep('details');
    setGroupInfo(null);
    onOpenChange(false);
  };

  // Handle moving to preview step
  const handleProceedToPreview = () => {
    if (!isConnected || !hasEnoughBalance || !isJoinable) {
      return;
    }
    setCurrentStep('preview');
  };

  // Handle actual transaction submission
  const handleTransactionSubmit = async () => {
    if (!isConnected || !primaryWallet?.address || !groupInfo) return;

    try {
      setCurrentStep('transaction');

      // Convert string ID to number for blockchain calls
      const numericId = parseInt(groupId);
      if (isNaN(numericId)) {
        throw new Error('Invalid group ID');
      }

      // Check if already a member
      const isMember = await isGroupMember(numericId);
      if (isMember) {
        showError('Already a member', 'You are already a member of this group');
        resetModal();
        return;
      }

      // Show pending transaction toast
      const pendingToast = transactionPending("group join");

      // Send blockchain transaction
      console.log('🔄 Joining group on blockchain with ID:', numericId);
      const hash = await joinGroup(numericId);

      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Transaction hash received:', hash);

      // Dismiss pending toast
      pendingToast.dismiss();

      // Show success message
      memberJoined(
        groupInfo.name || `Group ${groupId}`,
        groupInfo.contribution,
        hash
      );

      // Optional: Log activity for analytics (non-critical)
      try {
        await logActivity(
          'group_joined',
          'chama',
          groupId,
          `Joined ROSCA group "${groupInfo.name || `Group ${groupId}`}"`,
          {
            group_name: groupInfo.name || `Group ${groupId}`,
            contribution_amount: groupInfo.contribution,
            transaction_hash: hash
          }
        );
      } catch (activityError) {
        console.warn('⚠️ Could not log activity:', activityError);
      }

      // Optional: Award achievement for joining first group (non-critical)
      try {
        await awardAchievement('first-group', {
          transaction_hash: hash,
          group_id: groupId
        });
        console.log('✅ First group achievement awarded');
      } catch (achievementError) {
        console.warn('⚠️ Could not award achievement:', achievementError);
      }

      // Optional: Create notification for group join (non-critical)
      try {
        await createNotification(
          primaryWallet.address,
          'Successfully Joined Group! 🎉',
          `You have successfully joined "${groupInfo.name || `Group ${groupId}`}". Your first contribution is due soon.`,
          'success',
          {
            group_name: groupInfo.name || `Group ${groupId}`,
            transaction_hash: hash,
            contribution_amount: groupInfo.contribution,
            group_id: groupId
          }
        );
        console.log('✅ Group join notification sent');
      } catch (notificationError) {
        console.warn('⚠️ Could not create notification:', notificationError);
      }

      // Trigger callback for dashboard refresh
      if (onGroupJoined) {
        onGroupJoined();
      }

      setTimeout(() => resetModal(), 2000);
    } catch (err) {
      console.error('❌ Error joining group:', err);
      showError("Failed to Join Group", "Please try again or check your wallet connection");
      setCurrentStep('preview'); // Go back to preview step
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={resetModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-card rounded-xl border border-gray-200 dark:border-border shadow-2xl">
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
          {/* Details Step */}
          {currentStep === 'details' && (
            <div className="space-y-4">
              {isLoadingGroup ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin-orange"></div>
                </div>
              ) : groupInfo ? (
                <>
                  {/* Group Status */}
                  {!isJoinable && (
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
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                      Group Details
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Name:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {groupInfo.name || `Group ${groupId}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Contribution:</span>
                        <span className="font-mono text-gray-900 dark:text-white">
                          {groupInfo.contribution} cBTC
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Round Duration:</span>
                        <span className="text-gray-900 dark:text-white">
                          {Number(groupInfo.roundLength) / (24 * 60 * 60)} days
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
                    </div>
                  </div>

                  {/* Security Deposit Info */}
                  <div className="p-4 bg-bitcoin-orange/10 border border-bitcoin-orange/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 text-bitcoin-orange mt-0.5">ℹ️</span>
                      <div className="text-sm text-bitcoin-orange">
                        <div className="font-medium mb-1">Security Deposit Required</div>
                        <div className="space-y-1 text-xs">
                          <div>• You'll deposit <strong>{groupInfo.contribution} cBTC</strong> as collateral</div>
                          <div>• Returned after completing all rounds</div>
                          <div>• Ensures commitment from all members</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance Check */}
                  {!hasEnoughBalance && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-500">⚠️</span>
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            Insufficient Balance
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                            You need {groupInfo.contribution} cBTC to join. Your available balance is {maxSpendable} cBTC.
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
                          <span className="font-mono">{parseFloat(balance).toFixed(6)} cBTC</span>
                          <button
                            type="button"
                            onClick={async () => {
                              await refreshBalance();
                              const maxAmount = await getMaxSpendableAmount();
                              setMaxSpendable(maxAmount);
                            }}
                            className="text-bitcoin hover:text-bitcoin-dark transition-colors"
                            disabled={isLoadingBalance}
                            title="Refresh balance"
                          >
                            🔄
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Available:</span>
                      <span className="font-mono text-bitcoin">
                        {parseFloat(maxSpendable).toFixed(6)} cBTC
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Unable to load group information</p>
                </div>
              )}
            </div>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && groupInfo && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Confirm Your Participation
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review the details before joining this chama
                </p>
              </div>

              {/* Transaction Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                  Participation Summary
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Joining:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {groupInfo.name || `Group ${groupId}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Monthly Contribution:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {groupInfo.contribution} cBTC
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
                      {(parseFloat(groupInfo.contribution) * Number(groupInfo.maxMembers)).toFixed(4)} cBTC
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Initial Deposit:</span>
                      <span className="font-mono text-bitcoin-orange">
                        {groupInfo.contribution} cBTC
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      This serves as your security deposit
                    </div>
                  </div>
                </div>
              </div>

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
            </div>
          )}

          {/* Transaction Step */}
          {currentStep === 'transaction' && (
            <div className="space-y-6">
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
                  <div className="spinner border-bitcoin-orange"></div>
                  <span className="font-medium text-bitcoin-orange">
                    {isLoading ? 'Processing transaction...' : 'Waiting for confirmation...'}
                  </span>
                </div>

                <div className="text-center text-sm text-bitcoin-orange/80">
                  This may take a few moments. Please don't close this window.
                </div>
              </div>

              {/* Summary */}
              {groupInfo && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                    Transaction Summary
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Joining:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {groupInfo.name || `Group ${groupId}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deposit:</span>
                      <span className="font-mono text-bitcoin-orange">
                        {groupInfo.contribution} cBTC
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-border">
          {currentStep === 'details' && (
            <>
              <button
                type="button"
                onClick={resetModal}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedToPreview}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white rounded-lg hover:shadow-bitcoin disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isLoading || !isConnected || !hasEnoughBalance || !isJoinable || isLoadingGroup}
              >
                {!isConnected ? (
                  <>🔗 Connect Wallet</>
                ) : !hasEnoughBalance ? (
                  <>❌ Insufficient Balance</>
                ) : !isJoinable ? (
                  <>❌ Cannot Join</>
                ) : (
                  <>Continue →</>
                )}
              </button>
            </>
          )}

          {currentStep === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep('details')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleTransactionSubmit}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white rounded-lg hover:shadow-bitcoin disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={isLoading}
              >
                ✓ Confirm & Join
              </button>
            </>
          )}

          {currentStep === 'transaction' && (
            <button
              type="button"
              onClick={resetModal}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isLoading}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
