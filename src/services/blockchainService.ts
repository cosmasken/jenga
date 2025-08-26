/**
 * Production Blockchain Service Layer
 * Centralized service for all blockchain interactions with proper error handling
 */

import { type Address, type Hash } from 'viem';
import { useRosca } from '@/hooks/useRosca';
import { 
  type EnhancedMemberInfo, 
  type MemberContributionHistory, 
  type EnhancedMemberList,
  type MemberReadiness,
  type MemberPerformance,
  type MemberActivity,
  type MembershipStatus,
  type DepositStatus,
  type ContributionStatus,
  type RoundContribution
} from '@/types/member';

export interface ChamaBasicInfo {
  address: Address;
  name: string;
  creator: Address;
  contributionAmount: bigint;
  securityDeposit: bigint;
  memberTarget: number;
  totalMembers: number;
  status: number;
  currentRound: number;
  isActive: boolean;
  creationTime?: number;
}

export interface UserMembershipInfo {
  isMember: boolean;
  isCreator: boolean;
  hasContributed: boolean;
  joinTime?: number;
  totalContributions?: bigint;
}

export interface RoscaStatusInfo {
  status: number;
  timeUntilStart: number | null;
  memberReadiness: {
    totalJoined: number;
    totalPaidDeposits: number;
    allReady: boolean;
  } | null;
  canStart: boolean;
}

/**
 * Production-ready blockchain service
 */
class BlockchainService {
  private roscaHook: ReturnType<typeof useRosca> | null = null;

  setRoscaHook(hook: ReturnType<typeof useRosca>) {
    this.roscaHook = hook;
  }

  private ensureHook() {
    if (!this.roscaHook) {
      throw new Error('Blockchain service not initialized. Call setRoscaHook first.');
    }
    return this.roscaHook;
  }

  /**
   * Fetch comprehensive chama information
   */
  async getChamaInfo(address: Address): Promise<ChamaBasicInfo> {
    const hook = this.ensureHook();
    const info = await hook.getChamaInfo(address);
    
    return {
      address,
      name: info.roscaName || `Chama ${address.slice(0, 8)}...`,
      creator: info.creator,
      contributionAmount: info.contribution,
      securityDeposit: info.securityDeposit,
      memberTarget: info.memberTarget,
      totalMembers: info.totalMembers,
      status: info.status || 0,
      currentRound: info.currentRound,
      isActive: info.isActive,
    };
  }

  /**
   * Get user membership status for a chama
   */
  async getUserMembership(chamaAddress: Address, userAddress: Address): Promise<UserMembershipInfo> {
    const hook = this.ensureHook();
    const chamaInfo = await this.getChamaInfo(chamaAddress);
    
    const [isMember, hasContributed] = await Promise.all([
      hook.isMember(chamaAddress, userAddress),
      chamaInfo.status === 2 && chamaInfo.currentRound > 0
        ? hook.hasContributed(chamaAddress, userAddress, chamaInfo.currentRound)
        : Promise.resolve(false)
    ]);

    const isCreator = chamaInfo.creator.toLowerCase() === userAddress.toLowerCase();

    return {
      isMember,
      isCreator,
      hasContributed,
    };
  }

  /**
   * Get ROSCA status and readiness information
   */
  async getRoscaStatus(chamaAddress: Address): Promise<RoscaStatusInfo> {
    const hook = this.ensureHook();
    const chamaInfo = await this.getChamaInfo(chamaAddress);
    
    const [timeUntilStart, memberReadiness] = await Promise.all([
      hook.getTimeUntilStart(chamaAddress),
      hook.getMemberReadiness(chamaAddress),
    ]);

    const canStart = chamaInfo.status === 1 && chamaInfo.totalMembers >= chamaInfo.memberTarget;

    return {
      status: chamaInfo.status,
      timeUntilStart,
      memberReadiness,
      canStart,
    };
  }

