import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonalStacking } from "@/components/PersonalStacking";
import { ChamaCircles } from "@/components/ChamaCircles";
import { P2PSending } from "@/components/P2PSending";
import { WalletConnect } from "@/components/WalletConnect";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { NetworkSwitcher } from "@/components/NetworkSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, Users, Send, Zap, TrendingUp, Trophy, LogOut, Wallet, Shield, Target, User } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("stacking");
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <Card className="bg-card/90 backdrop-blur-sm cyber-border neon-glow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow pulse-orange">
                <Coins className="w-8 h-8 text-black" />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground glitch-text">JENGA</CardTitle>
              <p className="text-muted-foreground cyber-text">STACK • CIRCLE • SEND</p>
              <div className="text-xs text-orange-400 font-mono mt-2">
                [FINANCIAL SOVEREIGNTY PROTOCOL]
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-muted-foreground font-mono text-sm">
                {'>'} CONNECT BITCOIN WALLET TO ACCESS CITREA L2
              </p>
              
              <Button 
                onClick={() => setShowWalletConnect(true)}
                className="w-full cyber-button h-12 font-mono"
              >
                <Wallet className="w-5 h-5 mr-2" />
                CONNECT WALLET
              </Button>
              
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                <div className="text-center">
                  <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">STACK</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">CIRCLE</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">SEND</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <WalletConnect 
          isOpen={showWalletConnect} 
          onClose={() => setShowWalletConnect(false)} 
        />
      </div>
    );
  }

  // Show onboarding for first-time users
  if (user?.isFirstTime) {
    return <OnboardingFlow />;
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-400 rounded-lg flex items-center justify-center neon-glow">
                <Coins className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground glitch-text">JENGA</h1>
                <p className="text-sm text-muted-foreground font-mono">STACK • CIRCLE • SEND</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NetworkSwitcher />
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 font-mono">
                <Zap className="w-3 h-3 mr-1" />
                TESTNET
              </Badge>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-mono">BALANCE</p>
                <p className="text-sm font-bold text-orange-400">{user?.balance.toLocaleString()} sats</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => window.location.href = '/accounts'}
                className="cyber-button"
              >
                <User className="w-4 h-4 mr-1" />
                ACCOUNT
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="cyber-button">
                <LogOut className="w-4 h-4 mr-1" />
                DISCONNECT
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-orange-400 text-black border-0 neon-glow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black/70 text-sm font-mono">TOTAL STACKED</p>
                  <p className="text-2xl font-bold">127,543 sats</p>
                  <p className="text-black/60 text-xs font-mono">~$51.23</p>
                </div>
                <TrendingUp className="w-8 h-8 text-black/70" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-mono">CURRENT STREAK</p>
                  <p className="text-2xl font-bold text-foreground">12 days</p>
                  <p className="text-green-400 text-xs font-mono">🔥 ON FIRE!</p>
                </div>
                <Trophy className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card cyber-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-mono">ACTIVE CHAMAS</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-blue-400 text-xs font-mono">CONTRIBUTING WEEKLY</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger 
              value="stacking" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <Target className="w-4 h-4 mr-2" />
              STACK
            </TabsTrigger>
            <TabsTrigger 
              value="chamas" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <Shield className="w-4 h-4 mr-2" />
              CIRCLE
            </TabsTrigger>
            <TabsTrigger 
              value="sending" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <Zap className="w-4 h-4 mr-2" />
              SEND
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stacking" className="mt-6">
            <PersonalStacking />
          </TabsContent>

          <TabsContent value="chamas" className="mt-6">
            <ChamaCircles />
          </TabsContent>

          <TabsContent value="sending" className="mt-6">
            <P2PSending />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="mb-2 font-mono">POWERED BY CITREA - BITCOIN'S ZK ROLLUP</p>
            <p className="text-sm font-mono">BUILDING THE FUTURE OF BITCOIN FINANCE, ONE SAT AT A TIME.</p>
            <div className="mt-4 text-xs text-orange-400 font-mono">
              [DECENTRALIZED • TRUSTLESS • SOVEREIGN]
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
