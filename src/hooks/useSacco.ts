import { Address } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, useAccount } from 'wagmi';
import { SACCO_CONTRACT, Proposal, Loan, SaccoContractFunctions, MemberRegisteredEvent, SavingsDepositedEvent, LoanIssuedEvent, LoanRepaidEvent, DividendPaidEvent } from '../contracts/sacco-contract';
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
  };
}

// Write functions - following the pattern from useJengaContract
export function useRegisterMember() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { address } = useAccount();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const registerMember = (memberAddress: Address) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'registerMember',
      args: [memberAddress],
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
}

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

  const requestLoan = (amount: bigint, duration: bigint) => {
    writeContract({
      ...SACCO_CONTRACT,
      functionName: 'requestLoan',
      args: [amount, duration],
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
    onLogs(logs) {
      logs.forEach(() => {
        console.log('DividendPaid event detected');
        // onEvent({ member: '0x...', amount: 0n } as DividendPaidEvent);
      });
    },
  });
}
