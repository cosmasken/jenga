import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { LogOut, Home, User } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  className?: string;
}

export function Header({ title, showBackButton = true, className = '' }: HeaderProps) {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet, handleLogOut } = useDynamicContext();

  const handleLogout = () => {
    if (handleLogOut) {
      handleLogOut();
      navigate('/');
    }
  };

  return (
    <header className={`flex items-center max-w-7xl mx-auto p-4 md:p-6 bg-dark-gray/50 border-b border-electric/20 ${className}`}>
      {/* <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white"
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        )}
        
        {title && (
          <h1 className="text-xl font-bold text-white">{title}</h1>
        )}
      </div> */}

      <div className="flex items-center justify-between w-full">
        {isLoggedIn && primaryWallet && (
          <>
            {/* Wallet Address Display */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-dark-bg rounded-lg border border-electric/20">
              <User className="w-4 h-4 text-electric" />
              <span className="text-sm font-mono text-gray-300">
                {primaryWallet.address?.slice(0, 6)}...{primaryWallet.address?.slice(-4)}
              </span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Disconnect</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
