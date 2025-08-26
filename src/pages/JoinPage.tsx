import React, { useState, useEffect } from 'react';
import { useLocation, useSearch } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { blockchainService } from '@/services/blockchainService';
import { useRosca } from '@/hooks/useRosca';
import { FACTORY_ADDRESS } from '@/utils/constants';
import InputModal from '@/components/InputModal';
import EmptyState from '@/components/EmptyState';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Link, Users, Coins, Clock, Shield, CheckCircle } from 'lucide-react';
import { isAddress, type Address } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

export default function JoinPage() {
  const [, navigate] = useLocation();
  const searchParams = useSearch();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const queryClient = useQueryClient();
  const roscaHook = useRosca(FACTORY_ADDRESS);
  
  // Initialize blockchain service
  React.useEffect(() => {
    blockchainService.setRoscaHook(roscaHook);
  }, [roscaHook]);
  
  const [chamaAddress, setChamaAddress] = useState('');
  const [error, setError] = useState('');
  const [chamaInfo, setChamaInfo] = useState<any>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

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
      // Use the blockchain service to get info
      const info = await blockchainService.getROSCAInfo(chamaAddr as Address);
      if (!info) throw new Error('Failed to fetch ROSCA info');
      
      // Get deposit info
      const deposit = await blockchainService.getRequiredDeposit(chamaAddr as Address);
      
      // Convert blockchain data to display format (native ETH only)
      const decimals = 18;
      const divisor = 1e18;
      
      const displayInfo = {
        token: 'cBTC',
        contributionAmount: (Number(info.contributionAmount) / divisor).toString(),
        securityDeposit: deposit ? (Number(deposit) / divisor).toString() : '0',
        memberTarget: info.maxMembers,
        currentMembers: info.totalMembers,
        roundDuration: Math.floor(info.roundDuration / (24 * 60 * 60)), // Convert seconds to days
        creator: '0x...', // Not available in enhanced version
        isActive: info.status === 0 || info.status === 1 || info.status === 2, // RECRUITING, WAITING, or ACTIVE
        totalRounds: info.maxMembers,
        status: info.status,
      };
      
      setChamaInfo(displayInfo);
    } catch (error) {
      console.error('Failed to load chama info:', error);
      toast({
        title: "❌ Failed to load chama info",
        description: error instanceof Error ? error.message : "Could not retrieve chama details",
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
    
    setIsJoining(true);
    try {
      // First, check if the ROSCA is in RECRUITING status
      const roscaInfo = await blockchainService.getROSCAInfo(chamaAddress as Address);
      
      if (!roscaInfo) {
        toast({
          title: "❌ Invalid ROSCA",
          description: "Could not find ROSCA information. Please check the address.",
          variant: "destructive",
        });
        return;
      }

      // Check if ROSCA is in RECRUITING status (0)
      if (roscaInfo.status !== 0) {
        const statusNames = ['RECRUITING', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
        const currentStatus = statusNames[roscaInfo.status] || 'UNKNOWN';
        
        toast({
          title: "❌ Cannot Join ROSCA",
          description: `This ROSCA is currently ${currentStatus} and not accepting new members.`,
          variant: "destructive",
        });
        return;
      }

      // Check if ROSCA is full
      if (roscaInfo.memberCount >= roscaInfo.maxMembers) {
        toast({
          title: "❌ ROSCA Full",
          description: "This ROSCA has reached its maximum number of members.",
          variant: "destructive",
        });
        return;
      }

      // Check if user is already a member
      const isMember = await blockchainService.isMember(chamaAddress as Address, primaryWallet.address as Address);
      if (isMember) {
        toast({
          title: "ℹ️ Already a Member",
          description: "You are already a member of this ROSCA.",
          variant: "default",
        });
        navigate(`/dashboard/${chamaAddress}`);
        return;
      }

      // All checks passed, proceed with joining
      const txHash = await blockchainService.joinROSCA(chamaAddress as Address);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['chama-membership', primaryWallet.address] });
      queryClient.invalidateQueries({ queryKey: ['chama-info', chamaAddress] });
      
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
        description: error instanceof Error ? error.message : "Could not join chama. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const canJoin = chamaInfo && 
    chamaInfo.status === 0 && // Must be in RECRUITING status
    chamaInfo.currentMembers < chamaInfo.memberTarget; // Must have available spots
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
                    <span className="text-gray-300">Status:</span>
                    <span className={`font-bold ${
                      chamaInfo.status === 0 ? 'text-neon-green' : 
                      chamaInfo.status === 1 ? 'text-yellow-400' :
                      chamaInfo.status === 2 ? 'text-blue-400' :
                      chamaInfo.status === 3 ? 'text-gray-400' : 'text-red-400'
                    }`}>
                      {['RECRUITING', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'][chamaInfo.status] || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Contribution:</strong> {chamaInfo.contributionAmount} {chamaInfo.token} per round
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Security Deposit:</strong> {chamaInfo.securityDeposit} {chamaInfo.token} (returned when complete)
                  </div>
                  <div className="text-sm text-gray-300 mb-2">
                    <strong>Total Cost:</strong> {totalCost} {chamaInfo.token}
                  </div>
                  
                  {/* Status-specific messages */}
                  {chamaInfo.status !== 0 && (
                    <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                      <div className="flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold">Cannot Join</span>
                      </div>
                      <p className="text-sm text-yellow-300 mt-1">
                        {chamaInfo.status === 1 && "This ROSCA is waiting to start and no longer accepting new members."}
                        {chamaInfo.status === 2 && "This ROSCA is currently active and not accepting new members."}
                        {chamaInfo.status === 3 && "This ROSCA has completed all rounds."}
                        {chamaInfo.status === 4 && "This ROSCA has been cancelled."}
                      </p>
                    </div>
                  )}
                  
                  {chamaInfo.status === 0 && chamaInfo.currentMembers >= chamaInfo.memberTarget && (
                    <div className="mt-4 p-3 rounded-lg bg-orange-900/20 border border-orange-500/30">
                      <div className="flex items-center gap-2 text-orange-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold">ROSCA Full</span>
                      </div>
                      <p className="text-sm text-orange-300 mt-1">
                        This ROSCA has reached its maximum number of members.
                      </p>
                    </div>
                  )}
                  <div className="text-sm text-gray-300">
                    <strong>Total Rounds:</strong> {chamaInfo.totalRounds}
                  </div>
                </div>

                {/* Status Messages */}
                {chamaInfo && chamaInfo.status === 0 && chamaInfo.currentMembers >= chamaInfo.memberTarget && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 text-sm">This ROSCA is full</span>
                  </div>
                )}

                {chamaInfo && chamaInfo.status !== 0 && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">
                      This ROSCA is {['RECRUITING', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'][chamaInfo.status]} and not accepting new members
                    </span>
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
                  disabled={isJoining || isLoadingInfo}
                  className="flex-1 glassmorphism border-gray-500 text-gray-300 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isJoining || isLoadingInfo || !chamaAddress || !!error || !canJoin}
                  className="flex-1 bg-gradient-to-r from-electric to-blue-600 hover:scale-105 transition-transform font-bold disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isJoining ? (
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
