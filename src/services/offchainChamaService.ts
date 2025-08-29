/**
 * Off-Chain Chama Service
 * Handles all off-chain chama operations with Supabase integration
 */

import { supabase } from '@/lib/supabase';
import { type Address } from 'viem';

// Types matching the database schema
export type ChamaStatus = 'draft' | 'recruiting' | 'waiting' | 'registered' | 'active' | 'completed' | 'cancelled';
export type MemberStatus = 'invited' | 'pending' | 'confirmed' | 'active' | 'defaulted' | 'completed' | 'withdrawn';
export type DepositStatus = 'pending' | 'paid' | 'confirmed' | 'forfeited';
export type ContributionStatus = 'pending' | 'paid' | 'confirmed' | 'failed' | 'refunded';
export type RoundStatus = 'pending' | 'active' | 'completed' | 'expired' | 'cancelled';
export type BatchOperationStatus = 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';

export interface OffchainChama {
  id: string;
  chain_address?: string;
  name: string;
  description?: string;
  creator_address: string;
  
  // Configuration
  contribution_amount: string;
  security_deposit: string;
  member_target: number;
  round_duration_hours: number;
  
  // Status
  status: ChamaStatus;
  chain_status?: number;
  current_round: number;
  
  // Timing
  created_at: string;
  recruitment_deadline?: string;
  chain_deployed_at?: string;
  started_at?: string;
  completed_at?: string;
  
  // Settings
  is_private: boolean;
  invitation_code: string;
  chain_tx_hash?: string;
  auto_start: boolean;
  allow_late_join: boolean;
  late_fee_percentage: number;
}

export interface OffchainMember {
  id: string;
  chama_id: string;
  user_address: string;
  
  // Status
  status: MemberStatus;
  join_method: 'invited' | 'direct_join' | 'creator';
  
  // Financial
  deposit_status: DepositStatus;
  deposit_amount: string;
  deposit_tx_hash?: string;
  
  // Participation
  agreed_to_terms: boolean;
  agreed_at?: string;
  total_contributions: string;
  rounds_contributed: number;
  rounds_missed: number;
  
  // Payout
  has_received_payout: boolean;
  payout_round?: number;
  payout_amount?: string;
  payout_tx_hash?: string;
  
  // Chain sync
  chain_confirmed: boolean;
  chain_sync_at?: string;
  
  // Timing
  invited_at: string;
  joined_at?: string;
  notes?: string;
}

export interface OffchainRound {
  id: string;
  chama_id: string;
  round_number: number;
  
  // Configuration
  winner_address?: string;
  winner_selection_method: 'lottery' | 'rotation' | 'bidding';
  payout_amount?: string;
  
  // Timing
  start_time: string;
  end_time: string;
  actual_end_time?: string;
  
  // Status
  status: RoundStatus;
  chain_confirmed: boolean;
  chain_tx_hash?: string;
  
  // Participation
  expected_contributions: number;
  received_contributions: number;
  total_pot: string;
  notes?: string;
}

export interface OffchainContribution {
  id: string;
  chama_id: string;
  round_id: string;
  member_id: string;
  
  // Details
  amount: string;
  contributed_at: string;
  due_date?: string;
  
  // Status
  status: ContributionStatus;
  is_late: boolean;
  late_penalty: string;
  
  // Chain sync
  chain_tx_hash?: string;
  chain_confirmed: boolean;
  chain_sync_at?: string;
  
  // Metadata
  contribution_method: 'wallet' | 'auto_deduct';
  notes?: string;
}

export interface Invitation {
  id: string;
  chama_id: string;
  inviter_address: string;
  invitee_address?: string;
  invitee_email?: string;
  
  invitation_code: string;
  message?: string;
  expires_at: string;
  
  status: 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  responded_at?: string;
  created_at: string;
}

export interface BatchOperation {
  id: string;
  operation_type: 'deploy_chama' | 'batch_join' | 'batch_contribute' | 'start_rosca' | 'complete_round';
  chama_id: string;
  
  operation_data: Record<string, any>;
  estimated_gas?: number;
  gas_price?: string;
  
  status: BatchOperationStatus;
  error_message?: string;
  retry_count: number;
  max_retries: number;
  
