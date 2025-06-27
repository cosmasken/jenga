import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define types for our app store
export type UserRole = 'admin' | 'member';

// Base user properties
// Define user properties
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  isFirstTime: boolean;
  dynamicUserId?: string; // Store Dynamic user ID for reference
  avatar?: string;
  createdAt?: number;
  lastLogin?: number;
  // Allow additional properties with specific types
  [key: string]: string | number | boolean | undefined | null;

}

// App user type is the same as User
export type AppUser = User;



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

// Define the shape of our app store
export interface AppStore {
  // User data
  user: AppUser | null;
  isAuthenticated: boolean;
  
  // Chamas (savings groups) data
  chamas: Chama[];
  
  // Available networks
  networks: Network[];
  
  // App settings
  settings: AppSettings;
  
  // Loading and error states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  
  // Auth actions
  login: (userData: Omit<User, 'isFirstTime' | 'role'> & { role?: UserRole }) => void;
  logout: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Utility actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
};

// Initial static data
const initialData = {
  // State
  user: null as User | null,
  isAuthenticated: false,
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
      chainId: 12345,
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

// Create the store with persistence
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialData,
      
      // User actions
      setUser: (user) => ({
        user: user ? { 
          ...user,
          isFirstTime: user.isFirstTime ?? true
        } : null,
        isAuthenticated: !!user
      }),
      
      updateUser: (updates) => set((state) => {
        if (!state.user) return state;
        return { 
          user: { 
            ...state.user, 
            ...updates,
            updatedAt: Date.now()
          } 
        };
      }),
      
      completeOnboarding: () => set((state) => ({
        user: state.user ? { 
          ...state.user, 
          isFirstTime: false,
          lastLogin: Date.now()
        } : null
      })),
      
      resetOnboarding: () => set((state) => ({
        user: state.user ? { 
          ...state.user, 
          isFirstTime: true 
        } : null
      })),
      
      // Auth actions
      login: (userData: Omit<User, 'isFirstTime' | 'role'> & { role?: UserRole }) => {
        const currentUser = get().user;
        return {
          user: { 
            id: userData.id || `user-${Date.now()}`,
            name: userData.name || 'Anonymous',
            email: userData.email || '',
            role: userData.role || 'member',
            walletAddress: userData.walletAddress,
            isFirstTime: currentUser ? currentUser.isFirstTime : true,
            dynamicUserId: userData.dynamicUserId,
            avatar: userData.avatar,
            createdAt: userData.createdAt || Date.now(),
            lastLogin: Date.now(),
            ...userData // Include any additional properties
          },
          isAuthenticated: true,
          error: null
        };
      },
      
      logout: () => set({
        user: null,
        isAuthenticated: false
      }),
      
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
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);

// Export the store and any utility functions
export default useAppStore;
