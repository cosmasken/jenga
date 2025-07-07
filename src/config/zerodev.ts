import { createKernelAccount, createZeroDevPaymasterClient, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { http, createPublicClient, type Address, type Chain } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

// ZeroDev configuration - Based on official examples
// Create ZeroDev project for Sepolia in dashboard, but use with Citrea
export const ZERODEV_CONFIG = {
  projectId: import.meta.env.VITE_ZERODEV_PROJECT_ID || "your-zerodev-project-id",
  // Standard ZeroDev endpoints (configured for Sepolia in dashboard)
  bundlerUrl: `https://rpc.zerodev.app/api/v2/bundler/${import.meta.env.VITE_ZERODEV_PROJECT_ID}`,
  paymasterUrl: `https://rpc.zerodev.app/api/v2/paymaster/${import.meta.env.VITE_ZERODEV_PROJECT_ID}`,
  // Toggle to enable/disable gas sponsorship
  enableGasSponsorship: false, // Set to true when ZeroDev is properly configured
};

// Citrea chain configuration for ZeroDev
export const citreaChain: Chain = {
  id: 5115,
  name: 'Citrea',
  nativeCurrency: {
    name: 'Citrea BTC',
    symbol: 'cBTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
    public: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Citrea Explorer', url: 'https://explorer.testnet.citrea.xyz' },
  },
  testnet: true,
};

// Optimized Gas Sponsorship Policies for Jenga
export const GAS_POLICIES = {
  // 🎯 ONBOARDING - Critical for user acquisition
  ONBOARDING: {
    maxGasLimit: 800000n, // Higher limit for complex profile setup
    maxTransactions: 3, // First 3 transactions sponsored
    operations: [
      'createProfile',
      'joinChama', 
      'setInitialPreferences',
      'completeKYC'
    ],
    description: 'Free onboarding for new users - first 3 transactions',
    costPerUser: 0.50, // Estimated $0.50 per new user
    priority: 'HIGH'
  },
  
  // 💰 MICRO CONTRIBUTIONS - Encourage small savers
  MICRO_CONTRIBUTIONS: {
    maxGasLimit: 400000n,
    maxAmount: 50000n, // 50k sats (~$22.50 at $45k BTC)
    dailyLimit: 3, // Max 3 sponsored micro-contributions per day
    operations: ['contributeToCycle'],
    description: 'Sponsored gas for small contributions under 50k sats',
    userLevels: ['new', 'regular'], // Not for premium (they can afford gas)
    costPerTransaction: 0.15,
    priority: 'HIGH'
  },
  
  // 🎓 LEARNING & ACHIEVEMENTS - Gamification incentives
  LEARNING_REWARDS: {
    maxGasLimit: 300000n,
    operations: [
      'claimAchievement',
      'updateReputation',
      'completeModule',
      'mintBadge'
    ],
    description: 'Free gas for educational milestones and achievements',
    monthlyLimit: 10, // Max 10 learning transactions per month
    costPerTransaction: 0.10,
    priority: 'MEDIUM'
  },
  
  // 🤝 COMMUNITY ACTIONS - Build social features
  COMMUNITY_ENGAGEMENT: {
    maxGasLimit: 250000n,
    operations: [
      'inviteMember',
      'referFriend',
      'createInviteCode',
      'shareSuccess',
      'p2pTransfer' // Add P2P transfers to community engagement
    ],
    description: 'Sponsored community building actions and small P2P transfers',
    weeklyLimit: 5, // Max 5 community actions per week
    userLevels: ['regular', 'premium'],
    costPerTransaction: 0.08,
    priority: 'MEDIUM'
  },
  
  // 🚨 EMERGENCY ACTIONS - Critical user needs
  EMERGENCY_OPERATIONS: {
    maxGasLimit: 600000n,
    operations: [
      'emergencyWithdraw',
      'disputeResolution',
      'accountRecovery',
      'freezeAccount'
    ],
    description: 'Emergency operations for user protection',
    monthlyLimit: 2, // Max 2 emergency actions per month
    costPerTransaction: 0.25,
    priority: 'CRITICAL'
  },
  
  // 🎁 PROMOTIONAL - Marketing campaigns
  PROMOTIONAL: {
    maxGasLimit: 500000n,
    operations: [
      'claimPromoReward',
      'participateInCampaign',
      'redeemCode'
    ],
    description: 'Promotional campaign rewards',
    campaignBased: true, // Enabled/disabled per campaign
    costPerTransaction: 0.20,
    priority: 'LOW'
  }
};

// User level definitions with progression criteria
export const USER_LEVELS = {
  NEW: {
    name: 'new',
    criteria: {
      transactionCount: 0,
      accountAge: 0, // days
      totalContributed: 0n, // sats
      chamasJoined: 0
    },
    benefits: ['ONBOARDING', 'MICRO_CONTRIBUTIONS', 'LEARNING_REWARDS'],
    sponsorshipBudget: 2.00, // $2 per new user
    description: 'Welcome package for new users'
  },
  
  REGULAR: {
    name: 'regular',
    criteria: {
      transactionCount: 5,
      accountAge: 7, // 1 week
      totalContributed: 100000n, // 100k sats
      chamasJoined: 1
    },
    benefits: ['MICRO_CONTRIBUTIONS', 'LEARNING_REWARDS', 'COMMUNITY_ENGAGEMENT'],
    sponsorshipBudget: 1.00, // $1 per month
    description: 'Active community member benefits'
  },
  
  PREMIUM: {
    name: 'premium',
    criteria: {
      transactionCount: 20,
      accountAge: 30, // 1 month
      totalContributed: 500000n, // 500k sats
      chamasJoined: 2,
      reputationScore: 80
    },
    benefits: ['LEARNING_REWARDS', 'COMMUNITY_ENGAGEMENT', 'EMERGENCY_OPERATIONS'],
    sponsorshipBudget: 0.50, // $0.50 per month (they're established)
    description: 'Trusted member with enhanced benefits'
  },
  
  VIP: {
    name: 'vip',
    criteria: {
      transactionCount: 50,
      accountAge: 90, // 3 months
      totalContributed: 2000000n, // 2M sats
      chamasJoined: 3,
      reputationScore: 95,
      referrals: 5
    },
    benefits: ['ALL'], // All policies available
    sponsorshipBudget: 2.00, // Higher budget for VIPs
    description: 'Community leader with full benefits'
  }
};

// Time-based limits to prevent abuse
export const RATE_LIMITS = {
  DAILY: {
    maxSponsoredTransactions: 10,
    maxSponsoredValue: 1000000n, // 1M sats per day
    cooldownPeriod: 3600, // 1 hour between similar operations
  },
  
  WEEKLY: {
    maxSponsoredTransactions: 50,
    maxSponsoredValue: 5000000n, // 5M sats per week
  },
  
  MONTHLY: {
    maxSponsoredTransactions: 200,
    maxSponsoredValue: 20000000n, // 20M sats per month
    budgetReset: true
  }
};

// Special conditions for gas sponsorship
export const SPONSORSHIP_CONDITIONS = {
  // Network congestion - reduce sponsorship during high gas
  NETWORK_CONDITIONS: {
    highGasThreshold: 50, // gwei
    reducedSponsorship: 0.5, // 50% of normal limits
    pauseThreshold: 100 // gwei - pause sponsorship
  },
  
  // User behavior patterns
  BEHAVIOR_PATTERNS: {
    suspiciousActivity: {
      rapidTransactions: 10, // 10 tx in 1 hour
      unusualAmounts: true,
      newAccountHighValue: 100000n // 100k sats from new account
    },
    
    goodBehavior: {
      consistentContributions: true,
      communityEngagement: true,
      completedEducation: true
    }
  },
  
  // Business rules
  BUSINESS_RULES: {
    maxDailyCost: 100.00, // $100 daily sponsorship budget
    maxMonthlyCost: 2000.00, // $2000 monthly budget
    emergencyPause: true, // Can pause if budget exceeded
    
    // ROI tracking
    targetUserLTV: 10.00, // $10 lifetime value per user
    maxAcquisitionCost: 3.00 // $3 max cost to acquire user
  }
};

// Create ZeroDev clients with enhanced configuration
// Create ZeroDev clients - Handle Citrea with proper fallback
export const createZeroDevClients = async (privateKey?: `0x${string}`) => {
  const signer = privateKeyToAccount(privateKey || generatePrivateKey());
  
  // Always use Citrea for the public client (for reading blockchain state)
  const publicClient = createPublicClient({
    transport: http(citreaChain.rpcUrls.default.http[0]),
    chain: citreaChain,
  });

  // Check if ZeroDev is properly configured
  if (!ZERODEV_CONFIG.projectId || ZERODEV_CONFIG.projectId === "your-zerodev-project-id") {
    console.warn('ZeroDev not configured, using regular transactions only');
    return {
      account: null,
      kernelClient: null,
      publicClient,
      paymasterClient: null,
      isZeroDevEnabled: false,
      network: 'citrea'
    };
  }

  try {
    // Try to create ZeroDev clients
    const paymasterClient = createZeroDevPaymasterClient({
      transport: http(ZERODEV_CONFIG.paymasterUrl),
    });

    const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
      signer,
      kernelVersion: KERNEL_V3_1,
    });

    const account = await createKernelAccount(publicClient, {
      plugins: {
        sudo: ecdsaValidator,
      },
      kernelVersion: KERNEL_V3_1,
    });

    const kernelClient = createKernelAccountClient({
      account,
      chain: citreaChain, // Use Citrea chain
      bundlerTransport: http(ZERODEV_CONFIG.bundlerUrl),
      middleware: {
        // Only add paymaster if gas sponsorship is enabled
        ...(ZERODEV_CONFIG.enableGasSponsorship && {
          sponsorUserOperation: paymasterClient.sponsorUserOperation,
        }),
      },
    });

    return {
      account,
      kernelClient,
      publicClient,
      paymasterClient,
      isZeroDevEnabled: true,
      network: 'citrea'
    };
  } catch (error) {
    console.warn('ZeroDev setup failed, falling back to regular transactions:', error);
    
    // Fallback to regular Citrea transactions
    return {
      account: null,
      kernelClient: null,
      publicClient,
      paymasterClient: null,
      isZeroDevEnabled: false,
      network: 'citrea'
    };
  }
};
  };
};

