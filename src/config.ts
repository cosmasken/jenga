// Contract addresses - Update these with your actual deployed contract addresses
// For testing purposes, using placeholder addresses that follow Ethereum address format
export const CONTRACT_ADDRESSES = {
  JENGA_REGISTRY: '0x1234567890123456789012345678901234567890',
  SACCO_FACTORY: '0x2345678901234567890123456789012345678901',
  STACKING_VAULT: '0x3456789012345678901234567890123456789012',
  P2P_TRANSFERS: '0x4567890123456789012345678901234567890123',
  MULTISIG: '0x5678901234567890123456789012345678901234',
} as const;

export const LOADING_MESSAGES = {
  // Jenga Registry
  CREATING_PROFILE: 'Creating your profile...',
  UPDATING_SCORE: 'Updating your score...',
  
  // Sacco Factory
  CREATING_POOL: 'Creating new savings pool...',
  JOINING_POOL: 'Joining savings pool...',
  CONTRIBUTING: 'Processing your contribution...',
  
  // Stacking Vault
  CREATING_GOAL: 'Setting up your savings goal...',
  PROCESSING_DEPOSIT: 'Processing your deposit...',
  
  // P2P Transfers
  SENDING_BTC: 'Sending BTC...',
  CREATING_ENVELOPE: 'Creating red envelope...',
  CLAIMING_ENVELOPE: 'Claiming your share...',
  
  // Token Operations
  APPROVING_TOKEN: 'Approving token transfer...',
  TOKEN_TRANSFER: 'Processing token transfer...'
} as const;

// Token addresses
// Replace with your actual token contract addresses if using ERC20/wrapped tokens
export const TOKEN = {
  BTC: '0x0000000000000000000000000000000000000000', // Native cBTC (use WBTC address if wrapped)
  // Add other token addresses as needed
} as const;

// Chama (savings group) addresses
// Replace with real chama (pool) addresses as deployed on testnet
export const CHAMA_ADDRESSES = {
  CHAMA_1: '0xYOUR_CHAMA1_ADDRESS',
  CHAMA_2: '0xYOUR_CHAMA2_ADDRESS',
  CHAMA_3: '0xYOUR_CHAMA3_ADDRESS',
} as const;
