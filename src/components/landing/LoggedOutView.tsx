import { Button } from "@/components/ui/button";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Wallet } from 'lucide-react';

export const LoggedOutView = () => {
  const { setShowAuthFlow } = useDynamicContext();

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-orange-400 glitch-text">JENGA</h1>
          <p className="text-muted-foreground font-mono">STACK • CIRCLE • SEND</p>
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm border border-orange-500/20 shadow-lg rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-2">Welcome</h2>
          <p className="text-muted-foreground text-center mb-8">
            Connect your wallet to start stacking sats with your community
          </p>
          
          <Button 
            onClick={() => setShowAuthFlow(true)}
            className="w-full py-6 text-lg bg-orange-500 hover:bg-orange-600 text-black font-bold"
          >
            <Wallet className="w-5 h-5 mr-2" />
            Connect Wallet
          </Button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
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
                className="w-full px-3 py-2 bg-background border border-border rounded-md font-mono text-sm"
              />
            </div>
            <Button variant="outline" className="w-full font-mono">
              Continue with Email
            </Button>
          </div>
        </div>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          By connecting, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
