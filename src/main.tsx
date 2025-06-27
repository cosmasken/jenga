// import { createRoot } from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// createRoot(document.getElementById("root")!).render(<App />);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { mainnet } from "viem/chains";
import App from "./App";
import "./index.css";
import Index from "./pages/Index";

const config = createConfig({
  chains: [mainnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [mainnet.id]: http(),
  },
});

const queryClient = new QueryClient();
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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    > */}
    <DynamicContextProvider
    theme="auto"
          settings={{
            environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
            initialAuthenticationMode: 'connect-only',
            overrides: { 
              evmNetworks: [citreaTestnet],
            },
          }}
        >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <Index />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  </StrictMode>
);