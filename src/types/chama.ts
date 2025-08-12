import { type Address } from 'viem';

export type ChamaState = 
  | 'PRE_LAUNCH'
  | 'ROUND_OPEN'
  | 'ROUND_COMPLETE'
  | 'ALL_ROUNDS_FINISHED'
  | 'DISPUTE_ACTIVE'
  | 'MEMBER_EMPTY_STATES'
  | 'CREATOR_EMPTY_STATES'
  | 'ERROR_STATES';

export type MemberStatus = 'contributed' | 'pending' | 'late' | 'winner';

export interface ChamaMember {
  address: Address;
  name: string;
  avatar?: string;
  status: MemberStatus;
  roundReceived?: number;
  contributedCurrentRound: boolean;
}

export interface ChamaRound {
  roundNumber: number;
  winner: Address | null;
  deadline: Date;
  isComplete: boolean;
  contributions: Record<Address, boolean>;
  totalContributions: number;
}

export interface ChamaData {
  // Basic info
  address: Address;
  creator: Address;
  token: 'cBTC' | 'USDC';
  contributionAmount: string;
  securityDeposit: string;
  
  // Round info
  currentRound: number;
  totalRounds: number;
  rounds: ChamaRound[];
  
  // Member info
  members: ChamaMember[];
  memberTarget: number;
  currentMemberCount: number;
  
  // State info
  state: ChamaState;
  isActive: boolean;
  hasDispute: boolean;
  disputeDetails?: {
    accuser: Address;
    accused: Address;
    reason: string;
    isResolved: boolean;
  };
  
  // Timing
  roundDuration: number; // in seconds
  lateWindow: number; // in seconds
  latePenalty: string; // percentage as string
  
  // User-specific
  userAddress: Address | null;
  userHasJoined: boolean;
  userIsCreator: boolean;
  userContributedCurrentRound: boolean;
  userBalance: string;
}

export interface UIStateConfig {
  title: string;
  description: string;
  primaryCTA: {
    text: string;
    color: string;
    disabled: boolean;
    action: () => void;
  };
  secondaryCTA?: {
    text: string;
    color: string;
    disabled: boolean;
    action: () => void;
  };
  banner?: {
    type: 'success' | 'warning' | 'error' | 'info';
    message: string;
  };
  showCountdown: boolean;
  showMemberList: boolean;
  showProgressBar: boolean;
}