  tx_hash?: string;
  block_number?: number;
  gas_used?: number;
  
  created_at: string;
  scheduled_for: string;
  executed_at?: string;
  completed_at?: string;
}

export interface ChamaEvent {
  id: string;
  chama_id: string;
  event_type: string;
  actor_address: string;
  
  event_data: Record<string, any>;
  created_at: string;
  
  chain_tx_hash?: string;
  block_number?: number;
  ip_address?: string;
  user_agent?: string;
}

export interface CreateChamaData {
  name: string;
  description?: string;
  contribution_amount: string;
  security_deposit: string;
  member_target: number;
  round_duration_hours: number;
  is_private?: boolean;
  auto_start?: boolean;
  allow_late_join?: boolean;
  late_fee_percentage?: number;
}

export interface JoinChamaData {
  chama_id: string;
  user_address: string;
  agreed_to_terms: boolean;
}

export interface InvitationData {
  invitee_address?: string;
  invitee_email?: string;
  message?: string;
  expires_in_hours?: number;
}

// Main service class
export class OffchainChamaService {
  
  // ============ CHAMA MANAGEMENT ============
  
  /**
   * Create a new chama (off-chain only initially)
   */
  async createChama(creatorAddress: string, data: CreateChamaData): Promise<OffchainChama> {
    // Generate invitation code
    const invitationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    const { data: chama, error } = await supabase
      .from('chamas')
      .insert({
        ...data,
        creator_address: creatorAddress,
        status: 'draft' as ChamaStatus,
        current_round: 0,
        invitation_code: invitationCode,
        is_private: data.is_private ?? false,
        auto_start: data.auto_start ?? false,
        allow_late_join: data.allow_late_join ?? false,
        late_fee_percentage: data.late_fee_percentage ?? 0,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create chama: ${error.message}`);
    
    // Directly insert creator as first member (bypass addMember to avoid RLS recursion)
    const { data: creatorMember, error: memberError } = await supabase
      .from('chama_members')
      .insert({
        chama_id: chama.id,
        user_address: creatorAddress,
        join_method: 'creator',
        status: 'active',
        deposit_status: 'pending',
        deposit_amount: chama.security_deposit,
        agreed_to_terms: true,
        total_contributions: '0',
        rounds_contributed: 0,
        rounds_missed: 0,
        has_received_payout: false,
        chain_confirmed: false,
        invited_at: new Date().toISOString(),
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (memberError) {
      console.error('❌ Failed to add creator as member:', memberError);
      // Don't throw here, the chama was created successfully
      // The creator can still join via the normal flow if needed
    }
    
    // Log event
    await this.logEvent(chama.id, 'chama_created', creatorAddress, {
      chama_name: data.name,
      member_target: data.member_target,
    });
    
    return chama;
  }
  
  /**
   * Get chama by ID
   */
  async getChama(chamaId: string): Promise<OffchainChama | null> {
    const { data: chama, error } = await supabase
      .from('chamas')
      .select('*')
      .eq('id', chamaId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch chama: ${error.message}`);
    }
    
    return chama;
  }
  
