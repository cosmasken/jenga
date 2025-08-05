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
import { useStore } from "@/lib/store";
import { useEffect } from "react";
import { useLocation } from "wouter";

import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import GroupDetail from "@/pages/group-detail";
import Disputes from "@/pages/disputes";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";




function Router() {
  const { onboardingCompleted, setInviteCode } = useStore();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check for invite code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
      setInviteCode(inviteCode);
      // Redirect to onboarding if not completed
      if (!onboardingCompleted) {
        setLocation('/onboarding');
      }
    }
  }, [setInviteCode, onboardingCompleted, setLocation]);

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
            setInviteCode(params.code);
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
  const { onboardingCompleted } = useStore();
  const [location, setLocation] = useLocation();

  // Auto-redirect to onboarding if needed
  useEffect(() => {
    if (!onboardingCompleted && location !== '/onboarding' && location !== '/') {
      setLocation('/onboarding');
    }
  }, [onboardingCompleted, location, setLocation]);

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
