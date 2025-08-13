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
import ChamaDashboard from "./pages/ChamaDashboard";
import InviteTest from "./pages/InviteTest";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/sacco-dashboard" component={SaccoOnboardingWrapper} />
      <Route path="/create" component={CreatePage} />
      <Route path="/join" component={JoinChamaPage} />
      <Route path="/chama/:address" component={ChamaDashboard} />
      <Route path="/dashboard/:address" component={ChamaDashboard} />
      <Route path="/invite-test" component={InviteTest} />
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
