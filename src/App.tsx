import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import { SaccoStatusProvider } from "./contexts/SaccoStatusContext";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import SaccoOnboardingWrapper from "./components/SaccoOnboardingWrapper";
import Dashboard from "./pages/Dashboard";
import NotFound from "@/pages/not-found";
import CreatePage from "./pages/CreatePage";
import JoinChamaPage from "./pages/JoinChamaPage";
import InviteTest from "./pages/InviteTest";
import { HybridEnhancedDashboardRoute } from "./components/HybridEnhancedDashboard";
import { ReactivityTest } from "./components/ReactivityTest";
import ChamaDiscoveryPage from "./pages/ChamaDiscoveryPage";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

function TestReactivityWrapper() {
  const { primaryWallet } = useDynamicContext();
  if (!primaryWallet?.address) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 text-center">
        <h2 className="text-xl font-bold mb-4">Connect Wallet Required</h2>
        <p className="text-gray-600 dark:text-gray-400">Connect your wallet to access the reactivity testing tools.</p>
      </div>
    );
  }
  return <ReactivityTest userAddress={primaryWallet.address} />;
}


function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/sacco-dashboard" component={SaccoOnboardingWrapper} />
      <Route path="/create" component={CreatePage} />
      <Route path="/join" component={JoinChamaPage} />
      <Route path="/chama/:address" component={HybridEnhancedDashboardRoute} />
      <Route path="/dashboard/:address" component={HybridEnhancedDashboardRoute} />
      <Route path="/invite-test" component={InviteTest} />
      <Route path="/discover" component={ChamaDiscoveryPage} />
      <Route path="/test-reactivity" component={TestReactivityWrapper} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SaccoStatusProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Navigation />
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </SaccoStatusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
