import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useTranslation } from 'react-i18next';
import { Wallet, Users, Shield, Coins, ArrowRight } from 'lucide-react';

export const LoggedOutView = () => {
  const { setShowAuthFlow } = useDynamicContext();
  const { t } = useTranslation();

  return (
    <div className="w-full">
      {/* Hero Section with Full Width Orange Background */}
      <div className="w-full bg-gradient-to-r from-orange-500 to-orange-400 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white font-mono">
            {t('app.name')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-mono mb-2">
            STACK • CIRCLE • SEND
          </p>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            {t('app.tagline')}
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

          {/* Simplified Connect Card */}
          <div className="max-w-md mx-auto">
            <Card className="border-orange-500/20 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Wallet className="w-6 h-6 text-orange-500" />
                  Get Started
                </CardTitle>
                <p className="text-muted-foreground">
                  Connect your wallet to start your Bitcoin savings journey
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => setShowAuthFlow(true)}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold py-3 text-lg"
                  size="lg"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  {t('wallet.connect')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Secure • Non-custodial • Bitcoin-native
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-8">How Jenga Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  1
                </div>
                <h3 className="font-semibold mb-2">Connect Wallet</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Bitcoin wallet to get started with Jenga
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  2
                </div>
                <h3 className="font-semibold mb-2">Join or Create</h3>
                <p className="text-sm text-muted-foreground">
                  Join existing chamas or create your own savings circle
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  3
                </div>
                <h3 className="font-semibold mb-2">Save & Earn</h3>
                <p className="text-sm text-muted-foreground">
                  Contribute regularly and receive payouts in rotation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
