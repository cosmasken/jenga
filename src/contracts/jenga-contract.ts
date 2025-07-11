import { Address } from 'viem';
import { TESTNET_CONFIG } from '../config';
import JengaABI from '../abi/Jenga.json';

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
  
  // Write functions
  createChama: readonly [string, bigint, bigint, bigint]; // name, contributionAmount, cycleDuration, maxMembers
  joinChama: readonly [bigint]; // chamaId
  stackBTC: readonly [bigint]; // chamaId (payable)
};

// Event types based on actual contract
export type ChamaCreatedEvent = {
  chamaId: bigint;
  name: string;
  creator: Address;
};

export type ChamaJoinedEvent = {
  chamaId: bigint;
  member: Address;
};

export type ContributionMadeEvent = {
  chamaId: bigint;
  user: Address;
  amount: bigint;
};

// Chama struct type based on contract
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
};
