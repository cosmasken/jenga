import { useState, useEffect } from "react";
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
import { useAppStore } from "@/store/appStore";
import { useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { LoggedInView } from "@/components/landing/LoggedInView";
import { LoggedOutView } from "@/components/landing/LoggedOutView";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";


import { Coins, Users, Send, Zap, TrendingUp, Trophy, LogOut, Wallet, Shield, Target, User } from "lucide-react";

const Index = () => {
  // Extend the UserProfile type to include the properties we need
  interface ExtendedUserProfile extends UserProfile {
    userId?: string;
    email?: string;
    // Add any other properties you need from the dynamic user
  }

  // Use type assertion to extend the user object
  const { user: dynamicUser, primaryWallet } = useDynamicContext();
  const isAuthenticated = !!primaryWallet;
  const { user, setUser, updateUser, completeOnboarding } = useAppStore();

  // Sync Dynamic user with our store
  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && dynamicUser) {
        // Generate a consistent wallet address
        // In a real app, you'd get this from the connected wallet
        const walletAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
        
        // Generate a consistent username from email or use a default
        const username = dynamicUser.email?.split('@')[0] || 'User';
        
        // Check if we already have this user in our store
        if (!user || (dynamicUser.userId && user.id !== dynamicUser.userId)) {
          // Create a new user with dummy data where needed
          setUser({
            id: dynamicUser.userId || `user-${Date.now()}`,
            name: username,
            email: dynamicUser.email || `${username.toLowerCase()}@example.com`,
            role: 'member',
            walletAddress,
            isFirstTime: true
          });
        } else if (walletAddress && user.walletAddress !== walletAddress) {
          // Update wallet address if it changed
          updateUser({ walletAddress });
        }
      } else if (!isAuthenticated) {
        // Clear user when logged out
        setUser(null);
      }
    };

    syncUser();
  }, [isAuthenticated, dynamicUser, user, setUser, updateUser]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    completeOnboarding();
  };

  // Show onboarding for first-time users
  if (user?.isFirstTime) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
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
              
              {/* <Button 
                className="w-full cyber-button h-12 font-mono"
              >
                <Wallet className="w-5 h-5 mr-2" />
                CONNECT WALLET
              </Button> */}
              <DynamicWidget />
              
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {isAuthenticated ? (
          <LoggedInView />
        ) : (
          <LoggedOutView />
        )}
      </main>

      <AppFooter />
    </div>
  );
};

export default Index;
