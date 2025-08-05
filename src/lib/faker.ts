import type { ROSCAGroup, Member, Dispute } from './store';

const groupNames = [
  'Bitcoin Savers', 'Crypto Rockets', 'Diamond Hands', 'Satoshi Squad',
  'Lightning Network', 'DeFi Pioneers', 'Hodlers United', 'Block Builders'
];

const memberNames = [
  'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Liam', 'Maya', 'Nick', 'Olivia', 'Paul'
];

const avatarTypes = ['bitcoin', 'coins', 'chart-line', 'rocket', 'gem', 'fire', 'crown', 'star'];

export function generateMember(): Member {
  return {
    id: Math.random().toString(36).substr(2, 9),
    displayName: memberNames[Math.floor(Math.random() * memberNames.length)],
    avatar: avatarTypes[Math.floor(Math.random() * avatarTypes.length)],
    reputation: 3.5 + Math.random() * 1.5, // 3.5 to 5.0
    joinedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Within last 30 days
    hasPaid: Math.random() > 0.3, // 70% have paid
  };
}

export function generateGroup(): ROSCAGroup {
  const totalRounds = 8 + Math.floor(Math.random() * 5); // 8-12 rounds
  const currentRound = Math.floor(Math.random() * totalRounds);
  const weeklyContribution = 0.02 + Math.random() * 0.08; // 0.02-0.1 BTC
  const maxMembers = totalRounds;
  const memberCount = Math.max(5, Math.floor(Math.random() * maxMembers));
  
  const members = Array.from({ length: memberCount }, generateMember);
  
  const statuses: ('pending' | 'active' | 'completed')[] = ['pending', 'active', 'completed'];
  const status = currentRound === 0 ? 'pending' : 
                 currentRound >= totalRounds ? 'completed' : 'active';

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: groupNames[Math.floor(Math.random() * groupNames.length)],
    description: 'A decentralized savings group powered by Bitcoin',
    poolSize: weeklyContribution * totalRounds,
    weeklyContribution,
    totalRounds,
    currentRound,
    members,
    maxMembers,
    status,
    nextPayoutDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within next week
    createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Within last 60 days
  };
}

export function generateDispute(): Dispute {
  const types: ('payment' | 'late' | 'fraud' | 'rule')[] = ['payment', 'late', 'fraud', 'rule'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  const titles = {
    payment: 'Payment Dispute',
    late: 'Late Payment Report',
    fraud: 'Fraudulent Activity',
    rule: 'Rule Violation'
  };
  
  const descriptions = {
    payment: 'Member claims payment was sent but not received. Transaction hash provided for verification.',
    late: 'Member is several days late on payment. Group requesting penalty enforcement.',
    fraud: 'Suspicious activity detected. Multiple payments from same wallet address.',
    rule: 'Member violated group rules by attempting to receive payout early.'
  };

  return {
    id: Math.random().toString(36).substr(2, 9),
    groupId: Math.random().toString(36).substr(2, 9),
    groupName: groupNames[Math.floor(Math.random() * groupNames.length)],
    title: titles[type],
    description: descriptions[type],
    type,
    reportedBy: memberNames[Math.floor(Math.random() * memberNames.length)],
    reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Within last week
    votingEndsAt: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000), // Within next 3 days
    votesSupport: Math.floor(Math.random() * 10),
    votesDispute: Math.floor(Math.random() * 5),
    status: Math.random() > 0.7 ? 'resolved' : 'active',
  };
}

export function generateInvite(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase();
}
