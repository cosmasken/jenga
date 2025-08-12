// src/pages/JoinChamaPage.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useRosca } from '@/hooks/useRosca';
import { useDashboardData } from '@/hooks/useDashboardData';
import { FACTORY_ADDRESS } from '@/utils/constants';
import { TOKENS } from '@/config';
import InputModal from '@/components/InputModal';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2, Users } from 'lucide-react';
import { type Address, isAddress } from 'viem';

export default function JoinChamaPage() {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [isJoining, setIsJoining] = useState(false);
  const [chamaAddress, setChamaAddress] = useState('');
  const [error, setError] = useState('');

  const roscaHook = useRosca(FACTORY_ADDRESS);
  const { addChama } = useDashboardData(); // Add this to update dashboard when chama is joined

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn && !isJoining) {
      navigate('/');
    }
  }, [isLoggedIn, navigate, isJoining]);

  const validateAddress = (address: string): boolean => {
    if (!address) {
      setError('Chama address is required');
      return false;
    }

    if (!isAddress(address)) {
      setError('Invalid Ethereum address format');
      return false;
    }

    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddress(chamaAddress) || !primaryWallet?.address) {
      return;
    }

    setIsJoining(true);
    try {
      const hash = await roscaHook.join(chamaAddress as Address);

      if (hash) {
        toast({
          title: '🎉 Successfully joined chama!',
          description: 'You are now a member of this savings circle.'
        });
        
        // Add the chama to the dashboard
        addChama(chamaAddress as Address);
        
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (e: any) {
      console.error('Join failed:', e);
      toast({
        title: '❌ Failed to join chama',
        description: e.message || 'An error occurred while joining the chama',
        variant: 'destructive'
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => navigate('/dashboard');

  if (!isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-gray to-dark-bg">
      <Header title="Join Chama" />
      <div className="flex items-center justify-center px-4 py-8">
        <div className="max-w-md mx-auto">
          <InputModal
            title="Join a Chama"
            description="Enter the chama address to join an existing savings circle"
            isOpen
            onClose={handleCancel}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Info Card */}
              <div className="glassmorphism p-4 rounded-lg border border-electric/30 mb-6">
                <h4 className="font-orbitron text-sm font-bold text-electric mb-3">
                  <Users className="inline w-4 h-4 mr-2" />
                  JOINING A CHAMA
                </h4>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• You'll need to pay a security deposit to join</p>
                  <p>• Make sure you can commit to regular contributions</p>
                  <p>• Review the chama terms before joining</p>
                </div>
              </div>

              {/* Chama Address Input */}
              <div className="space-y-2 text-black">
                <Label htmlFor="chamaAddress" className="text-black">
                  Chama Contract Address
                </Label>
                <Input
                  id="chamaAddress"
                  type="text"
                  placeholder="0x..."
                  value={chamaAddress}
                  onChange={(e) => {
                    setChamaAddress(e.target.value);
                    if (error) setError(''); // Clear error on input change
                  }}
                  className="bg-dark-gray/50 border-gray-600 text-black placeholder-gray-400"
                />
                <p className="text-xs text-gray-400">
                  Enter the Ethereum address of the chama you want to join
                </p>
                {error && (
                  <div className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isJoining || roscaHook.isLoading}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isJoining || roscaHook.isLoading || !chamaAddress}
                  className="flex-1 bg-gradient-to-r from-electric to-blue-600 hover:scale-105 transition-transform font-bold"
                >
                  {isJoining || roscaHook.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Join Chama
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
