/**
 * Unified Configuration for Jenga ROSCA dApp
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

/**
 * Network Configuration Constants
 */
export const NETWORK_CONFIG = {
  CHAIN_ID: 5115,
  CHAIN_ID_HEX: '0x13FB', // 5115 in hex
  RPC_URL: 'https://rpc.testnet.citrea.xyz',
  EXPLORER_URL: 'https://explorer.testnet.citrea.xyz',
  FAUCET_URL: 'https://citrea.xyz/faucet',
  CURRENCY_SYMBOL: 'cBTC',
  CURRENCY_NAME: 'Citrea Bitcoin',
  CURRENCY_DECIMALS: 18,
} as const;

/**
 * Dynamic Wallet Configuration for Citrea
 */
export const DYNAMIC_NETWORK_CONFIG = [
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
];

// =============================================================================
// CONTRACT CONFIGURATION
// =============================================================================

/**
 * Smart Contract Addresses
 */
export const CONTRACT_ADDRESSES = {
  ROSCA: '0xB7AdF792C054976E1F40B45CB768f6D09E42358A' as Address,
  // Add other contract addresses here as needed
  // GOVERNANCE: '0x...' as Address,
  // TOKEN: '0x...' as Address,
} as const;

/**
 * Legacy export for backward compatibility
 * @deprecated Use CONTRACT_ADDRESSES.ROSCA instead
 */
export const ROSCA_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.ROSCA;

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
} as const;

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  TOAST_DURATION: 5000, // 5 seconds
  MODAL_ANIMATION_DURATION: 300, // 300ms
  POLLING_INTERVAL: 10_000, // 10 seconds for data refresh
} as const;

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_DISPUTES: true,
  ENABLE_ANALYTICS: true,
  ENABLE_REAL_TIME_UPDATES: true,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  DYNAMIC_ENVIRONMENT_ID: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
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
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

/**
 * Check if we're on the correct network
 */
export function isCorrectNetwork(chainId: number): boolean {
  return chainId === NETWORK_CONFIG.CHAIN_ID;
}

/**
 * Get explorer URL for a transaction hash
 */
export function getTransactionUrl(hash: string): string {
  return `${NETWORK_CONFIG.EXPLORER_URL}/tx/${hash}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressUrl(address: string): string {
  return `${NETWORK_CONFIG.EXPLORER_URL}/address/${address}`;
}

/**
 * Get explorer URL for a block
 */
export function getBlockUrl(blockNumber: number | string): string {
  return `${NETWORK_CONFIG.EXPLORER_URL}/block/${blockNumber}`;
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type NetworkConfig = typeof NETWORK_CONFIG;
export type ContractAddresses = typeof CONTRACT_ADDRESSES;
export type TransactionConfig = typeof TRANSACTION_CONFIG;
export type UIConfig = typeof UI_CONFIG;
export type FeatureFlags = typeof FEATURE_FLAGS;
export type APIConfig = typeof API_CONFIG;
