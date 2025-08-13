import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WalletBalance } from './WalletBalance';
import { 
  User, 
  LogOut, 
  Copy, 
  ExternalLink, 
  ChevronDown,
  Wallet,
  RefreshCw
} from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { NETWORK_CONFIG } from '@/config';

interface WalletDropdownProps {
  className?: string;
}

export function WalletDropdown({ className = '' }: WalletDropdownProps) {
  const [, navigate] = useLocation();
  const { primaryWallet, handleLogOut } = useDynamicContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!primaryWallet?.address) {
    return null;
  }

  const handleLogout = () => {
    if (handleLogOut) {
      handleLogOut();
      navigate('/');
      toast({
        title: '👋 Disconnected',
        description: 'Wallet disconnected successfully',
      });
    }
    setIsOpen(false);
  };

  const copyAddress = async () => {
    if (primaryWallet.address) {
      try {
        await navigator.clipboard.writeText(primaryWallet.address);
        toast({
          title: '📋 Copied!',
          description: 'Wallet address copied to clipboard',
        });
      } catch (error) {
        console.error('Failed to copy address:', error);
        toast({
          title: '❌ Copy failed',
          description: 'Could not copy address to clipboard',
          variant: 'destructive',
        });
      }
    }
    setIsOpen(false);
  };

  const openExplorer = () => {
    if (primaryWallet.address) {
      const explorerUrl = `${NETWORK_CONFIG.EXPLORER_URL}/address/${primaryWallet.address}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
    setIsOpen(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center space-x-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700/50 text-gray-300 hover:text-white ${className}`}
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline font-mono">
            {formatAddress(primaryWallet.address)}
          </span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-gray-900 border-gray-700 text-gray-300"
      >
        {/* Header */}
        <DropdownMenuLabel className="flex items-center space-x-2 text-gray-200">
          <User className="w-4 h-4" />
          <span>Wallet</span>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Address Display */}
        <div className="px-2 py-2">
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg">
            <span className="text-xs text-gray-400">Address</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm text-gray-300">
                {formatAddress(primaryWallet.address)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0 hover:bg-gray-700"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        <div className="px-2 py-2">
          <div className="text-xs text-gray-400 mb-2 px-2">Balances</div>
          <WalletBalance showUsdValue={false} />
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Actions */}
        <DropdownMenuItem 
          onClick={copyAddress}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Address</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={openExplorer}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View on Explorer</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 cursor-pointer hover:bg-gray-800 focus:bg-gray-800"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Balances</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center space-x-2 cursor-pointer hover:bg-red-900/50 focus:bg-red-900/50 text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span>Disconnect</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WalletDropdown;
