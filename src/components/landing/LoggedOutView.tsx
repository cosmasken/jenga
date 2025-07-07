import { Button } from "@/components/ui/button";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Wallet, Users, Shield, Coins } from 'lucide-react';

export const LoggedOutView = () => {
  const { setShowAuthFlow } = useDynamicContext();

  return (
    <div className="w-full">
      {/* Hero Section with Full Width Orange Background */}
      <div className="w-full bg-gradient-to-r from-orange-500 to-orange-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white font-mono">
            JENGA
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-mono mb-2">
            STACK • CIRCLE • SEND
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Bitcoin-Native Community Lending Circles on Citrea
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 rounded-lg bg-muted/50 border border-orange-500/20">
              <Users className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2">Community Savings</h3>
              <p className="text-muted-foreground">Join rotating savings circles with your community</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/50 border border-orange-500/20">
              <Shield className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2">Trustless</h3>
              <p className="text-muted-foreground">Smart contracts eliminate the need for trusted treasurers</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-muted/50 border border-orange-500/20">
              <Coins className="w-12 h-12 mx-auto mb-4 text-orange-500" />
              <h3 className="text-xl font-bold mb-2">Bitcoin Native</h3>
              <p className="text-muted-foreground">Built on Citrea, keeping everything Bitcoin-native</p>
            </div>
          </div>

          {/* Login Card */}
          <div className="max-w-md mx-auto">
            <div className="bg-card/90 backdrop-blur-sm border border-orange-500/20 shadow-xl rounded-xl p-8">
              <h2 className="text-2xl font-bold text-center mb-2">Get Started</h2>
              <p className="text-muted-foreground text-center mb-8">
                Connect your wallet to start stacking sats with your community
              </p>
              
              <Button 
                onClick={() => setShowAuthFlow(true)}
                className="w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    OR
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-xs font-mono text-muted-foreground">
                    EMAIL
                  </label>
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="w-full px-3 py-2 bg-background border border-border rounded-md font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                  />
                </div>
                <Button variant="outline" className="w-full font-mono border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/10">
                  Continue with Email
                </Button>
              </div>
            </div>
            
            <p className="text-center mt-6 text-sm text-muted-foreground">
              By connecting, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
