
// createRoot(document.getElementById("root")!).render(<App />);
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { createConfig, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type Chain } from 'viem'
import { http } from 'viem'
import "./index.css";
import "./styles/dynamic-theme.css"; // Import the custom theme
import Index from "./pages/Index";

// Add Google Fonts to the document head
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// Citrea Testnet Configuration
export const citreaTestnet: Chain = {
  id: 5115,
  name: 'Citrea',
  nativeCurrency: {
    name: 'Citrea BTC',
    symbol: 'cBTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
    public: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Citrea Explorer', url: 'https://explorer.testnet.citrea.xyz' },
  },
  testnet: true,
};

const evmNetworks = [
  {
    chainId: 5115,
    networkId: 5115,
    name: 'Citrea',
    nativeCurrency: {
      name: 'Citrea BTC',
      symbol: 'cBTC',
      decimals: 18,
    },
    rpcUrls: ['https://rpc.testnet.citrea.xyz'],
    blockExplorerUrls: ['https://explorer.testnet.citrea.xyz'],
    iconUrls: ['https://example.com/icon.png'], // Replace with actual icon URL
    isTestnet: true,
    vanityName: 'Citrea Testnet',
    chainName: 'Citrea',
  }
]

// // Citrea Testnet configuration for Dynamic
// const citreaNetworkConfig = {
//   blockExplorerUrls: ['https://explorer.testnet.citrea.xyz/'],
//   chainId: 5115,
//   chainName: 'Citrea',
//   iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
//   name: 'Citrea',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'Citrea BTC',
//     symbol: 'cBTC',
//   },
//   networkId: 5115,
//   rpcUrls: ['https://rpc.testnet.citrea.xyz'],
//   vanityName: 'Citrea Testnet',
//   isTestnet: true
// };

const config = createConfig({
  chains: [citreaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [citreaTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        initialAuthenticationMode: 'connect-only',
        overrides: { evmNetworks },
      }}
      theme="dark"
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