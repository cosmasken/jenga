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
  memberAddresses: readonly [bigint];
  
  // Board-related read functions
  boardMembers: readonly [bigint];
  committeeBids: readonly [bigint];
  isBoardMember: readonly [Address];
  getBoardMembers: readonly [];
  getCommitteeBids: readonly [];
  getActiveBoardMembersCount: readonly [];
  getActiveBidsCount: readonly [];
  getBidVotes: readonly [bigint];
  hasVotedOnBidCheck: readonly [bigint, Address];

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
  
  // Board-related write functions
  submitCommitteeBid: readonly [string];
  voteOnCommitteeBid: readonly [bigint, bigint];
  removeBoardMember: readonly [Address];
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

// Board-related event types
export type BoardMemberAddedEvent = {
  member: Address;
  votes: bigint;
};

export type BoardMemberRemovedEvent = {
  member: Address;
};

export type CommitteeBidSubmittedEvent = {
  bidder: Address;
  bidId: bigint;
  amount: bigint;
};

export type CommitteeBidVotedEvent = {
  voter: Address;
  bidId: bigint;
  votes: bigint;
};

export type CommitteeBidAcceptedEvent = {
  bidder: Address;
  bidId: bigint;
};

// Struct types based on contract
export type Member = {
  shares: bigint;
  savings: bigint;
  lastInterestUpdate: bigint;
  joinDate: bigint;
  isActive: boolean;
  totalLoansReceived: bigint;
  guaranteeCapacity: bigint;
};

export type Proposal = {
  description: string;
  deadline: bigint;
  yesVotes: bigint;
  noVotes: bigint;
  executed: boolean;
  proposer: Address;
};

export type BoardMember = {
  memberAddress: Address;
  appointedDate: bigint;
  votes: bigint;
  isActive: boolean;
};

export type CommitteeBid = {
  bidder: Address;
  proposal: string;
  bidAmount: bigint;
  submissionDate: bigint;
  votes: bigint;
  isActive: boolean;
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