// Enhanced sponsorship eligibility checker
export const shouldSponsorGas = (
  operation: string,
  amount?: bigint,
  userLevel?: keyof typeof USER_LEVELS,
  userStats?: {
    dailyTransactions: number;
    weeklyTransactions: number;
    monthlyTransactions: number;
    totalContributed: bigint;
    accountAge: number;
    reputationScore: number;
  }
): {
  eligible: boolean;
  reason: string;
  policy?: keyof typeof GAS_POLICIES;
  costEstimate?: number;
} => {
  
  // Check if user level exists
  if (!userLevel || !USER_LEVELS[userLevel.toUpperCase() as keyof typeof USER_LEVELS]) {
    return {
      eligible: false,
      reason: 'Invalid user level'
    };
  }
  
  const userLevelConfig = USER_LEVELS[userLevel.toUpperCase() as keyof typeof USER_LEVELS];
  
  // Check each policy
  for (const [policyName, policy] of Object.entries(GAS_POLICIES)) {
    if (policy.operations.includes(operation)) {
      
      // Check if user level has access to this policy
      if (!userLevelConfig.benefits.includes(policyName) && !userLevelConfig.benefits.includes('ALL')) {
        continue;
      }
      
      // Check amount limits for contributions
      if (policyName === 'MICRO_CONTRIBUTIONS' && amount) {
        if (amount > policy.maxAmount) {
          continue;
        }
      }
      
      // Check rate limits
      if (userStats) {
        if (policy.dailyLimit && userStats.dailyTransactions >= policy.dailyLimit) {
          continue;
        }
        
        if (policy.weeklyLimit && userStats.weeklyTransactions >= policy.weeklyLimit) {
          continue;
        }
        
        if (policy.monthlyLimit && userStats.monthlyTransactions >= policy.monthlyLimit) {
          continue;
        }
      }
      
      // Check user level restrictions
      if (policy.userLevels && !policy.userLevels.includes(userLevel)) {
        continue;
      }
      
      // All checks passed
      return {
        eligible: true,
        reason: policy.description,
        policy: policyName as keyof typeof GAS_POLICIES,
        costEstimate: policy.costPerTransaction || policy.costPerUser
      };
    }
  }
  
  return {
    eligible: false,
    reason: 'Operation not covered by any sponsorship policy'
  };
};

