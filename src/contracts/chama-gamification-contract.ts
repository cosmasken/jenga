import { Address } from 'viem';

// Contract function types
export type ChamaGamificationContractFunctions = {
  createProfile: readonly [string, `0x${string}`];
  updateProfile: readonly [string];
  generateInvite: readonly [string, `0x${string}`];
  acceptInvite: readonly [`0x${string}`];
  addScore: readonly [Address, bigint, string];
  subtractScore: readonly [Address, bigint, string];
  unlockAchievement: readonly [Address, string];
  getUserScore: readonly [Address];
  getUserAchievements: readonly [Address];
  getUserProfile: readonly [Address];
  getUserInviteHash: readonly [Address];
  getReferralCount: readonly [Address];
  getUserReferrals: readonly [Address];
  getAchievementPoints: readonly [string];
  isValidAchievement: readonly [string];
  findAddressByInviteHash: readonly [`0x${string}`];
};

// Event types
export type AchievementUnlockedEvent = {
  user: Address;
  achievement: string;
  points: bigint;
};

export type InviteGeneratedEvent = {
  user: Address;
  inviteHash: `0x${string}`;
};

export type InviteAcceptedEvent = {
  referrer: Address;
  newUser: Address;
};

export type ProfileCreatedEvent = {
  user: Address;
  username: string;
};

export type ProfileUpdatedEvent = {
  user: Address;
  username: string;
};

export type ScoreUpdatedEvent = {
  user: Address;
  newScore: bigint;
  reason: string;
};
