// src/pages/CreatePage.tsx
import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useRosca } from '@/hooks/useRosca';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FACTORY_ADDRESS } from '@/utils/constants';
import { TOKENS } from '@/config';
import { checkSufficientBalance } from '@/utils/walletUtils';
import { checkApprovalNeeded } from '@/utils/tokenApproval';
import InputModal from '@/components/InputModal';
import ApprovalStatus from '@/components/ApprovalStatus';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AlertCircle, Coins, Users, Clock, Shield, Loader2 } from 'lucide-react';
import { type Address, parseUnits } from 'viem';

export default function CreatePage() {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [isApproving, setIsApproving] = useState(false);
  const [approvalNeeded, setApprovalNeeded] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const roscaHook = useRosca(FACTORY_ADDRESS);
  const { addChama } = useDashboardData(); // Add this to update dashboard when chama is created

  const [formData, setFormData] = useState({
    token: 'cBTC' as 'cBTC' | 'USDC',
    contribution: '',
    securityDeposit: '5',
    roundDuration: '7',
    memberTarget: 5
  });

  // Token decimals
  const tokenDecimals = formData.token === 'cBTC' ? 18 : 6;
  const minAmount = 1 / 10 ** tokenDecimals; // 0.000001 for cBTC, 0.000001 for USDC

  // Amount needed for approval (USDC only)
  const totalAmountNeeded = useMemo(() => {
    if (formData.token !== 'USDC') return '0';
    const contribution = parseFloat(formData.contribution) || 0;
    const deposit = parseFloat(formData.securityDeposit) || 0;
    return (contribution + deposit).toString();
  }, [formData.token, formData.contribution, formData.securityDeposit]);

  // Approval status check (debounced)
  const checkApprovalStatus = useMemo(() => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (!primaryWallet?.address || !roscaHook.publicClient || formData.token !== 'USDC') {
          setApprovalNeeded(null); return;
        }
        try {
          const check = await checkApprovalNeeded(
            roscaHook.publicClient,
            TOKENS.USDC.address,
            primaryWallet.address as Address,
            FACTORY_ADDRESS,
            totalAmountNeeded,
            6
          );
          setApprovalNeeded(check.needsApproval);
        } catch {
          setApprovalNeeded(null);
        }
      }, 500);
    };
  }, [totalAmountNeeded, formData.token, primaryWallet?.address, roscaHook.publicClient]);

  useEffect(() => checkApprovalStatus(), [checkApprovalStatus]);

  const handleApproval = async () => {
    if (!primaryWallet?.address) return;
    setIsApproving(true);
    try {
      // Use the enhanced ROSCA hook's approveUSDC method
      const hash = await roscaHook.approveUSDC(FACTORY_ADDRESS, '1000000'); // Approve max amount
      if (hash) {
        toast({ title: '✅ USDC Approved' });
        setApprovalNeeded(false);
      } else {
        throw new Error('Approval transaction failed');
      }
    } catch (e: any) {
      toast({ title: '❌ Approval failed', description: e.message, variant: 'destructive' });
    } finally {
      setIsApproving(false);
    }
  };

  const validateForm = async () => {
    const errs: Record<string, string> = {};

    const contrib = parseFloat(formData.contribution);
    const deposit = parseFloat(formData.securityDeposit);

    if (!formData.contribution || contrib < minAmount) {
      errs.contribution = `Contribution must be ≥ ${minAmount} ${formData.token}`;
    }
    if (!formData.securityDeposit || deposit < minAmount) {
      errs.securityDeposit = `Security deposit must be ≥ ${minAmount} ${formData.token}`;
    }
    if (formData.memberTarget < 3 || formData.memberTarget > 15) {
      errs.memberTarget = 'Members must be 3-15';
    }

    // Balance check
    if (primaryWallet?.address && roscaHook.publicClient) {
      const total = contrib + deposit;
      const tokenAddr = formData.token === 'cBTC' ? null : TOKENS.USDC.address;
      try {
        const balance = await checkSufficientBalance(roscaHook.publicClient, primaryWallet.address as Address, tokenAddr, total.toString());
        if (!balance.sufficient && !balance.balanceCheckFailed) {
          errs.balance = `Insufficient ${formData.token} balance`;
        }
      } catch { }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(await validateForm()) || !primaryWallet?.address) return;

    // USDC path – ensure approval
    if (formData.token === 'USDC' && approvalNeeded) {
      toast({ title: '⚠️ USDC Approval Required', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const tokenAddress = formData.token === 'cBTC' ? TOKENS.NATIVE.address : TOKENS.USDC.address;

      // Use the new enhanced createROSCA method
      const txHash = await roscaHook.createROSCA(
        tokenAddress,
        formData.contribution,                        // contribution amount
        parseInt(formData.roundDuration) * 86400,     // round duration in seconds
        formData.memberTarget                         // max members
      );

      if (txHash) {
        toast({ 
          title: '🎉 ROSCA created!', 
          description: 'Your savings circle has been created successfully. Transaction hash: ' + txHash.slice(0, 10) + '...' 
        });
        
        // Note: The new createROSCA returns a transaction hash, not the ROSCA address
        // We need to extract the address from the transaction receipt/events
        // For now, just navigate to dashboard
        
        // First go to main dashboard
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (e: any) {
      toast({ title: '❌ Creation failed', description: e.message, variant: 'destructive' });
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
  const estimatedAPY = Math.round((12 / formData.memberTarget) * 100);
  const totalRequired = parseFloat(formData.contribution || '0') + parseFloat(formData.securityDeposit || '0');

  // Redirect to home if not logged in - run only when login status actually changes
  useEffect(() => {
    if (!isLoggedIn && !isCreating) {
      console.log('User not logged in, redirecting to home');
      navigate('/');
    }
  }, [isLoggedIn]); // Only depend on login status, not navigation function

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-gray to-dark-bg">
      <Header title="Create New Chama" />
      <div className="flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <InputModal
            title="Create Your Chama"
            description="Set up a new savings circle with your parameters"
            isOpen
            onClose={handleCancel}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Summary Card */}
              <div className="glassmorphism p-4 rounded-lg border border-bitcoin/30 mb-6">
                <h4 className="font-orbitron text-sm font-bold text-bitcoin mb-3">CIRCLE SUMMARY</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-electric" /><span className="text-gray-300">Est. APY:</span><span className="text-white font-bold">{estimatedAPY}%</span></div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-neon-green" /><span className="text-gray-300">Members:</span><span className="text-white font-bold">{formData.memberTarget}</span></div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /><span className="text-gray-300">Duration:</span><span className="text-white font-bold">{formData.roundDuration}d</span></div>
                  <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" /><span className="text-gray-300">Total Cost:</span><span className="text-white font-bold">{totalRequired} {formData.token}</span></div>
                </div>
              </div>

              {/* Token Selection */}
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Select value={formData.token} onValueChange={v => setFormData(p => ({ ...p, token: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cBTC">cBTC (Citrea Bitcoin)</SelectItem>
                    <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400">{formData.token === 'cBTC' ? 'Native Bitcoin on Citrea Layer 2' : 'Stable value, predictable returns'}</p>
                {formData.token === 'USDC' && primaryWallet?.address && (
                  <div className="mt-3 p-3 bg-dark-gray/50 rounded-lg border border-electric/20">
                    <ApprovalStatus
                      publicClient={roscaHook.publicClient}
                      userAddress={primaryWallet.address as Address}
                      spenderAddress={FACTORY_ADDRESS}
                      tokenAddress={TOKENS.USDC.address}
                      requiredAmount={totalAmountNeeded}
                      onApprovalNeeded={handleApproval}
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Contribution */}
              <div className="space-y-2">
                <Label>Contribution Amount per Round</Label>
                <Input
                  type="number"
                  step={minAmount}
                  min={minAmount}
                  placeholder={`e.g. ${minAmount}`}
                  value={formData.contribution}
                  onChange={e => setFormData(p => ({ ...p, contribution: e.target.value }))}
                />
                {errors.contribution && <div className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} />{errors.contribution}</div>}
              </div>

              {/* Security Deposit */}
              <div className="space-y-2">
                <Label>Security Deposit</Label>
                <Input
                  type="number"
                  step={minAmount}
                  min={minAmount}
                  placeholder={`e.g. ${minAmount}`}
                  value={formData.securityDeposit}
                  onChange={e => setFormData(p => ({ ...p, securityDeposit: e.target.value }))}
                />
                {errors.securityDeposit && <div className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} />{errors.securityDeposit}</div>}
              </div>

              {/* Round Duration */}
              <div className="space-y-2">
                <Label>Round Duration</Label>
                <Select value={formData.roundDuration} onValueChange={v => setFormData(p => ({ ...p, roundDuration: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 days (Fast)</SelectItem>
                    <SelectItem value="7">7 days (Standard)</SelectItem>
                    <SelectItem value="14">14 days (Relaxed)</SelectItem>
                    <SelectItem value="30">30 days (Monthly)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Member Target */}
              <div className="space-y-2">
                <Label>Member Target: <span className="text-bitcoin font-bold">{formData.memberTarget}</span></Label>
                <Slider value={[formData.memberTarget]} onValueChange={v => setFormData(p => ({ ...p, memberTarget: v[0] }))} min={3} max={15} step={1} />
                <div className="flex justify-between text-xs text-gray-400"><span>3 (Min)</span><span>15 (Max)</span></div>
                {errors.memberTarget && <div className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} />{errors.memberTarget}</div>}
              </div>

              {/* Errors */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg space-y-1">
                  {Object.entries(errors).map(([k, m]) => (
                    <div key={k} className="text-red-400 text-sm flex items-center gap-1"><AlertCircle size={14} />{m}</div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isCreating || roscaHook.isLoading} className="flex-1">Cancel</Button>
                <Button
                  type="submit"
                  disabled={isCreating || roscaHook.isLoading || (formData.token === 'USDC' && approvalNeeded === true)}
                  className="flex-1 bg-gradient-to-r from-bitcoin to-orange-600 hover:scale-105 transition-transform font-bold"
                >
                  {isCreating || roscaHook.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : approvalNeeded === true ? 'Approve USDC First' : 'Create Chama'}
                </Button>
              </div>
            </form>
          </InputModal>
        </div>
      </div>
    </div>
  );
}