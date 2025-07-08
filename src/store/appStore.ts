import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define types for our app store (UI state only, auth handled by authBridge)
export interface Chama {
  id: number;
  name: string;
  members: number;
  weeklyTarget: number;
  currentPool: number;
  nextPayout: string;
  myContribution: number;
  role: 'Admin' | 'Member';
}

export interface Network {
  id: string;
  name: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  currency: string;
  language: string;
  recentTransactions: boolean;
  notifications: boolean;
}

// Define the shape of our app store (UI state only)
export interface AppStore {
  // App data
  chamas: Chama[];
  networks: Network[];
  settings: AppSettings;
  
  // UI state
  currentView: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentView: (view: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Initial static data
const initialData = {
  currentView: 'dashboard',
  isLoading: false,
  error: null as string | null,
  
  chamas: [
    {
      id: 1,
      name: 'Bitcoin Builders',
      members: 12,
      weeklyTarget: 0.01,
      currentPool: 0.24,
      nextPayout: '2023-06-15',
      myContribution: 0.02,
      role: 'Admin' as const
    },
    {
      id: 2,
      name: 'Crypto Savers',
      members: 8,
      weeklyTarget: 0.005,
      currentPool: 0.12,
      nextPayout: '2023-06-22',
      myContribution: 0.01,
      role: 'Member' as const
    }
  ],
  
  networks: [
    {
      id: 'citrea',
      name: 'Citrea L2',
      chainId: 5115,
      nativeCurrency: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 18
      },
      rpcUrls: ['https://rpc.citrea.xyz'],
      blockExplorerUrls: ['https://explorer.citrea.xyz']
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      chainId: 0,
      nativeCurrency: {
        name: 'Bitcoin',
        symbol: 'BTC',
        decimals: 8
      },
      rpcUrls: [],
      blockExplorerUrls: ['https://blockstream.info']
    }
  ],
  
  settings: {
    theme: 'dark' as const,
    currency: 'BTC',
    language: 'en',
    recentTransactions: true,
    notifications: true
  }
};

// Create the store with persistence (UI state only)
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialData,
      
      // UI actions
      setCurrentView: (view) => set({ currentView: view }),
      
      // Settings actions
      updateSettings: (settings) => set((state) => ({
        settings: { 
          ...state.settings, 
          ...settings 
        }
      })),
      
      // Utility actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'jenga-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
        currentView: state.currentView,
      }),
    }
  )
);

// Export the store
export default useAppStore;
