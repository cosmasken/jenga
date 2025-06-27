import { DynamicContextProvider, DynamicWidget } from "@dynamic-labs/sdk-react-core";

// Citrea Testnet Configuration
const citreaTestnet = {
  blockExplorerUrls: ['https://explorer.testnet.citrea.xyz/'],
  chainId: 5115, // 0x13fb in hex
  chainName: 'Citrea Testnet',
  iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'], // Using ETH icon as fallback
  name: 'Citrea',
  nativeCurrency: {
    decimals: 18,
    name: 'Citrea BTC',
    symbol: 'cBTC',
  },
  networkId: 5115,
  rpcUrls: ['https://rpc.testnet.citrea.xyz'],
  vanityName: 'Citrea Testnet',
  isTestnet: true,
};
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Accounts from "./pages/Accounts";
import NotFound from "./pages/NotFound";

// Initialize query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Separate component for the app content to use hooks
function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/accounts" element={<Accounts />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

// Main App component
export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "094a38fd-ad63-4b2c-a007-c080b2f12126",
        initialAuthenticationMode: 'connect-only',
        overrides: { 
          evmNetworks: [citreaTestnet],
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner position="top-right" />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
      <DynamicWidget />
    </DynamicContextProvider>
  );
}
