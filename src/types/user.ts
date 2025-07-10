
export interface Profile {
  address: string; // wallet address (EOA)
  username: string;
  emailHash: string; // keccak256 hash
  avatarId: number; // 1-10 for avatar selection
  joinedAt: number; // timestamp
  isVerified: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number; // timestamp
  progress?: {
    current: number;
    target: number;
  };
}

export interface Score {
  address: string;
  totalPoints: number;
  contributionPoints: number;
  invitePoints: number;
  redEnvelopePoints: number;
  rank?: number;
}

export interface Invite {
  id: string;
  inviterAddress: string;
  inviteHash: string; // keccak256 hash
  url: string; // full invite URL
  acceptances: number;
  createdAt: number;
  lastUsed?: number;
}

export interface User {
  profile: Profile;
  score: Score;
  achievements: Achievement[];
  invites: Invite[];
}
