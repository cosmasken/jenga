import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { UnitDisplayProvider } from "@/contexts/UnitDisplayContext";
import { Navigation } from "@/components/navigation";
import { OnboardingModal } from "@/components/OnboardingModal";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useIsLoggedIn, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useSimpleSupabase } from "@/hooks/useSimpleSupabase";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import BrowseChamas from "@/pages/browse-chamas";
import ChamaDetail from "@/pages/chama-detail";
import GroupDetail from "@/pages/group-detail";
import Disputes from "@/pages/disputes";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

// Component for handling invite redirects
function InviteHandler({ code, setLocation }: { code: string; setLocation: (url: string) => void }) {
  useEffect(() => {
    localStorage.setItem('jenga_invite_code', code);
    setLocation(`/?invite=${code}`);
  }, [code, setLocation]);
  return null;
}

function Router() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Handle invite code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
      localStorage.setItem('jenga_invite_code', inviteCode);
    }
  }, []);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/browse" component={BrowseChamas} />
      <Route path="/chama/:id" component={ChamaDetail} />
      <Route path="/group/:id" component={GroupDetail} />
      <Route path="/disputes" component={Disputes} />
      <Route path="/profile" component={Profile} />
      <Route path="/invite/:code">
        {(params) => (
          <InviteHandler code={params.code} setLocation={setLocation} />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  
  const { user, loading, loadUser } = useSimpleSupabase();

  // Check onboarding completion from database when wallet connects
  useEffect(() => {
    if (isLoggedIn && primaryWallet?.address) {
      setCheckingOnboarding(true);
      console.log('🔄 Checking onboarding status for wallet:', primaryWallet.address);
      
      // Load user from database
      loadUser().then((userData) => {
        console.log('🔍 Database lookup result:', {
          userData: userData,
          exists: !!userData,
          onboarding_completed: userData?.onboarding_completed,
          wallet: userData?.wallet_address
        });
        
        if (userData) {
          console.log('📊 User found in database:', {
            id: userData.id,
            wallet: userData.wallet_address,
            display_name: userData.display_name,
            onboarding_completed: userData.onboarding_completed,
            onboarding_completed_at: userData.onboarding_completed_at
          });
          
          const isOnboardingComplete = userData.onboarding_completed === true;
          console.log('✨ Setting onboarding status:', {
            raw_value: userData.onboarding_completed,
            processed_value: isOnboardingComplete,
            type: typeof userData.onboarding_completed
          });
          
          setOnboardingCompleted(isOnboardingComplete);
          
          if (isOnboardingComplete) {
            // User is onboarded - redirect to dashboard if on landing page
            console.log('🔄 User is onboarded, hiding modal and redirecting if needed');
            setShowOnboarding(false);
            if (location === '/') {
              console.log('🔄 Onboarded user on landing page, redirecting to dashboard');
              setLocation('/dashboard');
            }
          } else {
            // User exists but hasn't completed onboarding
            console.log('🔄 User exists but onboarding not complete, showing modal');
            setShowOnboarding(true);
          }
        } else {
          // No user found in database - new user needs onboarding
          console.log('🔄 No user found in database, showing onboarding modal');
          setOnboardingCompleted(false);
          setShowOnboarding(true);
        }
      }).catch((error) => {
        console.error('❌ Error checking onboarding status:', error);
        // On database error, assume new user needs onboarding
        console.log('⚠️ Database error, treating as new user');
        setOnboardingCompleted(false);
        setShowOnboarding(true);
      }).finally(() => {
        setCheckingOnboarding(false);
      });
    } else if (!isLoggedIn) {
      // User not logged in - reset state
      setOnboardingCompleted(false);
      setShowOnboarding(false);
      setCheckingOnboarding(false);
    }
  }, [isLoggedIn, primaryWallet?.address, location, setLocation, loadUser]);

  const handleOnboardingComplete = () => {
    console.log('✅ Onboarding completed, updating state');
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    // Redirect to dashboard after onboarding
    setLocation('/dashboard');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <UnitDisplayProvider>
              {isLoggedIn && onboardingCompleted && <Navigation />}
              
              <Router />
              
              {/* Onboarding Modal */}
              <OnboardingModal 
                open={showOnboarding} 
                onComplete={handleOnboardingComplete}
              />
            </UnitDisplayProvider>
            
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
