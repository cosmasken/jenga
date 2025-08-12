import { type Address } from 'viem';
import { type ChamaData, type ChamaState, type ChamaMember, type ChamaRound } from '@/types/chama';

// Interface that matches the useRosca hook structure
export interface RoscaHookInterface {
  createChama: (
    token: Address | null,
    contribution: string,
    securityDeposit: string,
    roundDuration: string,
    lateWindow: string,
    latePenalty: string,
    memberTarget: number
  ) => Promise<Address>;
  join: (chamaAddress: Address) => Promise<void>;
  contribute: (chamaAddress: Address) => Promise<void>;
  getChamaInfo: (chamaAddress: Address) => Promise<{
    token: Address | null;
    contribution: bigint;
    securityDeposit: bigint;
    roundDuration: number;
    memberTarget: number;
    currentRound: number;
    totalMembers: number;
    isActive: boolean;
  }>;
  isLoading: boolean;
  error: string | null;
}

// State transition rules based on blockchain data
class ChamaStateManager {
  private stateCache: Map<Address, { data: ChamaData; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  // Determine state based on blockchain data
  private determineState(
    chamaInfo: any,
    userAddress: Address | null,
    memberData: ChamaMember[]
  ): ChamaState {
    const { currentRound, totalMembers, memberTarget, isActive } = chamaInfo;
    
    // Check if user has joined
    const userHasJoined = userAddress ? memberData.some(m => m.address === userAddress) : false;
    const isCreator = userAddress === chamaInfo.creator;

    // State determination logic
    if (!isActive) {
      return 'ALL_ROUNDS_FINISHED';
    }

    if (totalMembers < memberTarget) {
      if (isCreator) {
        return totalMembers === 1 ? 'CREATOR_EMPTY_STATES' : 'PRE_LAUNCH';
      } else {
        return userHasJoined ? 'MEMBER_EMPTY_STATES' : 'MEMBER_EMPTY_STATES';
      }
    }

    // Check for disputes (would come from blockchain events)
    const hasDispute = false; // TODO: Check dispute events from blockchain
    if (hasDispute) {
      return 'DISPUTE_ACTIVE';
    }

    // Check if current round is complete
    const currentRoundData = this.getCurrentRoundData(chamaInfo, memberData);
    if (currentRoundData.isComplete) {
      return 'ROUND_COMPLETE';
    }

    // Check for error states
    if (this.hasErrorConditions(chamaInfo, userAddress)) {
      return 'ERROR_STATES';
    }

    // Default to round open
    return 'ROUND_OPEN';
  }

  private getCurrentRoundData(chamaInfo: any, memberData: ChamaMember[]) {
    const contributedCount = memberData.filter(m => m.contributedCurrentRound).length;
    return {
      isComplete: contributedCount === memberData.length,
      contributedCount,
      totalMembers: memberData.length
    };
  }

  private hasErrorConditions(chamaInfo: any, userAddress: Address | null): boolean {
    // Check for various error conditions
    // - Insufficient balance
    // - Past deadline
    // - Already contributed
    // etc.
    return false; // TODO: Implement error condition checks
  }

  // Convert blockchain data to our ChamaData format
  private async convertBlockchainData(
    chamaAddress: Address,
    chamaInfo: any,
    userAddress: Address | null,
    roscaHook: RoscaHookInterface
  ): Promise<ChamaData> {
    // Mock member data - in real implementation, this would come from blockchain events
    const memberData = await this.getMemberData(chamaAddress, chamaInfo);
    
    // Mock round data - in real implementation, this would come from blockchain state
    const roundData = await this.getRoundData(chamaAddress, chamaInfo);

    const state = this.determineState(chamaInfo, userAddress, memberData);

    return {
      address: chamaAddress,
      creator: chamaInfo.creator || ('0x0000000000000000000000000000000000000000' as Address),
      token: chamaInfo.token ? 'USDC' : 'ETH',
      contributionAmount: this.formatTokenAmount(chamaInfo.contribution),
      securityDeposit: this.formatTokenAmount(chamaInfo.securityDeposit),
      currentRound: chamaInfo.currentRound,
      totalRounds: chamaInfo.memberTarget, // Assuming total rounds = member target
      rounds: roundData,
      members: memberData,
      memberTarget: chamaInfo.memberTarget,
      currentMemberCount: chamaInfo.totalMembers,
      state,
      isActive: chamaInfo.isActive,
      hasDispute: false, // TODO: Check from blockchain events
      roundDuration: chamaInfo.roundDuration,
      lateWindow: 2 * 60 * 60, // TODO: Get from contract
      latePenalty: '10', // TODO: Get from contract
      userAddress,
      userHasJoined: userAddress ? memberData.some(m => m.address === userAddress) : false,
      userIsCreator: userAddress === chamaInfo.creator,
      userContributedCurrentRound: userAddress ? 
        memberData.find(m => m.address === userAddress)?.contributedCurrentRound || false : false,
      userBalance: '50.0', // TODO: Get actual wallet balance
    };
  }

  private formatTokenAmount(amount: bigint): string {
    // Convert from wei to readable format
    return (Number(amount) / 1e18).toString();
  }

  private async getMemberData(chamaAddress: Address, chamaInfo: any): Promise<ChamaMember[]> {
    // In real implementation, this would:
    // 1. Query MemberJoined events from the contract
    // 2. Get current contribution status for each member
    // 3. Determine winner for current round
    
    try {
      // Get member events from blockchain
      const memberEvents = await this.getMemberJoinedEvents(chamaAddress);
      
      // Build member list with real data
      const members: ChamaMember[] = [];
      for (const event of memberEvents) {
        const member: ChamaMember = {
          address: event.member,
          name: `${event.member.slice(0, 6)}...${event.member.slice(-4)}`, // Format address as name
          status: 'contributed', // TODO: Check if they've received payout
          contributedCurrentRound: await this.hasContributed(chamaAddress, event.member, chamaInfo.currentRound),
        };
        members.push(member);
      }
      
      return members;
    } catch (error) {
      console.error('Error getting member data:', error);
      // Fallback to basic member data if blockchain query fails
      return this.getBasicMemberData(chamaInfo.totalMembers);
    }
  }

  private async getMemberJoinedEvents(chamaAddress: Address) {
    // TODO: Query MemberJoined events from the contract
    // This would use your publicClient to get events
    return [];
  }

  private async hasContributed(chamaAddress: Address, memberAddress: Address, currentRound: number): Promise<boolean> {
    // TODO: Check if member has contributed in current round
    // This would call the 'contributed' function on your contract
    return Math.random() > 0.5; // Temporary - replace with real contract call
  }

  private getBasicMemberData(memberCount: number): ChamaMember[] {
    // Basic fallback member data when blockchain queries fail
    const basicMembers: ChamaMember[] = [];
    
    for (let i = 0; i < memberCount; i++) {
      basicMembers.push({
        address: ('0x' + Math.random().toString(16).substring(2, 42).padStart(40, '0')) as Address,
        name: `Member ${i + 1}`,
        status: 'contributed',
        contributedCurrentRound: Math.random() > 0.3, // 70% contributed
      });
    }

    return basicMembers;
  }

  private async getRoundData(chamaAddress: Address, chamaInfo: any): Promise<ChamaRound[]> {
    // In real implementation, this would:
    // 1. Query RoundStarted events
    // 2. Query PayoutMade events
    // 3. Calculate deadlines based on round duration
    
    const rounds: ChamaRound[] = [];
    for (let i = 1; i <= chamaInfo.memberTarget; i++) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (i - chamaInfo.currentRound) * 7);
      
      rounds.push({
        roundNumber: i,
        winner: i < chamaInfo.currentRound ? ('0x1234567890123456789012345678901234567890' as Address) : null,
        deadline,
        isComplete: i < chamaInfo.currentRound,
        contributions: {},
        totalContributions: i < chamaInfo.currentRound ? chamaInfo.totalMembers : Math.floor(Math.random() * chamaInfo.totalMembers),
      });
    }

