import { useState, useCallback } from 'react';
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, isAddress, type Address } from 'viem';
import { createZeroDevClients, shouldSponsorGas } from '@/config/zerodev';
import { useToast } from './use-toast';
import { useGasSponsorshipInfo } from './useZeroDevContracts';

interface UseP2PSendingOptions {
  sponsorGas?: boolean;
}

export const useP2PSending = (options: UseP2PSendingOptions = {}) => {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { userLevel, userStats } = useGasSponsorshipInfo();
  
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Regular Wagmi transaction hook as fallback
  const { sendTransaction, data: regularTxHash, error: regularError, isPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}` || regularTxHash,
  });

  const sendBitcoin = useCallback(async (
    recipient: string,
    amount: string, // in BTC
    note?: string
  ) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    // Validate recipient address
    if (!isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    // Validate amount
    const amountBigInt = parseEther(amount);
    if (amountBigInt <= 0n) {
      throw new Error('Amount must be greater than 0');
    }

    // Check if user has sufficient balance
    if (balance && amountBigInt > balance.value) {
      throw new Error('Insufficient balance');
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      // Check if we should sponsor gas for this P2P transaction
      const sponsorshipCheck = shouldSponsorGas(
        'p2pTransfer', 
        amountBigInt, 
        userLevel,
        userStats
      );

      if (options.sponsorGas && sponsorshipCheck.eligible) {
        // Try ZeroDev for sponsored transaction
        try {
          const { kernelClient, isZeroDevEnabled } = await createZeroDevClients();
          
          if (isZeroDevEnabled && kernelClient) {
            const hash = await kernelClient.sendTransaction({
              to: recipient as Address,
              value: amountBigInt,
              data: note ? `0x${Buffer.from(note, 'utf8').toString('hex')}` : '0x',
            });

            setTxHash(hash);
            
            toast({
              title: "🎉 Bitcoin Sent (Gas Sponsored!)",
              description: `Sent ${amount} BTC to ${recipient.slice(0, 10)}... with sponsored gas!`,
            });
            return;
          }
        } catch (zeroDevError) {
          console.warn('ZeroDev transaction failed, falling back to regular transaction:', zeroDevError);
        }
      }

      // Use regular Wagmi transaction (fallback or non-sponsored)
      sendTransaction({
        to: recipient as Address,
        value: amountBigInt,
        data: note ? `0x${Buffer.from(note, 'utf8').toString('hex')}` : undefined,
      });

      // Wait for the regular transaction to complete
      if (regularTxHash) {
        setTxHash(regularTxHash);
        toast({
          title: "Bitcoin Sent Successfully!",
          description: `Sent ${amount} BTC to ${recipient.slice(0, 10)}...`,
        });
      }

      if (regularError) {
        throw regularError;
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [
    isConnected, 
    address, 
    balance, 
    options.sponsorGas, 
    userLevel, 
    userStats, 
    sendTransaction, 
    regularTxHash,
    regularError, 
    toast
  ]);

  // Utility function to convert sats to BTC
  const sendSats = useCallback(async (
    recipient: string,
    sats: number,
    note?: string
  ) => {
    const btcAmount = (sats / 100000000).toString();
    return sendBitcoin(recipient, btcAmount, note);
  }, [sendBitcoin]);

  // Get transaction fee estimate
  const estimateFee = useCallback(async (
    recipient: string,
    amount: string
  ): Promise<{
    gasEstimate: bigint;
    feeEstimate: bigint;
    canSponsor: boolean;
  }> => {
    if (!isAddress(recipient)) {
      throw new Error('Invalid recipient address');
    }

    const amountBigInt = parseEther(amount);
    
    // Check sponsorship eligibility
    const sponsorshipCheck = shouldSponsorGas(
      'p2pTransfer',
      amountBigInt,
      userLevel,
      userStats
    );

    // Mock gas estimation (in a real app, you'd call estimateGas)
    const gasEstimate = 21000n; // Standard ETH transfer gas
    const gasPrice = 20000000000n; // 20 gwei
    const feeEstimate = gasEstimate * gasPrice;

    return {
      gasEstimate,
      feeEstimate: sponsorshipCheck.eligible ? 0n : feeEstimate,
      canSponsor: sponsorshipCheck.eligible
    };
  }, [userLevel, userStats]);

  return {
    sendBitcoin,
    sendSats,
    estimateFee,
    isLoading: isLoading || isPending || isConfirming,
    txHash: txHash || regularTxHash,
    error: error || regularError,
    isSuccess: isSuccess || !!regularTxHash,
    balance,
    isConnected
  };
};

// Hook for P2P transaction history
export const useP2PHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: 'sent' | 'received';
    recipient: string;
    amount: bigint;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
    txHash: string;
    note?: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!address) return;

    setIsLoading(true);
    try {
      // In a real app, you'd fetch from your backend or index blockchain data
      // For now, we'll use localStorage as a mock
      const storedHistory = localStorage.getItem(`p2p-history-${address}`);
      if (storedHistory) {
        const history = JSON.parse(storedHistory);
        setTransactions(history.map((tx: any) => ({
          ...tx,
          amount: BigInt(tx.amount),
          timestamp: new Date(tx.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading P2P history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const addTransaction = useCallback((tx: {
    type: 'sent' | 'received';
    recipient: string;
    amount: bigint;
    txHash: string;
    note?: string;
  }) => {
    if (!address) return;

    const newTx = {
      id: `${tx.txHash}-${Date.now()}`,
      ...tx,
      timestamp: new Date(),
      status: 'pending' as const
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);

    // Store in localStorage
    localStorage.setItem(`p2p-history-${address}`, JSON.stringify(
      updatedTransactions.map(t => ({
        ...t,
        amount: t.amount.toString(),
        timestamp: t.timestamp.toISOString()
      }))
    ));
  }, [address, transactions]);

  return {
    transactions,
    isLoading,
    loadHistory,
    addTransaction
  };
};
