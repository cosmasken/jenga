import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

interface UseContractInteractionOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export const useContractInteraction = (options: UseContractInteractionOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();

  const execute = useCallback(async <T>(
    contractFunction: () => Promise<T>,
    customOptions?: Partial<UseContractInteractionOptions>
  ): Promise<T | null> => {
    if (!primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await contractFunction();
      
      // Success handling
      const successTitle = customOptions?.successTitle || options.successTitle || "Transaction Successful";
      const successDescription = customOptions?.successDescription || options.successDescription || "Your transaction has been completed successfully";
      
      toast({
        title: successTitle,
        description: successDescription,
      });

      options.onSuccess?.(result);
      customOptions?.onSuccess?.(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      
      // Error handling
      const errorTitle = customOptions?.errorTitle || options.errorTitle || "Transaction Failed";
      const errorDescription = customOptions?.errorDescription || options.errorDescription || error.message;
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });

      options.onError?.(error);
      customOptions?.onError?.(error);
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, toast, options]);

  return {
    execute,
    isLoading,
    error,
    isConnected: !!primaryWallet
  };
};
