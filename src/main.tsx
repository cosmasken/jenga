import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";

import App from "./App";
import "./index.css";

const citreaNetworks = [
  {
    blockExplorerUrls: ['https://explorer.testnet.citrea.xyz'],
    chainId: 5115,
    chainName: 'Citrea Testnet',
    iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
    name: 'Citrea Testnet',
    nativeCurrency: {
      decimals: 18,
      name: 'Citrea',
      symbol: 'cBTC',
      iconUrl: 'https://app.dynamic.xyz/assets/networks/eth.svg',
    },
    networkId: 5115,

    rpcUrls: ['https://rpc.testnet.citrea.xyz'],
    vanityName: 'Citrea Testnet',
  },
];


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DynamicContextProvider
      theme="auto"
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
        overrides: { evmNetworks: citreaNetworks },
      }}
    >
      <App />
    </DynamicContextProvider>
  </StrictMode>
);