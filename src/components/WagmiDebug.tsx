import { useAccount, useBalance, useChainId } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WagmiDebug = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { data: balance } = useBalance({ address });
  const chainId = useChainId();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wagmi Connection Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Connection Status:</strong>
          <p>{isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Not Connected'}</p>
        </div>
        
        {isConnected && (
          <>
            <div>
              <strong>Address:</strong>
              <p className="text-sm font-mono break-all">{address}</p>
            </div>
            
            <div>
              <strong>Chain ID:</strong>
              <p>{chainId}</p>
            </div>
            
            <div>
              <strong>Balance:</strong>
              <p>{balance ? `${balance.formatted} ${balance.symbol}` : 'Loading...'}</p>
            </div>
          </>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>Expected Chain ID: 5115 (Citrea)</p>
          <p>If chain ID doesn't match, switch to Citrea network in your wallet</p>
        </div>
      </CardContent>
    </Card>
  );
};
