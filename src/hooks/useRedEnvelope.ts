import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { useAccount } from 'wagmi';
import { Address, parseEther } from 'viem';
import { JENGA_CONTRACT } from '../contracts/jenga-contract';
import { citreaTestnet } from '../wagmi';

export interface RedEnvelopeData {
  recipients: Address[];
  totalAmount: bigint;
  isRandom: boolean;
  message: string;
}

export function useSendRedEnvelope() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const sendRedEnvelope = (data: RedEnvelopeData) => {
    try {
      writeContract({
        ...JENGA_CONTRACT,
        functionName: 'sendRedEnvelope',
        args: [data.recipients, data.totalAmount, data.isRandom, data.message],
        value: data.totalAmount,
        chain: citreaTestnet,
        account: address,
      });
    } catch (error) {
      console.error('Error in sendRedEnvelope:', error);
      throw error;
    }
  };

  return {
    sendRedEnvelope,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useClaimRedEnvelope() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const claimRedEnvelope = (envelopeId: bigint) => {
    try {
      writeContract({
        ...JENGA_CONTRACT,
        functionName: 'claimRedEnvelope',
        args: [envelopeId],
        chain: citreaTestnet,
        account: address,
      });
    } catch (error) {
      console.error('Error in claimRedEnvelope:', error);
      throw error;
    }
  };

  return {
    claimRedEnvelope,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useGetRedEnvelopeDetails(envelopeId: bigint) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getRedEnvelopeDetails',
    args: [envelopeId],
    query: {
      enabled: envelopeId > 0n,
    },
  });
}

export function useGetUserClaimableEnvelopes(userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getUserClaimableEnvelopes',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useGetUserSentEnvelopes(userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getUserSentEnvelopes',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });
}

export function useGetUserReceivedEnvelopes(userAddress: Address) {
  return useReadContract({
    ...JENGA_CONTRACT,
    functionName: 'getUserReceivedEnvelopes',
    args: [userAddress],
    query: {
      enabled: !!userAddress,
    },
  });
}

// Helper function to convert sats to wei for red envelopes
export function satsToWei(sats: number): bigint {
  return BigInt(sats) * 10n ** 10n;
}

// Helper function to convert wei to sats for display
export function weiToSats(wei: bigint): number {
  return Number(wei / 10n ** 10n);
}

// Helper function to format red envelope amount for display
export function formatRedEnvelopeAmount(amount: bigint): string {
  const sats = weiToSats(amount);
  if (sats >= 100000000) {
    return `${(sats / 100000000).toFixed(4)} BTC`;
  } else if (sats >= 1000) {
    return `${(sats / 1000).toFixed(1)}k sats`;
  } else {
    return `${sats} sats`;
  }
}
