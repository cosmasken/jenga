import { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useRosca } from '@/hooks/useRosca';
import { chamaStateManager } from '@/services/chamaStateManager';
import { FACTORY_ADDRESS } from '@/utils/constants';
import InputModal from '@/components/InputModal';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Link, Users, Coins, Clock, Shield, CheckCircle } from 'lucide-react';
import { isAddress, type Address } from 'viem';

export default function JoinPage() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const roscaHook = useRosca(FACTORY_ADDRESS);
  
  const [chamaAddress, setChamaAddress] = useState('');
  const [error, setError] = useState('');
  const [chamaInfo, setChamaInfo] = useState<any>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);

  // Check for address in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(searchParams);
    const addressFromUrl = urlParams.get('address');
    if (addressFromUrl && isAddress(addressFromUrl)) {
      setChamaAddress(addressFromUrl);
      loadChamaInfo(addressFromUrl);
    }
  }, [searchParams]);

  // Redirect if wallet not connected
  useEffect(() => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    if (!primaryWallet) {
      toast({
        title: "Wallet Connection Required",
        description: "Please connect your wallet to join a Chama.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [isLoggedIn, primaryWallet, navigate]);

  const loadChamaInfo = async (chamaAddr: string) => {
    if (!isAddress(chamaAddr)) return;
    
    setIsLoadingInfo(true);
    try {
      // Use the real rosca hook to get chama info
      const info = await roscaHook.getChamaInfo(chamaAddr as Address);
      
      // Convert blockchain data to display format
      const displayInfo = {
        token: info.token ? 'USDC' : 'ETH',
        contributionAmount: (Number(info.contribution) / 1e18).toString(),
        securityDeposit: (Number(info.securityDeposit) / 1e18).toString(),
        memberTarget: info.memberTarget,
        currentMembers: info.totalMembers,
        roundDuration: Math.floor(info.roundDuration / (24 * 60 * 60)), // Convert seconds to days
        creator: '0x1234...5678', // TODO: Get from contract
        isActive: info.isActive,
        totalRounds: info.memberTarget, // Assuming total rounds = member target
      };
      
      setChamaInfo(displayInfo);
    } catch (error) {
      console.error('Failed to load chama info:', error);
      toast({
        title: "❌ Failed to load chama info",
        description: roscaHook.error || "Could not retrieve chama details",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const validateAddress = (address: string): boolean => {
    if (!address) {
      setError('');
      setChamaInfo(null);
      return false;
    }
    
    if (!isAddress(address)) {
      setError('Invalid address format');
      setChamaInfo(null);
      return false;
    }
    
    setError('');
    return true;
  };

  const handleAddressChange = (newAddress: string) => {
    setChamaAddress(newAddress);
    const isValid = validateAddress(newAddress);
    
    if (isValid) {
      loadChamaInfo(newAddress);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddress(chamaAddress) || !primaryWallet?.address) return;
    
    try {
      // Use the real rosca hook to join
      await roscaHook.join(chamaAddress as Address);
      
      // Update state manager with the join action
      await chamaStateManager.handleActionResult('join', chamaAddress as Address, primaryWallet.address as Address, roscaHook);
      
      toast({
        title: "🎉 Successfully joined!",
        description: "Welcome to the savings circle. Waiting for more members to join.",
      });
      
      setTimeout(() => {
        navigate(`/dashboard/${chamaAddress}`);
      }, 1500);
      
    } catch (error) {
      toast({
        title: "❌ Join failed",
        description: roscaHook.error || "Could not join chama. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const canJoin = chamaInfo && chamaInfo.currentMembers < chamaInfo.memberTarget && chamaInfo.isActive;
  const totalCost = chamaInfo ? parseFloat(chamaInfo.contributionAmount) + parseFloat(chamaInfo.securityDeposit) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <InputModal
          title="Join a Chama"
          description="Enter the group code you received from a friend"
          isOpen={true}
          onClose={handleCancel}
        >
          {!chamaAddress && !chamaInfo && (
            <EmptyState
              icon={Link}
              title="Ready to Connect"
              description="Paste the group code you received from a friend"
              className="py-8 mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Chama Address */}
            <div className="space-y-2">
              <Label htmlFor="chamaAddress">Chama Address</Label>
              <Input
                id="chamaAddress"
                type="text"
                placeholder="0x..."
                value={chamaAddress}
                onChange={(e) => handleAddressChange(e.target.value)}
                className="bg-dark-gray border-electric/30 text-white focus:border-electric font-mono"
              />
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoadingInfo && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-electric border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300">Loading chama details...</span>
                </div>
              </div>
            )}

            {/* Chama Info Display */}
            {chamaInfo && !isLoadingInfo && (
              <div className="glassmorphism p-6 rounded-lg border border-electric/30 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <h4 className="font-orbitron text-lg font-bold text-neon-green">Chama Found!</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-electric" />
                    <span className="text-gray-300">Token:</span>
                    <span className="text-white font-bold">{chamaInfo.token}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neon-green" />
                    <span className="text-gray-300">Members:</span>
                    <span className="text-white font-bold">
                      {chamaInfo.currentMembers}/{chamaInfo.memberTarget}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Round:</span>
                    <span className="text-white font-bold">{chamaInfo.roundDuration} days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Total Cost:</span>
                    <span className="text-white font-bold">{totalCost} {chamaInfo.token}</span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Contribution:</strong> {chamaInfo.contributionAmount} {chamaInfo.token} per round
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Security Deposit:</strong> {chamaInfo.securityDeposit} {chamaInfo.token} (returned when complete)
                  </div>
                  <div className="text-sm text-gray-300">
                    <strong>Total Rounds:</strong> {chamaInfo.totalRounds}
                  </div>
                </div>

                {/* Status Messages */}
                {!canJoin && chamaInfo.currentMembers >= chamaInfo.memberTarget && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">This chama is full</span>
                  </div>
                )}

                {!canJoin && !chamaInfo.isActive && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">This chama is no longer active</span>
                  </div>
                )}

                {canJoin && (
                  <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                    <span className="text-neon-green text-sm">
                      Ready to join! {chamaInfo.memberTarget - chamaInfo.currentMembers} spots remaining
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={roscaHook.isLoading}
                className="flex-1 glassmorphism border-gray-500 text-gray-300 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={roscaHook.isLoading || !chamaAddress || !!error || !canJoin}
                className="flex-1 bg-gradient-to-r from-electric to-blue-600 hover:scale-105 transition-transform font-bold disabled:opacity-50 disabled:hover:scale-100"
              >
                {roscaHook.isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Joining...
                  </div>
                ) : (
                  "Join Chama"
                )}
              </Button>
            </div>
          </form>
        </InputModal>
      </div>
    </div>
  );
}
