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
  // User preferences
  hasSeenWelcomeGuide: boolean;
  hasSeenDashboardTour: boolean;
  dismissedWarnings: string[];
  // Actions
  setMemberStatus: (isMember: boolean) => void;
  completeOnboarding: () => void;
  markGuideAsSeen: (guideType: 'welcome' | 'dashboard') => void;
  dismissWarning: (warningId: string) => void;
  updateFinancials: (data: { ethDeposited?: string; usdcBorrowed?: string; maxBorrowAmount?: string }) => void;
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
  dismissedWarnings: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // connect: (address: string) => {
      //   set({ 
      //     isConnected: true, 
      //     walletAddress: address 
      //   });
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