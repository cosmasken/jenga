import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the shape of our app store
export type AppStore = {
  // User data
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'member';
    walletAddress?: string;
    isFirstTime: boolean;
  } | null;
  
  // Chamas (savings groups) data
  chamas: Array<{
    id: number;
    name: string;
    members: number;
    weeklyTarget: number;
    currentPool: number;
    nextPayout: string;
    myContribution: number;
    role: 'Admin' | 'Member';
  }>;
  
  // Available networks
  networks: Array<{
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
  }>;
  
  // App settings
  settings: {
    theme: 'light' | 'dark';
    currency: string;
    language: string;
  };
  
  // Actions
  setUser: (user: AppStore['user']) => void;
  updateUser: (updates: Partial<NonNullable<AppStore['user']>>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  updateSettings: (settings: Partial<AppStore['settings']>) => void;
};

// Initial static data
const initialData = {
  user: null,
  
  chamas: [
    {
      id: 1,
      name: 'Women Farmers Circle',
      members: 12,
      weeklyTarget: 5000,
      currentPool: 38000,
      nextPayout: '3 days',
      myContribution: 15000,
      role: 'Member' as const,
    },
    {
      id: 2,
      name: 'Tech Builders Fund',
      members: 8,
      weeklyTarget: 10000,
      currentPool: 72000,
      nextPayout: '1 day',
      myContribution: 30000,
      role: 'Admin' as const,
    },
  ],
  
  networks: [
    {
      id: 'ethereum-mainnet',
      name: 'Ethereum Mainnet',
      chainId: 1,
      nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: ['https://mainnet.infura.io/v3/YOUR-INFURA-KEY'],
      blockExplorerUrls: ['https://etherscan.io'],
    },
    {
      id: 'polygon-mainnet',
      name: 'Polygon Mainnet',
      chainId: 137,
      nativeCurrency: {
        name: 'Matic',
        symbol: 'MATIC',
        decimals: 18,
      },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com'],
    },
  ],
  
  settings: {
    theme: 'light' as const,
    currency: 'USD',
    language: 'en',
  },
};

// Create the store with persistence
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...initialData,
      
      // Actions
      setUser: (user) => set({ user }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      
      completeOnboarding: () => set((state) => ({
        user: state.user ? { ...state.user, isFirstTime: false } : null
      })),
      
      resetOnboarding: () => set((state) => ({
        user: state.user ? { ...state.user, isFirstTime: true } : null
      })),
      
      updateSettings: (settings) => set((state) => ({
        settings: { ...state.settings, ...settings }
      })),
    }),
    {
      name: 'jenga-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);

// Export the store and any utility functions
export default useAppStore;
