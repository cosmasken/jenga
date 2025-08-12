import { formatEther, formatUnits, parseEther, parseUnits } from 'viem';
import type { Address } from 'viem';
import type { MemberInfo, FormattedBalances, HealthMetrics, SaccoError } from '../types/sacco';

/* === CONTRACT CONSTANTS === */
export const SACCO_CONSTANTS = {
  JOIN_FEE: parseEther('0.0001'), // 0.0001 ETH
  MAX_LTV_BPS: 5000n, // 50%
  BIG_THRESHOLD: 1000n * 10n ** 6n, // 1,000 USDC
  QUORUM: 10000n * 10n ** 18n, // 10,000 governance tokens
  INIT_RATE_BPS: 500n, // 5%
  USDC_DECIMALS: 6,
  BASIS_POINTS: 10000n,
} as const;

/* === FORMATTING UTILITIES === */

/**
 * Format ETH amount to human readable string with specified decimals
 */
export function formatETH(amount: bigint, decimals: number = 4): string {
  return Number(formatEther(amount)).toFixed(decimals);
}

/**
 * Format USDC amount to human readable string with specified decimals
 */
export function formatUSDC(amount: bigint, decimals: number = 2): string {
  return Number(formatUnits(amount, SACCO_CONSTANTS.USDC_DECIMALS)).toFixed(decimals);
}

/**
 * Format basis points to percentage
 */
export function formatBasisPoints(bps: bigint, decimals: number = 2): string {
  return (Number(bps) / 100).toFixed(decimals);
}

/**
 * Parse ETH amount from string
 */
export function parseETH(amount: string): bigint {
  return parseEther(amount);
}

/**
 * Parse USDC amount from string
 */
export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, SACCO_CONSTANTS.USDC_DECIMALS);
}

/* === CALCULATION UTILITIES === */

/**
 * Calculate maximum borrowable USDC based on ETH collateral
 */
export function calculateMaxBorrowable(ethDeposited: bigint, currentDebt: bigint): bigint {
  const maxPossible = (ethDeposited * SACCO_CONSTANTS.MAX_LTV_BPS) / SACCO_CONSTANTS.BASIS_POINTS;
  return maxPossible > currentDebt ? maxPossible - currentDebt : 0n;
}

/**
 * Calculate available ETH to withdraw (considering collateral requirements)
 */
export function calculateAvailableToWithdraw(ethDeposited: bigint, usdcBorrowed: bigint): bigint {
  if (usdcBorrowed === 0n) return ethDeposited;
  
  const requiredCollateral = (usdcBorrowed * SACCO_CONSTANTS.BASIS_POINTS) / SACCO_CONSTANTS.MAX_LTV_BPS;
  return ethDeposited > requiredCollateral ? ethDeposited - requiredCollateral : 0n;
}

/**
 * Calculate health factor (higher is better, <1 means liquidation risk)
 */
export function calculateHealthFactor(ethDeposited: bigint, usdcBorrowed: bigint, ethPriceUSD: bigint = parseEther('2000')): number {
  if (usdcBorrowed === 0n) return Infinity;
  
  // Convert ETH collateral to USD value
  const collateralValueUSD = (ethDeposited * ethPriceUSD) / parseEther('1');
  
  // Convert USDC debt to same scale (18 decimals)
  const debtValueUSD = usdcBorrowed * (10n ** (18n - BigInt(SACCO_CONSTANTS.USDC_DECIMALS)));
  
  // Health factor = (collateral * max_ltv) / debt
  const maxCollateralValue = (collateralValueUSD * SACCO_CONSTANTS.MAX_LTV_BPS) / SACCO_CONSTANTS.BASIS_POINTS;
  
  return Number(maxCollateralValue) / Number(debtValueUSD);
}

/**
 * Calculate utilization rate (debt / max possible debt)
 */
export function calculateUtilizationRate(ethDeposited: bigint, usdcBorrowed: bigint): number {
  if (ethDeposited === 0n) return 0;
  
  const maxPossibleDebt = (ethDeposited * SACCO_CONSTANTS.MAX_LTV_BPS) / SACCO_CONSTANTS.BASIS_POINTS;
  if (maxPossibleDebt === 0n) return 0;
  
  return Number(usdcBorrowed * SACCO_CONSTANTS.BASIS_POINTS / maxPossibleDebt) / 100;
}

/**
 * Get formatted balances for display
 */
