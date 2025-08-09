/**
 * Token Utilities
 * Comprehensive token management system with icons, metadata, and formatting
 */

import type { Address } from 'viem';
import { CONTRACT_ADDRESSES } from '@/config';

// Token Icons - Using emoji for now, can be replaced with actual icon components
export const TOKEN_ICONS = {
  cBTC: '₿',
  // Stablecoins
  USDC: '💵',
  USDT: '💵',
  DAI: '💰',

  
  // Default fallback
  DEFAULT: '🪙',
} as const;

export type TokenSymbol = keyof typeof TOKEN_ICONS;

/**
 * Token metadata interface
 */
export interface TokenInfo {
  symbol: string;
  name: string;
  address: Address;
  decimals: number;
  icon: string;
  isNative: boolean;
  isStablecoin: boolean;
  isTestToken: boolean;
  color: string;
  description?: string;
}

/**
 * Supported tokens configuration
 */
export const SUPPORTED_TOKENS: Record<string, TokenInfo> = {
  cBTC: {
    symbol: 'cBTC',
    name: 'Citrea Bitcoin',
    address: '0x0000000000000000000000000000000000000000' as Address,
    decimals: 18,
    icon: TOKEN_ICONS.cBTC,
    isNative: true,
    isStablecoin: false,
    isTestToken: false,
    color: '#F7931A',
    description: 'Native Bitcoin on Citrea Layer 2',
  },
  USDC: {
    symbol: 'fUSDC',
    name: 'Fake USD Coin',
    address: CONTRACT_ADDRESSES.USDC,
    decimals: 6,
    icon: TOKEN_ICONS.fUSDC,
    isNative: false,
    isStablecoin: true,
    isTestToken: true,
    color: '#2775CA',
    description: 'Test USDC token with built-in faucet',
  },
  USDT: {
    symbol: 'fUSDT',
    name: 'Fake Tether USD',
    address: CONTRACT_ADDRESSES.USDT,
    decimals: 6,
    icon: TOKEN_ICONS.fUSDT,
    isNative: false,
    isStablecoin: true,
    isTestToken: true,
    color: '#26A17B',
    description: 'Test USDT token with built-in faucet',
  },
  DAI: {
    symbol: 'fDAI',
    name: 'Fake Dai Stablecoin',
    address: CONTRACT_ADDRESSES.DAI,
    decimals: 18,
    icon: TOKEN_ICONS.fDAI,
    isNative: false,
    isStablecoin: true,
    isTestToken: true,
    color: '#F5AC37',
    description: 'Test DAI token with built-in faucet',
  },
} as const;

/**
 * Get token icon by symbol
 * @param symbol Token symbol
 * @returns Token icon (emoji or component)
 */
export function getTokenIcon(symbol: string): string {
  const normalizedSymbol = symbol.toUpperCase() as TokenSymbol;
  return TOKEN_ICONS[normalizedSymbol] || TOKEN_ICONS.DEFAULT;
}

/**
 * Get token info by symbol
 * @param symbol Token symbol
 * @returns Token information or null if not found
 */
export function getTokenInfo(symbol: string): TokenInfo | null {
  const normalizedSymbol = symbol.toUpperCase();
  return SUPPORTED_TOKENS[normalizedSymbol] || null;
}

/**
 * Get token info by address
 * @param address Token contract address
 * @returns Token information or null if not found
 */
export function getTokenInfoByAddress(address: Address): TokenInfo | null {
  const normalizedAddress = address.toLowerCase();
  
  // Handle native token (zero address)
  if (normalizedAddress === '0x0000000000000000000000000000000000000000') {
    return SUPPORTED_TOKENS.cBTC;
  }
  
  return Object.values(SUPPORTED_TOKENS).find(
    token => token.address.toLowerCase() === normalizedAddress
  ) || null;
}

/**
 * Get all supported tokens
 * @param includeNative Include native token (cBTC)
 * @param includeTestTokens Include test tokens
 * @returns Array of token information
 */
export function getSupportedTokens(
  includeNative: boolean = true,
  includeTestTokens: boolean = true
): TokenInfo[] {
  return Object.values(SUPPORTED_TOKENS).filter(token => {
    if (!includeNative && token.isNative) return false;
    if (!includeTestTokens && token.isTestToken) return false;
    return true;
  });
}

