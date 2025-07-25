import { Address, parseEther } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useAccount } from 'wagmi';
import { SACCO_CONTRACT, Member, BoardMember, CommitteeBid, Proposal, Loan, SaccoContractFunctions, MemberRegisteredEvent, SavingsDepositedEvent, LoanIssuedEvent, LoanRepaidEvent, DividendPaidEvent, BoardMemberAddedEvent, BoardMemberRemovedEvent, CommitteeBidSubmittedEvent, CommitteeBidVotedEvent, CommitteeBidAcceptedEvent } from '../contracts/sacco-contract';
import { citreaTestnet } from '../wagmi';

export function useSacco() {
  // Read functions as custom hooks
  function useRegisteredMembers(memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'registeredMembers',
      args: [memberAddress],
    });
  }

  function useSavings(memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'savings',
      args: [memberAddress],
    });
  }

  function useProposal(proposalId: bigint) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'proposals',
      args: [proposalId],
    });
  }

  function useVotingPower(memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'votingPower',
      args: [memberAddress],
    });
  }

  function useHasVoted(proposalId: bigint, memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'hasVoted',
      args: [proposalId, memberAddress],
    });
  }

  function useTotalProposals() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'totalProposals',
    });
  }

  function useVotingDuration() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'votingDuration',
    });
  }

  function useNextLoanId() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'nextLoanId',
    });
  }

  function useLoanInterestRate() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'loanInterestRate',
    });
  }

  function useOwner() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'owner',
    });
  }

  function useLoan(loanId: bigint) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'loans',
      args: [loanId],
    });
  }

  function useMemberLoans(memberAddress: Address, index: bigint) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'memberLoans',
      args: [memberAddress, index],
    });
  }

  function useGetMemberInfo(memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'getMemberInfo',
      args: [memberAddress],
    });
  }

  function useMinimumShares() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'MINIMUM_SHARES',
    });
  }

  function useSharePrice() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'SHARE_PRICE',
    });
  }

  function useMembers(memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'members',
      args: [memberAddress],
    }) as { data: Member | undefined; isLoading: boolean; error: Error | null };
  }

  // Board-related read functions
  function useGetBoardMembers() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'getBoardMembers',
    }) as { data: BoardMember[] | undefined; isLoading: boolean; error: Error | null };
  }

  function useGetCommitteeBids() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'getCommitteeBids',
    }) as { data: CommitteeBid[] | undefined; isLoading: boolean; error: Error | null };
  }

  function useIsBoardMember(memberAddress: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'isBoardMember',
      args: [memberAddress],
    });
  }

  function useGetActiveBoardMembersCount() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'getActiveBoardMembersCount',
    });
  }

  function useGetActiveBidsCount() {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'getActiveBidsCount',
    });
  }

  function useGetBidVotes(bidId: bigint) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'getBidVotes',
      args: [bidId],
    });
  }

  function useHasVotedOnBid(bidId: bigint, voter: Address) {
    return useReadContract({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'hasVotedOnBidCheck',
      args: [bidId, voter],
    });
  }

  // Note: For now, we'll use a simpler approach and get members from board members
  // In a full implementation, you'd want to add a getMemberAddresses() function to the contract
  function useGetMemberAddresses() {
    const { data: boardMembers } = useGetBoardMembers();
    
    // For now, return board members as potential recipients
    // In production, you'd want all SACCO members
    const members = Array.isArray(boardMembers) ? boardMembers : [];
    return {
      memberAddresses: members.map((member: BoardMember) => member.memberAddress as Address).filter(Boolean),
      isLoading: false,
      error: null,
    };
  }

  return {
    // Read functions
    useRegisteredMembers,
    useSavings,
    useProposal,
    useVotingPower,
    useHasVoted,
    useTotalProposals,
    useVotingDuration,
    useNextLoanId,
    useLoanInterestRate,
    useOwner,
    useLoan,
    useMemberLoans,
    useGetMemberInfo,
    useMinimumShares,
    useSharePrice,
    useMembers,
    // Board-related read functions
    useGetBoardMembers,
    useGetCommitteeBids,
    useIsBoardMember,
    useGetActiveBoardMembersCount,
    useGetActiveBidsCount,
    useGetBidVotes,
    useHasVotedOnBid,
    useGetMemberAddresses,
  };
}

// Write functions - following the pattern from useJengaContract
export const usePurchaseShares = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const purchaseShares = (shares: number, value: string) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'purchaseShares',
      args: [shares],
      value: parseEther(value),
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    purchaseShares,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export const useProposeMembership = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const proposeMembership = (candidateAddress: string) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'proposeMembership',
      args: [candidateAddress],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    proposeMembership,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

// Legacy function for backward compatibility
export const useRegisterMember = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const registerMember = (memberAddress: string) => {
    // For new system, this will use purchaseShares with minimum shares
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'purchaseShares',
      args: [10], // MINIMUM_SHARES
      value: parseEther('0.01'), // 10 * 0.001 BTC
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    registerMember,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
};

export function useDepositSavings() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const depositSavings = (amount: bigint) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'depositSavings',
      value: amount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    depositSavings,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useRequestLoan() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const requestLoan = (amount: bigint, duration: bigint, purpose: string = "") => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'requestLoan',
      args: [amount, duration, purpose],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    requestLoan,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Provide guarantee for another member's loan
