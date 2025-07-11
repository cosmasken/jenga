
export interface Chama {
  name: string;
  contributionAmount: number; // in Wei
  cycleDuration: number; // in seconds
  maxMembers: number;
  members: string[]; // wallet addresses
  active: boolean;
  currentCycle: number;
  currentRecipientIndex: number;
  lastCycleTimestamp: number;
}


export interface Contribution {
  id: string;
  chamaId: number;
  user: string; // wallet address
  amount: number; // in Wei
  timestamp: number;
  txHash?: string;
}

export interface Transaction {
  id: string;
  type: 'contribution' | 'p2p' | 'red_envelope';
  sender: string; // wallet address
  receiver?: string; // wallet address (for p2p)
  chamaId?: number; // for contributions
  envelopeId?: string; // for red envelopes
  amount: number; // in Wei
  timestamp: number;
  txHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface ChamaStats {
  totalChamas: number;
  activeChamas: number;
  totalContributions: number;
  nextContributionDue?: number; // timestamp
  totalEarned: number;
}
