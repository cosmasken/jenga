import { Address } from 'viem';

// Contract function types
export type ChamaCoreContractFunctions = {
  createChama: readonly [string, bigint, bigint, bigint];
  joinChama: readonly [bigint];
  startChama: readonly [bigint];
  stackBTC: readonly [bigint];
  processMissedContributions: readonly [bigint];
  getChamaDetails: readonly [bigint];
  getChamaMembers: readonly [bigint];
  getMemberContributions: readonly [bigint, Address];
  getCycleInfo: readonly [bigint, bigint];
  getMemberCollateral: readonly [bigint, Address];
  isCollateralReturned: readonly [bigint, Address];
  getTotalCollateral: readonly [bigint];
  getMemberPayoutPosition: readonly [bigint, Address];
  hasMemberReceivedPayout: readonly [bigint, Address];
  hasContributedThisCycle: readonly [bigint, Address];
  lastContributionTimestamp: readonly [bigint, Address];
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

export type ChamaJoinedEvent = {
  chamaId: bigint;
  member: Address;
  collateralAmount: bigint;
};

export type ChamaStartedEvent = {
  chamaId: bigint;
  startTime: bigint;
};

export type ContributionMadeEvent = {
  chamaId: bigint;
  member: Address;
  amount: bigint;
  cycle: bigint;
};

export type PayoutDistributedEvent = {
  chamaId: bigint;
  recipient: Address;
  amount: bigint;
  cycle: bigint;
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
  reason: string;
};

export type ChamaCompletedEvent = {
  chamaId: bigint;
  totalDistributed: bigint;
  completionTime: bigint;
};
