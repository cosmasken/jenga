import React, { useState, useEffect } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRosca } from '../hooks/useRosca';
import { useSupabase } from '../hooks/useSupabase';
import { useRoscaToast } from '../hooks/use-rosca-toast';
import { useUnitDisplay } from '../contexts/UnitDisplayContext';
import { formatAmount, formatDuration, parseCbtcToWei } from '../lib/unitConverter';

interface CreateChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated?: () => void; // Callback for when group is successfully created
}

export const CreateChamaModal: React.FC<CreateChamaModalProps> = ({ open, onOpenChange, onGroupCreated }) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'preview' | 'transaction'>('form');
  const [formData, setFormData] = useState({
    name: '',
    contributionAmount: '', // Amount in cBTC
    roundLength: '', // Round length in days
    maxMembers: '5' // Default to 5 members
  });
  const [maxSpendable, setMaxSpendable] = useState<string>('0');
  const [maxSpendableRaw, setMaxSpendableRaw] = useState<string>('0'); // Store raw numeric value

  const { primaryWallet } = useDynamicContext();
  const {
    createGroup,
    isLoading,
    isConnected,
    balance,
    isLoadingBalance,
    refreshBalance,
    getMaxSpendableAmount
  } = useRosca();
  const {
    logActivity,
    createNotification,
    awardAchievement
  } = useSupabase();
  const { groupCreated, error: showError, transactionPending } = useRoscaToast();
  const { displayUnit } = useUnitDisplay();

  // Get max spendable amount when modal opens or balance changes
  useEffect(() => {
    if (open && isConnected) {
      getMaxSpendableAmount().then((formattedAmount) => {
        setMaxSpendable(formattedAmount);
        // Extract numeric value from formatted string
        const numericValue = formattedAmount.split(' ')[0];
        setMaxSpendableRaw(numericValue);
      });
    }
  }, [open, isConnected, balance, getMaxSpendableAmount]);

  // Enhanced form validation with balance checking
  const formValidation = React.useMemo(() => {
    if (!formData.contributionAmount) {
      return { isValid: true, error: null };
    }

    try {
      const contribution = parseFloat(formData.contributionAmount);
      const maxSpendableNum = parseFloat(maxSpendableRaw);
      const balanceNum = parseFloat(balance);

      // Validate minimum contribution (0.0001 cBTC)
      if (contribution < 0.0001) {
        return {
          isValid: false,
          error: 'Minimum contribution is ' + formatAmount(parseCbtcToWei('0.0001'), displayUnit),
          shortError: 'Below minimum'
        };
      }

      // Validate against balance (accounting for gas)
      if (contribution > maxSpendableNum) {
        return {
          isValid: false,
          error: `Amount exceeds available balance. Maximum: ${formatAmount(parseCbtcToWei(maxSpendable), displayUnit)}`,
          shortError: 'Exceeds balance'
        };
      }

      // Warning if using more than 80% of balance
      if (contribution > balanceNum * 0.8) {
        return {
          isValid: true,
          error: null,
          warning: 'Using most of your balance. Ensure you have enough for future transactions.'
        };
      }

      return {
        isValid: true,
        error: null
      };
    } catch {
      return { isValid: true, error: null };
    }
  }, [formData.contributionAmount, maxSpendableRaw, balance, displayUnit]);

  // Reset modal state
  const resetModal = () => {
    setFormData({ name: '', contributionAmount: '', roundLength: '', maxMembers: '5' });
    setCurrentStep('form');
    onOpenChange(false);
  };

  // Handle form submission (go to preview step)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      return;
    }

    if (!formValidation.isValid) {
      return;
    }

    setCurrentStep('preview');
  };

  // Handle actual transaction submission
  const handleTransactionSubmit = async () => {
    if (!isConnected || !primaryWallet?.address) return;

    try {
      setCurrentStep('transaction');

      // Show pending transaction toast
      const pendingToast = transactionPending("group creation");

      // Send blockchain transaction
      console.log('🔄 Sending blockchain transaction...');
      const result = await createGroup({
        token: '0x0000000000000000000000000000000000000000',
        contribution: formData.contributionAmount,
        roundLength: parseInt(formData.roundLength) * 24 * 60 * 60, // Convert days to seconds
        maxMembers: parseInt(formData.maxMembers)
      });

      if (!result || !result.hash) {
        throw new Error('Failed to get transaction hash');
      }

      const { hash, groupId: chainGroupId } = result;
      console.log('✅ Transaction hash received:', hash);
      console.log('✅ Chain group ID:', chainGroupId);

      // Dismiss pending toast
      pendingToast.dismiss();

      // Show success message
      groupCreated(
        formData.name,
        formData.contributionAmount,
        hash
      );

      // Optional: Log activity for analytics (non-critical)
      try {
        if (chainGroupId !== undefined) {
          await logActivity(
            'group_created',
            'chama',
            chainGroupId.toString(),
            `Created ROSCA group: ${formData.name}`,
            {
              group_name: formData.name,
              contribution_amount: formData.contributionAmount,
              max_members: formData.maxMembers,
              transaction_hash: hash
            }
          );
        }
      } catch (activityError) {
        console.warn('⚠️ Could not log activity:', activityError);
      }

      // Optional: Award achievement for group creation (non-critical)
      try {
        await awardAchievement('group-creator', {
          transaction_hash: hash,
          group_id: chainGroupId?.toString()
        });
        console.log('✅ Group Creator achievement awarded');
      } catch (achievementError) {
        console.warn('⚠️ Could not award achievement:', achievementError);
      }

      // Optional: Create notification for group creation (non-critical)
      try {
        await createNotification(
          primaryWallet.address,
          'Group Created Successfully! 🎉',
          `Your ROSCA group "${formData.name}" has been created and confirmed on the blockchain.`,
          'success',
          {
            group_name: formData.name,
            transaction_hash: hash,
            contribution_amount: formData.contributionAmount,
            chain_group_id: chainGroupId
          }
        );
        console.log('✅ Group creation notification sent');
      } catch (notificationError) {
        console.warn('⚠️ Could not create notification:', notificationError);
      }

      // Trigger callback for dashboard refresh
      if (onGroupCreated) {
        onGroupCreated();
      }
      
      setTimeout(() => resetModal(), 2000);
    } catch (err) {
      console.error('❌ Error creating chama:', err);
      showError("Group Creation Failed", "Please try again or check your wallet connection");
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
              {currentStep === 'form' && 'Create New Chama'}
              {currentStep === 'preview' && 'Transaction Preview'}
              {currentStep === 'transaction' && 'Creating Chama'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentStep === 'form' && 'Set up your Bitcoin savings circle'}
              {currentStep === 'preview' && 'Review your chama details'}
              {currentStep === 'transaction' && 'Please wait...'}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${currentStep === 'form'
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
          {/* Form Step */}
          {currentStep === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Chama Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chama Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a name for your chama"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent"
                  required
                />
              </div>

              {/* Contribution Amount */}
              <div className="space-y-2">
                <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contribution Amount
                </label>
                <div className="relative">
                  <input
                    id="contribution"
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={formData.contributionAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, contributionAmount: e.target.value }))}
                    placeholder="0.0001"
                    className={`w-full px-3 py-2 pr-16 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent ${!formValidation.isValid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    cBTC
                  </span>
                </div>

                {/* Balance Information */}
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Balance:</span>
            {isLoadingBalance ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              <div className="flex items-center gap-1">
                <span className="font-mono">{formatAmount(parseCbtcToWei(balance), displayUnit)}</span>
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
            <span>Max (after gas):</span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, contributionAmount: maxSpendableRaw }))}
              className="font-mono text-bitcoin hover:text-bitcoin-dark underline cursor-pointer transition-colors"
              disabled={isLoadingBalance || parseFloat(maxSpendableRaw) <= 0}
              title="Use maximum amount"
            >
              {maxSpendable}
            </button>
          </div>
        </div>

                {/* Quick Amount Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Quick amounts:</span>
                  <div className="flex gap-1">
                    {['0.001', '0.01', '0.1'].map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, contributionAmount: amount }))}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                        disabled={parseCbtcToWei(amount) > parseCbtcToWei(maxSpendableRaw)}
                      >
                        {formatAmount(parseCbtcToWei(amount), displayUnit)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contributionAmount: (parseFloat(maxSpendableRaw) * 0.5).toFixed(6) }))}
                      className="px-2 py-1 text-xs bg-bitcoin/10 hover:bg-bitcoin/20 text-bitcoin rounded transition-colors"
                      disabled={parseFloat(maxSpendableRaw) <= 0}
                    >
                      50%
                    </button>
                  </div>
                </div>

                {/* Warning for high balance usage */}
                {formValidation.warning && (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <span className="w-4 h-4">⚠️</span>
                    <span>{formValidation.warning}</span>
                  </div>
                )}

                {/* Low balance warning */}
                {parseFloat(balance) < 0.01 && parseFloat(balance) > 0 && (
                  <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                    <span className="w-4 h-4">⚠️</span>
                    <span>
                      Low balance detected. Consider getting more cBTC from the{' '}
                      <a
                        href="https://citrea.xyz/faucet"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-orange-700 dark:hover:text-orange-300"
                      >
                        faucet
                      </a>
                      .
                    </span>
                  </div>
                )}

                {/* Validation Error */}
                {!formValidation.isValid && (
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                    <span className="w-4 h-4">⚠️</span>
                    <span>{formValidation.error}</span>
                  </div>
                )}

                {/* Info Box */}
                {formData.contributionAmount && parseFloat(formData.contributionAmount) >= 0.0001 && (
                  <div className="p-3 bg-bitcoin-orange/10 border border-bitcoin-orange/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 text-bitcoin-orange mt-0.5">ℹ️</span>
                      <div className="text-sm text-bitcoin-orange">
                        <div className="font-medium mb-1">Security Deposit Required</div>
                        <div className="space-y-1 text-xs">
                          <div>• You'll deposit <strong>{formatAmount(parseCbtcToWei(formData.contributionAmount), displayUnit)}</strong> as collateral</div>
                          <div>• Returned after completing all rounds</div>
                          <div>• Ensures commitment from all members</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Round Length */}
              <div className="space-y-2">
                <label htmlFor="roundLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Round Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    id="roundLength"
                    type="number"
                    min="1"
                    value={formData.roundLength}
                    onChange={(e) => setFormData(prev => ({ ...prev, roundLength: e.target.value }))}
                    placeholder="30"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent"
                    required
                  />
                  <div className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Days</span>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Quick presets:</span>
                  {[7, 14, 30, 90].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, roundLength: days.toString() }))}
                      className="text-xs px-2 py-1 bg-bitcoin-orange/10 text-bitcoin-orange rounded hover:bg-bitcoin-orange/20 transition-colors"
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Members */}
              <div className="space-y-2">
                <label htmlFor="maxMembers" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Maximum Members
                </label>
                <select
                  id="maxMembers"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxMembers: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-bitcoin-orange focus:border-transparent"
                  required
                >
                  <option value="">Select max members</option>
                  <option value="3">3 members</option>
                  <option value="5">5 members</option>
                  <option value="8">8 members</option>
                  <option value="10">10 members</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white rounded-lg hover:shadow-bitcoin disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={isLoading ||
                    !formData.name ||
                    !formData.contributionAmount ||
                    !formData.roundLength ||
                    !formData.maxMembers ||
                    !isConnected ||
                    !formValidation.isValid}
                >
                  {!formValidation.isValid ? (
                    <>⚠️ {formValidation.shortError || 'Invalid Input'}</>
                  ) : (
                    <>Next: Preview →</>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Preview Step */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Review Your Chama
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please review the details before creating
                </p>
              </div>

              {/* Transaction Summary */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                  Chama Details
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Per Round:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {formatAmount(parseCbtcToWei(formData.contributionAmount), displayUnit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Round Duration:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDuration(parseInt(formData.roundLength) * 24 * 60 * 60)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Max Members:</span>
                    <span className="text-gray-900 dark:text-white">{formData.maxMembers} members</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600 dark:text-gray-400">Security Deposit:</span>
                      <span className="font-mono text-bitcoin-orange">
                        {formatAmount(parseCbtcToWei(formData.contributionAmount), displayUnit)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Returned after completing all rounds
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <span>ℹ️</span>
                  Important Information
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <div>• You'll be the first member and admin of this chama</div>
                  <div>• Other members can join after creation</div>
                  <div>• Rounds start when the chama is full</div>
                  <div>• Your security deposit will be locked until completion</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep('form')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  ← Back to Form
                </button>
                <button
                  type="button"
                  onClick={handleTransactionSubmit}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white rounded-lg hover:shadow-bitcoin disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  disabled={isLoading}
                >
                  ✓ Create Chama
                </button>
              </div>
            </div>
          )}

          {/* Transaction Step */}
          {currentStep === 'transaction' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Creating Your Chama
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
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                  Transaction Summary
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Creating:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Deposit:</span>
                    <span className="font-mono text-bitcoin-orange">
                      {formatAmount(parseCbtcToWei(formData.contributionAmount), displayUnit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
