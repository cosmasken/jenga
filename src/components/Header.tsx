import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { WalletDropdown } from './WalletDropdown';
import { DynamicConnectButton } from '@/components/ui/dynamic-connect-button';
import { LogOut, Home, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

export function Header({ title, showBackButton = true, className = '' }: HeaderProps) {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();

  return (
    <header className={`flex items-center max-w-7xl mx-auto p-4 md:p-6 bg-dark-gray/50 border-b border-electric/20 ${className}`}>
      <div className="flex items-center justify-between w-full">
        {/* Left side - Title or Logo */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          )}
          
          {title && (
            <h1 className="text-xl font-bold text-white">{title}</h1>
          )}
        </div>

        {/* Right side - Wallet */}
        <div className="flex items-center space-x-3">
          {isLoggedIn && primaryWallet ? (
            <WalletDropdown />
          ) : (
            <DynamicConnectButton
              connectText="Connect Wallet"
              variant="outline"
              className="bg-bitcoin hover:bg-bitcoin/90 border-bitcoin text-white"
              showIcon={true}
            />
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
