// import { createRoot } from "react-dom/client";
// import { StrictMode } from 'react';
// import App from "./App";
// import "./index.css";

// import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
// import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';

// import { DYNAMIC_NETWORK_CONFIG, API_CONFIG, getDynamicEnvironmentId, isDynamicConfigured } from './config';

// // Validate environment configuration on startup
// if (!isDynamicConfigured()) {
//   console.warn('Dynamic Labs is not properly configured. Some wallet features may not work.');
// }

// // Mock Dynamic provider for fallback when environment ID is missing
// // const MockDynamicProvider = ({ children }: { children: React.ReactNode }) => {
// //   return <>{children}</>;
// // };

// function AppWithProviders() {
//   // Safely get the environment ID
//   const environmentId = getDynamicEnvironmentId();

//   // if (!environmentId) {
//   //   console.error('Dynamic Labs environment ID is not available. Running in mock mode.');
//   //   // Return app without Dynamic provider for development
//   //   return (
//   //     <StrictMode>
//   //       <MockDynamicProvider>
//   //         <App />
//   //       </MockDynamicProvider>
//   //     </StrictMode>
//   //   );
//   // }

//   return (
//     <StrictMode>
//       <DynamicContextProvider
//         theme="auto"
//         settings={{
//           environmentId: API_CONFIG.DYNAMIC_ENVIRONMENT_ID,
//           walletConnectors: [EthereumWalletConnectors],
//           overrides: { evmNetworks: DYNAMIC_NETWORK_CONFIG },
//           // Disable auto-showing modals so landing page is visible
//           initialAuthenticationMode: 'connect-only',
//           shadowDOMEnabled: false,
//         }}
//       >
//         <App />
//       </DynamicContextProvider>
//     </StrictMode>
//   );
// }

// createRoot(document.getElementById("root")!).render(<AppWithProviders />);

import { createRoot } from "react-dom/client";
import { StrictMode } from 'react';
import App from "./App";
import "./index.css";

import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';

import { DYNAMIC_NETWORK_CONFIG, API_CONFIG, getDynamicEnvironmentId, isDynamicConfigured, validateConfig } from './config';
import { runMigration } from './utils/migration';

// Validate environment configuration on startup
console.log('🔧 Environment Configuration Check:');
console.log('VITE_DYNAMIC_ENVIRONMENT_ID:', import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID ? '✅ Set' : '❌ Missing');

const blastApiId = import.meta.env.VITE_BLAST_API_PROJECT_ID;
const hasValidBlastApi = blastApiId && blastApiId !== 'your-blast-api-project-id-here';
console.log('VITE_BLAST_API_PROJECT_ID:', hasValidBlastApi ? '✅ Set' : '⚠️ Missing (using fallback RPC)');

if (!hasValidBlastApi) {
  console.log('🌐 Using fallback RPC: https://rpc.testnet.citrea.xyz');
  console.log('💡 For better performance, add your Blast API project ID to .env');
}

console.log('VITE_ROSCA_FACTORY_ADDRESS:', import.meta.env.VITE_ROSCA_FACTORY_ADDRESS ? '✅ Set' : '⚠️ Using default');

// Run full validation
validateConfig();

// Run migration check to clean up old contract data
runMigration();

if (!isDynamicConfigured()) {
  console.warn('⚠️ Dynamic Labs is not properly configured. Some wallet features may not work.');
}

function AppWithProviders() {
  // Safely get the environment ID
  const environmentId = getDynamicEnvironmentId();

  if (!environmentId) {
    console.error('❌ Dynamic Labs environment ID is not available. Please check your .env file.');
    // Return app without Dynamic provider for development
    return (
      <StrictMode>
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-red-400">Configuration Error</h1>
            <p className="text-gray-300">Dynamic Labs environment ID is missing.</p>
            <div className="text-left bg-gray-900 p-4 rounded-lg text-sm">
              <p className="text-gray-400 mb-2">Add to your .env file:</p>
              <code className="text-green-400">
                VITE_DYNAMIC_ENVIRONMENT_ID=your-environment-id<br />
                VITE_BLAST_API_PROJECT_ID=your-blast-project-id
              </code>
            </div>
            <p className="text-xs text-gray-500">Check the console for more details</p>
          </div>
        </div>
      </StrictMode>
    );
  }

  console.log('🚀 Starting app with Dynamic Labs integration');
  console.log('Environment ID:', environmentId.slice(0, 8) + '...');
  console.log('Network Config:', DYNAMIC_NETWORK_CONFIG[0].name);

  return (
    <StrictMode>
      <DynamicContextProvider
        theme="auto"
        settings={{
          environmentId: API_CONFIG.DYNAMIC_ENVIRONMENT_ID,
          walletConnectors: [EthereumWalletConnectors],
          overrides: { evmNetworks: DYNAMIC_NETWORK_CONFIG },
          // Disable auto-showing modals so landing page is visible
          initialAuthenticationMode: 'connect-and-sign',
          shadowDOMEnabled: false,
        }}
      >
        <App />
      </DynamicContextProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<AppWithProviders />);

