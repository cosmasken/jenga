/**
 * Error Formatter Service
 * Converts raw errors into user-friendly formatted errors
 */

import { 
  type FormattedError, 
  ErrorCategory, 
  ErrorSeverity, 
  type ErrorCode, 
  ERROR_CODES,
  type ErrorContext,
  type WalletErrorContext,
  type ContractErrorContext,
  type TransactionErrorContext,
  type NetworkErrorContext
} from '@/types/errors';

export class ErrorFormatterService {
  private static instance: ErrorFormatterService;

  public static getInstance(): ErrorFormatterService {
    if (!ErrorFormatterService.instance) {
      ErrorFormatterService.instance = new ErrorFormatterService();
    }
    return ErrorFormatterService.instance;
  }

  /**
   * Format any error into a user-friendly FormattedError
   */
  public formatError(error: any, context?: ErrorContext): FormattedError {
    const errorId = this.generateErrorId();
    const timestamp = new Date();

    // Try to identify error type and format accordingly
    if (this.isWalletError(error)) {
      return this.formatWalletError(error, context as WalletErrorContext, errorId, timestamp);
    }
    
    if (this.isContractError(error)) {
      return this.formatContractError(error, context as ContractErrorContext, errorId, timestamp);
    }
    
    if (this.isTransactionError(error)) {
      return this.formatTransactionError(error, context as TransactionErrorContext, errorId, timestamp);
    }
    
    if (this.isNetworkError(error)) {
      return this.formatNetworkError(error, context as NetworkErrorContext, errorId, timestamp);
    }

    // Fallback to generic error
    return this.formatGenericError(error, context, errorId, timestamp);
  }

  /**
   * Format wallet-related errors
   */
  private formatWalletError(
    error: any, 
    context: WalletErrorContext = {}, 
    id: string, 
    timestamp: Date
  ): FormattedError {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
      return {
        id,
        category: ErrorCategory.WALLET,
        code: ERROR_CODES.TRANSACTION_REJECTED,
        title: 'Transaction Rejected',
        message: 'You rejected the transaction in your wallet.',
        suggestion: 'Please approve the transaction to continue.',
        severity: ErrorSeverity.MEDIUM,
        timestamp,
        raw: error,
        context,
        action: {
          label: 'Try Again',
          handler: () => window.location.reload()
        }
      };
    }

    if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
      const requiredAmount = context.requiredAmount || 'unknown';
      const currentBalance = context.balance || 'unknown';
      
