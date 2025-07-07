import { useEffect } from "react";

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
import { WagmiDebug } from "@/components/WagmiDebug";
import { useAppStore } from "@/store/appStore";
import { useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { LoggedInView } from "@/components/landing/LoggedInView";
import { LoggedOutView } from "@/components/landing/LoggedOutView";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { Coins, Users, Send, Zap, TrendingUp, Trophy, LogOut, Wallet, Shield, Target, User } from "lucide-react";
import { toast } from "sonner";

// Extend the UserProfile type to include the properties we need
interface ExtendedUserProfile extends UserProfile {
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  [key: string]: unknown; // Allow additional properties
}

const Index = () => {
  const { 
    user: dynamicUser, 
    primaryWallet,
    handleLogOut,
    setShowAuthFlow
  } = useDynamicContext();
  
  // Toggle the Dynamic auth flow
  const handleConnectWallet = () => {
    if (!isAuthenticated) {
      setShowAuthFlow(true);
    }
  };
  
  const isDynamicAuthenticated = !!primaryWallet;
  
  // Safe access to dynamic user properties
  const dynamicUserProfile = dynamicUser as ExtendedUserProfile | null;
  
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    updateUser, 
    completeOnboarding,
    setLoading,
    setError
  } = useAppStore();

  // Sync authentication state between Dynamic and our app store
  useEffect(() => {
    const syncAuthState = async () => {
      try {
        setLoading(true);
        
        if (isDynamicAuthenticated && dynamicUserProfile && primaryWallet) {
          // Get the wallet address from the primary wallet
          const walletAddress = primaryWallet.address;
          
          // Generate a username from email or use a default
          const username = dynamicUserProfile.email?.split('@')[0] || 
                         `${dynamicUserProfile.firstName || 'User'}_${Math.random().toString(36).substring(2, 6)}`;
          
          // Check if we need to update the user in our store
          if (!user || user.dynamicUserId !== dynamicUser.userId) {
            // Create or update user in our store
// Prepare user data for login
            const userData = {
              id: dynamicUserProfile.userId || `user-${Date.now()}`,
              name: dynamicUserProfile.firstName || username,
              email: dynamicUserProfile.email || `${username.toLowerCase()}@example.com`,
              walletAddress,
              role: user?.role || 'member',
              dynamicUserId: dynamicUserProfile.userId,
              avatar: dynamicUserProfile.profileImageUrl,
              // Include any additional properties from the dynamic user
              ...Object.fromEntries(
                Object.entries(dynamicUserProfile)
                  .filter(([key]) => !['userId', 'email', 'firstName', 'profileImageUrl'].includes(key))
              )
            };
            
            // Update user data in the store
            if (user) {
              updateUser({
                ...userData,
                isFirstTime: user.isFirstTime,
                lastLogin: Date.now()
              });
              toast.success('Welcome back!');
            } else {
              // New user login
              login({
                ...userData,
                isFirstTime: true,
                role: userData.role as 'member' | 'admin',
                createdAt: Date.now(),
                lastLogin: Date.now()
              });
              toast.success('Welcome to Jenga!');
              // The Navigate component will handle the redirection
              // by re-rendering the component with the new route
            }
            
            toast.success('Successfully connected wallet');
          } else if (walletAddress && user.walletAddress !== walletAddress) {
            // Just update the wallet address if it changed
            updateUser({ 
              walletAddress,
              lastLogin: Date.now() 
            });
          }
        } else if (!isDynamicAuthenticated) {
          // Handle logout
          if (isAuthenticated) {
            logout();
            toast.info('Successfully disconnected');
          }
        }
      } catch (error) {
        console.error('Error syncing auth state:', error);
        setError(error instanceof Error ? error.message : 'Failed to sync authentication state');
        toast.error('Authentication error');
      } finally {
        setLoading(false);
      }
    };

    syncAuthState();
  // We're using all the dependencies we need, but some are stable references from the store
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDynamicAuthenticated, dynamicUserProfile, primaryWallet?.address]);

  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    completeOnboarding();
    updateUser({
      isFirstTime: false,
      lastLogin: Date.now()
    });
    toast.success('Onboarding completed!');
  };

  // Show loading state while syncing auth
  if (isDynamicAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated and not first time
  if (isAuthenticated && isDynamicAuthenticated && !user?.isFirstTime) {
    window.location.href = '/dashboard';
    return null;
  }

  // Main container with consistent styling
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        {isDynamicAuthenticated ? (
          // Show dashboard when authenticated
          <div className="w-full max-w-6xl space-y-6">
            <WagmiDebug />
            <LoggedInView />
          </div>
        ) : (
          // Show connect wallet screen when not authenticated
          <div className="w-full max-w-md">
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
              <CardContent className="flex flex-col space-y-4 items-center">
                <p className="text-center text-muted-foreground font-mono text-sm">
                  {'>'} CONNECT WALLET TO ACCESS CITREA AND THE POWER OF THE CIRCLE
                </p>
                
                <div className="w-full">
                  <Button 
                    onClick={handleConnectWallet}
                    className="w-full cyber-button h-12 font-mono flex items-center justify-center"
                  >
                    <Wallet className="w-5 h-5 mr-2" />
                    CONNECT WALLET
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border w-full">
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
        )}
      </main>
      
      <AppFooter />
    </div>
  );
};

export default Index;