  /**
   * Join a ROSCA
   */
  async joinRosca(chamaAddress: Address): Promise<Hash | undefined> {
    const hook = this.ensureHook();
    return hook.joinROSCA(chamaAddress);
  }

  /**
   * Contribute to current round
   */
  async contribute(chamaAddress: Address): Promise<Hash | undefined> {
    const hook = this.ensureHook();
    return hook.contribute(chamaAddress);
  }

  /**
   * Start ROSCA
   */
  async startRosca(chamaAddress: Address): Promise<Hash | undefined> {
    const hook = this.ensureHook();
    return hook.startROSCA(chamaAddress);
  }

  /**
   * Create a native ROSCA
   */
  async createNativeROSCA(
    contributionAmount: string,
    roundDurationSeconds: number,
    maxMembers: number,
    roscaName: string
  ): Promise<Hash | undefined> {
    const hook = this.ensureHook();
    return hook.createNativeROSCA(contributionAmount, roundDurationSeconds, maxMembers, roscaName);
  }

  /**
   * Extract ROSCA address from transaction receipt
   */
  async extractROSCAAddressFromReceipt(txHash: Hash): Promise<Address | null> {
    const hook = this.ensureHook();
    return hook.extractROSCAAddressFromReceipt(txHash);
  }

  /**
   * Join ROSCA (alias for joinRosca for consistency)
   */
  async joinROSCA(chamaAddress: Address): Promise<Hash | undefined> {
    const hook = this.ensureHook();
    return hook.joinROSCA(chamaAddress);
  }

  /**
   * Get ROSCA info
   */
  async getROSCAInfo(chamaAddress: Address) {
    const hook = this.ensureHook();
    return hook.getROSCAInfo(chamaAddress);
  }

  /**
   * Get required deposit
   */
  async getRequiredDeposit(chamaAddress: Address) {
    const hook = this.ensureHook();
    return hook.getRequiredDeposit(chamaAddress);
  }

  /**
   * Check if user is a member
   */
  async isMember(chamaAddress: Address, userAddress: Address): Promise<boolean> {
    const hook = this.ensureHook();
    return hook.isMember(chamaAddress, userAddress);
  }

  /**
   * Search ROSCAs by name
   */
  async searchROSCAsByName(searchTerm: string) {
    const hook = this.ensureHook();
    return hook.searchROSCAsByName(searchTerm);
  }

  /**
   * Get balance
   */
  async getBalance(address: Address) {
    const hook = this.ensureHook();
    if (!hook.publicClient) {
      throw new Error('Public client not available');
    }
    return hook.publicClient.getBalance({ address });
  }

  /**
   * Discover user's ROSCAs by checking factory and membership
   */
  async getUserRoscas(userAddress: Address): Promise<ChamaBasicInfo[]> {
    const hook = this.ensureHook();
    
    try {
      console.log(`Fetching ROSCAs for user: ${userAddress}`);
      
      // Get all active ROSCAs from factory
      const allActiveRoscas = await hook.getAllActiveROSCAs();
      if (!allActiveRoscas || !allActiveRoscas.addresses.length) {
        console.log('No active ROSCAs found');
        return [];
      }
      
      console.log(`Found ${allActiveRoscas.addresses.length} active ROSCAs`);
      
      // Check which ones the user is a member of or created
      const userRoscas: ChamaBasicInfo[] = [];
      
      for (let i = 0; i < allActiveRoscas.addresses.length; i++) {
        const roscaAddress = allActiveRoscas.addresses[i];
        const creator = allActiveRoscas.creators[i];
        const name = allActiveRoscas.names[i];
        
        try {
          // Check if user is creator or member
          const isCreator = creator.toLowerCase() === userAddress.toLowerCase();
          const isMember = isCreator || await hook.isMember(roscaAddress, userAddress);
          
          if (isMember) {
            // Get detailed info for this ROSCA
            const roscaInfo = await hook.getROSCAInfo(roscaAddress);
            if (roscaInfo) {
              userRoscas.push({
                address: roscaAddress,
                name: name || roscaInfo.roscaName || `Chama ${roscaAddress.slice(0, 8)}...`,
                creator,
                contributionAmount: roscaInfo.contributionAmount,
                securityDeposit: 0n, // Calculate if needed
                memberTarget: roscaInfo.maxMembers,
                totalMembers: roscaInfo.totalMembers,
                status: roscaInfo.status,
                currentRound: roscaInfo.currentRound,
                isActive: roscaInfo.status <= 2, // RECRUITING, WAITING, or ACTIVE
                creationTime: allActiveRoscas.creationTimes?.[i],
              });
            }
          }
        } catch (membershipError) {
          console.error(`Error checking membership for ROSCA ${roscaAddress}:`, membershipError);
          // Continue to next ROSCA instead of failing entirely
          continue;
        }
      }
      
      console.log(`Found ${userRoscas.length} ROSCAs for user ${userAddress}`);
      return userRoscas;
      
    } catch (error) {
      console.error('Failed to fetch user ROSCAs:', error);
      return [];
    }
  }

