import { Address } from 'viem';
import { TESTNET_CONFIG } from '../config';
import JengaABI from '../abi/Jenga.json';

export const JENGA_CONTRACT = {
  address: TESTNET_CONFIG.smartContracts.jenga as Address,
  abi: JengaABI,
} as const;

// Type-safe contract functions
export type JengaContractFunctions = {
  // Read functions
  getChamaInfo: readonly [bigint];
  getUserChamas: readonly [Address];
  getChamaMembers: readonly [bigint];
  getUserScore: readonly [Address];
  
  // Write functions
  createChama: readonly [string, bigint, bigint, bigint];
  joinChama: readonly [bigint];
  contribute: readonly [bigint];
  requestPayout: readonly [bigint];
  closeChamaEarly: readonly [bigint];
};

// Event types
export type ChamaCreatedEvent = {
  chamaId: bigint;
  creator: Address;
  name: string;
  contributionAmount: bigint;
  cycleDuration: bigint;
  maxMembers: bigint;
};

export type ChamaMemberJoinedEvent = {
  chamaId: bigint;
  member: Address;
  memberCount: bigint;
};

export type ContributionMadeEvent = {
  chamaId: bigint;
  member: Address;
  amount: bigint;
  cycle: bigint;
};

export type PayoutRequestedEvent = {
  chamaId: bigint;
  member: Address;
  amount: bigint;
  cycle: bigint;
};
