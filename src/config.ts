// Dummy contract addresses - replace with actual addresses when deploying
export const CONTRACT_ADDRESSES = {
  JENGA_REGISTRY: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  SACCO_FACTORY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  STACKING_VAULT: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  P2P_TRANSFERS: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'
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
export const TOKEN = {
  BTC: '0x0000000000000000000000000000000000000000', // Native token address
  // Add other token addresses as needed
} as const;

// Chama (savings group) addresses
export const CHAMA_ADDRESSES = {
  CHAMA_1: '0x1234567890123456789012345678901234567890',
  CHAMA_2: '0x2345678901234567890123456789012345678901',
  CHAMA_3: '0x3456789012345678901234567890123456789012',
} as const;
