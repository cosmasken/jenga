
import { Chama, Contribution, Transaction } from '../types/chama';
import { Profile, Achievement, Score, Invite } from '../types/user';
import { RedEnvelope, RED_ENVELOPE_THEMES } from '../types/redEnvelope';

// Mock Users
export const MOCK_PROFILES: Profile[] = [
  {
    address: '0x1111111111111111111111111111111111111111',
    username: 'Alice',
    emailHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    avatarId: 1,
    joinedAt: Date.now() - 86400000 * 30, // 30 days ago
    isVerified: true,
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    username: 'Bob',
    emailHash: '0xb2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567',
    avatarId: 2,
    joinedAt: Date.now() - 86400000 * 20, // 20 days ago
    isVerified: true,
  },
  {
    address: '0x3333333333333333333333333333333333333333',
    username: 'Charlie',
    emailHash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    avatarId: 3,
    joinedAt: Date.now() - 86400000 * 40, // 40 days ago
    isVerified: true,
  },
  {
    address: '0x4444444444444444444444444444444444444444',
    username: 'Diana',
    emailHash: '0xd4e5f6789012345678901234567890abcdef1234567890abcdef123456789',
    avatarId: 4,
    joinedAt: Date.now() - 86400000 * 10, // 10 days ago
    isVerified: false,
  },
  {
    address: '0x5555555555555555555555555555555555555555',
    username: 'Eve',
    emailHash: '0xe5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    avatarId: 5,
    joinedAt: Date.now() - 86400000 * 25, // 25 days ago
    isVerified: true,
  },
];

// Mock Chamas
export const MOCK_CHAMAS: Chama[] = [
  {
    id: 1,
    name: 'Satoshi Jenga',
    contributionAmount: 20000000000000000, // 0.02 BTC in Wei
    cycleDuration: 6, // 6 months
    maxMembers: 8,
    members: [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
      '0x5555555555555555555555555555555555555555',
      '0x6666666666666666666666666666666666666666',
    ],
    active: true,
    createdAt: Date.now() - 86400000 * 45, // 45 days ago
    nextPayout: Date.now() + 86400000 * 30, // 30 days from now
    totalContributions: 120000000000000000, // 0.12 BTC
  },
  {
    id: 2,
    name: 'Hodl Jenga',
    contributionAmount: 10000000000000000, // 0.01 BTC in Wei
    cycleDuration: 4, // 4 months
    maxMembers: 6,
    members: [
      '0x1111111111111111111111111111111111111111',
      '0x3333333333333333333333333333333333333333',
      '0x5555555555555555555555555555555555555555',
      '0x7777777777777777777777777777777777777777',
    ],
    active: true,
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    nextPayout: Date.now() + 86400000 * 60, // 60 days from now
    totalContributions: 40000000000000000, // 0.04 BTC
  },
  {
    id: 3,
    name: 'Moon Jenga',
    contributionAmount: 30000000000000000, // 0.03 BTC in Wei
    cycleDuration: 12, // 12 months
    maxMembers: 8,
    members: [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x3333333333333333333333333333333333333333',
      '0x4444444444444444444444444444444444444444',
      '0x5555555555555555555555555555555555555555',
      '0x8888888888888888888888888888888888888888',
      '0x9999999999999999999999999999999999999999',
      '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    ],
    active: false, // Full and closed
    createdAt: Date.now() - 86400000 * 60, // 60 days ago
    totalContributions: 360000000000000000, // 0.36 BTC
  },
];

// Mock Achievements
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_stack',
    name: 'First Stack',
    description: 'Made your first contribution to a Chama',
    icon: '🎯',
  },
  {
    id: 'invited_3_friends',
    name: 'Invited 3 Friends',
    description: 'Successfully invited 3 friends to join Jenga',
    icon: '👥',
  },
  {
    id: '5_contributions',
    name: '5 Contributions',
    description: 'Made 5 contributions across all Chamas',
    icon: '💰',
  },
  {
    id: 'sent_5_red_envelopes',
    name: 'Sent 5 Red Envelopes',
    description: 'Spread joy by sending 5 red envelopes',
    icon: '🧧',
  },
];

