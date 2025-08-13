import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useSacco } from '@/hooks/useSacco';
import { CONTRACT_ADDRESSES } from '@/config';
import { formatUnits } from 'viem';

interface SaccoUserStatus {
  // Basic status
  isLoggedIn: boolean;
  isSaccoMember: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Member data
  memberData: {
    ethDeposited: number;
    usdcBorrowed: number;
    availableCredit: number;
    healthFactor: number;
    interestRate: number;
  } | null;
  
  // Treasury data
  treasuryData: {
    balance: number;
    totalMembers: number;
    totalBorrowed: number;
    utilizationRate: number;
  } | null;
  
  // Actions
  refreshStatus: () => Promise<void>;
  joinSacco: () => Promise<void>;
}

const SaccoStatusContext = createContext<SaccoUserStatus | undefined>(undefined);

interface SaccoStatusProviderProps {
  children: ReactNode;
}

export function SaccoStatusProvider({ children }: SaccoStatusProviderProps) {
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  
  // Use the Sacco hook
  const {
    memberData,
    maxBorrowableUSDC,
    totalOwedUSDC,
    treasuryBalance,
    currentInterestRate,
    isLoading: saccoLoading,
    error: saccoError,
    refreshData,
    join
  } = useSacco(CONTRACT_ADDRESSES?.MICRO_SACCO);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate derived values
  const isSaccoMember = memberData?.isMember || false;
  
  const memberDataFormatted = memberData ? {
    ethDeposited: parseFloat(formatUnits(memberData.ethDeposited, 18)),
    usdcBorrowed: parseFloat(formatUnits(memberData.usdcBorrowed, 6)),
    availableCredit: parseFloat(formatUnits(maxBorrowableUSDC, 6)),
    healthFactor: memberData.usdcBorrowed > 0n 
      ? (parseFloat(formatUnits(memberData.ethDeposited, 18)) * 65000) / parseFloat(formatUnits(memberData.usdcBorrowed, 6))
      : 999,
    interestRate: parseFloat(formatUnits(currentInterestRate, 2))
  } : null;

  const treasuryDataFormatted = {
    balance: parseFloat(formatUnits(treasuryBalance, 6)),
    totalMembers: 0, // This would need to be fetched from contract events
    totalBorrowed: parseFloat(formatUnits(totalOwedUSDC, 6)),
    utilizationRate: treasuryBalance > 0n 
      ? (parseFloat(formatUnits(totalOwedUSDC, 6)) / parseFloat(formatUnits(treasuryBalance, 6))) * 100
      : 0
  };

  // Update loading and error states
  useEffect(() => {
    setIsLoading(saccoLoading);
    setError(saccoError);
  }, [saccoLoading, saccoError]);

  // Refresh status function
  const refreshStatus = async () => {
    try {
      await refreshData();
    } catch (err: any) {
      setError(err.message || 'Failed to refresh Sacco status');
    }
  };

  // Join Sacco function
  const joinSacco = async () => {
    try {
      await join();
      await refreshStatus();
    } catch (err: any) {
      setError(err.message || 'Failed to join Sacco');
      throw err;
    }
  };

  const contextValue: SaccoUserStatus = {
    isLoggedIn,
    isSaccoMember,
    isLoading,
    error,
    memberData: memberDataFormatted,
    treasuryData: treasuryDataFormatted,
    refreshStatus,
    joinSacco
  };

  return (
    <SaccoStatusContext.Provider value={contextValue}>
      {children}
    </SaccoStatusContext.Provider>
  );
}

export function useSaccoStatus(): SaccoUserStatus {
  const context = useContext(SaccoStatusContext);
  if (context === undefined) {
    throw new Error('useSaccoStatus must be used within a SaccoStatusProvider');
  }
  return context;
}

// Hook for checking if user should see Sacco features
export function useSaccoFeatureAccess() {
  const { isLoggedIn, isSaccoMember } = useSaccoStatus();
  
  return {
    canViewSaccoFeatures: isLoggedIn,
    canUseSaccoFeatures: isLoggedIn && isSaccoMember,
    shouldShowJoinPrompt: isLoggedIn && !isSaccoMember,
    shouldShowLoginPrompt: !isLoggedIn
  };
}
