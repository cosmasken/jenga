import { type Address } from 'viem';

/**
 * Enhanced member status tracking
 */
export type MembershipStatus = 
  | 'pending_deposit'      // Joined but hasn't paid security deposit
  | 'deposit_paid'         // Paid deposit, waiting for ROSCA to start
  | 'active'              // ROSCA active, can contribute
  | 'contributed'         // Contributed this round
  | 'late'                // Missed contribution deadline
  | 'defaulted'           // Multiple missed contributions
  | 'winner'              // Won a round, received payout
  | 'completed'           // Successfully completed all rounds
  | 'inactive';           // Left or was removed

export type DepositStatus = 
  | 'not_required'        // No deposit required yet
  | 'required'            // Deposit required but not paid
  | 'paid'               // Deposit successfully paid
  | 'refunded'           // Deposit refunded (left early)
  | 'forfeited';         // Deposit forfeited (defaulted)

export type ContributionStatus = 
  | 'not_due'            // Contribution not due yet
  | 'due'                // Contribution due this round
  | 'paid'               // Contribution paid on time
  | 'late'               // Contribution paid late
  | 'missed'             // Contribution missed entirely
  | 'excused';           // Contribution excused (winner of round)

/**
 * Individual member information with enhanced tracking
 */
export interface EnhancedMemberInfo {
  // Basic info
  address: Address;
  displayName?: string;
  avatar?: string;
  joinTime: number;
  
  // Membership status
  membershipStatus: MembershipStatus;
  isActive: boolean;
  isCreator: boolean;
  
  // Deposit tracking
  depositStatus: DepositStatus;
  depositAmount: bigint;
  depositPaidTime?: number;
  
  // Contribution tracking
  currentRoundStatus: ContributionStatus;
  totalContributions: bigint;
  roundsPaid: number;
  roundsMissed: number;
  lateContributions: number;
  
  // Payout tracking
  hasReceivedPayout: boolean;
  payoutRound?: number;
  payoutAmount?: bigint;
  payoutTime?: number;
  
  // Performance metrics
  contributionRate: number; // Percentage of rounds contributed to
  averageContributionTime?: number; // Average time to contribute (in seconds from round start)
  reliabilityScore: number; // 0-100 score based on payment history
}

/**
 * Member contribution history for a specific round
 */
export interface RoundContribution {
  roundNumber: number;
  status: ContributionStatus;
  amount: bigint;
  contributionTime?: number;
  transactionHash?: string;
  isLate: boolean;
  daysLate?: number;
}

/**
 * Comprehensive member history across all rounds
 */
export interface MemberContributionHistory {
  memberAddress: Address;
  totalRounds: number;
  contributions: RoundContribution[];
  summary: {
    totalContributed: bigint;
    onTimeContributions: number;
    lateContributions: number;
    missedContributions: number;
    averageDaysToContribute: number;
    currentStreak: number; // Current streak of on-time contributions
    longestStreak: number; // Longest streak of on-time contributions
  };
}

/**
 * Member readiness information for ROSCA start
 */
export interface MemberReadiness {
  address: Address;
  hasJoined: boolean;
  hasPaidDeposit: boolean;
  isReady: boolean;
  joinTime?: number;
  depositPaidTime?: number;
  depositAmount?: bigint;
}

/**
 * Complete member list with all tracking information
 */
export interface EnhancedMemberList {
  members: EnhancedMemberInfo[];
  readiness: MemberReadiness[];
  summary: {
    totalMembers: number;
    activeMembers: number;
    membersReady: number;
    averageReliabilityScore: number;
    totalDeposits: bigint;
    totalContributions: bigint;
  };
}

/**
 * Member activity timeline event
 */
export interface MemberActivity {
  type: 'joined' | 'deposit_paid' | 'contributed' | 'won_round' | 'left' | 'defaulted';
  timestamp: number;
  roundNumber?: number;
  amount?: bigint;
  transactionHash?: string;
  description: string;
}

/**
 * Member performance analytics
 */
export interface MemberPerformance {
  address: Address;
  reliabilityScore: number;
  contributionRate: number;
  averageContributionDelay: number; // Average days late
  totalEarnings: bigint; // If won any rounds
  netContribution: bigint; // Total contributed minus earnings
  riskLevel: 'low' | 'medium' | 'high'; // Risk of defaulting
  activities: MemberActivity[];
}

/**
 * UI display preferences for member status
 */
export interface MemberDisplayConfig {
  showDeposits: boolean;
  showContributionHistory: boolean;
  showPerformanceMetrics: boolean;
  showActivity: boolean;
  groupByStatus: boolean;
  sortBy: 'name' | 'joinTime' | 'reliability' | 'contributions';
  sortOrder: 'asc' | 'desc';
}
