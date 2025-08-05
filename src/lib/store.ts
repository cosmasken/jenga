import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateGroup, generateMember, generateDispute, generateInvite } from './faker';

export interface User {
  id: string;
  displayName: string;
  avatar: string;
  reputation: number;
  walletAddress: string;
  joinedAt: Date;
}

export interface ROSCAGroup {
  id: string;
  name: string;
  description: string;
  poolSize: number;
  weeklyContribution: number;
  totalRounds: number;
  currentRound: number;
  members: Member[];
  maxMembers: number;
  status: 'pending' | 'active' | 'completed';
  nextPayoutDate: Date;
  createdAt: Date;
}

export interface Member {
  id: string;
  displayName: string;
  avatar: string;
  reputation: number;
  joinedAt: Date;
  hasPaid: boolean;
  roundReceived?: number;
}

export interface Dispute {
  id: string;
  groupId: string;
  groupName: string;
  title: string;
  description: string;
  type: 'payment' | 'late' | 'fraud' | 'rule';
  reportedBy: string;
  reportedAt: Date;
  votingEndsAt: Date;
  votesSupport: number;
  votesDispute: number;
  status: 'active' | 'resolved';
  evidence?: string;
}

export interface ReputationEvent {
  id: string;
  type: 'payment' | 'vote' | 'completion' | 'penalty';
  description: string;
  points: number;
  date: Date;
  groupName?: string;
}

interface AppState {
  // User state
  user: User | null;
  onboardingCompleted: boolean;
  inviteCode: string | null;
  
  // App data
  groups: ROSCAGroup[];
  disputes: Dispute[];
  reputationHistory: ReputationEvent[];
  
  // UI state
  selectedGroupId: string | null;
  showTransactionModal: boolean;
  showInviteModal: boolean;
  showVotingModal: boolean;
  selectedDispute: Dispute | null;
  
  // Actions
  setUser: (user: User) => void;
  completeOnboarding: () => void;
  setInviteCode: (code: string | null) => void;
  addGroup: (group: ROSCAGroup) => void;
  updateGroup: (id: string, updates: Partial<ROSCAGroup>) => void;
  selectGroup: (id: string | null) => void;
  addDispute: (dispute: Dispute) => void;
  addReputationEvent: (event: ReputationEvent) => void;
  setShowTransactionModal: (show: boolean) => void;
  setShowInviteModal: (show: boolean) => void;
  setShowVotingModal: (show: boolean, dispute?: Dispute) => void;
  initializeData: () => void;
  payContribution: (groupId: string) => void;
  createNewGroup: (name: string, contribution: number) => void;
  joinGroupWithInvite: (inviteCode: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      onboardingCompleted: false,
      inviteCode: null,
      groups: [],
      disputes: [],
      reputationHistory: [],
      selectedGroupId: null,
      showTransactionModal: false,
      showInviteModal: false,
      showVotingModal: false,
      selectedDispute: null,

      // Actions
      setUser: (user) => set({ user }),
      
      completeOnboarding: () => set({ onboardingCompleted: true }),
      
      setInviteCode: (code) => set({ inviteCode: code }),
      
      addGroup: (group) => set((state) => ({ 
        groups: [...state.groups, group] 
      })),
      
      updateGroup: (id, updates) => set((state) => ({
        groups: state.groups.map(group => 
          group.id === id ? { ...group, ...updates } : group
        )
      })),
      
      selectGroup: (id) => set({ selectedGroupId: id }),
      
      addDispute: (dispute) => set((state) => ({
        disputes: [...state.disputes, dispute]
      })),
      
      addReputationEvent: (event) => set((state) => ({
        reputationHistory: [event, ...state.reputationHistory]
      })),
      
      setShowTransactionModal: (show) => set({ showTransactionModal: show }),
      
      setShowInviteModal: (show) => set({ showInviteModal: show }),
      
      setShowVotingModal: (show, dispute) => set({ 
        showVotingModal: show, 
        selectedDispute: dispute || null 
      }),
      
      initializeData: () => {
        const state = get();
        if (state.groups.length === 0) {
          // Generate initial mock data
          const mockGroups = [
            generateGroup(),
            generateGroup(),
            generateGroup(),
          ];
          const mockDisputes = [
            generateDispute(),
            generateDispute(),
          ];
          
          set({ 
            groups: mockGroups,
            disputes: mockDisputes,
          });
        }
      },
      
      payContribution: (groupId) => {
        const state = get();
        const group = state.groups.find(g => g.id === groupId);
        if (group && state.user) {
          // Update user's payment status
          const updatedMembers = group.members.map(member =>
            member.id === state.user!.id ? { ...member, hasPaid: true } : member
          );
          
          get().updateGroup(groupId, { members: updatedMembers });
          
          // Add reputation event
          get().addReputationEvent({
            id: Date.now().toString(),
            type: 'payment',
            description: `Payment completed on time for ${group.name}`,
            points: 0.1,
            date: new Date(),
            groupName: group.name,
          });
        }
      },
      
      createNewGroup: (name, contribution) => {
        const newGroup = generateGroup();
        newGroup.name = name;
        newGroup.weeklyContribution = contribution;
        newGroup.poolSize = contribution * newGroup.totalRounds;
        get().addGroup(newGroup);
      },
      
      joinGroupWithInvite: (inviteCode) => {
        // Mock joining a group with invite
        const newGroup = generateGroup();
        newGroup.name = "Invited Group";
        get().addGroup(newGroup);
      },
    }),
    {
      name: 'bitcoin-rosca-store',
    }
  )
);