// Mock Scores
export const MOCK_SCORES: Score[] = [
  {
    address: '0x1111111111111111111111111111111111111111',
    totalPoints: 150,
    contributionPoints: 50,
    invitePoints: 50,
    redEnvelopePoints: 50,
    rank: 1,
  },
  {
    address: '0x2222222222222222222222222222222222222222',
    totalPoints: 80,
    contributionPoints: 80,
    invitePoints: 0,
    redEnvelopePoints: 0,
    rank: 4,
  },
  {
    address: '0x3333333333333333333333333333333333333333',
    totalPoints: 200,
    contributionPoints: 100,
    invitePoints: 0,
    redEnvelopePoints: 100,
    rank: 1,
  },
  {
    address: '0x4444444444444444444444444444444444444444',
    totalPoints: 50,
    contributionPoints: 50,
    invitePoints: 0,
    redEnvelopePoints: 0,
    rank: 5,
  },
  {
    address: '0x5555555555555555555555555555555555555555',
    totalPoints: 100,
    contributionPoints: 50,
    invitePoints: 50,
    redEnvelopePoints: 0,
    rank: 3,
  },
];

// Mock Contributions
export const MOCK_CONTRIBUTIONS: Contribution[] = [
  {
    id: '1',
    chamaId: 1,
    user: '0x1111111111111111111111111111111111111111',
    amount: 20000000000000000, // 0.02 BTC
    timestamp: Date.now() - 86400000 * 1, // 1 day ago
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
  },
  {
    id: '2',
    chamaId: 1,
    user: '0x2222222222222222222222222222222222222222',
    amount: 20000000000000000, // 0.02 BTC
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    txHash: '0xbcdef1234567890abcdef1234567890abcdef1234567890abcdef12345678901',
  },
  {
    id: '3',
    chamaId: 2,
    user: '0x3333333333333333333333333333333333333333',
    amount: 10000000000000000, // 0.01 BTC
    timestamp: Date.now() - 86400000 * 3, // 3 days ago
    txHash: '0xcdef1234567890abcdef1234567890abcdef1234567890abcdef123456789012',
  },
  {
    id: '4',
    chamaId: 1,
    user: '0x4444444444444444444444444444444444444444',
    amount: 20000000000000000, // 0.02 BTC
    timestamp: Date.now() - 86400000 * 4, // 4 days ago
    txHash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890123',
  },
  {
    id: '5',
    chamaId: 2,
    user: '0x5555555555555555555555555555555555555555',
    amount: 10000000000000000, // 0.01 BTC
    timestamp: Date.now() - 86400000 * 5, // 5 days ago
    txHash: '0xef1234567890abcdef1234567890abcdef1234567890abcdef12345678901234',
  },
];

// Mock Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [
  // Contributions
  ...MOCK_CONTRIBUTIONS.map(contrib => ({
    id: `tx_${contrib.id}`,
    type: 'contribution' as const,
    sender: contrib.user,
    chamaId: contrib.chamaId,
    amount: contrib.amount,
    timestamp: contrib.timestamp,
    txHash: contrib.txHash,
    status: 'confirmed' as const,
  })),
  // P2P Transactions
  {
    id: 'tx_p2p_1',
    type: 'p2p' as const,
    sender: '0x2222222222222222222222222222222222222222',
    receiver: '0x3333333333333333333333333333333333333333',
    amount: 5000000000000000, // 0.005 BTC
    timestamp: Date.now() - 86400000 * 2, // 2 days ago
    txHash: '0xf1234567890abcdef1234567890abcdef1234567890abcdef123456789012345',
    status: 'confirmed' as const,
  },
  {
    id: 'tx_p2p_2',
    type: 'p2p' as const,
    sender: '0x1111111111111111111111111111111111111111',
    receiver: '0x4444444444444444444444444444444444444444',
    amount: 3000000000000000, // 0.003 BTC
    timestamp: Date.now() - 86400000 * 6, // 6 days ago
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef12345678901234567',
    status: 'confirmed' as const,
  },
  {
    id: 'tx_p2p_3',
    type: 'p2p' as const,
    sender: '0x5555555555555555555555555555555555555555',
    receiver: '0x1111111111111111111111111111111111111111',
    amount: 7000000000000000, // 0.007 BTC
    timestamp: Date.now() - 86400000 * 8, // 8 days ago
    txHash: '0x234567890abcdef1234567890abcdef1234567890abcdef123456789012345678',
    status: 'confirmed' as const,
  },
];

