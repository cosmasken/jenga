import type { Address, Hash } from 'viem';

/* === CONTRACT TYPES === */

export interface MemberInfo {
  isMember: boolean;
  ethDeposited: bigint;
  usdcBorrowed: bigint;
}

export interface SaccoContractState {
  treasuryUSDC: bigint;
  globalRateBps: bigint;
  joinFee: bigint;
  maxLtvBps: bigint;
  bigThreshold: bigint;
  quorum: bigint;
}

export interface TransactionResult {
  hash: Hash;
  success: boolean;
  error?: string;
}

/* === HOOK TYPES === */

export interface SaccoHookState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  address: Address | null;
  ethBalance: string;
  memberData: MemberInfo | null;
  maxBorrowableUSDC: bigint;
  totalOwedUSDC: bigint;
  treasuryBalance: bigint;
  currentInterestRate: bigint;
}

export interface SaccoHookActions {
  connect: () => Promise<void>;
  refreshData: () => Promise<void>;
  join: () => Promise<Hash | undefined>;
  depositETH: (ethAmount: string) => Promise<Hash | undefined>;
  withdrawETH: (ethAmount: string) => Promise<Hash | undefined>;
  borrowUSDC: (usdcAmount: string) => Promise<Hash | undefined>;
  repayUSDC: (usdcAmount: string) => Promise<Hash | undefined>;
  fundTreasury: (usdcAmount: string) => Promise<Hash | undefined>;
}

export type SaccoHook = SaccoHookState & SaccoHookActions;

/* === EVENT TYPES === */

export interface JoinedEvent {
  user: Address;
  ethFee: bigint;
}

export interface DepositETHEvent {
  user: Address;
  ethAmount: bigint;
}

export interface BorrowUSDCEvent {
  user: Address;
  usdcAmount: bigint;
}

export interface RepayUSDCEvent {
  user: Address;
  usdcAmount: bigint;
}

export interface RateChangeEvent {
  delta: number;
  newRate: bigint;
}

/* === UTILITY TYPES === */

export interface FormattedBalances {
  ethDeposited: string;
  usdcBorrowed: string;
  maxBorrowable: string;
  totalOwed: string;
  availableToWithdraw: string;
}

export interface HealthMetrics {
  healthFactor: number;
  liquidationThreshold: number;
  utilizationRate: number;
  isHealthy: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/* === ERROR TYPES === */

export type SaccoError = 
  | 'WALLET_NOT_CONNECTED'
  | 'CONTRACT_NOT_AVAILABLE'
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_COLLATERAL'
  | 'EXCEEDS_MAX_LTV'
  | 'NOT_MEMBER'
  | 'TREASURY_INSUFFICIENT'
  | 'TRANSACTION_FAILED'
  | 'UNKNOWN_ERROR';

export interface SaccoErrorDetails {
  code: SaccoError;
  message: string;
  details?: any;
}
