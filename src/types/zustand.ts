
import { Achievement, Profile, Score, Invite } from './user';
import { Chama, Contribution, Transaction } from './chama';
import { RedEnvelope, RedEnvelopeHistory } from './redEnvelope';
import { WalletConnection } from './web3';

export interface UserStore {
  profile: Profile | null;
  score: Score | null;
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: Profile) => void;
  updateScore: (score: Score) => void;
  addAchievement: (achievement: Achievement) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export interface ChamaStore {
  chamas: Chama[];
  userChamas: Chama[];
  availableChamas: Chama[];
  selectedChama: Chama | null;
  contributions: Contribution[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setChamas: (chamas: Chama[]) => void;
  addChama: (chama: Chama) => void;
  updateChama: (chamaId: number, updates: Partial<Chama>) => void;
  setSelectedChama: (chama: Chama | null) => void;
  addContribution: (contribution: Contribution) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface TransactionStore {
  transactions: Transaction[];
  pendingTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface RedEnvelopeStore {
  history: RedEnvelopeHistory;
  activeEnvelopes: RedEnvelope[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addSentEnvelope: (envelope: RedEnvelope) => void;
  addReceivedEnvelope: (envelope: RedEnvelope) => void;
  updateEnvelope: (id: string, updates: Partial<RedEnvelope>) => void;
  setHistory: (history: RedEnvelopeHistory) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface WalletStore {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  setConnection: (connection: WalletConnection | null) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export interface InviteStore {
  invites: Invite[];
  myInvite: Invite | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setInvites: (invites: Invite[]) => void;
  setMyInvite: (invite: Invite | null) => void;
  updateInvite: (id: string, updates: Partial<Invite>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
