/**
 * Wallet Dropdown Component
 * Provides wallet connection and management using Dynamic
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useDynamicContext, 
  DynamicWidget,
  useIsLoggedIn 
} from '@dynamic-labs/sdk-react-core';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  LogOut,
  Settings,
  User,
  Bitcoin,
  Shield,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { useRosca } from '@/hooks/useRosca';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { formatDistanceToNow } from 'date-fns';

interface WalletDropdownProps {
  className?: string;
}

export function WalletDropdown({ className = '' }: WalletDropdownProps) {
  const { 
    primaryWallet, 
    user, 
    handleLogOut,
    setShowDynamicUserProfile 
  } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { 
    balance, 
    isLoadingBalance, 
    refreshBalance 
  } = useRosca();
  const toast = useRoscaToast();
  const [isOpen, setIsOpen] = useState(false);

  // If not logged in, show the Dynamic connect widget
  if (!isLoggedIn || !primaryWallet) {
    return (
      <div className={className}>
        <DynamicWidget 
          variant="modal"
          buttonClassName="!bg-bitcoin hover:!bg-bitcoin-dark !text-white !border-bitcoin !rounded-lg !px-4 !py-2 !font-medium !transition-all !duration-200"
        />
      </div>
    );
  }

  const handleCopyAddress = async () => {
    if (primaryWallet?.address) {
      try {
        await navigator.clipboard.writeText(primaryWallet.address);
        toast.success('Address Copied!', 'Wallet address copied to clipboard');
      } catch (error) {
        toast.error('Copy Failed', 'Could not copy address to clipboard');
      }
    }
  };

  const handleViewOnExplorer = () => {
    if (primaryWallet?.address) {
      const explorerUrl = `https://explorer.testnet.citrea.xyz/address/${primaryWallet.address}`;
      window.open(explorerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenProfile = () => {
    setShowDynamicUserProfile(true);
  };

  const handleDisconnect = async () => {
    try {
      await handleLogOut();
      toast.success('Disconnected', 'Wallet disconnected successfully');
    } catch (error) {
      toast.error('Disconnect Failed', 'Could not disconnect wallet');
    }
  };

  const getDisplayName = () => {
    if (user?.email) return user.email;
    if (user?.phone) return user.phone;
    if (primaryWallet?.address) {
      return `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`;
    }
    return 'Unknown User';
  };

  const getWalletType = () => {
    return primaryWallet?.connector?.name || 'Unknown Wallet';
  };

  return (
    <div className={className}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 min-w-[140px] justify-between hover:bg-bitcoin/5 hover:border-bitcoin/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-bitcoin/10 rounded-full flex items-center justify-center">
                <Wallet className="h-3 w-3 text-bitcoin" />
              </div>
              <span className="font-medium text-sm truncate max-w-[80px]">
                {getDisplayName()}
              </span>
            </div>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-80 p-0">
          <div className="p-4 bg-gradient-to-r from-bitcoin/5 to-bitcoin/10 border-b">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-bitcoin/20 rounded-full flex items-center justify-center">
                <Wallet className="h-5 w-5 text-bitcoin" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {getDisplayName()}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {getWalletType()}
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <Activity className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            </div>

            {/* Balance Display */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-4 w-4 text-bitcoin" />
                  <span className="text-sm font-medium">Balance</span>
                </div>
                {isLoadingBalance ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
                ) : (
                  <span className="font-mono text-sm font-bold">
                    {parseFloat(balance).toFixed(6)} cBTC
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
              Wallet Actions
            </DropdownMenuLabel>
            
            <DropdownMenuItem 
              onClick={handleCopyAddress}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer"
            >
              <Copy className="h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={handleViewOnExplorer}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View on Explorer</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2">
              Account
            </DropdownMenuLabel>

            <DropdownMenuItem 
              onClick={handleOpenProfile}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer"
            >
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-2 py-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </div>

          {/* Wallet Info Footer */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border-t text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Network: Citrea Testnet</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Online</span>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Compact Wallet Button for mobile/small spaces
 */
export function CompactWalletButton({ className = '' }: WalletDropdownProps) {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { balance } = useRosca();

  if (!isLoggedIn || !primaryWallet) {
    return (
      <div className={className}>
        <DynamicWidget 
          variant="modal"
          buttonClassName="!bg-bitcoin hover:!bg-bitcoin-dark !text-white !border-bitcoin !rounded-full !w-10 !h-10 !p-0 !flex !items-center !justify-center"
        >
          <Wallet className="h-4 w-4" />
        </DynamicWidget>
      </div>
    );
  }

  return (
    <div className={className}>
      <WalletDropdown />
    </div>
  );
}

/**
 * Wallet Status Indicator (for dashboard/header)
 */
export function WalletStatusIndicator() {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { balance, isLoadingBalance } = useRosca();

  if (!isLoggedIn || !primaryWallet) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span>Not Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-gray-600 dark:text-gray-400">Connected</span>
      <div className="flex items-center gap-1">
        <Bitcoin className="h-3 w-3 text-bitcoin" />
        {isLoadingBalance ? (
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-3 w-12 rounded"></div>
        ) : (
          <span className="font-mono text-xs font-medium">
            {parseFloat(balance).toFixed(4)} cBTC
          </span>
        )}
      </div>
    </div>
  );
}
