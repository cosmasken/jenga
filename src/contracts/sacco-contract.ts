import { Address } from 'viem';
import { TESTNET_CONFIG } from '../config';
import SACCOABI from '../abi/Sacco.json';

export const SACCO_CONTRACT = {
  address: TESTNET_CONFIG.smartContracts.sacco as Address,
  abi: SACCOABI,
} as const;

// Type-safe contract functions based on SACCO.sol
export type SaccoContractFunctions = {
  // Read functions
  registeredMembers: readonly [Address];
  savings: readonly [Address];
  proposals: readonly [bigint];
  votingPower: readonly [Address];
  hasVoted: readonly [bigint, Address];
  totalProposals: readonly [];
  votingDuration: readonly [];
  nextLoanId: readonly [];
  loanInterestRate: readonly [];
  owner: readonly [];
  loans: readonly [bigint];
  memberLoans: readonly [Address, bigint];

  // Write functions
  registerMember: readonly [Address];
  depositSavings: readonly [];
  requestLoan: readonly [bigint, bigint];
  repayLoan: readonly [bigint];
  penalizeLatePayment: readonly [bigint];
  distributeDividends: readonly [];
  createProposal: readonly [string];
  vote: readonly [bigint, boolean];
  executeProposal: readonly [bigint];
};

// Event types based on SACCO.sol
export type MemberRegisteredEvent = {
  member: Address;
};

export type SavingsDepositedEvent = {
  member: Address;
  amount: bigint;
};

export type LoanIssuedEvent = {
  borrower: Address;
  amount: bigint;
  loanId: bigint;
};

export type LoanRepaidEvent = {
  borrower: Address;
  loanId: bigint;
  amount: bigint;
};

export type DividendPaidEvent = {
  member: Address;
  amount: bigint;
};

// Struct types based on contract
export type Proposal = {
  description: string;
  deadline: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  executed: boolean;
  proposer: Address;
};

export type Loan = {
  amount: bigint;
  repaymentAmount: bigint; // amount + interest
  duration: bigint; // in seconds
  startTime: bigint;
  nextRepaymentTime: bigint;
  repaidAmount: bigint;
  repaid: boolean;
  borrower: Address;
};
