import { useEffect, useState } from "react";

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
import { EnhancedWalletOnboarding } from "@/components/EnhancedWalletOnboarding";
import { InteractiveTutorial } from "@/components/InteractiveTutorial";
import { MobileDashboard } from "@/components/MobileDashboard";
import { NotificationSystem } from "@/components/NotificationSystem";
import { EducationalContent } from "@/components/EducationalContent";
import { FinanceInsights } from "@/components/FinanceInsights";
import { GasSponsorshipDashboard } from "@/components/GasSponsorshipDashboard";
import { WagmiDebug } from "@/components/WagmiDebug";
import { useAppStore } from "@/store/appStore";
import { useDynamicContext, type UserProfile } from '@dynamic-labs/sdk-react-core';
import { useAccount, useChainId } from 'wagmi';
import { LoggedInView } from "@/components/landing/LoggedInView";
import { LoggedOutView } from "@/components/landing/LoggedOutView";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { Coins, Users, Send, Zap, TrendingUp, Trophy, LogOut, Wallet, Shield, Target, User, BookOpen, Bell, BarChart3 } from "lucide-react";
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

export default function Index() {
  const {
    user,
    isAuthenticated,
    primaryWallet,
    dynamicUserProfile,
    handleLogOut,
  } = useDynamicContext();

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'chamas' | 'stacking' | 'p2p' | 'learn' | 'notifications' | 'insights' | 'gas'>('dashboard');
  const [isMobile, setIsMobile] = useState(false);

  const isDynamicAuthenticated = !!primaryWallet;
  const { setUser, setIsAuthenticated } = useAppStore();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for first-time user tutorial
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('jenga-tutorial-completed');
    if (isDynamicAuthenticated && !hasSeenTutorial) {
      setTimeout(() => setShowTutorial(true), 2000); // Show tutorial after 2 seconds
    }
  }, [isDynamicAuthenticated]);

  // Sync authentication state with app store
  useEffect(() => {
    const syncAuthState = async () => {
      try {
        if (isDynamicAuthenticated && dynamicUserProfile && primaryWallet) {
          const walletAddress = primaryWallet.address;
          
          // Create user object with extended profile information
          const extendedProfile = dynamicUserProfile as ExtendedUserProfile;
          const userData = {
            id: extendedProfile.userId || walletAddress,
            email: extendedProfile.email || `${walletAddress}@wallet.local`,
            name: extendedProfile.firstName && extendedProfile.lastName 
              ? `${extendedProfile.firstName} ${extendedProfile.lastName}`
              : `User ${walletAddress.slice(0, 6)}`,
            walletAddress,
            profileImage: extendedProfile.profileImageUrl,
            isFirstTime: !localStorage.getItem('jenga-user-onboarded'),
            ...extendedProfile
          };

          setUser(userData);
          setIsAuthenticated(true);
          
          // Mark user as onboarded after first successful connection
          if (!localStorage.getItem('jenga-user-onboarded')) {
            localStorage.setItem('jenga-user-onboarded', 'true');
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error syncing auth state:', error);
        toast.error('Authentication sync failed');
      }
    };

    syncAuthState();
  }, [isDynamicAuthenticated, dynamicUserProfile, primaryWallet?.address, setUser, setIsAuthenticated]);

  // Show loading state while syncing auth
  if (isDynamicAuthenticated === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const renderMobileView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MobileDashboard />;
      case 'chamas':
        return <ChamaCircles />;
      case 'stacking':
        return <PersonalStacking />;
      case 'p2p':
        return <P2PSending />;
      case 'learn':
        return <EducationalContent />;
      case 'notifications':
        return <NotificationSystem />;
      case 'insights':
        return <FinanceInsights />;
      case 'gas':
        return <GasSponsorshipDashboard />;
      default:
        return <MobileDashboard />;
    }
  };

  const renderDesktopView = () => {
    return (
      <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-8 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="chamas" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Chamas</span>
          </TabsTrigger>
          <TabsTrigger value="stacking" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            <span className="hidden sm:inline">Stacking</span>
          </TabsTrigger>
          <TabsTrigger value="p2p" className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </TabsTrigger>
          <TabsTrigger value="learn" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Learn</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="gas" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Gas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <FinanceInsights />
        </TabsContent>
        
        <TabsContent value="chamas" className="space-y-6">
          <ChamaCircles />
        </TabsContent>
        
        <TabsContent value="stacking" className="space-y-6">
          <PersonalStacking />
        </TabsContent>
        
        <TabsContent value="p2p" className="space-y-6">
          <P2PSending />
        </TabsContent>
        
        <TabsContent value="learn" className="space-y-6">
          <EducationalContent />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSystem />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          <FinanceInsights />
        </TabsContent>
        
        <TabsContent value="gas" className="space-y-6">
          <GasSponsorshipDashboard />
        </TabsContent>
      </Tabs>
    );
  };

  // Main container with consistent styling
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <main className="flex-1 flex items-center justify-center p-4">
        {isDynamicAuthenticated ? (
          // Show enhanced dashboard when authenticated
          <div className="w-full max-w-7xl">
            {/* Show onboarding for new users or wrong network */}
            {(chainId !== 5115 || user?.isFirstTime) && (
              <div className="mb-6">
                <EnhancedWalletOnboarding />
              </div>
            )}
            
            {/* Debug component - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6">
                <WagmiDebug />
              </div>
            )}
            
            {/* Main content */}
            {isMobile ? renderMobileView() : renderDesktopView()}
          </div>
        ) : (
          // Show connect wallet screen when not authenticated
          <div className="w-full max-w-md">
            <Card className="bg-card/90 backdrop-blur-sm cyber-border neon-glow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow pulse-orange">
                  <Coins className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground font-mono glitch-text">
                  JENGA
                </CardTitle>
                <p className="text-muted-foreground font-mono">
                  Bitcoin-Native Community Lending Circles
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium">Community</p>
                    <p className="text-xs text-muted-foreground">Savings Circles</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <Shield className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm font-medium">Trustless</p>
                    <p className="text-xs text-muted-foreground">Smart Contracts</p>
                  </div>
                </div>
                
                <LoggedOutView />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && isDynamicAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2">
          <div className="flex justify-around">
            {[
              { key: 'dashboard', icon: BarChart3, label: 'Home' },
              { key: 'chamas', icon: Users, label: 'Chamas' },
              { key: 'stacking', icon: Coins, label: 'Stack' },
              { key: 'gas', icon: Zap, label: 'Gas' },
              { key: 'learn', icon: BookOpen, label: 'Learn' }
            ].map(({ key, icon: Icon, label }) => (
              <Button
                key={key}
                variant={currentView === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView(key as any)}
                className="flex-col h-12 px-2"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      <AppFooter />

      {/* Interactive Tutorial */}
      <InteractiveTutorial 
        isOpen={showTutorial} 
        onClose={() => {
          setShowTutorial(false);
          localStorage.setItem('jenga-tutorial-completed', 'true');
        }} 
      />
    </div>
  );
}