    return rounds;
  }

  // Main method to get chama data using the rosca hook
  public async getChamaData(
    chamaAddress: Address,
    userAddress: Address | null,
    roscaHook: RoscaHookInterface
  ): Promise<ChamaData> {
    // Check cache first
    const cached = this.stateCache.get(chamaAddress);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      // Get data from blockchain via rosca hook
      const chamaInfo = await roscaHook.getChamaInfo(chamaAddress);
      
      // Convert to our format
      const chamaData = await this.convertBlockchainData(chamaAddress, chamaInfo, userAddress, roscaHook);
      
      // Cache the result
      this.stateCache.set(chamaAddress, {
        data: chamaData,
        timestamp: Date.now()
      });

      return chamaData;
    } catch (error) {
      console.error('Failed to get chama data:', error);
      throw error;
    }
  }

  // Handle state transitions after actions
  public async handleActionResult(
    action: 'create' | 'join' | 'contribute',
    chamaAddress: Address,
    userAddress: Address | null,
    roscaHook: RoscaHookInterface
  ): Promise<ChamaData> {
    // Clear cache to force refresh
    this.stateCache.delete(chamaAddress);
    
    // Get fresh data
    const updatedData = await this.getChamaData(chamaAddress, userAddress, roscaHook);
    
    // Apply optimistic updates based on action
    switch (action) {
      case 'join':
        updatedData.userHasJoined = true;
        updatedData.currentMemberCount += 1;
        break;
      case 'contribute':
        updatedData.userContributedCurrentRound = true;
        break;
    }

    return updatedData;
  }

  // Clear cache for testing/development
  public clearCache(): void {
    this.stateCache.clear();
  }

  // Get cached data for immediate UI updates
  public getCachedData(chamaAddress: Address): ChamaData | null {
    const cached = this.stateCache.get(chamaAddress);
    return cached ? cached.data : null;
  }
}

export const chamaStateManager = new ChamaStateManager();
