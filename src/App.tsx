import React, { useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from 'wagmi';
import { Routes, Route } from "react-router-dom";

// Wagmi configuration
import { wagmiConfig, queryClient } from './wagmi';

// UI Components
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { Layout } from './components/layout/Layout';

// Pages
import Index from "./pages/Index";
import ErrorBoundary from "./components/ErrorBoundary";
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <ErrorBoundary>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Sonner />

              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </div>
          </TooltipProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  );
}

export default App;
