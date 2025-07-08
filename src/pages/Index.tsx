import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { PersonalStacking } from "@/components/PersonalStacking";
import { ChamaCircles } from "@/components/ChamaCircles";
import { P2PSending } from "@/components/P2PSending";
import { SimpleTutorial } from "@/components/SimpleTutorial";
import { SimpleOnboarding } from "@/components/SimpleOnboarding";
import { SimpleOnboardingService } from "@/lib/simpleOnboarding";
import { MobileDashboardEnhanced } from "@/components/MobileOptimized";
import { NotificationSystem } from "@/components/NotificationSystem";
import { EducationalContent } from "@/components/EducationalContent";
import { FinanceInsights } from "@/components/FinanceInsights";
import { LoggedOutView } from "@/components/landing/LoggedOutView";
import { AppHeader } from "@/components/AppHeader";
import { AppNavigation } from "@/components/AppNavigation";
import { MobileNavigation } from "@/components/MobileNavigation";
import { useSimpleAuth } from "@/lib/simpleAuth";
// import { useAuthBridgeSimple } from "@/lib/authBridgeSimple";
import { useAppStore } from "@/store/appStore";
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useChainId } from 'wagmi';

export default function Index() {
  const { t } = useTranslation();
  const chainId = useChainId();
  
  // Use the simple auth (Dynamic + Direct Database)
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    walletAddress,
    error: authError,
    retry: retryAuth
  } = useSimpleAuth();

  // Debug logging
  useEffect(() => {
    console.log('🔍 Simple Auth Debug:', {
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      walletAddress,
      userOnboarded: user?.onboarding_completed
    });
  }, [isAuthenticated, isLoading, user, walletAddress]);

  // App store for UI state
  const { currentView, setCurrentView } = useAppStore();

  // Local state
  const [showTutorial, setShowTutorial] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle onboarding for new users
  useEffect(() => {
    if (isAuthenticated && user && walletAddress) {
      const needsOnboarding = SimpleOnboardingService.needsOnboarding(user)
      
      if (needsOnboarding) {
        setIsFirstTimeUser(true)
        setShowOnboarding(true)
      }
    }
  }, [isAuthenticated, user, walletAddress]);

  // Mobile view renderer
  const renderMobileView = () => {
    switch (currentView) {
      case 'dashboard':
        return <MobileDashboardEnhanced />;
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
      default:
        return <MobileDashboardEnhanced />;
    }
  };

  // Desktop view renderer
  const renderDesktopView = () => {
    return (
      <Tabs value={currentView} onValueChange={setCurrentView} className="w-full">
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
      </Tabs>
    );
  };

  // Show loading state while syncing auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Show auth error with retry option
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">Authentication Error: {authError}</p>
          <Button onClick={retryAuth}>Retry</Button>
        </div>
      </div>
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      {/* Navigation - Desktop only */}
      {isAuthenticated && !isMobile && (
        <AppNavigation 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
      )}
      
      {/* Main content */}
      <main className={cn("flex-1", isAuthenticated && isMobile && "pb-16")}>
        {isAuthenticated ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-full max-w-7xl">
              {/* Show network warning if on wrong network */}
              {chainId !== 5115 && (
                <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ Please switch to Citrea network for full functionality
                  </p>
                </div>
              )}
              
              {/* Show loading state if database is still syncing */}
              {isAuthenticated && !user && isLoading && (
                <div className="mb-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                    <span className="text-sm">Setting up your profile...</span>
                  </div>
                </div>
              )}
              
              {/* Main content */}
              {isMobile ? renderMobileView() : renderDesktopView()}
            </div>
          </div>
        ) : (
          <LoggedOutView />
        )}
      </main>

      {/* Simple Onboarding */}
      {walletAddress && (
        <SimpleOnboarding 
          isOpen={showOnboarding}
          walletAddress={walletAddress}
          onComplete={() => {
            setShowOnboarding(false)
            setIsFirstTimeUser(false)
            localStorage.setItem('jenga-onboarding-complete', 'true')
          }}
          onSkip={() => {
            setShowOnboarding(false)
            setIsFirstTimeUser(false)
            localStorage.setItem('jenga-onboarding-complete', 'true')
          }}
        />
      )}

      {/* Simple Tutorial */}
      <SimpleTutorial 
        isOpen={showTutorial} 
        onClose={() => {
          setShowTutorial(false);
          localStorage.setItem('jenga-tutorial-completed', 'true');
        }} 
      />

      {/* Mobile Navigation */}
      {isAuthenticated && isMobile && (
        <MobileNavigation 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
      )}
    </div>
  );
}
