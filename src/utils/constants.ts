import { CONTRACT_ADDRESSES, PRICING_CONFIG } from '@/config';

// Factory contract address
export const FACTORY_ADDRESS = CONTRACT_ADDRESSES.ROSCA_FACTORY;

// Bitcoin price for USD calculations (since Citrea is Bitcoin Layer 2)
export const BITCOIN_PRICE_USD = PRICING_CONFIG.BITCOIN_PRICE_USD;

// ROSCA creation and validation config
export const ROSCA_CONFIG = {
  MIN_CONTRIBUTION_AMOUNT: '0.001', // cBTC
  MAX_CONTRIBUTION_AMOUNT: '10',    // cBTC
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 50,
  FACTORY_CREATION_FEE: '0.001',    // Estimated creation gas in cBTC (display only)
} as const;

// Round duration options in seconds
export const ROUND_DURATIONS = {
  '3': 3 * 24 * 60 * 60,    // 3 days
  '7': 7 * 24 * 60 * 60,    // 1 week
  '14': 14 * 24 * 60 * 60,  // 2 weeks
  '30': 30 * 24 * 60 * 60,  // 1 month
} as const;

// Copy text constants
export const COPY_TEXT = {
  HERO_TITLE: 'Save & borrow with friends—no banks, no borders.',
  HERO_SUBTITLE: 'Create or join a rotating savings circle in 30 seconds.',
  CREATE_CTA: 'Create a Chama',
  JOIN_CTA: 'Join a Chama',
  WALLET_CONNECT: 'Connect Wallet',
  
  // Success messages
  CHAMA_CREATED: '🎉 Chama created! Redirecting…',
  CHAMA_JOINED: '✅ You joined the chama!',
  CONTRIBUTION_SENT: '💸 Contribution sent!',
  
  // Error messages
  WALLET_REQUIRED: 'Please connect wallet first.',
  CREATE_FAILED: '❌ Could not create',
  JOIN_FAILED: '❌ Join failed',
  CONTRIBUTION_FAILED: '❌ Contribution failed',
} as const;
