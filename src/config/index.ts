/**
 * Unified Configuration for Jamii SACCO dApp
 * Single source of truth for all contract addresses, network settings, and app constants
 */

import type { Address } from 'viem';
import { defineChain } from 'viem';

// =============================================================================
// NETWORK CONFIGURATION
// =============================================================================

/**
 * Citrea Testnet Chain Configuration
 * Custom chain configuration for Citrea Bitcoin Layer 2 testnet
 */
export const citreaTestnet = defineChain({
  id: 5115,
  name: 'Citrea Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Citrea Bitcoin',
    symbol: 'cBTC',
  },
  rpcUrls: {
    default: {
      http: [`https://citrea-testnet.blastapi.io/${import.meta.env.VITE_BLAST_API_PROJECT_ID}`],
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

/**
 * CoreDAO Testnet Chain Configuration
 * Alternative Bitcoin L2 network
 */
export const coreDAOTestnet = defineChain({
  id: 1115,
  name: 'CoreDAO Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'tCORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.btcs.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CoreDAO Explorer',
      url: 'https://scan.test.btcs.network',
    },
  },
  testnet: true,
});

/**
 * Network Configuration Constants
 */
export const NETWORK_CONFIG = {
  // Primary network (Citrea)
  CHAIN_ID: 5115,
  CHAIN_ID_HEX: '0x13FB', // 5115 in hex
  RPC_URL: import.meta.env.VITE_BLAST_API_PROJECT_ID 
    ? `https://citrea-testnet.blastapi.io/${import.meta.env.VITE_BLAST_API_PROJECT_ID}`
    : 'https://rpc.testnet.citrea.xyz', // Fallback RPC URL
  EXPLORER_URL: 'https://explorer.testnet.citrea.xyz',
  FAUCET_URL: 'https://citrea.xyz/faucet',
  CURRENCY_SYMBOL: 'cBTC',
  CURRENCY_NAME: 'Citrea Bitcoin',
  CURRENCY_DECIMALS: 18,
  
  // Alternative network (CoreDAO)
  ALT_CHAIN_ID: 1115,
  ALT_RPC_URL: 'https://rpc.test.btcs.network',
  ALT_EXPLORER_URL: 'https://scan.test.btcs.network',
  ALT_CURRENCY_SYMBOL: 'tCORE',
} as const;

/**
 * Dynamic Wallet Configuration for Citrea & CoreDAO
 */
export const DYNAMIC_NETWORK_CONFIG = [
  // Citrea Testnet (Primary)
  {
    blockExplorerUrls: [NETWORK_CONFIG.EXPLORER_URL],
    chainId: NETWORK_CONFIG.CHAIN_ID,
    chainName: citreaTestnet.name,
    iconUrls: ['https://citrea.xyz/favicon.ico'],
    name: citreaTestnet.name,
    nativeCurrency: {
      decimals: NETWORK_CONFIG.CURRENCY_DECIMALS,
      name: NETWORK_CONFIG.CURRENCY_NAME,
      symbol: NETWORK_CONFIG.CURRENCY_SYMBOL,
    },
    networkId: NETWORK_CONFIG.CHAIN_ID,
    rpcUrls: [NETWORK_CONFIG.RPC_URL],
    vanityName: citreaTestnet.name,
  },
  // CoreDAO Testnet (Alternative)
  {
    blockExplorerUrls: [NETWORK_CONFIG.ALT_EXPLORER_URL],
    chainId: NETWORK_CONFIG.ALT_CHAIN_ID,
    chainName: coreDAOTestnet.name,
    iconUrls: ['https://coredao.org/favicon.ico'],
    name: coreDAOTestnet.name,
    nativeCurrency: {
      decimals: 18,
      name: 'Core',
      symbol: NETWORK_CONFIG.ALT_CURRENCY_SYMBOL,
    },
    networkId: NETWORK_CONFIG.ALT_CHAIN_ID,
    rpcUrls: [NETWORK_CONFIG.ALT_RPC_URL],
    vanityName: coreDAOTestnet.name,
  },
];

// =============================================================================
// SMART CONTRACT CONFIGURATION
// =============================================================================

/**
 * Smart Contract Addresses - Collateral-Based Architecture (Citrea Testnet Deployment)
 * Deployed on 2025-08-08 to Citrea Bitcoin Layer 2 Testnet
 * Updated automatically by deployment script
 */
/**
 * Smart Contract Addresses - Enhanced ROSCA dApp Deployment (Citrea Testnet)
 * Deployed on 2025-08-20 with enhanced features: deposits, grace periods, penalties
 */
export const CONTRACT_ADDRESSES = {
  ROSCA_FACTORY: (import.meta.env.VITE_ROSCA_FACTORY_ADDRESS || '0x3c8079F8aee1D6Bc4D2A1Fc6Bdc557CD3151813D') as Address,
  // Native ETH ROSCA - no token implementation needed
} as const;

/**
 * Deployment Information (updated automatically by deployment script)
 */
export const DEPLOYMENT_INFO = {
  network: 'citrea-testnet',
  chainId: 5115,
  timestamp: '2025-08-08T11:53:13.212Z', // Updated by deployment script
  deployer: '0x09aB514B6974601967E7b379478EFf4073cceD06', // Updated by deployment script
  version: '2.0.0', // Overcollateralized loan system
  phase: 'Phase 1 - Core Implementation'
} as const;

/**
 * Contract URLs for blockchain explorer
 * Generated dynamically from deployed contract addresses
 */
export const CONTRACT_URLS = {
  ROSCA_FACTORY: `${NETWORK_CONFIG.EXPLORER_URL}/address/${CONTRACT_ADDRESSES.ROSCA_FACTORY}`,
} as const;

// =============================================================================
// APPLICATION CONFIGURATION
// =============================================================================

/**
 * Transaction Configuration
 */
export const TRANSACTION_CONFIG = {
  TIMEOUT_MS: 60_000, // 60 seconds
  CONFIRMATION_BLOCKS: 1,
  GAS_LIMIT_BUFFER: 1.2, // 20% buffer for gas estimation
  MAX_PRIORITY_FEE_PER_GAS: '2000000000', // 2 gwei
  MAX_FEE_PER_GAS: '20000000000', // 20 gwei
} as const;

/**
 * SACCO Configuration
 */
export const SACCO_CONFIG = {
  MIN_DEPOSIT_AMOUNT: '0.001', // 0.001 native token
  MAX_LOAN_TERM_MONTHS: 24,
  DEFAULT_INTEREST_RATE_BPS: 500, // 5%
  MIN_SHARES_FOR_LOAN: 1000, // 1000 shares
  PROPOSAL_VOTING_PERIOD_DAYS: 7,
  PROPOSAL_QUORUM_PERCENTAGE: 50,
  PROPOSAL_MAJORITY_PERCENTAGE: 60,
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  MODAL_ANIMATION_DURATION: 300, // 300ms
  POLLING_INTERVAL: 10_000, // 10 seconds for data refresh
  DECIMALS_DISPLAY: 6, // Number of decimals to show for token amounts
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_MULTI_TOKEN: true,
  ENABLE_GOVERNANCE: true,
  ENABLE_LOANS: true,
  ENABLE_ANALYTICS: false, // Disable for MVP
  ENABLE_REAL_TIME_UPDATES: true,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  DYNAMIC_ENVIRONMENT_ID: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || '',
  BLAST_API_PROJECT_ID: import.meta.env.VITE_BLAST_API_PROJECT_ID || '',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
} as const;

// =============================================================================
// SUPPORTED TOKENS CONFIGURATION
// =============================================================================

export const SUPPORTED_TOKENS = [
  {
    address: '0x0000000000000000000000000000000000000000' as Address, // Native token (cBTC)
    symbol: 'cBTC',
    name: 'Citrea Bitcoin',
    displayName: 'Citrea Bitcoin',
    decimals: 18,
    logo: '/tokens/cbtc.png',
    minDeposit: '0.001',
    shareRatio: '1.0', // 1:1 ratio for collateral shares
    isNative: true,
    description: 'Primary collateral asset on Citrea Bitcoin Layer 2',
    color: '#F7931A',
    isCollateral: true, // New flag for collateral assets
  },
  // {
  //   address: CONTRACT_ADDRESSES.JAMII_GOVERNANCE_TOKEN,
  //   symbol: 'JGT',
  //   name: 'Jamii Governance Token',
  //   displayName: 'Jamii Governance Token',
  //   decimals: 18,
  //   logo: '/tokens/jgt.png',
  //   minDeposit: '100.0', // Minimum stake for loan eligibility
  //   shareRatio: '2.0', // Higher share ratio for higher risk
  //   isNative: false,
  //   description: 'SACCO membership, governance, and collateral asset',
  //   color: '#4B5563', // Jamii gray
  //   isCollateral: true,
  // },
] as const;

/**
 * Native ETH ROSCA - No loan assets needed for simple native token ROSCAs
 */
export const LOAN_ASSETS = [] as const;


/**
 * Overcollateralized Loan System Configuration
 */
export const LOAN_CONFIG = {
  // Loan Tiers with Dual Rates (Platform Users vs SACCO Members)
  TIERS: {
    MICRO: {
      name: 'Micro Loan',
      maxAmount: 1000, // USDC
      maxAmountFormatted: '1,000',
      collateralRatio: 150, // 150%
      platformUserRate: 12, // 12% APR
      saccoMemberRate: 8,   // 8% APR
      maxTermDays: 30,
      requiresVote: false,
      description: 'Small loans for immediate needs'
    },
    SMALL: {
      name: 'Small Loan',
      maxAmount: 5000, // USDC
      maxAmountFormatted: '5,000',
      collateralRatio: 175, // 175%
      platformUserRate: 15, // 15% APR
      saccoMemberRate: 10,  // 10% APR
      maxTermDays: 90,
      requiresVote: false,
      description: 'Medium loans for business or personal use'
    },
    LARGE: {
      name: 'Large Loan',
      maxAmount: 25000, // USDC
      maxAmountFormatted: '25,000',
      collateralRatio: 200, // 200%
      platformUserRate: 18, // 18% APR
      saccoMemberRate: 12,  // 12% APR
      maxTermDays: 365,
      requiresVote: true,
      description: 'Large loans requiring community approval'
    }
  },

  // Collateral Configuration
  COLLATERAL: {
    cBTC: {
      name: 'Citrea Bitcoin',
      symbol: 'cBTC',
      decimals: 18,
      ratio: 150, // 150% collateralization
      liquidationThreshold: 125, // 125%
      riskLevel: 'LOW',
      description: 'Native Bitcoin on Citrea L2'
    },
    JGT: {
      name: 'Jamii Governance Token',
      symbol: 'JGT',
      decimals: 18,
      ratio: 200, // 200% collateralization
      liquidationThreshold: 150, // 150%
      riskLevel: 'HIGH',
      description: 'SACCO governance and utility token'
    }
  },

  // Membership Benefits
  MEMBERSHIP_BENEFITS: {
    rateDiscount: 33, // 33% discount on interest rates
    governanceRights: true,
    profitSharing: true,
    priorityAccess: true,
    description: 'SACCO members enjoy significant rate discounts and governance participation'
  },

  // Demo Prices (for testing)
  DEMO_PRICES: {
    cBTC: 50000, // $50,000 per cBTC
    JGT: 1,      // $1 per JGT
    USDC: 1      // $1 per USDC
  }
} as const;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate that all required environment variables are present
 */
export function validateConfig(): void {
  const requiredEnvVars = [
    'VITE_DYNAMIC_ENVIRONMENT_ID',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName] || import.meta.env[varName].trim() === ''
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing or empty environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.\n' +
      'Example .env file:\n' +
      'VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id-here'
    );
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  // Additional validation for Dynamic environment ID format
  const dynamicEnvId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  if (dynamicEnvId && !dynamicEnvId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
    console.warn(
      'VITE_DYNAMIC_ENVIRONMENT_ID does not appear to be a valid UUID format.\n' +
      'Expected format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx\n' +
      `Received: ${dynamicEnvId}`
    );
  }
}

