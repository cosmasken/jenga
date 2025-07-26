import { useWriteContract, useReadContract, useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback } from 'react';
import { citreaTestnet } from '../config';
import P2P_TRANSFER_ABI from '../abi/P2PTransfer.json';
import { Abi } from 'viem';

// Contract configuration
const P2P_TRANSFER_CONTRACT = {
  address: process.env.REACT_APP_P2P_TRANSFER_CONTRACT_ADDRESS as `0x${string}`,
  abi: P2P_TRANSFER_ABI.abi as Abi,
} as const;

// Types
export interface Transaction {
  sender: string;
  receiver: string;
  amount: bigint;
  timestamp: bigint;
  transactionType: string;
}

export interface TransactionData {
  transactionType?: string;
  sender?: string;
  receiver?: string;
  amount?: bigint;
}

export interface RedEnvelopeDetails {
  sender: string;
  recipients: string[];
  totalAmount: bigint;
  amounts: bigint[];
  isRandom: boolean;
  claimedCount: bigint;
  createdAt: bigint;
  message: string;
  isActive: boolean;
}

// Write hooks
export const useSendP2P = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const sendP2P = (receiver: string, amount: bigint) => {
    writeContract({
      ...P2P_TRANSFER_CONTRACT,
      functionName: 'sendP2P',
      args: [receiver as `0x${string}`],
      value: amount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    sendP2P,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useSendRedEnvelope = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const sendRedEnvelope = (
    recipients: string[],
    totalAmount: bigint,
    isRandom: boolean,
    message: string
  ) => {
    writeContract({
      ...P2P_TRANSFER_CONTRACT,
      functionName: 'sendRedEnvelope',
      args: [
        recipients as `0x${string}`[],
        totalAmount,
        isRandom,
        message,
      ],
      value: totalAmount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    sendRedEnvelope,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useClaimRedEnvelope = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const claimRedEnvelope = (envelopeId: bigint) => {
    writeContract({
      ...P2P_TRANSFER_CONTRACT,
      functionName: 'claimRedEnvelope',
      args: [envelopeId],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    claimRedEnvelope,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useExpireRedEnvelope = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const expireRedEnvelope = (envelopeId: bigint) => {
    writeContract({
      ...P2P_TRANSFER_CONTRACT,
      functionName: 'expireRedEnvelope',
      args: [envelopeId],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    expireRedEnvelope,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Read hooks
export const useRedEnvelopeCount = () => {
  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'redEnvelopeCount',
  });
};

export const useTotalTransactions = () => {
  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'totalTransactions',
  });
};

export const useGetRedEnvelopeDetails = (envelopeId: bigint) => {
  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'getRedEnvelopeDetails',
    args: [envelopeId],
    query: {
      enabled: envelopeId > BigInt(0),
    },
  });
};

export const useHasClaimedRedEnvelope = (envelopeId: bigint, userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'hasClaimedRedEnvelope',
    args: [envelopeId, targetAddress as `0x${string}`],
    query: {
      enabled: envelopeId > BigInt(0) && !!targetAddress,
    },
  });
};

export const useGetUserTransactionHistory = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'getUserTransactionHistory',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress,
    },
  });
};

export const useGetUserRedEnvelopes = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'getUserRedEnvelopes',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress,
    },
  });
};

export const useGetTransactionDetails = (transactionId: bigint) => {
  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'getTransactionDetails',
    args: [transactionId],
    query: {
      enabled: transactionId > BigInt(0),
    },
  });
};

export const useGetUserP2PCount = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'getUserP2PCount',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress,
    },
  });
};

export const useGetUserRedEnvelopeCount = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  return useReadContract({
    ...P2P_TRANSFER_CONTRACT,
    functionName: 'getUserRedEnvelopeCount',
    args: [targetAddress as `0x${string}`],
    query: {
      enabled: !!targetAddress,
    },
  });
};

// Utility hooks
export const useUserP2PData = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: transactionHistory } = useGetUserTransactionHistory(targetAddress);
  const { data: redEnvelopes } = useGetUserRedEnvelopes(targetAddress);
  const { data: p2pCount } = useGetUserP2PCount(targetAddress);
  const { data: redEnvelopeCount } = useGetUserRedEnvelopeCount(targetAddress);

  return {
    transactionHistory: transactionHistory as bigint[] || [],
    redEnvelopes: redEnvelopes as bigint[] || [],
    p2pCount: p2pCount as bigint || BigInt(0),
    redEnvelopeCount: redEnvelopeCount as bigint || BigInt(0),
  };
};

// ... rest of the code remains the same ...

export const useTransactionDetails = (transactionIds: bigint[]) => {
  // For now, return empty data to avoid hook rule violations
  // TODO: Implement proper batch transaction fetching
  return {
    transactions: [],
    isLoading: false,
    hasError: false,
  };
};

