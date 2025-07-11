import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { Loader2, Bitcoin, Info, ExternalLink, CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { useCreateChama } from '../../hooks/useJengaContract';
import { useAccount, useSimulateContract, useEstimateGas, useBalance } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { JENGA_CONTRACT } from '../../contracts/jenga-contract';
import { citreaTestnet } from '../../wagmi';

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
      refetchInterval: 10000, // Refetch every 10 seconds
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
  
  // Prepare contract arguments for simulation
  const contractArgs = React.useMemo(() => {
    if (!formData.name || !formData.contributionSats || !formData.payoutPeriodDays || !formData.maxMembers) {
      return null;
    }
    try {
      const contributionSats = parseInt(formData.contributionSats, 10);
      const payoutPeriodDays = parseInt(formData.payoutPeriodDays, 10);
      if (contributionSats < 10000 || payoutPeriodDays < 7) {
        return null;
      }
      // Convert sats (integer) to 18 decimals: 1 sat = 1e10 units
      const contributionAmount = BigInt(contributionSats) * 10n ** 10n;
      return [
        formData.name,
        contributionAmount,
        BigInt(payoutPeriodDays * 24 * 60 * 60),
        BigInt(formData.maxMembers)
      ] as const;
    } catch {
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
    args: contractArgs,
    // No value needed for createChama
    chainId: citreaTestnet.id,
    query: {
      enabled: currentStep === 'simulation' && 
               !!contractArgs && 
               isConnected && 
               formValidation.isValid,
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
    args: contractArgs,
    // No value needed for createChama
    chainId: citreaTestnet.id,
    query: {
      enabled: currentStep === 'simulation' && 
               !!contractArgs && 
               isConnected && 
               formValidation.isValid,
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
      let errorMessage = t('chama.createFailedDesc');
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = t('errors.insufficientFunds');
      } else if (error.message.includes('user rejected')) {
        errorMessage = t('errors.userRejected');
      }
      
      toast({
        title: t('chama.createFailed'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [error, toast, t]);

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
    if (!contractArgs) return;
    
    try {
      setCurrentStep('transaction');
      
      createChama(
        formData.name,
        parseInt(formData.contributionSats),
        BigInt(parseInt(formData.payoutPeriodDays) * 24 * 60 * 60), // Convert days to seconds
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
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Info className="w-3 h-3" />
                <span>≈ {formatEther(BigInt(parseInt(formData.contributionSats)) * 10n ** 10n)} cBTC per round</span>
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
            <Label htmlFor="duration" className="text-gray-700 dark:text-gray-300">Payout Period (days)</Label>
            <div className="relative">
              <Input
                id="duration"
                type="number"
                value={formData.payoutPeriodDays}
                onChange={(e) => setFormData(prev => ({ ...prev, payoutPeriodDays: e.target.value }))}
                placeholder="Enter period in days (min: 7)"
                min="7"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 pr-16"
                disabled={isLoading}
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                days
              </span>
            </div>
            
            {/* Minimum validation */}
            {formData.payoutPeriodDays && parseInt(formData.payoutPeriodDays) < 7 && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" />
                <span>Minimum payout period is 7 days</span>
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
                       isBalanceLoading ||
                       parseInt(formData.contributionSats || '0') < 10000 ||
                       parseInt(formData.payoutPeriodDays || '0') < 7}
            >
              {!formValidation.isValid ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  {formValidation.shortError || 'Invalid Input'}
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
                      {simulationError.message.includes('execution reverted') 
                        ? 'Smart contract rejected the transaction. Please check your inputs.'
                        : simulationError.message.split('\n')[0]
                      }
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
                  <span className="text-gray-900 dark:text-white">{formData.payoutPeriodDays} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Max Members:</span>
                  <span className="text-gray-900 dark:text-white">{formData.maxMembers} members</span>
                </div>
              </div>
            </div>

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
                      Function: createChama("{formData.name}", {formData.contributionSats} sats, {formData.payoutPeriodDays} days, {formData.maxMembers} members)
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
              <Button
                type="button"
                onClick={handleTransactionSubmit}
                className="flex-1 btn-primary"
                // disabled={!simulationData || simulationError || isLoading || !formValidation.isValid}
              >
                {!formValidation.isValid ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Invalid Input
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
                    {hash}
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
                  <span className="text-gray-900 dark:text-white">{formData.payoutPeriodDays} days</span>
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
