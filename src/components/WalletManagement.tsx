
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WalletConnect } from "@/components/WalletConnect";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet, Plus, Eye, EyeOff, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WalletManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(true);
  const [showWalletConnect, setShowWalletConnect] = useState(false);

  const wallets = [
    {
      id: "primary",
      name: "Primary Wallet",
      address: user?.address || "",
      balance: user?.balance || 0,
      type: "MetaMask",
      active: true
    },
    {
      id: "secondary",
      name: "Savings Wallet",
      address: "bc1q9k8f2h5g3j4l6m7n8p9r0s1t2u3v4w5x6y7z8a9",
      balance: 25000,
      type: "Xverse",
      active: false
    }
  ];

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "📋 Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground font-mono">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-400" />
              Wallet Overview
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBalance(!showBalance)}
              className="cyber-button"
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-6">
            <p className="text-muted-foreground font-mono mb-2">TOTAL BALANCE</p>
            {showBalance ? (
              <div>
                <p className="text-4xl font-bold text-orange-400 font-mono">
                  {(user?.balance + 25000).toLocaleString()}
                </p>
                <p className="text-muted-foreground font-mono">sats</p>
              </div>
            ) : (
              <p className="text-4xl font-bold text-muted-foreground font-mono">••••••</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-foreground font-mono">
            Connected Wallets
            <Button
              size="sm"
              onClick={() => setShowWalletConnect(true)}
              className="cyber-button bg-green-500 hover:bg-green-600 text-black"
            >
              <Plus className="w-4 h-4 mr-1" />
              ADD WALLET
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="p-4 rounded-lg border border-border bg-background/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground font-mono">{wallet.name}</h3>
                    <p className="text-sm text-muted-foreground font-mono">{wallet.type}</p>
                  </div>
                </div>
                {wallet.active && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50 font-mono">
                    ACTIVE
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-sm">ADDRESS:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-mono text-sm">
                      {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAddress(wallet.address)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-sm">BALANCE:</span>
                  <span className="text-orange-400 font-mono font-semibold">
                    {showBalance ? `${wallet.balance.toLocaleString()} sats` : '••••••'}
                  </span>
                </div>
              </div>

              {!wallet.active && (
                <Button size="sm" variant="outline" className="w-full mt-3 cyber-button">
                  SWITCH TO THIS WALLET
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <WalletConnect 
        isOpen={showWalletConnect} 
        onClose={() => setShowWalletConnect(false)} 
      />
    </div>
  );
};
