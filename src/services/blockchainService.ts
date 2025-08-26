/**
 * Production Blockchain Service Layer
 * Centralized service for all blockchain interactions with proper error handling
 */

import { type Address, type Hash } from 'viem';
import { useRosca } from '@/hooks/useRosca';

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