export function useProvideGuarantee() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const provideGuarantee = (loanId: bigint, guaranteeAmount: string) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'provideGuarantee',
      args: [loanId],
      value: parseEther(guaranteeAmount),
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    provideGuarantee,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Calculate interest for all members
export function useCalculateInterestForAllMembers() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const calculateInterestForAllMembers = () => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'calculateInterestForAllMembers',
      args: [],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    calculateInterestForAllMembers,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useRepayLoan() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const repayLoan = (loanId: bigint, amount: bigint) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'repayLoan',
      args: [loanId],
      value: amount,
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    repayLoan,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function usePenalizeLatePayment() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const penalizeLatePayment = (loanId: bigint) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'penalizeLatePayment',
      args: [loanId],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    penalizeLatePayment,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useDistributeDividends() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const distributeDividends = () => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'distributeDividends',
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    distributeDividends,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useCreateProposal() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const createProposal = (description: string) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'createProposal',
      args: [description],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    createProposal,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useVote() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const vote = (proposalId: bigint, support: boolean) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'vote',
      args: [proposalId, support],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    vote,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useExecuteProposal() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const executeProposal = (proposalId: bigint) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'executeProposal',
      args: [proposalId],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    executeProposal,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Board-related write functions
export function useSubmitCommitteeBid() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const submitCommitteeBid = (proposal: string, bidAmount: string) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'submitCommitteeBid',
      args: [proposal],
      value: parseEther(bidAmount),
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    submitCommitteeBid,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useVoteOnCommitteeBid() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const voteOnCommitteeBid = (bidId: bigint, votes: bigint) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'voteOnCommitteeBid',
      args: [bidId, votes],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    voteOnCommitteeBid,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

export function useRemoveBoardMember() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const removeBoardMember = (memberAddress: Address) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'removeBoardMember',
      args: [memberAddress],
      chain: citreaTestnet,
      account: address,
    });
  };

  return {
    removeBoardMember,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}

// Event hooks - simplified approach for wagmi v2 compatibility
export function useSaccoMemberRegisteredEvent(onEvent: (event: MemberRegisteredEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'MemberRegistered',
    onLogs(logs) {
      logs.forEach(() => {
        // For now, we'll trigger the event without specific args
        // In a real implementation, you'd decode the log data
        console.log('MemberRegistered event detected');
        // onEvent({ member: '0x...' } as MemberRegisteredEvent);
      });
    },
  });
}

export function useSaccoSavingsDepositedEvent(onEvent: (event: SavingsDepositedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'SavingsDeposited',
    onLogs(logs) {
      logs.forEach(() => {
        console.log('SavingsDeposited event detected');
        // onEvent({ member: '0x...', amount: 0n } as SavingsDepositedEvent);
      });
    },
  });
}

export function useSaccoLoanIssuedEvent(onEvent: (event: LoanIssuedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'LoanIssued',
    onLogs(logs) {
      logs.forEach(() => {
        console.log('LoanIssued event detected');
        // onEvent({ loanId: 0n, borrower: '0x...', amount: 0n } as LoanIssuedEvent);
      });
    },
  });
}

export function useSaccoLoanRepaidEvent(onEvent: (event: LoanRepaidEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'LoanRepaid',
    onLogs(logs) {
      logs.forEach(() => {
        console.log('LoanRepaid event detected');
        // onEvent({ loanId: 0n, borrower: '0x...', amount: 0n } as LoanRepaidEvent);
      });
    },
  });
}

export function useSaccoDividendPaidEvent(onEvent: (event: DividendPaidEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'DividendPaid',
    onLogs: (logs) => {
      console.log('Dividend paid event:', logs);
      // onEvent({ member: '0x...', amount: 0n } as DividendPaidEvent);
    },
  });
}

// Board-related event hooks
export function useBoardMemberAddedEvent(onEvent: (event: BoardMemberAddedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'BoardMemberAdded',
    onLogs: (logs) => {
      console.log('Board member added event:', logs);
      // onEvent({ member: '0x...', votes: 0n } as BoardMemberAddedEvent);
    },
  });
}

export function useBoardMemberRemovedEvent(onEvent: (event: BoardMemberRemovedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'BoardMemberRemoved',
    onLogs: (logs) => {
      console.log('Board member removed event:', logs);
      // onEvent({ member: '0x...' } as BoardMemberRemovedEvent);
    },
  });
}

export function useCommitteeBidSubmittedEvent(onEvent: (event: CommitteeBidSubmittedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'CommitteeBidSubmitted',
    onLogs: (logs) => {
      console.log('Committee bid submitted event:', logs);
      // onEvent({ bidder: '0x...', bidId: 0n, amount: 0n } as CommitteeBidSubmittedEvent);
    },
  });
}

export function useCommitteeBidVotedEvent(onEvent: (event: CommitteeBidVotedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'CommitteeBidVoted',
    onLogs: (logs) => {
      console.log('Committee bid voted event:', logs);
      // onEvent({ voter: '0x...', bidId: 0n, votes: 0n } as CommitteeBidVotedEvent);
    },
  });
}

export function useCommitteeBidAcceptedEvent(onEvent: (event: CommitteeBidAcceptedEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'CommitteeBidAccepted',
    onLogs: (logs) => {
      console.log('Committee bid accepted event:', logs);
      // onEvent({ bidder: '0x...', bidId: 0n } as CommitteeBidAcceptedEvent);
    },
  });
}
