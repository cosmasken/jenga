import { formatEther, parseEther } from 'viem';

export type DisplayUnit = 'cBTC' | 'satoshi';

export const WEI_PER_CBTC = 1e18;
export const SATOSHIS_PER_CBTC = 1e8; // Assuming 1 cBTC = 100,000,000 satoshis

/**
 * Converts a BigInt (Wei) amount to a formatted string in the specified display unit.
 * @param weiAmount The amount in Wei (BigInt).
 * @param unit The desired display unit ('cBTC' or 'satoshi').
 * @returns The formatted amount as a string.
 */
export function formatAmount(weiAmount: bigint, unit: DisplayUnit): string {
  if (unit === 'cBTC') {
    return `${parseFloat(formatEther(weiAmount)).toFixed(6)} cBTC`;
  } else if (unit === 'satoshi') {
    const cbtcAmount = parseFloat(formatEther(weiAmount));
    const satoshiAmount = cbtcAmount * SATOSHIS_PER_CBTC;
    return `${satoshiAmount.toFixed(0)} satoshis`;
  }
  return `${parseFloat(formatEther(weiAmount)).toFixed(6)} cBTC`; // Default fallback
}

/**
 * Converts a duration in seconds to a formatted string in days.
 * @param seconds The duration in seconds.
 * @returns The formatted duration as a string (e.g., '7 days').
 */
export function formatDuration(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60));
  return `${days} days`;
}

/**
 * Converts a string amount in cBTC to BigInt (Wei).
 * @param cbtcAmount The amount in cBTC as a string.
 * @returns The amount in Wei as a BigInt.
 */
export function parseCbtcToWei(cbtcAmount: string): bigint {
  return parseEther(cbtcAmount);
}