/**
 * Get stablecoin tokens only
 * @returns Array of stablecoin token information
 */
export function getStablecoins(): TokenInfo[] {
  return Object.values(SUPPORTED_TOKENS).filter(token => token.isStablecoin);
}

/**
 * Format token amount with proper decimals
 * @param amount Amount in smallest unit (wei/satoshi)
 * @param tokenSymbol Token symbol
 * @param displayDecimals Number of decimals to display
 * @returns Formatted amount string
 */
export function formatTokenAmount(
  amount: bigint | string | number,
  tokenSymbol: string,
  displayDecimals: number = 4
): string {
  const tokenInfo = getTokenInfo(tokenSymbol);
  if (!tokenInfo) return '0';
  
  const amountBigInt = typeof amount === 'bigint' ? amount : BigInt(amount);
  const divisor = BigInt(10 ** tokenInfo.decimals);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  
  if (fractionalPart === 0n) {
    return wholePart.toString();
  }
  
  const fractionalStr = fractionalPart.toString().padStart(tokenInfo.decimals, '0');
  const trimmedFractional = fractionalStr.slice(0, displayDecimals).replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}

/**
 * Parse token amount to smallest unit
 * @param amount Amount as string (e.g., "1.5")
 * @param tokenSymbol Token symbol
 * @returns Amount in smallest unit (wei/satoshi)
 */
export function parseTokenAmount(amount: string, tokenSymbol: string): bigint {
  const tokenInfo = getTokenInfo(tokenSymbol);
  if (!tokenInfo) return 0n;
  
  const [wholePart = '0', fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(tokenInfo.decimals, '0').slice(0, tokenInfo.decimals);
  
  const wholePartBigInt = BigInt(wholePart) * BigInt(10 ** tokenInfo.decimals);
  const fractionalPartBigInt = BigInt(paddedFractional);
  
  return wholePartBigInt + fractionalPartBigInt;
}

/**
 * Get token display name with icon
 * @param symbol Token symbol
 * @returns Formatted display name with icon
 */
export function getTokenDisplayName(symbol: string): string {
  const tokenInfo = getTokenInfo(symbol);
  if (!tokenInfo) return symbol;
  
  return `${tokenInfo.icon} ${tokenInfo.symbol}`;
}

/**
 * Check if token has faucet functionality
 * @param symbol Token symbol
 * @returns True if token has faucet
 */
export function hasTokenFaucet(symbol: string): boolean {
  const tokenInfo = getTokenInfo(symbol);
  return tokenInfo?.isTestToken || false;
}

/**
 * Get faucet amount for token
 * @param symbol Token symbol
 * @returns Faucet amount in token units (not wei)
 */
export function getFaucetAmount(symbol: string): number {
  const tokenInfo = getTokenInfo(symbol);
  if (!tokenInfo?.isTestToken) return 0;
  
  // All test tokens give 1000 tokens from faucet
  return 1000;
}

/**
 * Get token color for UI theming
 * @param symbol Token symbol
 * @returns Hex color code
 */
export function getTokenColor(symbol: string): string {
  const tokenInfo = getTokenInfo(symbol);
  return tokenInfo?.color || '#6B7280';
}

/**
 * Validate token address
 * @param address Token address
 * @returns True if address is a supported token
 */
export function isValidTokenAddress(address: string): boolean {
  try {
    const tokenInfo = getTokenInfoByAddress(address as Address);
    return tokenInfo !== null;
  } catch {
    return false;
  }
}

/**
 * Get token selector options for UI components
 * @param includeNative Include native token
 * @param includeTestTokens Include test tokens
 * @returns Array of token selector options
 */
export interface TokenSelectorOption {
  value: string;
  label: string;
  icon: string;
  address: Address;
  decimals: number;
  color: string;
  isNative: boolean;
  isStablecoin: boolean;
  isTestToken: boolean;
}

export function getTokenSelectorOptions(
  includeNative: boolean = true,
  includeTestTokens: boolean = true
): TokenSelectorOption[] {
  return getSupportedTokens(includeNative, includeTestTokens).map(token => ({
    value: token.symbol,
    label: `${token.icon} ${token.symbol}`,
    icon: token.icon,
    address: token.address,
    decimals: token.decimals,
    color: token.color,
    isNative: token.isNative,
    isStablecoin: token.isStablecoin,
    isTestToken: token.isTestToken,
  }));
}
