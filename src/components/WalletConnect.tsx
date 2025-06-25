
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, Zap, Shield, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface WalletConnectProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnect = ({ isOpen, onClose }: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const mockWallets = [
    { name: "MetaMask", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", icon: Shield },
    { name: "Leather", address: "bc1q9k8f2h5g3j4l6m7n8p9r0s1t2u3v4w5x6y7z8a9", icon: Lock },
    { name: "Xverse", address: "bc1qw2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9m0n", icon: Zap }
  ];

  const handleConnect = async (wallet: typeof mockWallets[0]) => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login(wallet.address);
    
    toast({
      title: "🚀 WALLET CONNECTED",
      description: `Connected to ${wallet.name} - Welcome to the revolution!`,
    });
    
    setIsConnecting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card cyber-border neon-glow max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-foreground font-mono">
            <Wallet className="w-6 h-6 text-orange-400" />
            CONNECT WALLET
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <p className="text-muted-foreground text-sm font-mono">
            > SELECT YOUR BITCOIN WALLET TO ACCESS CITREA L2
          </p>
          
          {mockWallets.map((wallet) => {
            const IconComponent = wallet.icon;
            return (
              <Button
                key={wallet.name}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting}
                className="w-full justify-start gap-3 h-auto p-4 cyber-button"
                variant="outline"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center neon-glow">
                  <IconComponent className="w-4 h-4 text-black" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground font-mono">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{wallet.address.slice(0, 20)}...</div>
                </div>
              </Button>
            );
          })}
          
          {isConnecting && (
            <div className="text-center text-orange-400 text-sm font-mono animate-pulse">
              > ESTABLISHING SECURE CONNECTION...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
