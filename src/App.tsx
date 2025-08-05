import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { TransactionModal } from "@/components/modals/transaction-modal";
import { InviteModal } from "@/components/modals/invite-modal";
import { VotingModal } from "@/components/modals/voting-modal";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
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
      // Redirect to onboarding if not completed and logged in
      if (isLoggedIn && !onboardingCompleted) {
        setLocation('/onboarding');
      }
    }
  }, [isLoggedIn, onboardingCompleted, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
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
  
  // Check onboarding completion from localStorage
  const onboardingCompleted = localStorage.getItem('jenga_onboarding_completed') === 'true';

  // Auto-redirect logic for authenticated users
  useEffect(() => {
    if (isLoggedIn) {
      // If user is logged in but hasn't completed onboarding
      if (!onboardingCompleted && location !== '/onboarding' && location !== '/') {
        setLocation('/onboarding');
      }
      // If user completed onboarding but is on landing page, redirect to dashboard
      else if (onboardingCompleted && location === '/') {
        setLocation('/dashboard');
      }
    }
  }, [isLoggedIn, onboardingCompleted, location, setLocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans">
            <Navigation />
            <Router />
            <TransactionModal />
            <InviteModal />
            <VotingModal />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