  /**
   * Search for public ROSCAs
   */
  async searchRoscas(searchTerm: string): Promise<ChamaBasicInfo[]> {
    const hook = this.ensureHook();
    
    try {
      const result = await hook.searchROSCAsByName(searchTerm);
      if (!result) return [];

      const roscaInfoPromises = result.addresses.map(async (address, index) => ({
        address,
        name: result.names[index] || `ROSCA ${address.slice(0, 8)}...`,
        creator: '0x0000000000000000000000000000000000000000' as Address, // We'll need to fetch this separately if needed
        contributionAmount: 0n, // These would come from individual calls if needed
        securityDeposit: 0n,
        memberTarget: 0,
        totalMembers: 0,
        status: 0,
        currentRound: 0,
        isActive: true,
      }));

      return Promise.all(roscaInfoPromises);
    } catch (error) {
      console.error('Failed to search ROSCAs:', error);
      return [];
    }
  }

  /**
   * Get all active ROSCAs
   */
  async getAllActiveRoscas(): Promise<ChamaBasicInfo[]> {
    const hook = this.ensureHook();
    
    try {
      const result = await hook.getAllActiveROSCAs();
      if (!result) return [];

      const roscaInfoPromises = result.addresses.map(async (address, index) => ({
        address,
        name: result.names[index] || `ROSCA ${address.slice(0, 8)}...`,
        creator: result.creators[index],
        contributionAmount: 0n,
        securityDeposit: 0n,
        memberTarget: 0,
        totalMembers: 0,
        status: 0,
        currentRound: 0,
        isActive: true,
        creationTime: result.creationTimes[index],
      }));

      return Promise.all(roscaInfoPromises);
    } catch (error) {
      console.error('Failed to fetch active ROSCAs:', error);
      return [];
    }
  }

  // ============ ENHANCED MEMBER TRACKING METHODS ============

