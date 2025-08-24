// src/pages/CreatePage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useRosca } from '@/hooks/useRosca';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FACTORY_ADDRESS } from '@/utils/constants';
import { ROSCA_CONFIG } from '@/config';
import InputModal from '@/components/InputModal';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Coins, Users, Clock, Shield, Loader2, Bitcoin } from 'lucide-react';
import { type Address } from 'viem';

export default function CreatePage() {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const roscaHook = useRosca(FACTORY_ADDRESS);
  const { addChama } = useDashboardData();

  const [formData, setFormData] = useState({
    roscaName: '',
    contribution: '',
    roundDuration: '7',
    memberTarget: 5
  });

  // Native ETH configuration (memoized to prevent recalculation)
  const { minAmount, maxAmount, minMembers, maxMembers } = useMemo(() => ({
    minAmount: parseFloat(ROSCA_CONFIG.MIN_CONTRIBUTION_AMOUNT),
    maxAmount: parseFloat(ROSCA_CONFIG.MAX_CONTRIBUTION_AMOUNT),
    minMembers: ROSCA_CONFIG.MIN_MEMBERS,
    maxMembers: ROSCA_CONFIG.MAX_MEMBERS
  }), []);

  // Memoized validation function to prevent unnecessary re-renders
  const validateForm = useCallback(async () => {
    const errs: Record<string, string> = {};
    const contrib = parseFloat(formData.contribution);

    // ROSCA name validation
    if (!formData.roscaName.trim()) {
      errs.roscaName = 'ROSCA name is required';
    } else if (formData.roscaName.trim().length < 3) {
      errs.roscaName = 'ROSCA name must be at least 3 characters';
    } else if (formData.roscaName.trim().length > 50) {
      errs.roscaName = 'ROSCA name must be 50 characters or less';
    }

    // Basic validation (no API calls to prevent refresh)
    if (!formData.contribution || contrib < minAmount) {
      errs.contribution = `Contribution must be ≥ ${minAmount} cBTC`;
    }
    if (contrib > maxAmount) {
      errs.contribution = `Contribution must be ≤ ${maxAmount} cBTC`;
    }
    if (formData.memberTarget < minMembers || formData.memberTarget > maxMembers) {
      errs.memberTarget = `Members must be between ${minMembers}-${maxMembers}`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData.roscaName, formData.contribution, formData.memberTarget, minAmount, maxAmount, minMembers, maxMembers]);

  // Separate balance check (only on submit)
  const checkBalance = useCallback(async (): Promise<string | null> => {
    if (!primaryWallet?.address || !roscaHook.publicClient) {
      return null;
    }
    
    try {
      const balance = await roscaHook.publicClient.getBalance({
        address: primaryWallet.address as Address
      });
      const balanceInEth = parseFloat((Number(balance) / 1e18).toFixed(6));
      const contrib = parseFloat(formData.contribution);
      const requiredAmount = contrib + parseFloat(ROSCA_CONFIG.FACTORY_CREATION_FEE);
      
      if (balanceInEth < requiredAmount) {
        return `Insufficient cBTC balance. Required: ${requiredAmount.toFixed(4)}, Available: ${balanceInEth.toFixed(4)}`;
      }
    } catch (error) {
      console.warn('Balance check failed:', error);
    }
    
    return null;
  }, [primaryWallet?.address, roscaHook.publicClient, formData.contribution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validateForm()) || !primaryWallet?.address) return;

    // Check balance separately before creating
    const balanceError = await checkBalance();
    if (balanceError) {
      setErrors(prev => ({ ...prev, balance: balanceError }));
      return;
    }
    
    // Clear balance error if it passes
    setErrors(prev => ({ ...prev, balance: '' }));

    setIsCreating(true);
    try {
      // Use the native ETH helper method for cleaner code
      const txHash = await roscaHook.createNativeROSCA(
        formData.contribution,                        // contribution amount
        parseInt(formData.roundDuration) * 86400,     // round duration in seconds
        formData.memberTarget,                        // max members
        formData.roscaName.trim()                     // ROSCA name
      );

      if (txHash) {
        // Extract ROSCA address from transaction receipt using the utility function
        const roscaAddress = await roscaHook.extractROSCAAddressFromReceipt(txHash);
        
        if (roscaAddress) {
          // Add to user's chama list
          addChama(roscaAddress);
          
          toast({ 
            title: '🎉 ROSCA created!', 
            description: `Your savings circle has been created successfully!\nAddress: ${roscaAddress.slice(0, 6)}...${roscaAddress.slice(-4)}` 
          });
        } else {
          console.warn('⚠️ Could not extract ROSCA address from transaction');
          toast({ 
            title: '🎉 ROSCA created!', 
            description: 'Your savings circle has been created successfully. Please refresh to see it.' 
          });
        }
        
        // Navigate to dashboard after a short delay
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (e: any) {
      toast({ 
        title: '❌ Creation failed', 
        description: e.message || 'Failed to create ROSCA. Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  // Memoized calculated values to prevent unnecessary recalculation
  const estimatedAPY = useMemo(() => Math.round((12 / formData.memberTarget) * 100), [formData.memberTarget]);
  const totalRequired = useMemo(() => parseFloat(formData.contribution || '0') + parseFloat(ROSCA_CONFIG.FACTORY_CREATION_FEE), [formData.contribution]);

  // Redirect to home if not logged in
  useEffect(() => {
    if (!isLoggedIn && !isCreating) {
      navigate('/');
    }
  }, [isLoggedIn, navigate, isCreating]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-gray to-dark-bg">
      <Header title="Create New Chama" />
      <div className="flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <InputModal
            title="Create Your Chama"
            description="Set up a new native ETH savings circle"
            isOpen
            onClose={handleCancel}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Summary Card */}
              <div className="glassmorphism p-4 rounded-lg border border-bitcoin/30 mb-6">
                <h4 className="font-orbitron text-sm font-bold text-bitcoin mb-3 flex items-center gap-2">
                  <Bitcoin className="w-4 h-4" />
                  NATIVE ETH CIRCLE
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-electric" />
                    <span className="text-gray-300">Est. APY:</span>
                    <span className="text-white font-bold">{estimatedAPY}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neon-green" />
                    <span className="text-gray-300">Members:</span>
                    <span className="text-white font-bold">{formData.memberTarget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-white font-bold">{formData.roundDuration}d</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Total Cost:</span>
                    <span className="text-white font-bold">{totalRequired.toFixed(4)} cBTC</span>
                  </div>
                </div>
              </div>

              {/* Info Card */}
              <div className="glassmorphism p-4 rounded-lg border border-electric/30 mb-6">
                <div className="text-sm text-gray-300 space-y-2">
                  <p className="flex items-center gap-2">
                    <Bitcoin className="w-4 h-4 text-bitcoin" />
                    <strong className="text-bitcoin">Native ETH Only:</strong> No token approvals needed
                  </p>
                  <p>• Contributions and deposits are paid in native cBTC</p>
                  <p>• Security deposit calculated automatically (2x contribution)</p>
                  <p>• Creation fee: {ROSCA_CONFIG.FACTORY_CREATION_FEE} cBTC</p>
                </div>
              </div>

              {/* ROSCA Name */}
              <div className="space-y-2">
                <Label>Chama Name</Label>
                <Input
                  type="text"
                  placeholder="e.g. Mama Mboga Savings, Harambee Circle, Business Partners"
                  value={formData.roscaName}
                  onChange={e => setFormData(p => ({ ...p, roscaName: e.target.value }))}
                  className="bg-dark-gray/50 border-gray-600 text-black"
                  maxLength={50}
                />
                <p className="text-xs text-gray-400">
                  Give your savings circle a meaningful name (3-50 characters)
                </p>
                {errors.roscaName && (
                  <div className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.roscaName}
                  </div>
                )}
              </div>

              {/* Contribution */}
              <div className="space-y-2">
                <Label>Contribution Amount per Round (cBTC)</Label>
                <Input
                  type="number"
                  step={0.001}
                  min={minAmount}
                  max={maxAmount}
                  placeholder={`e.g. ${minAmount}`}
                  value={formData.contribution}
                  onChange={e => setFormData(p => ({ ...p, contribution: e.target.value }))}
                  className="bg-dark-gray/50 border-gray-600 text-black"
                />
                <p className="text-xs text-gray-400">
                  Min: {minAmount} cBTC, Max: {maxAmount} cBTC
                </p>
                {errors.contribution && (
                  <div className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.contribution}
                  </div>
                )}
              </div>

              {/* Round Duration */}
              <div className="space-y-2">
                <Label>Round Duration</Label>
                <Select value={formData.roundDuration} onValueChange={v => setFormData(p => ({ ...p, roundDuration: v }))}>
                  <SelectTrigger className="bg-dark-gray/50 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day (Testing)</SelectItem>
                    <SelectItem value="3">3 days (Fast)</SelectItem>
                    <SelectItem value="7">7 days (Standard)</SelectItem>
                    <SelectItem value="14">14 days (Relaxed)</SelectItem>
                    <SelectItem value="30">30 days (Monthly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Member Target */}
              <div className="space-y-2">
                <Label>
                  Member Target: <span className="text-bitcoin font-bold">{formData.memberTarget}</span>
                </Label>
                <Slider 
                  value={[formData.memberTarget]} 
                  onValueChange={v => setFormData(p => ({ ...p, memberTarget: v[0] }))} 
                  min={minMembers} 
                  max={maxMembers} 
                  step={1} 
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{minMembers} (Min)</span>
                  <span>{maxMembers} (Max)</span>
                </div>
                {errors.memberTarget && (
                  <div className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.memberTarget}
                  </div>
                )}
              </div>

              {/* Balance Error */}
              {errors.balance && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <div className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.balance}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isCreating || roscaHook.isLoading} 
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || roscaHook.isLoading}
                  className="flex-1 bg-gradient-to-r from-bitcoin to-orange-600 hover:scale-105 transition-transform font-bold"
                >
                  {isCreating || roscaHook.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Create Chama
                    </>
                  )}
                </Button>
              </div>
            </form>
          </InputModal>
        </div>
      </div>
    </div>
  );
}