export function getFormattedBalances(memberData: MemberInfo | null, maxBorrowable: bigint, totalOwed: bigint): FormattedBalances {
  if (!memberData) {
    return {
      ethDeposited: '0.00',
      usdcBorrowed: '0.00',
      maxBorrowable: '0.00',
      totalOwed: '0.00',
      availableToWithdraw: '0.00',
    };
  }

  const availableToWithdraw = calculateAvailableToWithdraw(memberData.ethDeposited, memberData.usdcBorrowed);

  return {
    ethDeposited: formatETH(memberData.ethDeposited),
    usdcBorrowed: formatUSDC(memberData.usdcBorrowed),
    maxBorrowable: formatUSDC(maxBorrowable),
    totalOwed: formatUSDC(totalOwed),
    availableToWithdraw: formatETH(availableToWithdraw),
  };
}

/**
 * Get health metrics for risk assessment
 */
export function getHealthMetrics(memberData: MemberInfo | null, ethPriceUSD: bigint = parseEther('2000')): HealthMetrics {
  if (!memberData || memberData.usdcBorrowed === 0n) {
    return {
      healthFactor: Infinity,
      liquidationThreshold: 0,
      utilizationRate: 0,
      isHealthy: true,
      riskLevel: 'low',
    };
  }

  const healthFactor = calculateHealthFactor(memberData.ethDeposited, memberData.usdcBorrowed, ethPriceUSD);
  const utilizationRate = calculateUtilizationRate(memberData.ethDeposited, memberData.usdcBorrowed);
  const liquidationThreshold = Number(SACCO_CONSTANTS.MAX_LTV_BPS) / 100; // 50%

  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (healthFactor >= 2) riskLevel = 'low';
  else if (healthFactor >= 1.5) riskLevel = 'medium';
  else if (healthFactor >= 1.1) riskLevel = 'high';
  else riskLevel = 'critical';

  return {
    healthFactor,
    liquidationThreshold,
    utilizationRate,
    isHealthy: healthFactor > 1.1,
    riskLevel,
  };
}

/* === VALIDATION UTILITIES === */

/**
 * Validate ETH amount for deposit
 */
export function validateETHAmount(amount: string, userBalance: string): { isValid: boolean; error?: SaccoError } {
  try {
    const amountWei = parseETH(amount);
    const balanceWei = parseETH(userBalance);
    
    if (amountWei <= 0n) {
      return { isValid: false, error: 'INSUFFICIENT_BALANCE' };
    }
    
    if (amountWei > balanceWei) {
      return { isValid: false, error: 'INSUFFICIENT_BALANCE' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'UNKNOWN_ERROR' };
  }
}

/**
 * Validate USDC amount for borrowing
 */
export function validateUSDCBorrow(amount: string, maxBorrowable: bigint, treasuryBalance: bigint): { isValid: boolean; error?: SaccoError } {
  try {
    const amountWei = parseUSDC(amount);
    
    if (amountWei <= 0n) {
      return { isValid: false, error: 'INSUFFICIENT_BALANCE' };
    }
    
    if (amountWei > maxBorrowable) {
      return { isValid: false, error: 'EXCEEDS_MAX_LTV' };
    }
    
    if (amountWei > treasuryBalance) {
      return { isValid: false, error: 'TREASURY_INSUFFICIENT' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'UNKNOWN_ERROR' };
  }
}

/**
 * Validate ETH withdrawal amount
 */
export function validateETHWithdraw(amount: string, memberData: MemberInfo | null): { isValid: boolean; error?: SaccoError } {
  if (!memberData) {
    return { isValid: false, error: 'NOT_MEMBER' };
  }
  
  try {
    const amountWei = parseETH(amount);
    const availableToWithdraw = calculateAvailableToWithdraw(memberData.ethDeposited, memberData.usdcBorrowed);
    
    if (amountWei <= 0n) {
      return { isValid: false, error: 'INSUFFICIENT_BALANCE' };
    }
    
    if (amountWei > availableToWithdraw) {
      return { isValid: false, error: 'INSUFFICIENT_COLLATERAL' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'UNKNOWN_ERROR' };
  }
}

/* === ADDRESS UTILITIES === */

/**
 * Shorten address for display
 */
export function shortenAddress(address: Address, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Check if address is valid
 */
export function isValidAddress(address: string): address is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/* === ERROR UTILITIES === */

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: SaccoError): string {
  const errorMessages: Record<SaccoError, string> = {
    WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
    CONTRACT_NOT_AVAILABLE: 'Contract is not available. Please try again later',
    INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
    INSUFFICIENT_COLLATERAL: 'Insufficient collateral to withdraw this amount',
    EXCEEDS_MAX_LTV: 'This amount exceeds the maximum loan-to-value ratio',
    NOT_MEMBER: 'You must be a member to perform this action',
    TREASURY_INSUFFICIENT: 'Treasury has insufficient funds for this loan',
    TRANSACTION_FAILED: 'Transaction failed. Please try again',
    UNKNOWN_ERROR: 'An unknown error occurred. Please try again',
  };
  
  return errorMessages[error] || errorMessages.UNKNOWN_ERROR;
}
