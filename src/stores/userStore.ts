import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserState {
  // Authentication state
  isConnected: boolean;
  walletAddress: string | null;
  // Member state
  isMember: boolean;
  hasCompletedOnboarding: boolean;
  // Financial data
  ethDeposited: string;
  usdcBorrowed: string;
  maxBorrowAmount: string;
  // User preferences and onboarding
  hasSeenWelcomeGuide: boolean;
  hasSeenDashboardTour: boolean;
  hasSeenSaccoWelcome: boolean;
  dismissedWarnings: string[];
  // First-time user experience
  isFirstTimeUser: boolean;
  lastVisitedSacco: number | null;
  // Actions
  setMemberStatus: (isMember: boolean) => void;
  completeOnboarding: () => void;
  markGuideAsSeen: (guideType: 'welcome' | 'dashboard' | 'sacco-welcome') => void;
  dismissWarning: (warningId: string) => void;
  updateFinancials: (data: { ethDeposited?: string; usdcBorrowed?: string; maxBorrowAmount?: string }) => void;
  setFirstTimeUser: (isFirstTime: boolean) => void;
  updateLastVisitedSacco: () => void;
  resetUserData: () => void;
}

const initialState = {
  isConnected: false,
  walletAddress: null,
  isMember: false,
  hasCompletedOnboarding: false,
  ethDeposited: "0.00",
  usdcBorrowed: "0.00",
  maxBorrowAmount: "0.00",
  hasSeenWelcomeGuide: false,
  hasSeenDashboardTour: false,
  hasSeenSaccoWelcome: false,
  dismissedWarnings: [],
  isFirstTimeUser: true,
  lastVisitedSacco: null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setMemberStatus: (isMember: boolean) => {
        set({ isMember });
      },

      completeOnboarding: () => {
        set({ 
          hasCompletedOnboarding: true,
          isFirstTimeUser: false 
        });
      },

      markGuideAsSeen: (guideType: 'welcome' | 'dashboard' | 'sacco-welcome') => {
        const updates: Partial<UserState> = {};
        
        switch (guideType) {
          case 'welcome':
            updates.hasSeenWelcomeGuide = true;
            break;
          case 'dashboard':
            updates.hasSeenDashboardTour = true;
            break;
          case 'sacco-welcome':
            updates.hasSeenSaccoWelcome = true;
            break;
        }
        
        set(updates);
      },

      dismissWarning: (warningId: string) => {
        const currentWarnings = get().dismissedWarnings;
        if (!currentWarnings.includes(warningId)) {
          set({ 
            dismissedWarnings: [...currentWarnings, warningId] 
          });
        }
      },

      updateFinancials: (data) => {
        set((state) => ({
          ...state,
          ...data
        }));
      },

      setFirstTimeUser: (isFirstTime: boolean) => {
        set({ isFirstTimeUser });
      },

      updateLastVisitedSacco: () => {
        set({ lastVisitedSacco: Date.now() });
      },

      resetUserData: () => {
        set(initialState);
      },
    }),
    {
      name: 'user-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain fields
      partialize: (state) => ({
        hasSeenWelcomeGuide: state.hasSeenWelcomeGuide,
        hasSeenDashboardTour: state.hasSeenDashboardTour,
        hasSeenSaccoWelcome: state.hasSeenSaccoWelcome,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        dismissedWarnings: state.dismissedWarnings,
        isFirstTimeUser: state.isFirstTimeUser,
        lastVisitedSacco: state.lastVisitedSacco,
      }),
    }
  )
);
      // },
      
      // disconnect: () => {
      //   set(initialState);
      // },
      
      setMemberStatus: (isMember: boolean) => {
        set({ isMember });
      },
      
      completeOnboarding: () => {
        set({ 
          hasCompletedOnboarding: true,
          isMember: true,
          ethDeposited: "",
          maxBorrowAmount: "1200.00"
        });
      },
      
      markGuideAsSeen: (guideType: 'welcome' | 'dashboard') => {
        if (guideType === 'welcome') {
          set({ hasSeenWelcomeGuide: true });
        } else if (guideType === 'dashboard') {
          set({ hasSeenDashboardTour: true });
        }
      },
      
      dismissWarning: (warningId: string) => {
        const { dismissedWarnings } = get();
        if (!dismissedWarnings.includes(warningId)) {
          set({ 
            dismissedWarnings: [...dismissedWarnings, warningId] 
          });
        }
      },
      
      updateFinancials: (data) => {
        set((state) => ({
          ...state,
          ...data
        }));
      },
      
      resetUserData: () => {
        set(initialState);
      },
    }),
    {
      name: 'sacco-user-store',
      partialize: (state) => ({
        hasSeenWelcomeGuide: state.hasSeenWelcomeGuide,
        hasSeenDashboardTour: state.hasSeenDashboardTour,
        dismissedWarnings: state.dismissedWarnings,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isMember: state.isMember,
        ethDeposited: state.ethDeposited,
        usdcBorrowed: state.usdcBorrowed,
        maxBorrowAmount: state.maxBorrowAmount,
      }),
    }
  )
);