  /**
   * Get chama by chain address
   */
  async getChamaByChainAddress(chainAddress: string): Promise<OffchainChama | null> {
    const { data: chama, error } = await supabase
      .from('chamas')
      .select('*')
      .eq('chain_address', chainAddress)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch chama: ${error.message}`);
    }
    
    return chama;
  }
  
  /**
   * Update chama status
   */
  async updateChamaStatus(chamaId: string, status: ChamaStatus, metadata?: Record<string, any>): Promise<void> {
    const updates: Partial<OffchainChama> = { status };
    
    // Set timing fields based on status
    switch (status) {
      case 'recruiting':
        updates.recruitment_deadline = metadata?.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case 'active':
        updates.started_at = new Date().toISOString();
        break;
      case 'completed':
        updates.completed_at = new Date().toISOString();
        break;
    }
    
    const { error } = await supabase
      .from('chamas')
      .update(updates)
      .eq('id', chamaId);
    
    if (error) throw new Error(`Failed to update chama status: ${error.message}`);
    
    // Log event
    await this.logEvent(chamaId, 'status_changed', 'system', {
      new_status: status,
      metadata,
    });
  }
  
  /**
   * Get member count for a chama
   */
  async getChamaMemberCount(chamaId: string): Promise<number> {
    const { count, error } = await supabase
      .from('chama_members')
      .select('*', { count: 'exact', head: true })
      .eq('chama_id', chamaId)
      .in('status', ['pending', 'confirmed', 'active']); // Active member statuses
    
    if (error) throw new Error(`Failed to count chama members: ${error.message}`);
    
    return count || 0;
  }

  /**
   * Get user's relationship to a chama
   */
  async getUserChamaContext(chamaId: string, userAddress: string): Promise<{
    isCreator: boolean;
    isMember: boolean;
    memberInfo: OffchainMember | null;
    memberCount: number;
  }> {
    try {
      // Get chama info
      const chama = await this.getChama(chamaId);
      if (!chama) {
        throw new Error('Chama not found');
      }

      const isCreator = chama.creator_address.toLowerCase() === userAddress.toLowerCase();
      
      // Get member info
      const memberInfo = await this.getMember(chamaId, userAddress);
      const isMember = !!memberInfo;
      
      // Get current member count
      const memberCount = await this.getChamaMemberCount(chamaId);
      
      return {
        isCreator,
        isMember,
        memberInfo,
        memberCount
      };
      
    } catch (error: any) {
      console.error('❌ Error in getUserChamaContext:', error.message);
      throw error;
    }
  }

  /**
   * Get public chamas available for discovery with member counts
   */
  async getPublicChamas(): Promise<OffchainChama[]> {
    try {
      const { data: chamas, error } = await supabase
        .from('chamas')
        .select('*')
        .eq('is_private', false)
        .in('status', ['recruiting', 'waiting', 'draft'])
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw new Error(`Failed to fetch public chamas: ${error.message}`);
      
      return chamas || [];
      
    } catch (error: any) {
      console.error('❌ Error in getPublicChamas:', error.message);
      throw error;
    }
  }

  /**
   * Get public chamas with user context for discovery
   */
  async getPublicChamasWithContext(userAddress?: string): Promise<(OffchainChama & {
    memberCount: number;
    isCreator?: boolean;
    isMember?: boolean;
    memberInfo?: OffchainMember | null;
  })[]> {
    try {
      const chamas = await this.getPublicChamas();
      
      // Enhance with member counts and user context
      const enhancedChamas = await Promise.all(
        chamas.map(async (chama) => {
          const memberCount = await this.getChamaMemberCount(chama.id);
          
          let userContext = {
            isCreator: false,
            isMember: false,
            memberInfo: null as OffchainMember | null
          };
          
          if (userAddress) {
            const context = await this.getUserChamaContext(chama.id, userAddress);
            userContext = {
              isCreator: context.isCreator,
              isMember: context.isMember,
              memberInfo: context.memberInfo
            };
          }
          
          return {
            ...chama,
            memberCount,
            ...userContext
          };
        })
      );
      
      return enhancedChamas;
      
    } catch (error: any) {
      console.error('❌ Error in getPublicChamasWithContext:', error.message);
      throw error;
    }
  }

  /**
   * Get user's chamas
   */
  async getUserChamas(userAddress: string): Promise<OffchainChama[]> {
    try {
      console.log('🔍 Fetching user chamas for:', userAddress);
      
      // First, get chamas where user is creator
      const { data: createdChamas, error: createdError } = await supabase
        .from('chamas')
        .select('*')
        .eq('creator_address', userAddress)
        .order('created_at', { ascending: false });
      
      if (createdError) throw new Error(`Failed to fetch created chamas: ${createdError.message}`);
      
      // Then, get chama IDs where user is a member (excluding creator role)
      const { data: membershipData, error: membershipError } = await supabase
        .from('chama_members')
        .select('chama_id')
        .eq('user_address', userAddress)
        .neq('join_method', 'creator');
      
      if (membershipError) throw new Error(`Failed to fetch member chamas: ${membershipError.message}`);
      
      const memberChamaIds = membershipData?.map(m => m.chama_id) || [];
      
      // Get chamas where user is a member (but not creator)
      let joinedChamas: OffchainChama[] = [];
      if (memberChamaIds.length > 0) {
        const { data, error: joinedError } = await supabase
          .from('chamas')
          .select('*')
          .in('id', memberChamaIds)
          .order('created_at', { ascending: false });
        
        if (joinedError) throw new Error(`Failed to fetch joined chamas: ${joinedError.message}`);
        joinedChamas = data || [];
      }
      
      // Combine and deduplicate results
      const allChamas = [...(createdChamas || []), ...joinedChamas];
      const uniqueChamas = Array.from(
        new Map(allChamas.map(chama => [chama.id, chama])).values()
      );
      
      // Sort by created_at desc
      uniqueChamas.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log(`✅ Found ${uniqueChamas.length} chamas for user`);
      return uniqueChamas;
      
    } catch (error: any) {
      console.error('❌ Error in getUserChamas:', error.message);
      throw error; // Let the error bubble up now that RLS is disabled
    }
  }
  
  // ============ MEMBER MANAGEMENT ============
  
  /**
   * Add a member to a chama
   */
  async addMember(chamaId: string, userAddress: string, joinMethod: 'invited' | 'direct_join' | 'creator' = 'direct_join'): Promise<OffchainMember> {
    // Check if chama exists and is accepting members
    const chama = await this.getChama(chamaId);
    if (!chama) throw new Error('Chama not found');
    
    if (chama.status !== 'draft' && chama.status !== 'recruiting') {
      throw new Error('Chama is not accepting new members');
    }
    
    // Check if already a member
    const existingMember = await this.getMember(chamaId, userAddress);
    if (existingMember) throw new Error('User is already a member');
    
    // Check member limit
    const currentMembers = await this.getChamaMembers(chamaId);
    if (currentMembers.length >= chama.member_target) {
      throw new Error('Chama is full');
    }
    
    const { data: member, error } = await supabase
      .from('chama_members')
      .insert({
        chama_id: chamaId,
        user_address: userAddress,
        join_method: joinMethod,
        status: joinMethod === 'creator' ? 'active' : 'pending',
        deposit_amount: chama.security_deposit,
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to add member: ${error.message}`);
    