export const useRedEnvelopeDetails = (envelopeIds: bigint[]) => {
  // For now, return empty data to avoid hook rule violations
  // TODO: Implement proper batch red envelope fetching
  return {
    envelopes: [],
    isLoading: false,
    hasError: false,
  };
};

export const useRedEnvelopeClaimStatus = (envelopeId: bigint, userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: envelopeDetails } = useGetRedEnvelopeDetails(envelopeId);
  const { data: hasClaimed } = useHasClaimedRedEnvelope(envelopeId, targetAddress);

  const getEnvelopeDetails = useCallback(() => envelopeDetails, [envelopeDetails]);
  const getHasClaimed = useCallback(() => hasClaimed, [hasClaimed]);

  const details = getEnvelopeDetails() as RedEnvelopeDetails | null;
  
  if (!details || !targetAddress) {
    return {
      canClaim: false,
      hasClaimed: false,
      isRecipient: false,
      isExpired: false,
      amount: BigInt(0),
    };
  }

  const isRecipient = details.recipients.includes(targetAddress);
  const isExpired = !details.isActive || 
                   (Date.now() / 1000) > (Number(details.createdAt) + 7 * 24 * 60 * 60);
  
  let amount = BigInt(0);
  if (isRecipient) {
    const recipientIndex = details.recipients.indexOf(targetAddress);
    amount = details.amounts[recipientIndex] || BigInt(0);
  }

  return {
    canClaim: isRecipient && !hasClaimed && !isExpired,
    hasClaimed: hasClaimed as boolean || false,
    isRecipient,
    isExpired,
    amount,
  };
};

export const useP2PStats = (userAddress?: string) => {
  const { address } = useAccount();
  const targetAddress = userAddress || address;

  const { data: transactionHistory } = useGetUserTransactionHistory(targetAddress);
  const { data: p2pCount } = useGetUserP2PCount(targetAddress);
  const { data: redEnvelopeCount } = useGetUserRedEnvelopeCount(targetAddress);

  const transactionIds = transactionHistory as bigint[] || [];
  const { transactions } = useTransactionDetails(transactionIds);

  // Calculate stats
  const p2pTransactions = transactions.filter(t => {
    const data = t.data as TransactionData;
    return data?.transactionType === 'P2P' && data?.sender === targetAddress;
  });
  
  const receivedTransactions = transactions.filter(t => {
    const data = t.data as TransactionData;
    return data?.receiver === targetAddress;
  });

  const totalSent = p2pTransactions.reduce((sum, t) => {
    const data = t.data as TransactionData;
    return sum + (data?.amount || BigInt(0));
  }, BigInt(0));

  const totalReceived = receivedTransactions.reduce((sum, t) => {
    const data = t.data as TransactionData;
    return sum + (data?.amount || BigInt(0));
  }, BigInt(0));

  return {
    p2pCount: p2pCount as bigint || BigInt(0),
    redEnvelopeCount: redEnvelopeCount as bigint || BigInt(0),
    totalSent,
    totalReceived,
    totalTransactions: transactionIds.length,
    p2pTransactions: p2pTransactions.length,
    receivedTransactions: receivedTransactions.length,
  };
};

export const useActiveRedEnvelopes = () => {
  const { data: totalEnvelopes } = useRedEnvelopeCount();
  const count = totalEnvelopes as bigint || BigInt(0);
  
  // Generate array of envelope IDs to check
  const envelopeIds = Array.from({ length: Number(count) }, (_, i) => BigInt(i + 1));
  
  const { envelopes } = useRedEnvelopeDetails(envelopeIds);
  
  const activeEnvelopes = envelopes.filter(envelope => 
    envelope.data?.isActive && 
    (Date.now() / 1000) <= (Number(envelope.data.createdAt) + 7 * 24 * 60 * 60)
  );

  return {
    activeEnvelopes,
    totalCount: Number(count),
    activeCount: activeEnvelopes.length,
  };
};

// Export all hooks as a grouped object
export const P2PHooks = {
  useSendP2P,
  useSendRedEnvelope,
  useClaimRedEnvelope,
  useExpireRedEnvelope,
  useRedEnvelopeCount,
  useTotalTransactions,
  useGetRedEnvelopeDetails,
  useHasClaimedRedEnvelope,
  useGetUserTransactionHistory,
  useGetUserRedEnvelopes,
  useGetTransactionDetails,
  useGetUserP2PCount,
  useGetUserRedEnvelopeCount,
  useUserP2PData,
  useTransactionDetails,
  useRedEnvelopeDetails,
  useRedEnvelopeClaimStatus,
  useP2PStats,
  useActiveRedEnvelopes,
};
