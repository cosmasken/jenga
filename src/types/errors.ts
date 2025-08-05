/**
 * Error and Notification System Types
 * Comprehensive type definitions for error handling and notifications
 */

export enum ErrorCategory {
  WALLET = 'wallet',
  NETWORK = 'network',
  CONTRACT = 'contract',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  TRANSACTION = 'transaction',
  SYSTEM = 'system'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ErrorAction {
  label: string;
  handler: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
}

export interface FormattedError {
  id: string;
  category: ErrorCategory;
  code: string;
  title: string;
  message: string;
  suggestion?: string;
  action?: ErrorAction;
  severity: ErrorSeverity;
  timestamp: Date;
  raw?: any; // Original error object
  context?: Record<string, any>; // Additional context
}

// Common error codes for each category
export const ERROR_CODES = {
  // Wallet Errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
  WALLET_NETWORK_MISMATCH: 'WALLET_NETWORK_MISMATCH',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_REJECTED: 'TRANSACTION_REJECTED',
  
  // Network Errors
  NETWORK_UNAVAILABLE: 'NETWORK_UNAVAILABLE',
  RPC_ERROR: 'RPC_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  BLOCK_CONFIRMATION_TIMEOUT: 'BLOCK_CONFIRMATION_TIMEOUT',
  
  // Contract Errors
  CONTRACT_CALL_FAILED: 'CONTRACT_CALL_FAILED',
  CONTRACT_REVERT: 'CONTRACT_REVERT',
  GAS_ESTIMATION_FAILED: 'GAS_ESTIMATION_FAILED',
  INVALID_CONTRACT_STATE: 'INVALID_CONTRACT_STATE',
  
  // Transaction Errors
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  TRANSACTION_UNDERPRICED: 'TRANSACTION_UNDERPRICED',
  NONCE_TOO_LOW: 'NONCE_TOO_LOW',
  REPLACEMENT_UNDERPRICED: 'REPLACEMENT_UNDERPRICED',
  
  // Validation Errors
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Authentication Errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // System Errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error context interfaces for different categories
export interface WalletErrorContext {
  address?: string;
  chainId?: number;
  requiredChainId?: number;
  balance?: string;
  requiredAmount?: string;
}

export interface ContractErrorContext {
  contractAddress?: string;
  functionName?: string;
  parameters?: any[];
  gasLimit?: string;
  gasPrice?: string;
}

export interface TransactionErrorContext {
  hash?: string;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
  value?: string;
  to?: string;
}

export interface NetworkErrorContext {
  chainId?: number;
  rpcUrl?: string;
  blockNumber?: number;
  retryCount?: number;
}

// Union type for all error contexts
export type ErrorContext = 
  | WalletErrorContext 
  | ContractErrorContext 
  | TransactionErrorContext 
  | NetworkErrorContext 
  | Record<string, any>;
