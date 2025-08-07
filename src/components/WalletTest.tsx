/**
 * Test component to verify wallet functionality for both regular and embedded wallets
 */


import { useDynamicContext, useDynamicWaas } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRosca } from '@/hooks/useRosca';

export function WalletTest() {
  const { primaryWallet, user } = useDynamicContext();
  const { userHasEmbeddedWallet } = useDynamicWaas();
  const { balance, getBalance, isConnected } = useRosca();

  const getWalletType = () => {
    if (!primaryWallet) return 'Not connected';
    
    if (isEthereumWallet(primaryWallet)) {
      return 'Ethereum Wallet (External)';
    }
    
    if (userHasEmbeddedWallet) {
      return 'Embedded Wallet (MPC)';
    }
    
    return 'Unknown Wallet Type';
  };

  const getLoginMethod = () => {
    if (!user) return 'Not logged in';
    
    // Check if user has social auth
    if (user.verifiedCredentials?.some(cred => 
      ['google', 'twitter', 'github', 'discord'].includes(cred.oauthProvider || '')
    )) {
      return 'Social Login';
    }
    
    return 'Web3 Wallet';
  };

  const canMakeTransactions = () => {
    return primaryWallet && (isEthereumWallet(primaryWallet) || userHasEmbeddedWallet);
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Wallet Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Connection Status:</p>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div>
          <p className="text-sm font-medium">Wallet Type:</p>
          <p className="text-sm text-gray-600">{getWalletType()}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Login Method:</p>
          <p className="text-sm text-gray-600">{getLoginMethod()}</p>
        </div>

        <div>
          <p className="text-sm font-medium">Address:</p>
          <p className="text-sm text-gray-600 break-all">
            {primaryWallet?.address || 'Not available'}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium">Balance:</p>
          <p className="text-sm text-gray-600">{balance} cBTC</p>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => getBalance()}
            className="mt-1"
          >
            Refresh Balance
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium">Transaction Capable:</p>
          <Badge variant={canMakeTransactions() ? "default" : "destructive"}>
            {canMakeTransactions() ? "Yes" : "No"}
          </Badge>
        </div>

        {user?.verifiedCredentials && (
          <div>
            <p className="text-sm font-medium">Verified Credentials:</p>
            <div className="space-y-1">
              {user.verifiedCredentials.map((cred, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {cred.oauthProvider || cred.email || 'Unknown'}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