// Get user's current level based on their stats
export const getUserLevel = (userStats: {
  transactionCount: number;
  accountAge: number; // days
  totalContributed: bigint;
  chamasJoined: number;
  reputationScore?: number;
  referrals?: number;
}): keyof typeof USER_LEVELS => {
  
  // Check VIP first (highest tier)
  const vip = USER_LEVELS.VIP.criteria;
  if (
    userStats.transactionCount >= vip.transactionCount &&
    userStats.accountAge >= vip.accountAge &&
    userStats.totalContributed >= vip.totalContributed &&
    userStats.chamasJoined >= vip.chamasJoined &&
    (userStats.reputationScore || 0) >= vip.reputationScore &&
    (userStats.referrals || 0) >= vip.referrals
  ) {
    return 'VIP';
  }
  
  // Check Premium
  const premium = USER_LEVELS.PREMIUM.criteria;
  if (
    userStats.transactionCount >= premium.transactionCount &&
    userStats.accountAge >= premium.accountAge &&
    userStats.totalContributed >= premium.totalContributed &&
    userStats.chamasJoined >= premium.chamasJoined &&
    (userStats.reputationScore || 0) >= premium.reputationScore
  ) {
    return 'PREMIUM';
  }
  
  // Check Regular
  const regular = USER_LEVELS.REGULAR.criteria;
  if (
    userStats.transactionCount >= regular.transactionCount &&
    userStats.accountAge >= regular.accountAge &&
    userStats.totalContributed >= regular.totalContributed &&
    userStats.chamasJoined >= regular.chamasJoined
  ) {
    return 'REGULAR';
  }
  
  // Default to NEW
  return 'NEW';
};

// Session key management for recurring operations
export const createSessionKey = async (
  kernelClient: any,
  permissions: {
    target: Address;
    valueLimit: bigint;
    sig: string;
  }[]
) => {
  return {
    sessionKey: generatePrivateKey(),
    permissions,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
};

// Cost tracking and budget management
export const BUDGET_TRACKING = {
  dailyBudget: 100.00, // $100 per day
  monthlyBudget: 2000.00, // $2000 per month
  
  // Alert thresholds
  alerts: {
    dailyWarning: 80.00, // $80 (80% of daily budget)
    monthlyWarning: 1600.00, // $1600 (80% of monthly budget)
    emergencyStop: 2500.00 // $2500 (125% of monthly budget)
  },
  
  // Cost optimization
  optimization: {
    batchTransactions: true, // Batch multiple operations
    gasOptimization: true, // Use gas-optimized contracts
    offPeakIncentives: true // Encourage off-peak usage
  }
};
