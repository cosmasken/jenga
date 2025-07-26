import { Address } from 'viem';

// Contract function types
export type JengaFactoryContractFunctions = {
  createChama: readonly [string, bigint, bigint, bigint];
  joinChama: readonly [bigint];
  stackBTC: readonly [bigint];
  startChama: readonly [bigint];
  processMissedContributions: readonly [bigint];
  createProfile: readonly [string, `0x${string}`];
  updateProfile: readonly [string];
  generateInvite: readonly [string, `0x${string}`];
  acceptInvite: readonly [`0x${string}`];
  sendP2P: readonly [Address];
  sendRedEnvelope: readonly [Address[], bigint, boolean, string];
  claimRedEnvelope: readonly [bigint];
  expireRedEnvelope: readonly [bigint];
  getUserCompleteProfile: readonly [Address];
  getModuleAddresses: readonly [];
  pauseAll: readonly [];
  unpauseAll: readonly [];
  handleChamaCompletion: readonly [bigint];
};

// Event types
export type ModuleUpdatedEvent = {
  moduleName: string;
  oldAddress: Address;
  newAddress: Address;
};

export type CrossModuleInteractionEvent = {
  user: Address;
  action: string;
  points: bigint;
};

// Re-export types from module contracts
export type {
  ChamaCreatedEvent,
  ChamaJoinedEvent,
  ChamaStartedEvent,
  ContributionMadeEvent,
  PayoutDistributedEvent,
  CollateralReturnedEvent,
  CollateralForfeitedEvent,
  ChamaCompletedEvent,
} from './chama-core-contract';

export type {
  AchievementUnlockedEvent,
  InviteGeneratedEvent,
  InviteAcceptedEvent,
  ProfileCreatedEvent,
  ProfileUpdatedEvent,
  ScoreUpdatedEvent,
} from './chama-gamification-contract';

export type {
  P2PSentEvent,
  RedEnvelopeSentEvent,
  RedEnvelopeClaimedEvent,
  RedEnvelopeExpiredEvent,
} from './p2p-transfer-contract';
