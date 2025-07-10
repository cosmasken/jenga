import React, { useEffect, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet, useNavigate } from "react-router-dom";

// Hooks & Stores
import useWallet from './stores/useWallet';

// UI Components
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { toast } from "./components/ui/use-toast";
import LoadingModal from "./components/LoadingModal";
import { Layout } from './components/layout/Layout';

// Pages
import Index from "./pages/Index";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from './pages/NotFound';
const queryClient = new QueryClient();

// Extend Window interface for development helpers
declare global {
  interface Window {
    forceOnboardingCheck?: () => void;
    showOnboardingModal?: () => void;
  }
}

const App = () => {
  const { address, initWeb3Auth, isConnected } = useWallet();
  const [isInitializing, setIsInitializing] = React.useState(true);
  // const [userProfile, setUserProfile] = React.useState<User | null>(null);

  const initializeAuth = useCallback(async () => {
    try {
      await initWeb3Auth();
      setIsInitializing(false);
    } catch (error) {
      console.error('Auth initialization error:', error);
      throw error;
    }
  }, [initWeb3Auth]);


  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);


  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Sonner />

        {isInitializing && (
              <LoadingModal
                isOpen={true}
                title="INITIALIZING"
                description="Please wait while we set up your wallet and connection."
                transactionText="Setting up your wallet and secure Web3 connection..."
              />
            )} 

            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
export default App;
