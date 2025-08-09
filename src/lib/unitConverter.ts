import { formatEther, parseEther } from 'viem';

/**
 * Converts a BigInt (Wei) amount to a formatted cBTC display string.
 * This should ONLY be used for display purposes in the UI.
 * @param weiAmount The amount in Wei (BigInt).
 * @returns The formatted amount as a string for display (e.g., "1.045628 cBTC").
 */
export function formatAmountForDisplay(weiAmount: bigint): string {
  return `${parseFloat(formatEther(weiAmount)).toFixed(6)} cBTC`;
}

/**
 * Converts a BigInt (Wei) amount to a numeric cBTC value.
 * Use this for calculations and comparisons.
 * @param weiAmount The amount in Wei (BigInt).
 * @returns The amount in cBTC as a number.
 */
export function weiToCbtc(weiAmount: bigint): number {
  return parseFloat(formatEther(weiAmount));
}

/**
 * Converts a BigInt (Wei) amount to a cBTC string (numeric only, no units).
 * Use this when you need the numeric string representation.
 * @param weiAmount The amount in Wei (BigInt).
 * @returns The amount in cBTC as a numeric string.
 */
export function weiToCbtcString(weiAmount: bigint): string {
  return parseFloat(formatEther(weiAmount)).toFixed(6);
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
 * @param cbtcAmount The amount in cBTC as a numeric string (e.g., "1.045628").
 * @returns The amount in Wei as a BigInt.
 */
export function cbtcToWei(cbtcAmount: string): bigint {
  return parseEther(cbtcAmount);
}

/**
 * Converts a numeric cBTC amount to BigInt (Wei).
 * @param cbtcAmount The amount in cBTC as a number.
 * @returns The amount in Wei as a BigInt.
 */
export function cbtcNumberToWei(cbtcAmount: number): bigint {
  return parseEther(cbtcAmount.toString());
}

// Legacy function names for backward compatibility during refactoring
// TODO: Remove these after all components are updated
export const formatAmount = formatAmountForDisplay;
export const parseCbtcToWei = cbtcToWei;
