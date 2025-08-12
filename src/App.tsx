import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import SaccoDashboard from "./pages/SaccoDashboard";
import Dashboard from "./pages/Dashboard";
import FloatingActionButton from "./components/FloatingActionButton";
import NotFound from "@/pages/not-found";
import CreatePage from "./pages/CreatePage";
import JoinChamaPage from "./pages/JoinChamaPage";
import ChamaDashboard from "./pages/ChamaDashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/sacco-dashboard" component={SaccoDashboard} />
      <Route path="/create" component={CreatePage} />
      <Route path="/join" component={JoinChamaPage} />
      <Route path="/dashboard/:address" component={ChamaDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Navigation />
            <Router />
            <FloatingActionButton />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