      return {
        id,
        category: ErrorCategory.WALLET,
        code: ERROR_CODES.INSUFFICIENT_BALANCE,
        title: 'Insufficient Balance',
        message: `You need ${requiredAmount} cBTC but only have ${currentBalance} cBTC.`,
        suggestion: 'Please add more funds to your wallet or reduce the amount.',
        severity: ErrorSeverity.HIGH,
        timestamp,
        raw: error,
        context,
        action: {
          label: 'Get Testnet Funds',
          handler: () => window.open('https://citrea.xyz/faucet', '_blank')
        }
      };
    }

    if (errorMessage.includes('wrong network') || errorMessage.includes('unsupported chain')) {
      return {
        id,
        category: ErrorCategory.WALLET,
        code: ERROR_CODES.WALLET_NETWORK_MISMATCH,
        title: 'Wrong Network',
        message: 'Please switch to Citrea Testnet (Chain ID: 5115).',
        suggestion: 'Click the button below to switch networks automatically.',
        severity: ErrorSeverity.HIGH,
        timestamp,
        raw: error,
        context,
        action: {
          label: 'Switch Network',
          handler: () => this.switchToCitreaTestnet()
        }
      };
    }

    if (errorMessage.includes('not connected') || errorMessage.includes('no wallet')) {
      return {
        id,
        category: ErrorCategory.WALLET,
        code: ERROR_CODES.WALLET_NOT_CONNECTED,
        title: 'Wallet Not Connected',
        message: 'Please connect your wallet to continue.',
        suggestion: 'Click the connect button to link your wallet.',
        severity: ErrorSeverity.HIGH,
        timestamp,
        raw: error,
        context
      };
    }

    // Generic wallet error
    return {
      id,
      category: ErrorCategory.WALLET,
      code: ERROR_CODES.WALLET_CONNECTION_FAILED,
      title: 'Wallet Error',
      message: 'There was an issue with your wallet connection.',
      suggestion: 'Please try reconnecting your wallet.',
      severity: ErrorSeverity.MEDIUM,
      timestamp,
      raw: error,
      context
    };
  }

  /**
   * Format contract-related errors
   */
  private formatContractError(
    error: any, 
    context: ContractErrorContext = {}, 
    id: string, 
    timestamp: Date
  ): FormattedError {
    const errorMessage = error.message?.toLowerCase() || '';
    const revertReason = this.extractRevertReason(error);

    if (revertReason) {
      return {
        id,
        category: ErrorCategory.CONTRACT,
        code: ERROR_CODES.CONTRACT_REVERT,
        title: 'Transaction Reverted',
        message: `Contract error: ${revertReason}`,
        suggestion: 'Please check your input parameters and try again.',
        severity: ErrorSeverity.HIGH,
        timestamp,
        raw: error,
        context
      };
    }

    if (errorMessage.includes('gas') && errorMessage.includes('estimate')) {
      return {
        id,
        category: ErrorCategory.CONTRACT,
        code: ERROR_CODES.GAS_ESTIMATION_FAILED,
        title: 'Gas Estimation Failed',
        message: 'Unable to estimate gas for this transaction.',
        suggestion: 'The transaction might fail. Please check your parameters.',
        severity: ErrorSeverity.MEDIUM,
        timestamp,
        raw: error,
        context
      };
    }

    // Generic contract error
    return {
      id,
      category: ErrorCategory.CONTRACT,
      code: ERROR_CODES.CONTRACT_CALL_FAILED,
      title: 'Contract Error',
      message: 'The smart contract call failed.',
      suggestion: 'Please try again or contact support if the issue persists.',
      severity: ErrorSeverity.HIGH,
      timestamp,
      raw: error,
      context
    };
  }

  /**
   * Format transaction-related errors
   */
  private formatTransactionError(
    error: any, 
    context: TransactionErrorContext = {}, 
    id: string, 
    timestamp: Date
  ): FormattedError {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('underpriced')) {
      return {
        id,
        category: ErrorCategory.TRANSACTION,
        code: ERROR_CODES.TRANSACTION_UNDERPRICED,
        title: 'Transaction Underpriced',
        message: 'Your transaction gas price is too low.',
        suggestion: 'Please increase the gas price and try again.',
        severity: ErrorSeverity.MEDIUM,
        timestamp,
        raw: error,
        context,
        action: {
          label: 'Retry with Higher Gas',
          handler: () => console.log('Retry with higher gas')
        }
      };
    }

    if (errorMessage.includes('nonce too low')) {
      return {
        id,
        category: ErrorCategory.TRANSACTION,
        code: ERROR_CODES.NONCE_TOO_LOW,
        title: 'Transaction Nonce Error',
        message: 'Transaction nonce is too low.',
        suggestion: 'Please wait for pending transactions to complete.',
        severity: ErrorSeverity.MEDIUM,
        timestamp,
        raw: error,
        context
      };
    }

    // Generic transaction error
    return {
      id,
      category: ErrorCategory.TRANSACTION,
      code: ERROR_CODES.TRANSACTION_FAILED,
      title: 'Transaction Failed',
      message: 'Your transaction could not be processed.',
      suggestion: 'Please check your wallet and try again.',
      severity: ErrorSeverity.HIGH,
      timestamp,
      raw: error,
      context
    };
  }

  /**
   * Format network-related errors
   */
  private formatNetworkError(
    error: any, 
    context: NetworkErrorContext = {}, 
    id: string, 
    timestamp: Date
  ): FormattedError {
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      return {
        id,
        category: ErrorCategory.NETWORK,
        code: ERROR_CODES.TIMEOUT_ERROR,
        title: 'Network Timeout',
        message: 'The request timed out. The network might be slow.',
        suggestion: 'Please try again in a few moments.',
        severity: ErrorSeverity.MEDIUM,
        timestamp,
        raw: error,
        context,
        action: {
          label: 'Retry',
          handler: () => window.location.reload()
        }
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('rpc')) {
      return {
        id,
        category: ErrorCategory.NETWORK,
        code: ERROR_CODES.RPC_ERROR,
        title: 'Network Error',
        message: 'Unable to connect to the Citrea network.',
        suggestion: 'Please check your internet connection and try again.',
        severity: ErrorSeverity.HIGH,
        timestamp,
        raw: error,
        context
      };
    }

    // Generic network error
    return {
      id,
      category: ErrorCategory.NETWORK,
      code: ERROR_CODES.NETWORK_UNAVAILABLE,
      title: 'Network Unavailable',
      message: 'The blockchain network is currently unavailable.',
      suggestion: 'Please try again later.',
      severity: ErrorSeverity.HIGH,
      timestamp,
      raw: error,
      context
    };
  }

  /**
   * Format generic/unknown errors
   */
  private formatGenericError(
    error: any, 
    context: ErrorContext = {}, 
    id: string, 
    timestamp: Date
  ): FormattedError {
    return {
      id,
      category: ErrorCategory.SYSTEM,
      code: ERROR_CODES.UNKNOWN_ERROR,
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred.',
      suggestion: 'Please try again or contact support if the issue persists.',
      severity: ErrorSeverity.MEDIUM,
      timestamp,
      raw: error,
      context
    };
  }

  /**
   * Helper methods for error type detection
   */
  private isWalletError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('wallet') || 
           message.includes('user rejected') || 
           message.includes('insufficient funds') ||
           message.includes('wrong network') ||
           message.includes('not connected');
  }

  private isContractError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('revert') || 
           message.includes('contract') ||
           message.includes('gas estimate') ||
           error.code === 'CALL_EXCEPTION';
  }

  private isTransactionError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('transaction') ||
           message.includes('nonce') ||
           message.includes('underpriced') ||
           message.includes('replacement');
  }

  private isNetworkError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('rpc') ||
           message.includes('connection');
  }

  /**
   * Extract revert reason from contract error
   */
  private extractRevertReason(error: any): string | null {
    if (error.reason) return error.reason;
    if (error.data?.message) return error.data.message;
    
    const message = error.message || '';
    const revertMatch = message.match(/revert (.+)/i);
    if (revertMatch) return revertMatch[1];
    
    return null;
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Switch to Citrea Testnet
   */
  private async switchToCitreaTestnet(): Promise<void> {
    try {
      await window.ethereum?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13FB' }], // 5115 in hex
      });
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x13FB',
            chainName: 'Citrea Testnet',
            nativeCurrency: {
              name: 'Citrea Bitcoin',
              symbol: 'cBTC',
              decimals: 18
            },
            rpcUrls: ['https://rpc.testnet.citrea.xyz'],
            blockExplorerUrls: ['https://explorer.testnet.citrea.xyz']
          }]
        });
      }
    }
  }
}
