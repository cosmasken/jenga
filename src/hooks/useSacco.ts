import { Address } from 'viem';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from 'wagmi';
import { SACCO_CONTRACT, Proposal, Loan, SaccoContractFunctions, MemberRegisteredEvent, SavingsDepositedEvent, LoanIssuedEvent, LoanRepaidEvent, DividendPaidEvent } from '../contracts/sacco-contract';

export function useSacco() {
  const { writeContractAsync } = useWriteContract();

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

  // Write functions
  const registerMember = async (memberAddress: Address) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'registerMember',
      args: [memberAddress],
    });
    return hash;
  };

  const depositSavings = async (amount: bigint) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'depositSavings',
      value: amount,
    });
    return hash;
  };

  const requestLoan = async (amount: bigint, duration: bigint) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'requestLoan',
      args: [amount, duration],
    });
    return hash;
  };

  const repayLoan = async (loanId: bigint, amount: bigint) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'repayLoan',
      args: [loanId],
      value: amount,
    });
    return hash;
  };

  const penalizeLatePayment = async (loanId: bigint) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'penalizeLatePayment',
      args: [loanId],
    });
    return hash;
  };

  const distributeDividends = async () => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'distributeDividends',
    });
    return hash;
  };

  const createProposal = async (description: string) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'createProposal',
      args: [description],
    });
    return hash;
  };

  const vote = async (proposalId: bigint, support: boolean) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'vote',
      args: [proposalId, support],
    });
    return hash;
  };

  const executeProposal = async (proposalId: bigint) => {
    const { hash } = await writeContractAsync({
      abi: SACCO_CONTRACT.abi,
      address: SACCO_CONTRACT.address,
      functionName: 'executeProposal',
      args: [proposalId],
    });
    return hash;
  };

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

    // Write functions
    registerMember,
    depositSavings,
    requestLoan,
    repayLoan,
    penalizeLatePayment,
    distributeDividends,
    createProposal,
    vote,
    executeProposal,
  };
}

// Event hooks
export function useSaccoMemberRegisteredEvent(onEvent: (event: MemberRegisteredEvent) => void) {
  useWatchContractEvent({
    address: SACCO_CONTRACT.address,
    abi: SACCO_CONTRACT.abi,
    eventName: 'MemberRegistered',
    onLogs(logs) {
      logs.forEach(log => {
        if (log.eventName === 'MemberRegistered') {
          onEvent(log.args as MemberRegisteredEvent);
        }
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
      logs.forEach(log => {
        if (log.eventName === 'SavingsDeposited') {
          onEvent(log.args as SavingsDepositedEvent);
        }
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
      logs.forEach(log => {
        if (log.eventName === 'LoanIssued') {
          onEvent(log.args as LoanIssuedEvent);
        }
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
      logs.forEach(log => {
        if (log.eventName === 'LoanRepaid') {
          onEvent(log.args as LoanRepaidEvent);
        }
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
      logs.forEach(log => {
        if (log.eventName === 'DividendPaid') {
          onEvent(log.args as DividendPaidEvent);
        }
      });
    },
  });
}
