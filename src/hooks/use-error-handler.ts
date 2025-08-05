/**
 * Error Handler Hook
 * Provides error handling functionality with toast integration
 */

import { useCallback } from 'react';
import { useRoscaToast } from './use-rosca-toast';
import { ErrorFormatterService } from '@/services/error-formatter';
import { type FormattedError, type ErrorContext, ErrorCategory, ErrorSeverity } from '@/types/errors';

export interface UseErrorHandlerReturn {
  handleError: (error: any, context?: ErrorContext) => FormattedError;
  handleWalletError: (error: any, context?: ErrorContext) => FormattedError;
  handleContractError: (error: any, context?: ErrorContext) => FormattedError;
  handleTransactionError: (error: any, context?: ErrorContext) => FormattedError;
  handleNetworkError: (error: any, context?: ErrorContext) => FormattedError;
  showFormattedError: (formattedError: FormattedError) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const toast = useRoscaToast();
  const errorFormatter = ErrorFormatterService.getInstance();

  /**
   * Handle any error and show appropriate toast
   */
  const handleError = useCallback((error: any, context?: ErrorContext): FormattedError => {
    const formattedError = errorFormatter.formatError(error, context);
    showFormattedError(formattedError);
    return formattedError;
  }, [errorFormatter]);

  /**
   * Handle wallet-specific errors
   */
  const handleWalletError = useCallback((error: any, context?: ErrorContext): FormattedError => {
    const formattedError = errorFormatter.formatError(error, context);
    
    // Use specific toast variants for wallet errors
    if (formattedError.code === 'INSUFFICIENT_BALANCE') {
      toast.error(
        formattedError.title,
        formattedError.message,
        formattedError.action ? {
          label: formattedError.action.label,
          onClick: formattedError.action.handler
        } : undefined
      );
    } else if (formattedError.code === 'WALLET_NETWORK_MISMATCH') {
      toast.warning(
        formattedError.title,
        formattedError.message,
        formattedError.action ? {
          label: formattedError.action.label,
          onClick: formattedError.action.handler
        } : undefined
      );
    } else {
      showFormattedError(formattedError);
    }
    
    return formattedError;
  }, [errorFormatter, toast]);

  /**
   * Handle contract-specific errors
   */
  const handleContractError = useCallback((error: any, context?: ErrorContext): FormattedError => {
    const formattedError = errorFormatter.formatError(error, context);
    
    // Log contract errors for debugging
    console.error('Contract Error:', {
      error: formattedError,
      raw: error,
      context
    });
    
    showFormattedError(formattedError);
    return formattedError;
  }, [errorFormatter]);

  /**
   * Handle transaction-specific errors
   */
  const handleTransactionError = useCallback((error: any, context?: ErrorContext): FormattedError => {
    const formattedError = errorFormatter.formatError(error, context);
    
    // Use transaction-specific toast styling
    toast.error(
      formattedError.title,
      formattedError.message,
      formattedError.action ? {
        label: formattedError.action.label,
        onClick: formattedError.action.handler
      } : undefined
    );
    
    return formattedError;
  }, [errorFormatter, toast]);

  /**
   * Handle network-specific errors
   */
  const handleNetworkError = useCallback((error: any, context?: ErrorContext): FormattedError => {
    const formattedError = errorFormatter.formatError(error, context);
    
    // Use network status toast for network errors
    if (formattedError.code === 'NETWORK_UNAVAILABLE' || formattedError.code === 'RPC_ERROR') {
      toast.networkStatus('disconnected');
    } else if (formattedError.code === 'TIMEOUT_ERROR') {
      toast.networkStatus('slow');
    }
    
    // Also show the detailed error
    showFormattedError(formattedError);
    return formattedError;
  }, [errorFormatter, toast]);

  /**
   * Show a formatted error using the appropriate toast variant
   */
  const showFormattedError = useCallback((formattedError: FormattedError): void => {
    const { title, message, severity, action, suggestion } = formattedError;
    
    // Combine message and suggestion
    const fullMessage = suggestion ? `${message}\n\n💡 ${suggestion}` : message;
    
    // Choose toast variant based on severity
    const toastAction = action ? {
      label: action.label,
      onClick: action.handler
    } : undefined;

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        toast.error(title, fullMessage, toastAction);
        break;
      case ErrorSeverity.HIGH:
        toast.error(title, fullMessage, toastAction);
        break;
      case ErrorSeverity.MEDIUM:
        toast.warning(title, fullMessage, toastAction);
        break;
      case ErrorSeverity.LOW:
        toast.warning(title, fullMessage, toastAction);
        break;
      default:
        toast.error(title, fullMessage, toastAction);
    }
  }, [toast]);

  return {
    handleError,
    handleWalletError,
    handleContractError,
    handleTransactionError,
    handleNetworkError,
    showFormattedError
  };
}

/**
 * Error boundary hook for React error boundaries
 */
export function useErrorBoundary() {
  const { handleError } = useErrorHandler();

  const logError = useCallback((error: Error, errorInfo: any) => {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Format and handle the error
    handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
  }, [handleError]);

  return { logError };
}

/**
 * Async error handler for promises and async operations
 */
export function useAsyncErrorHandler() {
  const { handleError } = useErrorHandler();

  const handleAsyncError = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T | null> => {
    try {
      return await asyncOperation();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  const wrapAsyncFunction = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context?: ErrorContext
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, context);
        return null;
      }
    };
  }, [handleError]);

  return {
    handleAsyncError,
    wrapAsyncFunction
  };
}
