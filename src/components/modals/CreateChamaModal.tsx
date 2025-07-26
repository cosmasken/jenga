import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, Bitcoin, Info, ExternalLink, CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { useCreateChama } from '../../hooks/useJengaContract';
import { useAccount, useSimulateContract, useEstimateGas, useBalance } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { JENGA_CONTRACT } from '../../contracts/jenga-contract';
import { citreaTestnet } from '../../wagmi';
import { truncateAddress } from '../../lib/utils';

interface CreateChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateChamaModal: React.FC<CreateChamaModalProps> = ({ open, onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'simulation' | 'transaction'>('form');
  const [formData, setFormData] = useState({
    name: '',
    contributionSats: '', // Amount in sats (will be converted to 18 decimals)
    payoutPeriodDays: '', // Payout period in days
    maxMembers: ''
  });
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isConnected, address } = useAccount();
  
  // Fetch user's balance
  const { data: balance, isLoading: isBalanceLoading, error: balanceError } = useBalance({
    address,
    chainId: citreaTestnet.id,
    query: {
      enabled: !!address && isConnected,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  // Validate form inputs
  const formValidation = React.useMemo(() => {
    if (!formData.contributionSats) {
      return { isValid: true, error: null };
    }

    try {
      const contributionSats = parseInt(formData.contributionSats);
      
      // Validate minimum contribution (10,000 sats)
      if (contributionSats < 10000) {
        return {
          isValid: false,
          error: 'Minimum contribution is 10,000 sats',
          shortError: 'Below minimum'
        };
      }
      
      return { 
        isValid: true, 
        error: null
      };
    } catch {
      return { isValid: true, error: null };
    }
  }, [formData.contributionSats]);

  // Validate balance for collateral requirement
  const balanceValidation = React.useMemo(() => {
    if (!formData.contributionSats || !balance || isBalanceLoading) {
      return { isValid: true, error: null };
    }

    try {
      const contributionSats = parseInt(formData.contributionSats);
      const contributionAmount = BigInt(contributionSats) * 10n ** 10n; // Convert to wei
      
      // Check if user has enough balance for collateral + gas
      const requiredBalance = contributionAmount + parseEther('0.001'); // Add some buffer for gas
      
      if (balance.value < requiredBalance) {
        const requiredCBTC = formatEther(contributionAmount);
        return {
          isValid: false,
          error: `Insufficient balance. You need ${requiredCBTC} cBTC for collateral plus gas fees.`,
          shortError: 'Insufficient balance'
        };
      }
      
      return { 
        isValid: true, 
        error: null
      };
    } catch {
      return { isValid: true, error: null };
    }
  }, [formData.contributionSats, balance, isBalanceLoading]);
  
  // Prepare contract arguments for simulation
  const contractArgs = React.useMemo(() => {
    if (!formData.name || !formData.contributionSats || !formData.payoutPeriodDays || !formData.maxMembers) {
      return null;
    }
    try {
      const contributionSats = parseInt(formData.contributionSats, 10);
      const payoutPeriodDays = parseFloat(formData.payoutPeriodDays);
      const maxMembers = parseInt(formData.maxMembers, 10);
      
      // Convert days to seconds (minimum 7 days as per contract)
      const payoutPeriodSeconds = Math.max(7 * 24 * 60 * 60, Math.floor(payoutPeriodDays * 24 * 60 * 60)); // Minimum 7 days (604800 seconds)
      
      // Validate inputs
      if (contributionSats < 10000 || payoutPeriodSeconds < 7 * 24 * 60 * 60 || maxMembers < 3 || maxMembers > 20) {
        return null;
      }
      
      // Convert sats (integer) to 18 decimals: 1 sat = 1e10 units
      const contributionAmount = BigInt(contributionSats) * 10n ** 10n;
      
      console.log('Contract args preparation:', {
        name: formData.name,
        contributionAmount: contributionAmount.toString(),
        payoutPeriodSeconds,
        maxMembers,
        valueToSend: contributionAmount.toString(),
        minSecondsRequired: 7 * 24 * 60 * 60, // 7 days
        actualSeconds: payoutPeriodSeconds
      });
      
      return {
        args: [
          formData.name,
          contributionAmount,
          BigInt(payoutPeriodSeconds),
          BigInt(maxMembers)
        ] as const,
        value: contributionAmount // Collateral payment equal to contribution amount
      };
    } catch (error) {
      console.error('Error preparing contract args:', error);
      return null;
    }
  }, [formData]);

  // Simulate contract call
  const {
    data: simulationData,
    error: simulationError,
    isLoading: isSimulating,
    refetch: refetchSimulation
  } = useSimulateContract({
    ...JENGA_CONTRACT,
    functionName: 'createChama',
    args: contractArgs?.args,
    value: contractArgs?.value, // Include collateral payment
    chainId: citreaTestnet.id,
    query: {
      enabled: currentStep === 'simulation' && 
               !!contractArgs && 
               isConnected && 
               formValidation.isValid &&
               balanceValidation.isValid,
      retry: 2,
      retryDelay: 1000,
    },
  });

  // Estimate gas for the transaction
  const {
    data: gasEstimate,
    error: gasError,
    isLoading: isEstimatingGas
  } = useEstimateGas({
    ...JENGA_CONTRACT,
    functionName: 'createChama',
    args: contractArgs?.args,
    value: contractArgs?.value, // Include collateral payment
    chainId: citreaTestnet.id,
    query: {
      enabled: currentStep === 'simulation' && 
               !!contractArgs && 
               isConnected && 
               formValidation.isValid &&
               balanceValidation.isValid,
      retry: 2,
    },
  });

  const { 
    createChama, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error,
    hash 
  } = useCreateChama();

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: t('chama.createdSuccess'),
        description: (
          <div className="space-y-2">
            <p>{t('chama.createdSuccessDesc', { name: formData.name })}</p>
            <a 
              href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          </div>
        ),
      });
      
      // Reset modal after success
      setTimeout(() => resetModal(), 2000);
    }
  }, [isConfirmed, hash, formData.name, toast, t]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      console.error('CreateChama error:', error);
      
      let errorMessage = 'Failed to create chama. Please try again.';
      
      // More specific error handling
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. You need enough cBTC for collateral plus gas fees.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message.includes('execution reverted')) {
        if (error.message.includes('Contribution must be > 0')) {
          errorMessage = 'Contribution amount must be greater than 0.';
        } else if (error.message.includes('Cycle must be >= 7 days')) {
          errorMessage = 'Cycle duration must be at least 7 days.';
        } else if (error.message.includes('Members: 3-20')) {
          errorMessage = 'Number of members must be between 3 and 20.';
        } else if (error.message.includes('Must deposit collateral')) {
          errorMessage = 'You must deposit collateral equal to the contribution amount.';
        } else {
          errorMessage = 'Transaction failed. Please check your inputs and try again.';
        }
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('gas')) {
        errorMessage = 'Gas estimation failed. You may not have enough funds for gas fees.';
      }
      
      toast({
        title: 'Chama Creation Failed',
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Reset modal state
  const resetModal = () => {
    setFormData({ name: '', contributionSats: '', payoutPeriodDays: '', maxMembers: '' });
    setCurrentStep('form');
    setShowAdvancedDetails(false);
    onOpenChange(false);
  };

  // Handle form submission (go to simulation step)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a chama.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formValidation.isValid) {
      toast({
        title: 'Invalid input',
        description: formValidation.error || 'Please check your input values.',
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentStep('simulation');
  };

  // Handle actual transaction submission
  const handleTransactionSubmit = () => {
    if (!contractArgs) {
      toast({
        title: 'Invalid Parameters',
        description: 'Contract arguments are not properly prepared.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to create a chama.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!balanceValidation.isValid) {
      toast({
        title: 'Insufficient Balance',
        description: balanceValidation.error || 'You do not have enough balance for this transaction.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setCurrentStep('transaction');
      
      console.log('Submitting transaction with args:', {
        name: formData.name,
        contributionSats: parseInt(formData.contributionSats),
        payoutPeriodSeconds: Math.floor(parseFloat(formData.payoutPeriodDays) * 24 * 60 * 60),
        maxMembers: parseInt(formData.maxMembers),
        userAddress: address,
        userBalance: balance?.formatted
      });
      
      createChama(
        formData.name,
        parseInt(formData.contributionSats),
        BigInt(Math.floor(parseFloat(formData.payoutPeriodDays) * 24 * 60 * 60)), // Convert days to seconds
        BigInt(formData.maxMembers)
      );
    } catch (err) {
      console.error('Error creating chama:', err);
      toast({
        title: t('chama.createFailed'),
        description: 'An unexpected error occurred. Please try again.',
        variant: "destructive",
      });
      setCurrentStep('simulation'); // Go back to simulation step
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={resetModal}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-card border border-gray-200 dark:border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-foreground">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            {currentStep === 'form' && t('chama.createNew')}
            {currentStep === 'simulation' && 'Transaction Preview'}
            {currentStep === 'transaction' && 'Creating Chama'}
          </DialogTitle>
        </DialogHeader>
        
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 'form' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            1
          </div>
          <div className={`w-8 h-1 ${
            ['simulation', 'transaction'].includes(currentStep) ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 'simulation' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            2
          </div>
          <div className={`w-8 h-1 ${
            currentStep === 'transaction' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
          }`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
            currentStep === 'transaction' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            3
          </div>
        </div>
        
        {/* Form Step */}
        {currentStep === 'form' && (
        
          <form onSubmit={handleFormSubmit} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">{t('chama.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t('chama.namePlaceholder')}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution" className="text-gray-700 dark:text-gray-300">Contribution Amount (sats)</Label>
            <div className="relative">
              <Input
                id="contribution"
                type="number"
                value={formData.contributionSats}
                onChange={(e) => setFormData(prev => ({ ...prev, contributionSats: e.target.value }))}
                placeholder="Enter amount in sats (min: 10,000)"
                min="10000"
                className={`bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 pr-16 ${
                  !formValidation.isValid ? 'border-red-500 focus:border-red-500' : ''
                }`}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                sats
              </span>
            </div>
            
            {/* Conversion Display */}
            {formData.contributionSats && parseInt(formData.contributionSats) >= 10000 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Info className="w-3 h-3" />
                  <span>≈ {formatEther(BigInt(parseInt(formData.contributionSats)) * 10n ** 10n)} cBTC per round</span>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <div className="font-medium mb-1">Security Deposit Required</div>
                      <div className="space-y-2">
                        <div>You'll need to deposit <strong>{parseInt(formData.contributionSats).toLocaleString()} sats</strong> as collateral when creating this chama.</div>
                        <div className="text-xs">
                          • This deposit equals one cycle contribution<br/>
                          • Returned after successfully completing all cycles<br/>
                          • Ensures commitment from all members<br/>
                          • Total upfront cost: {parseInt(formData.contributionSats).toLocaleString()} sats + gas fees
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Balance Validation Error */}
                {!balanceValidation.isValid && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <div className="font-medium mb-1">Insufficient Balance</div>
                        <div>{balanceValidation.error}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Minimum validation */}
            {formData.contributionSats && parseInt(formData.contributionSats) < 10000 && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Minimum contribution is 10,000 sats</span>
              </div>
            )}
            
            {/* Balance Display */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Your Balance:</span>
              <span className="font-mono text-gray-900 dark:text-white">
                {isBalanceLoading ? (
                  <div className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </div>
                ) : balance ? (
                  `${formatEther(balance.value)} cBTC`
                ) : (
                  'Unable to load'
                )}
              </span>
            </div>
            
            {/* Form Validation Error */}
            {!formValidation.isValid && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span>{formValidation.shortError}</span>
              </div>
            )}
            
            {/* Balance Error */}
            {balanceError && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Failed to load balance</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-gray-700 dark:text-gray-300">Payout Period</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Input
                  id="duration"
                  type="number"
                  value={formData.payoutPeriodDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutPeriodDays: e.target.value }))}
                  placeholder="Enter period"
                  min="7" // Minimum 7 days as per contract
                  step="1" // 1 day increments
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-center px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Days</span>
              </div>
            </div>
            
            {/* Helper text for production */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Minimum cycle duration is 7 days as per contract requirements
            </div>
            
            {/* Quick preset buttons for common durations */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Quick presets:</span>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '7' }))}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                7 days
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '14' }))}
                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                2 weeks
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '30' }))}
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
              >
                1 month
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '90' }))}
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
              >
                3 months
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '1' }))}
                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
              >
                1 day
              </button>
            </div>
            
            {/* Show converted time */}
            {/* Show period confirmation */}
            {formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) > 0 && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Cycle Duration: {parseFloat(formData.payoutPeriodDays)} days
                {parseFloat(formData.payoutPeriodDays) >= 30 && (
                  <span className="ml-2 text-xs">
                    (~{Math.round(parseFloat(formData.payoutPeriodDays) / 30)} month{Math.round(parseFloat(formData.payoutPeriodDays) / 30) > 1 ? 's' : ''})
                  </span>
                )}
              </div>
            )}
            
            {/* Minimum validation */}
            {formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) > 0 && parseFloat(formData.payoutPeriodDays) < 7 && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Minimum cycle duration is 7 days</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="members" className="text-gray-700 dark:text-gray-300">{t('chama.maxMembers')}</Label>
            <Select value={formData.maxMembers} onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: value }))}>
              <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                <SelectValue placeholder={t('chama.selectMaxMembers')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                <SelectItem value="3" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 3 })}</SelectItem>
                <SelectItem value="5" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 5 })}</SelectItem>
                <SelectItem value="8" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 8 })}</SelectItem>
                <SelectItem value="10" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 10 })}</SelectItem>
                <SelectItem value="15" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 15 })}</SelectItem>
                <SelectItem value="20" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">{t('chama.members', { count: 20 })}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {t('chama.transactionSubmitted')}{' '}
                <a 
                  href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline text-blue-600 dark:text-blue-400"
                >
                  {t('chama.viewOnExplorer')}
                </a>
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetModal}
              className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isLoading || 
                       !formData.name || 
                       !formData.contributionSats || 
                       !formData.payoutPeriodDays || 
                       !formData.maxMembers || 
                       !isConnected || 
                       !formValidation.isValid || 
                       !balanceValidation.isValid ||
                       isBalanceLoading ||
                       parseInt(formData.contributionSats || '0') < 10000 ||
                       parseFloat(formData.payoutPeriodDays || '0') < 7}
            >
              {!formValidation.isValid ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {formValidation.shortError || 'Invalid Input'}
                </>
              ) : !balanceValidation.isValid ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {balanceValidation.shortError || 'Insufficient Balance'}
                </>
              ) : isBalanceLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking Balance...
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Next: Preview
                </>
              )}
            </Button>
          </div>
        </form>
      
        )}

        {/* Simulation Step */}
        {currentStep === 'simulation' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Transaction Simulation
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Validating your transaction before submission
              </p>
            </div>

            {/* Simulation Status */}
            <div className={`p-4 rounded-lg border-2 ${
              !formValidation.isValid
                ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
                : isSimulating 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' 
                  : simulationData && !simulationError
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
            }`}>
              <div className="flex items-center gap-3">
                {!formValidation.isValid ? (
                  <XCircle className="w-5 h-5 text-red-600" />
                ) : isSimulating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : simulationData && !simulationError ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    {!formValidation.isValid
                      ? 'Invalid Input'
                      : isSimulating 
                        ? 'Simulating transaction...' 
                        : simulationData && !simulationError
                          ? 'Transaction will succeed' 
                          : 'Transaction will fail'
                    }
                  </div>
                  {!formValidation.isValid ? (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {formValidation.error}
                    </div>
                  ) : simulationError && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      <div className="font-medium mb-1">Simulation Error:</div>
                      <div className="space-y-1">
                        {simulationError.message.includes('execution reverted') ? (
                          <>
                            <div>Smart contract rejected the transaction.</div>
                            <div className="text-xs">
                              <strong>Error Details:</strong>
                              <div className="mt-1 p-2 bg-red-100 dark:bg-red-900 rounded font-mono text-xs break-all">
                                {simulationError.message}
                              </div>
                              <div className="mt-2">
                                <strong>Possible causes:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  <li>Contract validation failed (check cycle duration ≥ 7 minutes)</li>
                                  <li>Insufficient balance for collateral + gas</li>
                                  <li>Contract address mismatch</li>
                                  <li>ABI not updated with new contract</li>
                                </ul>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div>{simulationError.message.split('\n')[0]}</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gas Estimation */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-sm text-gray-900 dark:text-white">
                  Gas Estimation
                </span>
              </div>
              
              {isEstimatingGas ? (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Estimating gas cost...
                </div>
              ) : gasEstimate && !gasError ? (
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Gas Limit:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      {gasEstimate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Estimated Cost:</span>
                    <span className="font-mono text-gray-900 dark:text-white">
                      ~{formatEther(gasEstimate * 1000000000n)} cBTC
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-red-600 dark:text-red-400">
                  Unable to estimate gas cost
                </div>
              )}
            </div>

            {/* Transaction Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-3">
                Transaction Summary
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Chama Name:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Per Round:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formData.contributionSats ? parseInt(formData.contributionSats).toLocaleString() : '0'} sats
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payout Period:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 1 
                      ? `${parseFloat(formData.payoutPeriodDays)} days`
                      : formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 0.041667
                        ? `${(parseFloat(formData.payoutPeriodDays) * 24).toFixed(1)} hours`
                        : formData.payoutPeriodDays
                          ? `${(parseFloat(formData.payoutPeriodDays) * 24 * 60).toFixed(0)} minutes`
                          : '0 days'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Members:</span>
                  <span className="text-gray-900 dark:text-white">{formData.maxMembers} members</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-600 dark:text-gray-400">Security Deposit:</span>
                    <span className="font-mono text-orange-600 dark:text-orange-400">
                      {formData.contributionSats ? parseInt(formData.contributionSats).toLocaleString() : '0'} sats
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Returned after completing all cycles
                  </div>
                </div>
              </div>
            </div>

            {/* Troubleshooting Section */}
            {simulationError && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Quick Fixes
                </div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      name: 'Test Chama',
                      contributionSats: '10000',
                      payoutPeriodDays: '7', // 7 days minimum
                      maxMembers: '3'
                    }))}
                    className="w-full text-left text-sm p-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    Set test values (10 min, 10k sats, 3 members)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '7' }))}
                    className="w-full text-left text-sm p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Set cycle to 7 days (minimum allowed)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, payoutPeriodDays: '30' }))}
                    className="w-full text-left text-sm p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Set cycle to 30 days (1 month)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, contributionSats: '50000' }))}
                    className="w-full text-left text-sm p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    Set contribution to 50,000 sats
                  </button>
                </div>
              </div>
            )}

            {/* Debug Information (only show when there's an error) */}
            {simulationError && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="font-medium text-sm text-yellow-900 dark:text-yellow-100 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Debug Information
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                  <div>
                    <strong>Contract Arguments:</strong>
                    <div className="font-mono text-xs mt-1 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                      {contractArgs ? (
                        <>
                          <div>Name: "{contractArgs.args[0]}"</div>
                          <div>Contribution: {contractArgs.args[1].toString()} wei ({formData.contributionSats} sats)</div>
                          <div>Cycle Duration: {contractArgs.args[2].toString()} seconds ({
                            formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 1 
                              ? `${parseFloat(formData.payoutPeriodDays)} days`
                              : formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 0.041667
                                ? `${(parseFloat(formData.payoutPeriodDays) * 24).toFixed(1)} hours`
                                : formData.payoutPeriodDays
                                  ? `${(parseFloat(formData.payoutPeriodDays) * 24 * 60).toFixed(0)} minutes`
                                  : '0'
                          })</div>
                          <div>Max Members: {contractArgs.args[3].toString()}</div>
                          <div>Value Sent: {contractArgs.value.toString()} wei</div>
                        </>
                      ) : (
                        'Contract args are null'
                      )}
                    </div>
                  </div>
                  <div className="text-xs">
                    Try increasing the cycle duration if the error persists. Some contracts require minimum periods.
                  </div>
                </div>
              </div>
            )}

            {/* Creation Info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Chama Creation
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Creating a chama is free. Members will contribute {formData.contributionSats ? parseInt(formData.contributionSats).toLocaleString() : '0'} sats per round after joining.
              </div>
            </div>

            {/* Advanced Details Toggle */}
            {simulationData && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {showAdvancedDetails ? 'Hide' : 'Show'} Advanced Details
                  <ArrowRight className={`w-3 h-3 ml-1 transition-transform ${showAdvancedDetails ? 'rotate-90' : ''}`} />
                </Button>
                
                {showAdvancedDetails && (
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-900 rounded text-xs font-mono">
                    <div className="text-gray-600 dark:text-gray-400 mb-2">Contract Call Data:</div>
                    <div className="text-gray-900 dark:text-white break-all">
                      Function: createChama("{formData.name}", {formData.contributionSats} sats, {
                        formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 1 
                          ? `${parseFloat(formData.payoutPeriodDays)} days`
                          : formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 0.041667
                            ? `${(parseFloat(formData.payoutPeriodDays) * 24).toFixed(1)} hours`
                            : formData.payoutPeriodDays
                              ? `${(parseFloat(formData.payoutPeriodDays) * 24 * 60).toFixed(0)} minutes`
                              : '0 days'
                      }, {formData.maxMembers} members)
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 mt-2 mb-1">Value Sent:</div>
                    <div className="text-gray-900 dark:text-white">
                      {formData.contributionSats ? (parseInt(formData.contributionSats) * 2).toLocaleString() : '0'} sats (deposit + first round)
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep('form')}
                className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Form
              </Button>
              
              {simulationError && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('Retrying simulation with current args:', contractArgs);
                    refetchSimulation();
                  }}
                  className="flex-1 bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-800"
                  disabled={isLoading || isSimulating}
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Retry Simulation
                    </>
                  )}
                </Button>
              )}
              
              <Button
                type="button"
                onClick={handleTransactionSubmit}
                className="flex-1 btn-primary"
                disabled={!simulationData || simulationError || isLoading || !formValidation.isValid || !balanceValidation.isValid}
              >
                {!formValidation.isValid ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Invalid Input
                  </>
                ) : !balanceValidation.isValid ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Insufficient Balance
                  </>
                ) : simulationData && !simulationError ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Submit Transaction
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Cannot Submit
                  </>
                )}
              </Button>
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

            {/* Transaction Status */}
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {isPending ? 'Waiting for confirmation...' : 'Processing transaction...'}
                </span>
              </div>
              
              <div className="text-center text-sm text-blue-700 dark:text-blue-300">
                {isPending && 'Please confirm the transaction in your wallet'}
                {isConfirming && 'Transaction submitted, waiting for confirmation...'}
              </div>
            </div>

            {/* Transaction Hash */}
            {hash && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" />
                  Transaction Hash:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-white dark:bg-gray-900 px-2 py-1 rounded border flex-1 truncate">
                    {truncateAddress(hash)}
                  </code>
                  <a 
                    href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
                    {formData.contributionSats ? parseInt(formData.contributionSats).toLocaleString() : '0'} sats
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payout Period:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 1 
                      ? `${parseFloat(formData.payoutPeriodDays)} days`
                      : formData.payoutPeriodDays && parseFloat(formData.payoutPeriodDays) >= 0.041667
                        ? `${(parseFloat(formData.payoutPeriodDays) * 24).toFixed(1)} hours`
                        : formData.payoutPeriodDays
                          ? `${(parseFloat(formData.payoutPeriodDays) * 24 * 60).toFixed(0)} minutes`
                          : '0 days'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Members:</span>
                  <span className="text-gray-900 dark:text-white">{formData.maxMembers} members</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              Do not close this window until the transaction is confirmed
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