    // Log event
    await this.logEvent(chamaId, 'member_joined', userAddress, {
      join_method: joinMethod,
    });
    
    // Check if chama is now full
    if (currentMembers.length + 1 === chama.member_target) {
      await this.updateChamaStatus(chamaId, 'waiting');
    }
    
    return member;
  }
  
  /**
   * Get member by chama and user address
   */
  async getMember(chamaId: string, userAddress: string): Promise<OffchainMember | null> {
    const { data: member, error } = await supabase
      .from('chama_members')
      .select('*')
      .eq('chama_id', chamaId)
      .eq('user_address', userAddress)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch member: ${error.message}`);
    }
    
    return member;
  }
  
  /**
   * Get all members of a chama
   */
  async getChamaMembers(chamaId: string): Promise<OffchainMember[]> {
    const { data: members, error } = await supabase
      .from('chama_members')
      .select('*')
      .eq('chama_id', chamaId)
      .order('joined_at');
    
    if (error) throw new Error(`Failed to fetch chama members: ${error.message}`);
    
    return members || [];
  }
  
  /**
   * Update member status
   */
  async updateMemberStatus(memberId: string, status: MemberStatus, metadata?: Record<string, any>): Promise<void> {
    const { error } = await supabase
      .from('chama_members')
      .update({
        status,
        ...metadata,
      })
      .eq('id', memberId);
    
    if (error) throw new Error(`Failed to update member status: ${error.message}`);
  }
  
  /**
   * Record member deposit payment
   */
  async recordDepositPayment(memberId: string, txHash?: string): Promise<void> {
    const { error } = await supabase
      .from('chama_members')
      .update({
        deposit_status: 'paid',
        deposit_tx_hash: txHash,
        status: 'active',
      })
      .eq('id', memberId);
    
    if (error) throw new Error(`Failed to record deposit payment: ${error.message}`);
  }
  
  // ============ ROUND MANAGEMENT ============
  
  /**
   * Create a new round
   */
  async createRound(chamaId: string, roundNumber: number): Promise<OffchainRound> {
    const chama = await this.getChama(chamaId);
    if (!chama) throw new Error('Chama not found');
    
    const activeMembers = await this.getActiveMembers(chamaId);
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + (chama.round_duration_hours * 60 * 60 * 1000));
    
    const { data: round, error } = await supabase
      .from('chama_rounds')
      .insert({
        chama_id: chamaId,
        round_number: roundNumber,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        expected_contributions: activeMembers.length,
        status: 'active' as RoundStatus,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create round: ${error.message}`);
    
    // Log event
    await this.logEvent(chamaId, 'round_started', 'system', {
      round_number: roundNumber,
      expected_contributions: activeMembers.length,
    });
    
    return round;
  }
  
  /**
   * Get current active round
   */
  async getCurrentRound(chamaId: string): Promise<OffchainRound | null> {
    const { data: round, error } = await supabase
      .from('chama_rounds')
      .select('*')
      .eq('chama_id', chamaId)
      .eq('status', 'active')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch current round: ${error.message}`);
    }
    
    return round;
  }
  
  /**
   * Get active members (confirmed and active status)
   */
  async getActiveMembers(chamaId: string): Promise<OffchainMember[]> {
    const { data: members, error } = await supabase
      .from('chama_members')
      .select('*')
      .eq('chama_id', chamaId)
      .in('status', ['confirmed', 'active']);
    
    if (error) throw new Error(`Failed to fetch active members: ${error.message}`);
    
    return members || [];
  }
  
  // ============ CONTRIBUTION MANAGEMENT ============
  
  /**
   * Record a contribution
   */
  async recordContribution(
    chamaId: string,
    roundId: string,
    memberAddress: string,
    amount: string
  ): Promise<OffchainContribution> {
    // Get member ID
    const member = await this.getMember(chamaId, memberAddress);
    if (!member) throw new Error('Member not found');
    
    // Check if already contributed
    const existingContribution = await this.getContribution(roundId, member.id);
    if (existingContribution) throw new Error('Already contributed this round');
    
    const { data: contribution, error } = await supabase
      .from('contributions')
      .insert({
        chama_id: chamaId,
        round_id: roundId,
        member_id: member.id,
        amount,
        status: 'pending' as ContributionStatus,
        contributed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to record contribution: ${error.message}`);
    
    // Update member stats
    await supabase
      .from('chama_members')
      .update({
        total_contributions: (parseFloat(member.total_contributions) + parseFloat(amount)).toString(),
        rounds_contributed: member.rounds_contributed + 1,
      })
      .eq('id', member.id);
    
    // Update round stats
    await supabase
      .from('chama_rounds')
      .update({
        received_contributions: supabase.raw('received_contributions + 1'),
        total_pot: supabase.raw(`total_pot + ${amount}`),
      })
      .eq('id', roundId);
    
    // Log event
    await this.logEvent(chamaId, 'contribution_made', memberAddress, {
      round_id: roundId,
      amount,
    });
    
    return contribution;
  }
  
  /**
   * Get contribution for a round and member
   */
  async getContribution(roundId: string, memberId: string): Promise<OffchainContribution | null> {
    const { data: contribution, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('round_id', roundId)
      .eq('member_id', memberId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch contribution: ${error.message}`);
    }
    
    return contribution;
  }
  
  // ============ INVITATION SYSTEM ============
  
  /**
   * Send invitations
   */
  async sendInvitations(
    chamaId: string,
    inviterAddress: string,
    invitations: InvitationData[]
  ): Promise<Invitation[]> {
    const chama = await this.getChama(chamaId);
    if (!chama) throw new Error('Chama not found');
    
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // Default 72 hours
    
    const invitationRecords = invitations.map(inv => ({
      chama_id: chamaId,
      inviter_address: inviterAddress,
      invitee_address: inv.invitee_address,
      invitee_email: inv.invitee_email,
      message: inv.message,
      expires_at: new Date(Date.now() + (inv.expires_in_hours || 72) * 60 * 60 * 1000).toISOString(),
    }));
    
    const { data: sentInvitations, error } = await supabase
      .from('invitations')
      .insert(invitationRecords)
      .select();
    
    if (error) throw new Error(`Failed to send invitations: ${error.message}`);
    
    // Log event
    await this.logEvent(chamaId, 'invitations_sent', inviterAddress, {
      count: invitations.length,
    });
    
    return sentInvitations || [];
  }
  
  /**
   * Accept invitation
   */
  async acceptInvitation(invitationCode: string, userAddress: string): Promise<OffchainMember> {
    // Get invitation
    const { data: invitation, error: invError } = await supabase
      .from('invitations')
      .select('*, chamas(*)')
      .eq('invitation_code', invitationCode)
      .eq('status', 'sent')
      .single();
    
    if (invError || !invitation) throw new Error('Invalid invitation');
    
    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }
    
    // Update invitation status
    await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        responded_at: new Date().toISOString(),
      })
      .eq('id', invitation.id);
    
    // Add member
    const member = await this.addMember(invitation.chama_id, userAddress, 'invited');
    
    return member;
  }
  
  // ============ CHAIN DEPLOYMENT ============
  
  /**
   * Deploy chama to blockchain and update off-chain record
   */
  async deployToChain(
    chamaId: string, 
    creatorAddress: string,
    blockchainService: any // Import type as needed
  ): Promise<{ txHash: string; chainAddress: string }> {
    // Get chama data
    const chama = await this.getChama(chamaId);
    if (!chama) throw new Error('Chama not found');
    
    // Verify creator
    if (chama.creator_address !== creatorAddress) {
      throw new Error('Only creator can deploy chama to chain');
    }
    
    // Verify chama is ready for deployment
    if (chama.status !== 'waiting' && chama.status !== 'recruiting') {
      throw new Error('Chama must be in waiting or recruiting status to deploy');
    }
    
    // Check if already deployed
    if (chama.chain_address) {
      throw new Error('Chama is already deployed to blockchain');
    }
    
    try {
      // Deploy to blockchain
      const txHash = await blockchainService.createNativeROSCA(
        chama.contribution_amount,
        chama.round_duration_hours * 3600, // Convert hours to seconds
        chama.member_target,
        chama.name
      );
      
      if (!txHash) throw new Error('Failed to create ROSCA on blockchain');
      
      // Extract ROSCA address from transaction receipt
      const chainAddress = await blockchainService.extractROSCAAddressFromReceipt(txHash);
      
      if (!chainAddress) {
        throw new Error('Failed to extract ROSCA address from transaction');
      }
      
      // Update chama with chain details
      const { error: updateError } = await supabase
        .from('chamas')
        .update({
          chain_address: chainAddress,
          chain_tx_hash: txHash,
          chain_deployed_at: new Date().toISOString(),
          status: 'registered' as ChamaStatus, // New status for on-chain registration
          chain_status: 0, // RECRUITING status on contract
        })
        .eq('id', chamaId);
      
      if (updateError) {
        console.error('Failed to update chama with chain info:', updateError);
        throw new Error('Deployed to chain but failed to update database');
      }
      
      // Log deployment event
      await this.logEvent(chamaId, 'chama_deployed', creatorAddress, {
        chain_address: chainAddress,
        tx_hash: txHash,
      });
      
      // Schedule batch operation to sync members to chain if needed
      await this.scheduleBatchOperation(
        'batch_join',
        chamaId,
        { chain_address: chainAddress },
        new Date(Date.now() + 5000) // 5 seconds delay
      );
      
      return { txHash, chainAddress };
      
    } catch (error: any) {
      console.error('Chain deployment failed:', error);
      
      // Log failed deployment
      await this.logEvent(chamaId, 'deployment_failed', creatorAddress, {
        error: error.message,
      });
      
      throw error;
    }
  }
  
  /**
   * Update chain address for existing chama (for manual fixes)
   */
  async updateChainAddress(
    chamaId: string,
    chainAddress: string,
    txHash?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('chamas')
      .update({
        chain_address: chainAddress,
        chain_tx_hash: txHash,
        chain_deployed_at: new Date().toISOString(),
        status: 'registered' as ChamaStatus,
      })
      .eq('id', chamaId);
    
    if (error) throw new Error(`Failed to update chain address: ${error.message}`);
  }
  
  /**
   * Sync chama status with on-chain contract
   */
  async syncWithChain(
    chamaId: string,
    blockchainService: any
  ): Promise<void> {
    const chama = await this.getChama(chamaId);
    if (!chama || !chama.chain_address) return;
    
    try {
      const chainInfo = await blockchainService.getROSCAInfo(chama.chain_address);
      if (!chainInfo) return;
      
      // Map chain status to our status
      let newStatus: ChamaStatus = chama.status;
      switch (chainInfo.status) {
        case 0: newStatus = 'registered'; break; // RECRUITING on chain
        case 1: newStatus = 'waiting'; break;    // WAITING on chain  
        case 2: newStatus = 'active'; break;     // ACTIVE on chain
        case 3: newStatus = 'completed'; break;  // COMPLETED on chain
        case 4: newStatus = 'cancelled'; break;  // CANCELLED on chain
      }
      
      // Update if status changed
      if (newStatus !== chama.status) {
        await this.updateChamaStatus(chamaId, newStatus);
        
        // Update chain status field
        await supabase
          .from('chamas')
          .update({ chain_status: chainInfo.status })
          .eq('id', chamaId);
      }
      
    } catch (error) {
      console.error('Failed to sync with chain:', error);
    }
  }
  
  // ============ BATCH OPERATIONS ============
  
  /**
   * Schedule a batch operation
   */
  async scheduleBatchOperation(
    type: BatchOperation['operation_type'],
    chamaId: string,
    operationData: Record<string, any>,
    scheduledFor?: Date
  ): Promise<BatchOperation> {
    const { data: operation, error } = await supabase
      .from('batch_operations')
      .insert({
        operation_type: type,
        chama_id: chamaId,
        operation_data: operationData,
        scheduled_for: (scheduledFor || new Date()).toISOString(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Failed to schedule batch operation: ${error.message}`);
    
    return operation;
  }
  
  /**
   * Get pending batch operations
   */
  async getPendingBatchOperations(): Promise<BatchOperation[]> {
    const { data: operations, error } = await supabase
      .from('batch_operations')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for');
    
    if (error) throw new Error(`Failed to fetch pending operations: ${error.message}`);
    
    return operations || [];
  }
  
  /**
   * Update batch operation status
   */
  async updateBatchOperation(
    operationId: string,
    status: BatchOperationStatus,
    metadata?: Partial<BatchOperation>
  ): Promise<void> {
    const updates: Partial<BatchOperation> = {
      status,
      ...metadata,
    };
    
    if (status === 'executing') {
      updates.executed_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('batch_operations')
      .update(updates)
      .eq('id', operationId);
    
    if (error) throw new Error(`Failed to update batch operation: ${error.message}`);
  }
  
  // ============ EVENT LOGGING ============
  
  /**
   * Log an event
   */
  async logEvent(
    chamaId: string,
    eventType: string,
    actorAddress: string,
    eventData: Record<string, any>,
    chainTxHash?: string,
    blockNumber?: number
  ): Promise<void> {
    const { error } = await supabase
      .from('chama_events')
      .insert({
        chama_id: chamaId,
        event_type: eventType,
        actor_address: actorAddress,
        event_data: eventData,
        chain_tx_hash: chainTxHash,
        block_number: blockNumber,
      });
    
    if (error) {
      // Don't throw on logging errors, just console.error
      console.error('Failed to log event:', error);
    }
  }
  
  // ============ REAL-TIME SUBSCRIPTIONS ============
  
  /**
   * Subscribe to chama updates
   */
  subscribeToChamaUpdates(chamaId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chama:${chamaId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chamas', filter: `id=eq.${chamaId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chama_members', filter: `chama_id=eq.${chamaId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chama_rounds', filter: `chama_id=eq.${chamaId}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'contributions', filter: `chama_id=eq.${chamaId}` },
        callback
      )
      .subscribe();
  }
  
  /**
   * Subscribe to user's chamas
   */
  subscribeToUserChamas(userAddress: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user:${userAddress}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chamas', filter: `creator_address=eq.${userAddress}` },
        callback
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'chama_members', filter: `user_address=eq.${userAddress}` },
        callback
      )
      .subscribe();
  }
}

// Export singleton instance
export const offchainChamaService = new OffchainChamaService();

// Note: React hooks moved to separate hooks file to avoid circular dependencies