  /**
   * Get enhanced member information for a specific member
   */
  async getEnhancedMemberInfo(chamaAddress: Address, memberAddress: Address): Promise<EnhancedMemberInfo | null> {
    const hook = this.ensureHook();
    
    try {
      const [chamaInfo, memberInfo, requiredDeposit] = await Promise.all([
        this.getChamaInfo(chamaAddress),
        hook.getMemberInfo(chamaAddress, memberAddress),
        hook.getRequiredDeposit(chamaAddress)
      ]);

      if (!memberInfo || !chamaInfo) {
        return null;
      }

      // Determine membership status
      const membershipStatus = this.determineMembershipStatus(
        memberInfo,
        chamaInfo,
        requiredDeposit || 0n
      );

      // Determine deposit status
      const depositStatus = this.determineDepositStatus(
        memberInfo,
        chamaInfo,
        requiredDeposit || 0n
      );

      // Determine current round contribution status
      const currentRoundStatus = await this.determineContributionStatus(
        chamaAddress,
        memberAddress,
        chamaInfo.currentRound,
        chamaInfo.status
      );

      // Calculate performance metrics
      const contributionRate = chamaInfo.currentRound > 0 
        ? (memberInfo.roundsPaid / chamaInfo.currentRound) * 100 
        : 0;
      
      const reliabilityScore = this.calculateReliabilityScore(
        memberInfo.roundsPaid,
        memberInfo.missedRounds,
        contributionRate
      );

      return {
        address: memberAddress,
        displayName: `Member ${memberAddress.slice(0, 6)}...${memberAddress.slice(-4)}`,
        joinTime: Date.now() - (30 * 24 * 60 * 60 * 1000), // Mock join time
        
        membershipStatus,
        isActive: memberInfo.isActive,
        isCreator: chamaInfo.creator.toLowerCase() === memberAddress.toLowerCase(),
        
        depositStatus,
        depositAmount: requiredDeposit || 0n,
        
        currentRoundStatus,
        totalContributions: memberInfo.totalContributions,
        roundsPaid: memberInfo.roundsPaid,
        roundsMissed: memberInfo.missedRounds,
        lateContributions: 0, // Would need to track separately
        
        hasReceivedPayout: memberInfo.hasReceivedPayout,
        payoutRound: memberInfo.hasReceivedPayout ? memberInfo.payoutRound : undefined,
        
        contributionRate,
        reliabilityScore,
      };
    } catch (error) {
      console.error('Failed to get enhanced member info:', error);
      return null;
    }
  }

  /**
   * Get enhanced member list for a chama
   */
  async getEnhancedMemberList(chamaAddress: Address): Promise<EnhancedMemberList | null> {
    const hook = this.ensureHook();
    
    try {
      const [chamaInfo, memberAddresses, memberReadiness] = await Promise.all([
        this.getChamaInfo(chamaAddress),
        hook.getMembers(chamaAddress),
        hook.getMemberReadiness(chamaAddress)
      ]);

      if (!chamaInfo || !memberAddresses.length) {
        return null;
      }

      // Get enhanced info for each member
      const members = await Promise.all(
        memberAddresses.map(address => this.getEnhancedMemberInfo(chamaAddress, address))
      );

      const validMembers = members.filter((member): member is EnhancedMemberInfo => member !== null);

      // Create readiness array
      const readiness: MemberReadiness[] = validMembers.map(member => ({
        address: member.address,
        hasJoined: true,
        hasPaidDeposit: member.depositStatus === 'paid',
        isReady: member.depositStatus === 'paid',
        joinTime: member.joinTime,
        depositPaidTime: member.depositPaidTime,
        depositAmount: member.depositAmount
      }));

      // Calculate summary
      const summary = {
        totalMembers: validMembers.length,
        activeMembers: validMembers.filter(m => m.isActive).length,
        membersReady: readiness.filter(r => r.isReady).length,
        averageReliabilityScore: validMembers.reduce((sum, m) => sum + m.reliabilityScore, 0) / validMembers.length || 0,
        totalDeposits: validMembers.reduce((sum, m) => sum + m.depositAmount, 0n),
        totalContributions: validMembers.reduce((sum, m) => sum + m.totalContributions, 0n)
      };

      return {
        members: validMembers,
        readiness,
        summary
      };
    } catch (error) {
      console.error('Failed to get enhanced member list:', error);
      return null;
    }
  }

