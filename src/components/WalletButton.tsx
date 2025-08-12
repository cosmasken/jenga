import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';

export default function WalletButton() {
  const { setShowAuthFlow, primaryWallet, handleLogOut } = useDynamicContext();

  if (primaryWallet) {
    const address = primaryWallet.address;
    const shortAddress = `${address?.slice(0, 6)}...${address?.slice(-4)}`;
    
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={handleLogOut}
          className="glassmorphism px-6 py-2 rounded-lg border border-electric/50 hover:border-electric transition-all duration-300 hover:shadow-lg hover:shadow-electric/30"
        >
          <span className="text-electric font-medium">{shortAddress}</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowAuthFlow(true)}
      className="glassmorphism px-6 py-2 rounded-lg border border-electric/50 hover:border-electric transition-all duration-300 hover:shadow-lg hover:shadow-electric/30 animate-glow-pulse"
    >
      <span className="text-electric font-medium">Connect Wallet</span>
    </Button>
  );
}
