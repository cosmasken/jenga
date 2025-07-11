import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient } from '@tanstack/react-query';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';
import { web3AuthConnector } from './lib/web3auth-connector';

// Define Citrea testnet chain
export const citreaTestnet = defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'cBTC',
    symbol: 'cBTC',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.testnet.citrea.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Citrea Explorer',
      url: 'https://explorer.testnet.citrea.xyz',
    },
  },
  testnet: true,
});

// Configure chains
const chains = [citreaTestnet, mainnet, sepolia] as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    web3AuthConnector({
      clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID || '',
      web3AuthNetwork: 'sapphire_devnet',
    }),
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: false,
  transports: {
    [citreaTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