  /**
   * Get member contribution history
   */
  async getMemberContributionHistory(chamaAddress: Address, memberAddress: Address): Promise<MemberContributionHistory | null> {
    const hook = this.ensureHook();
    
    try {
      const chamaInfo = await this.getChamaInfo(chamaAddress);
      if (!chamaInfo) return null;

      const contributions: RoundContribution[] = [];
      
      // Get contribution info for each completed round
      for (let round = 1; round <= chamaInfo.currentRound; round++) {
        try {
          const hasContributed = await hook.hasContributed(chamaAddress, memberAddress, round);
          const roundInfo = await hook.getRoundInfo(chamaAddress, round);
          
          const contribution: RoundContribution = {
            roundNumber: round,
            status: hasContributed ? 'paid' : 'missed',
            amount: hasContributed ? chamaInfo.contributionAmount : 0n,
            isLate: false, // Would need additional tracking
            contributionTime: roundInfo?.startTime
          };
          
          contributions.push(contribution);
        } catch (error) {
          console.warn(`Failed to get contribution info for round ${round}:`, error);
        }
      }

      // Calculate summary
      const totalContributed = contributions
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0n);
      
      const onTimeContributions = contributions.filter(c => c.status === 'paid' && !c.isLate).length;
      const lateContributions = contributions.filter(c => c.status === 'paid' && c.isLate).length;
      const missedContributions = contributions.filter(c => c.status === 'missed').length;

      return {
        memberAddress,
        totalRounds: chamaInfo.currentRound,
        contributions,
        summary: {
          totalContributed,
          onTimeContributions,
          lateContributions,
          missedContributions,
          averageDaysToContribute: 0, // Would need additional tracking
          currentStreak: this.calculateCurrentStreak(contributions),
          longestStreak: this.calculateLongestStreak(contributions)
        }
      };
    } catch (error) {
      console.error('Failed to get member contribution history:', error);
      return null;
    }
  }

  /**
   * Get member performance analytics
   */
  async getMemberPerformance(chamaAddress: Address, memberAddress: Address): Promise<MemberPerformance | null> {
    const history = await this.getMemberContributionHistory(chamaAddress, memberAddress);
    const enhancedInfo = await this.getEnhancedMemberInfo(chamaAddress, memberAddress);
    
    if (!history || !enhancedInfo) return null;

    const activities: MemberActivity[] = [
      {
        type: 'joined',
        timestamp: enhancedInfo.joinTime,
        description: 'Joined the chama'
      }
    ];

    if (enhancedInfo.depositStatus === 'paid') {
      activities.push({
        type: 'deposit_paid',
        timestamp: enhancedInfo.depositPaidTime || enhancedInfo.joinTime,
        amount: enhancedInfo.depositAmount,
        description: 'Paid security deposit'
      });
    }

    // Add contribution activities
    history.contributions.filter(c => c.status === 'paid').forEach(contribution => {
      activities.push({
        type: 'contributed',
        timestamp: contribution.contributionTime || Date.now(),
        roundNumber: contribution.roundNumber,
        amount: contribution.amount,
        description: `Contributed to round ${contribution.roundNumber}`
      });
    });

    // Add payout activity
    if (enhancedInfo.hasReceivedPayout && enhancedInfo.payoutRound) {
      activities.push({
        type: 'won_round',
        timestamp: enhancedInfo.payoutTime || Date.now(),
        roundNumber: enhancedInfo.payoutRound,
        amount: enhancedInfo.payoutAmount,
        description: `Won round ${enhancedInfo.payoutRound}`
      });
    }

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(enhancedInfo.reliabilityScore, enhancedInfo.contributionRate);

    return {
      address: memberAddress,
      reliabilityScore: enhancedInfo.reliabilityScore,
      contributionRate: enhancedInfo.contributionRate,
      averageContributionDelay: 0, // Would need additional tracking
      totalEarnings: enhancedInfo.payoutAmount || 0n,
      netContribution: enhancedInfo.totalContributions - (enhancedInfo.payoutAmount || 0n),
      riskLevel,
      activities: activities.sort((a, b) => b.timestamp - a.timestamp)
    };
  }

  // ============ PRIVATE HELPER METHODS ============

  private determineMembershipStatus(memberInfo: any, chamaInfo: ChamaBasicInfo, requiredDeposit: bigint): MembershipStatus {
    if (!memberInfo.isActive) return 'inactive';
    if (chamaInfo.status === 3) return 'completed';
    if (memberInfo.hasReceivedPayout) return 'winner';
    if (memberInfo.missedRounds > 2) return 'defaulted';
    if (memberInfo.missedRounds > 0) return 'late';
    if (chamaInfo.status === 2) return 'active';
    if (chamaInfo.status === 1) return 'deposit_paid';
    return 'pending_deposit';
  }

  private determineDepositStatus(memberInfo: any, chamaInfo: ChamaBasicInfo, requiredDeposit: bigint): DepositStatus {
    if (chamaInfo.status === 0) return 'required';
    if (memberInfo.isActive) return 'paid';
    if (memberInfo.missedRounds > 2) return 'forfeited';
    return 'required';
  }

  private async determineContributionStatus(
    chamaAddress: Address, 
    memberAddress: Address, 
    currentRound: number, 
    chamaStatus: number
  ): Promise<ContributionStatus> {
    if (chamaStatus !== 2 || currentRound === 0) return 'not_due';
    
    try {
      const hook = this.ensureHook();
      const hasContributed = await hook.hasContributedThisRound(chamaAddress, memberAddress);
      return hasContributed ? 'paid' : 'due';
    } catch {
      return 'due';
    }
  }

  private calculateReliabilityScore(roundsPaid: number, missedRounds: number, contributionRate: number): number {
    const baseScore = contributionRate;
    const penaltyPerMiss = 5;
    const penalty = Math.min(missedRounds * penaltyPerMiss, 30);
    return Math.max(0, Math.min(100, baseScore - penalty));
  }

  private calculateCurrentStreak(contributions: RoundContribution[]): number {
    let streak = 0;
    for (let i = contributions.length - 1; i >= 0; i--) {
      if (contributions[i].status === 'paid' && !contributions[i].isLate) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private calculateLongestStreak(contributions: RoundContribution[]): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    contributions.forEach(contribution => {
      if (contribution.status === 'paid' && !contribution.isLate) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }

  private calculateRiskLevel(reliabilityScore: number, contributionRate: number): 'low' | 'medium' | 'high' {
    const combinedScore = (reliabilityScore + contributionRate) / 2;
    
    if (combinedScore >= 80) return 'low';
    if (combinedScore >= 60) return 'medium';
    return 'high';
  }
}

// Global service instance
export const blockchainService = new BlockchainService();

/**
 * Production patterns for data management:
 * 
 * 1. **Event-based Discovery**: Use The Graph Protocol or similar indexing service
 *    to track ROSCACreated, MemberJoined events for user's ROSCAs
 * 
 * 2. **Backend API**: Implement a backend service that:
 *    - Indexes blockchain events
 *    - Caches user interactions
 *    - Provides fast queries
 * 
 * 3. **Real-time Updates**: Use WebSocket connections or Server-Sent Events
 *    for real-time updates instead of polling
 * 
 * 4. **Pagination**: Implement proper pagination for large datasets
 * 
 * 5. **Error Recovery**: Implement proper retry mechanisms and fallbacks
 */

export const PRODUCTION_PATTERNS = {
  /**
   * Instead of localStorage, use these patterns:
   */
  USER_ROSCA_DISCOVERY: 'event-indexing', // Index blockchain events
  STATE_MANAGEMENT: 'tanstack-query', // TanStack Query for server state
  REAL_TIME_UPDATES: 'websocket', // Real-time updates via WebSocket
  CACHING_STRATEGY: 'stale-while-revalidate', // Serve cached data while updating
  ERROR_HANDLING: 'error-boundaries', // React error boundaries
  OPTIMISTIC_UPDATES: 'mutation-optimistic', // Optimistic updates for better UX
} as const;
