import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { OnboardingModal } from "@/components/OnboardingModal";
import { queryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import GroupDetail from "@/pages/group-detail";
import Disputes from "@/pages/disputes";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [location, setLocation] = useLocation();
  const isLoggedIn = useIsLoggedIn();

  // Check onboarding completion from localStorage
  const onboardingCompleted = localStorage.getItem('jenga_onboarding_completed') === 'true';

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
      <Route path="/group/:id" component={GroupDetail} />
      <Route path="/disputes" component={Disputes} />
      <Route path="/profile" component={Profile} />
      <Route path="/invite/:code">
        {(params) => {
          // Handle invite redirect
          useEffect(() => {
            localStorage.setItem('jenga_invite_code', params.code);
            setLocation(`/?invite=${params.code}`);
          }, [params.code]);
          return null;
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location, setLocation] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Check onboarding completion from localStorage
  const onboardingCompleted = localStorage.getItem('jenga_onboarding_completed') === 'true';

  // Handle onboarding modal visibility
  useEffect(() => {
    const handleLoginSuccess = () => {
      const onboardingCompleted = localStorage.getItem('jenga_onboarding_completed') === 'true';
      if (onboardingCompleted) {
        setLocation('/dashboard');
      } else {
        setShowOnboarding(true);
      }
    };

    window.addEventListener('dynamic_login_success', handleLoginSuccess);

    return () => {
      window.removeEventListener('dynamic_login_success', handleLoginSuccess);
    };
  }, [setLocation]);

  // Auto-redirect logic for authenticated users
  useEffect(() => {
    if (isLoggedIn && onboardingCompleted) {
      // If user completed onboarding but is on landing page, redirect to dashboard
      if (location === '/') {
        setLocation('/dashboard');
      }
    }
  }, [isLoggedIn, onboardingCompleted, location, setLocation]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Redirect to dashboard after onboarding
    setLocation('/dashboard');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            {/* Only show navigation if user is logged in and onboarded */}
            {isLoggedIn && onboardingCompleted && <Navigation />}
            
            <Router />
            
            {/* Onboarding Modal */}
            <OnboardingModal 
              open={showOnboarding} 
              onComplete={handleOnboardingComplete}
            />
            
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
