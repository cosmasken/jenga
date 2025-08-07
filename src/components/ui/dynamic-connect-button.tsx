
import { Button } from '@/components/ui/button';
import { Wallet, Loader2 } from 'lucide-react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { cn } from '@/lib/utils';

interface DynamicConnectButtonProps {
  /**
   * Button text when wallet is not connected
   */
  connectText?: string;
  /**
   * Button text when wallet is connected
   */
  connectedText?: string;
  /**
   * Button size variant
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /**
   * Button style variant
   */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Show wallet icon
   */
  showIcon?: boolean;
  /**
   * Callback when connection state changes
   */
  onConnectionChange?: (isConnected: boolean) => void;
  /**
   * Custom loading text
   */
  loadingText?: string;
  /**
   * Show connected state (useful for landing page where we want to show connect button even when connected)
   */
  showConnectedState?: boolean;
}

/**
 * Custom Dynamic SDK connect button component
 * Uses setShowAuthFlow as documented in Dynamic SDK v4
 */
export function DynamicConnectButton({
  connectText = 'Connect Wallet',
  connectedText = 'Connected',
  size = 'default',
  variant = 'default',
  className,
  showIcon = true,
  onConnectionChange,
  loadingText = 'Connecting...',
  showConnectedState = true
}: DynamicConnectButtonProps) {
  const isLoggedIn = useIsLoggedIn();
  const { 
    setShowAuthFlow, 
    primaryWallet, 
    isVerificationInProgress 
  } = useDynamicContext();

  // Handle connection state changes
  React.useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isLoggedIn);
    }
  }, [isLoggedIn, onConnectionChange]);

  const handleConnect = () => {
    if (!isLoggedIn) {
      // Use setShowAuthFlow as documented in Dynamic SDK v4
      // Note: This may show a deprecation warning but is the officially documented method
      setShowAuthFlow(true);
    }
  };

  const getButtonText = () => {
    if (isVerificationInProgress) return loadingText;
    if (isLoggedIn && primaryWallet && showConnectedState) {
      return connectedText;
    }
    return connectText;
  };

  const getButtonIcon = () => {
    if (!showIcon) return null;
    
    if (isVerificationInProgress) {
      return <Loader2 size={16} className="animate-spin" />;
    }
    
    return <Wallet size={16} />;
  };

  const isButtonDisabled = isVerificationInProgress || (isLoggedIn && showConnectedState);

  return (
    <Button
      onClick={handleConnect}
      size={size}
      variant={variant}
      disabled={isButtonDisabled}
      className={cn(
        isLoggedIn && showConnectedState && 'bg-green-600 hover:bg-green-700',
        className
      )}
    >
      {getButtonIcon() && (
        <span className="mr-2">
          {getButtonIcon()}
        </span>
      )}
      {getButtonText()}
    </Button>
  );
}
