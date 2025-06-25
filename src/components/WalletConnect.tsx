
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wallet, Zap } from "lucide-react";
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
    { name: "MetaMask", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
    { name: "Leather", address: "bc1q9k8f2h5g3j4l6m7n8p9r0s1t2u3v4w5x6y7z8a9" },
    { name: "Xverse", address: "bc1qw2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9m0n" }
  ];

  const handleConnect = async (wallet: typeof mockWallets[0]) => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    login(wallet.address);
    
    toast({
      title: "🎉 Wallet Connected!",
      description: `Connected to ${wallet.name} successfully`,
    });
    
    setIsConnecting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-orange-50 to-amber-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wallet className="w-6 h-6 text-orange-600" />
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          <p className="text-gray-600 text-sm">
            Choose your Bitcoin wallet to start stacking, sending, and joining Chamas
          </p>
          
          {mockWallets.map((wallet) => (
            <Button
              key={wallet.name}
              onClick={() => handleConnect(wallet)}
              disabled={isConnecting}
              className="w-full justify-start gap-3 h-auto p-4 bg-white hover:bg-orange-50 text-gray-900 border border-orange-200"
              variant="outline"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold">{wallet.name}</div>
                <div className="text-xs text-gray-500">{wallet.address.slice(0, 20)}...</div>
              </div>
            </Button>
          ))}
          
          {isConnecting && (
            <div className="text-center text-orange-600 text-sm">
              Connecting wallet...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