// Mock Red Envelopes
export const MOCK_RED_ENVELOPES: RedEnvelope[] = [
  {
    id: 'env_1',
    sender: '0x3333333333333333333333333333333333333333',
    recipients: [
      '0x1111111111111111111111111111111111111111',
      '0x2222222222222222222222222222222222222222',
      '0x4444444444444444444444444444444444444444',
    ],
    totalAmount: 5000000000000000, // 0.005 BTC
    amounts: [2000000000000000, 1500000000000000, 1500000000000000], // Random split
    message: 'HODL Strong! 🚀',
    theme: RED_ENVELOPE_THEMES[0],
    mode: { type: 'random', maxRecipients: 10 },
    claimed: [true, true, false],
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    expiresAt: Date.now() + 86400000 * 4, // 4 days from now
    txHash: '0x34567890abcdef1234567890abcdef1234567890abcdef1234567890123456789',
  },
  {
    id: 'env_2',
    sender: '0x1111111111111111111111111111111111111111',
    recipients: [
      '0x2222222222222222222222222222222222222222',
      '0x5555555555555555555555555555555555555555',
    ],
    totalAmount: 4000000000000000, // 0.004 BTC
    amounts: [2000000000000000, 2000000000000000], // Equal split
    message: 'Happy Friday! 🎉',
    theme: RED_ENVELOPE_THEMES[2],
    mode: { type: 'equal', maxRecipients: 10 },
    claimed: [false, true],
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    expiresAt: Date.now() + 86400000 * 1, // 1 day from now
    txHash: '0x4567890abcdef1234567890abcdef1234567890abcdef12345678901234567890',
  },
];

// Mock Invites
export const MOCK_INVITES: Invite[] = [
  {
    id: 'inv_1',
    inviterAddress: '0x1111111111111111111111111111111111111111',
    inviteHash: '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    url: 'https://jenga.app/invite/a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    acceptances: 2,
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    lastUsed: Date.now() - 86400000 * 5, // 5 days ago
  },
  {
    id: 'inv_2',
    inviterAddress: '0x3333333333333333333333333333333333333333',
    inviteHash: '0xc3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    url: 'https://jenga.app/invite/c3d4e5f6789012345678901234567890abcdef1234567890abcdef12345678',
    acceptances: 1,
    createdAt: Date.now() - 86400000 * 40, // 40 days ago
    lastUsed: Date.now() - 86400000 * 15, // 15 days ago
  },
  {
    id: 'inv_3',
    inviterAddress: '0x5555555555555555555555555555555555555555',
    inviteHash: '0xe5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    url: 'https://jenga.app/invite/e5f6789012345678901234567890abcdef1234567890abcdef1234567890',
    acceptances: 3,
    createdAt: Date.now() - 86400000 * 25, // 25 days ago
    lastUsed: Date.now() - 86400000 * 2, // 2 days ago
  },
];

// Helper functions to get mocked data
export const getMockUserProfile = (address: string): Profile | undefined => {
  return MOCK_PROFILES.find(profile => profile.address.toLowerCase() === address.toLowerCase());
};

export const getMockUserScore = (address: string): Score | undefined => {
  return MOCK_SCORES.find(score => score.address.toLowerCase() === address.toLowerCase());
};

export const getMockUserChamas = (address: string): Chama[] => {
  return MOCK_CHAMAS.filter(chama => 
    chama.members.some(member => member.toLowerCase() === address.toLowerCase())
  );
};

export const getMockAvailableChamas = (): Chama[] => {
  return MOCK_CHAMAS.filter(chama => chama.active && chama.members.length < chama.maxMembers);
};

export const getMockUserTransactions = (address: string): Transaction[] => {
  return MOCK_TRANSACTIONS.filter(tx => 
    tx.sender.toLowerCase() === address.toLowerCase() || 
    tx.receiver?.toLowerCase() === address.toLowerCase()
  );
};

export const getMockUserRedEnvelopes = (address: string): { sent: RedEnvelope[], received: RedEnvelope[] } => {
  const sent = MOCK_RED_ENVELOPES.filter(env => 
    env.sender.toLowerCase() === address.toLowerCase()
  );
  
  const received = MOCK_RED_ENVELOPES.filter(env => 
    env.recipients.some(recipient => recipient.toLowerCase() === address.toLowerCase())
  );
  
  return { sent, received };
};