/**
 * Safely get the Dynamic environment ID with validation
 */
export function getDynamicEnvironmentId(): string | null {
  const envId = import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID;
  
  if (!envId || envId.trim() === '') {
    console.error('VITE_DYNAMIC_ENVIRONMENT_ID is not set or empty');
    return null;
  }
  
  // Validate UUID format
  if (!envId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i)) {
    console.error('VITE_DYNAMIC_ENVIRONMENT_ID is not in valid UUID format:', envId);
    return null;
  }
  
  return envId;
}

/**
 * Check if Dynamic Labs is properly configured
 */
export function isDynamicConfigured(): boolean {
  return getDynamicEnvironmentId() !== null;
}
export function isCorrectNetwork(chainId: number): boolean {
  return chainId === NETWORK_CONFIG.CHAIN_ID || chainId === NETWORK_CONFIG.ALT_CHAIN_ID;
}

/**
 * Get explorer URL for a transaction hash
 */
export function getTransactionUrl(hash: string, chainId?: number): string {
  const explorerUrl = chainId === NETWORK_CONFIG.ALT_CHAIN_ID 
    ? NETWORK_CONFIG.ALT_EXPLORER_URL 
    : NETWORK_CONFIG.EXPLORER_URL;
  return `${explorerUrl}/tx/${hash}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressUrl(address: string, chainId?: number): string {
  const explorerUrl = chainId === NETWORK_CONFIG.ALT_CHAIN_ID 
    ? NETWORK_CONFIG.ALT_EXPLORER_URL 
    : NETWORK_CONFIG.EXPLORER_URL;
  return `${explorerUrl}/address/${address}`;
}

/**
 * Get explorer URL for a block
 */
export function getBlockUrl(blockNumber: number | string, chainId?: number): string {
  const explorerUrl = chainId === NETWORK_CONFIG.ALT_CHAIN_ID 
    ? NETWORK_CONFIG.ALT_EXPLORER_URL 
    : NETWORK_CONFIG.EXPLORER_URL;
  return `${explorerUrl}/block/${blockNumber}`;
}

/**
 * Get token configuration by address
 */
export function getTokenConfig(address: string) {
  return SUPPORTED_TOKENS.find(token => 
    token.address.toLowerCase() === address.toLowerCase() ||
    (token.isNative && address === '0x0000000000000000000000000000000000000000')
  );
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type NetworkConfig = typeof NETWORK_CONFIG;
export type ContractAddresses = typeof CONTRACT_ADDRESSES;
export type TransactionConfig = typeof TRANSACTION_CONFIG;
export type SaccoConfig = typeof SACCO_CONFIG;
export type UIConfig = typeof UI_CONFIG;
export type FeatureFlags = typeof FEATURE_FLAGS;
export type APIConfig = typeof API_CONFIG;
export type SupportedToken = typeof SUPPORTED_TOKENS[number];




/**
 * ROSCA Configuration
 */
export const ROSCA_CONFIG = {
  MIN_CONTRIBUTION_AMOUNT: '0.001', // 0.001 cBTC minimum
  MAX_CONTRIBUTION_AMOUNT: '10.0',  // 10 cBTC maximum
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 20,
  MIN_ROUND_DURATION_DAYS: 1,  // 1 day minimum
  MAX_ROUND_DURATION_DAYS: 30, // 30 days maximum
  DEFAULT_ROUND_DURATION_DAYS: 7, // 1 week default
  FACTORY_CREATION_FEE: '0.001', // 0.001 cBTC to create ROSCA
} as const;


// =============================================================================
// PRICING CONFIGURATION (Bitcoin Layer 2)
// =============================================================================

/**
 * Bitcoin Pricing Configuration
 * Since Citrea is a Bitcoin Layer 2, we use Bitcoin pricing
 */
export const PRICING_CONFIG = {
  // Current Bitcoin price for USD calculations (in production, fetch from API)
  BITCOIN_PRICE_USD: 65000, // $65,000 per BTC
  CITREA_BITCOIN_RATIO: 1, // 1:1 ratio with Bitcoin
  
  // Price API endpoints (for future real-time pricing)
  PRICE_API_ENDPOINTS: {
    COINGECKO: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
    COINBASE: 'https://api.coinbase.com/v2/exchange-rates?currency=BTC',
  },
} as const;

// =============================================================================
// TOKEN CONFIGURATION EXPORTS
// =============================================================================

/**
 * Native Token (cBTC) Configuration
 */
export const NATIVE_TOKEN = {
  address: '0x0000000000000000000000000000000000000000' as Address,
  symbol: 'cBTC',
  name: 'Citrea',
  decimals: 18,
  isNative: true,
} as const;

/**
 * All supported tokens for easy access (Native ETH only)
 */
export const TOKENS = {
  NATIVE: NATIVE_TOKEN,
} as const;

// =============================================================================
// SUPPORTED TOKENS CONFIGURATION
// =============================================================================


/**
 * Convert cBTC amount to USD using Bitcoin price
 */
export function convertCBTCToUSD(amount: number): number {
  return amount * PRICING_CONFIG.BITCOIN_PRICE_USD;
}

/**
 * Format currency amount with proper decimals
 */
export function formatCurrency(amount: number, currency: 'USD' | 'cBTC' = 'USD'): string {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else {
    return `${amount.toFixed(6)} cBTC`;
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type ROSCAConfig = typeof ROSCA_CONFIG;
export type PricingConfig = typeof PRICING_CONFIG;
