import { Address } from 'viem';
import { TESTNET_CONFIG } from '../config';
import { JengaABI } from '../abi/JengaABI';

export const JENGA_CONTRACT = {
  address: TESTNET_CONFIG.smartContracts.jenga as Address,
  abi: JengaABI,
} as const;

// Type-safe contract functions based on actual Jenga.sol
export type JengaContractFunctions = {
  // Read functions
  chamas: readonly [bigint]; // Returns chama details by ID
  scores: readonly [Address]; // Returns user score
  chamaCount: readonly []; // Returns total number of chamas
  contributions: readonly [bigint, Address]; // Returns user contributions for a chama
  hasContributedThisCycle: readonly [bigint, Address]; // Check if contributed this cycle
  lastContributionTimestamp: readonly [bigint, Address]; // Last contribution time
  getChamaMembers: readonly [bigint]; // Get chama member list
  getMemberCollateral: readonly [bigint, Address]; // Get member collateral
  isCollateralReturned: readonly [bigint, Address]; // Check collateral status
  getTotalCollateral: readonly [bigint]; // Get total collateral
  getMemberPayoutPosition: readonly [bigint, Address]; // Get payout position
  hasMemberReceivedPayout: readonly [bigint, Address]; // Check payout status
  getCycleInfo: readonly [bigint, bigint]; // Get cycle information
  
  // Write functions
  createChama: readonly [string, bigint, bigint, bigint]; // name, contributionAmount, cycleDuration, maxMembers
  joinChama: readonly [bigint]; // chamaId
  stackBTC: readonly [bigint]; // chamaId (payable)
  startChama: readonly [bigint]; // chamaId (manual start)
  processMissedContributions: readonly [bigint]; // chamaId (emergency)
  emergencyPayout: readonly [bigint, Address]; // chamaId, recipient (emergency recovery)
};

// Enhanced event types based on actual contract
export type ChamaCreatedEvent = {
  chamaId: bigint;
  name: string;
  creator: Address;
  contributionAmount: bigint;
};

export type ChamaJoinedEvent = {
  chamaId: bigint;
  member: Address;
};

export type ChamaStartedEvent = {
  chamaId: bigint;
  starter: Address;
  timestamp: bigint;
};

export type ContributionMadeEvent = {
  chamaId: bigint;
  user: Address;
  amount: bigint;
};

export type PayoutProcessedEvent = {
  chamaId: bigint;
  recipient: Address;
  amount: bigint;
  cycleNumber: bigint;
};

export type ChamaCycleCompletedEvent = {
  chamaId: bigint;
  cycleNumber: bigint;
};

export type ChamaCompletedEvent = {
  chamaId: bigint;
};

export type CollateralDepositedEvent = {
  chamaId: bigint;
  member: Address;
  amount: bigint;
};

export type CollateralReturnedEvent = {
  chamaId: bigint;
  member: Address;
  amount: bigint;
};

export type CollateralForfeitedEvent = {
  chamaId: bigint;
  member: Address;
  amount: bigint;
};

export type EmergencyPayoutEvent = {
  chamaId: bigint;
  recipient: Address;
  amount: bigint;
  cycleNumber: bigint;
};

// Enhanced Chama struct type based on contract
export type ChamaInfo = {
  name: string;
  contributionAmount: bigint;
  cycleDuration: bigint;
  maxMembers: bigint;
  members: Address[];
  active: boolean;
  currentCycle: bigint;
  currentRecipientIndex: bigint;
  lastCycleTimestamp: bigint;
  totalPool: bigint;
  totalCollateral: bigint;
};

// Cycle information type
export type CycleInfo = {
  cycleContributions: bigint;
  recipient: Address;
  completed: boolean;
};

// User status in chama
export type ChamaUserStatus = 
  | 'not_member'
  | 'waiting_to_start'
  | 'needs_to_contribute'
  | 'contributed_this_cycle'
  | 'current_recipient'
  | 'received_payout'
  | 'completed';
