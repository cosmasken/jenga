// src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBlockchainBase, createLocalStorageManager } from './useBlockchainBase';
import { useRosca } from '@/hooks/useRosca';
import { FACTORY_ADDRESS } from '@/utils/constants';
import { formatUnits, type Address } from 'viem';

export interface ChamaData {
  address: Address;
  name: string;
  token: Address | null;
  tokenSymbol: string;
  contribution: bigint;
  securityDeposit: bigint;
  roundDuration: number;
  memberTarget: number;
  currentRound: number;
  totalMembers: number;
  isActive: boolean;
  creator: Address;
  userRole: 'creator' | 'member' | 'none';
  contributionAmount: number;
  securityDepositAmount: number;
}

export interface DashboardStats {
  totalChamas: number;
  userChamas: number;
  totalDeposited: number;
  totalSaved: number;
  averageRound: number;
}

export function useDashboardData() {
  // Use base blockchain functionality
  const base = useBlockchainBase();
  const roscaHook = useRosca(FACTORY_ADDRESS);
  
  // Create localStorage manager for chamas
  const chamaStorage = useMemo(() => createLocalStorageManager<Address[]>('chamas'), []);
  
  const [userChamas, setUserChamas] = useState<ChamaData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalChamas: 0,
    userChamas: 0,
    totalDeposited: 0,
    totalSaved: 0,
    averageRound: 0,
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [chamaList, setChamaList] = useState<Address[]>([]);

  // Load chamas from localStorage when user address changes
  useEffect(() => {
    if (!base.address) {
      setChamaList([]);
      return;
    }
    
    const chamas = chamaStorage.load(base.address) || [];
    setChamaList(chamas);
  }, [base.address, chamaStorage]);

  // Save chamas to localStorage
  const saveChamas = useCallback((chamas: Address[]) => {
    if (!base.address) return;
    
    chamaStorage.save(base.address, chamas);
    setChamaList(chamas);
  }, [base.address, chamaStorage]);

  const fetchChamaData = useCallback(async (chamaAddress: Address): Promise<ChamaData | null> => {
    try {
      const chamaInfo = await roscaHook.getChamaInfo(chamaAddress);
      
      // Determine token symbol and decimals
      const isNative = chamaInfo.token === null || chamaInfo.token === '0x0000000000000000000000000000000000000000';
      const tokenSymbol = isNative ? 'cBTC' : 'USDC';
      const decimals = isNative ? 18 : 6;
      
      // Convert amounts to human readable format
      const contributionAmount = parseFloat(formatUnits(chamaInfo.contribution, decimals));
      const securityDepositAmount = parseFloat(formatUnits(chamaInfo.securityDeposit, decimals));
      
      // Determine user role
      let userRole: 'creator' | 'member' | 'none' = 'none';
      if (base.address) {
        if (chamaInfo.creator.toLowerCase() === base.address.toLowerCase()) {
          userRole = 'creator';
        } else {
          // TODO: Check if user is a member by calling the contract
          // For now, assume they're a member if they can see the chama
          userRole = 'member';
        }
      }

      return {
        address: chamaAddress,
        name: `Chama ${chamaAddress.slice(0, 6)}...${chamaAddress.slice(-4)}`, // Generate name from address
        token: chamaInfo.token,
        tokenSymbol,
        contribution: chamaInfo.contribution,
        securityDeposit: chamaInfo.securityDeposit,
        roundDuration: chamaInfo.roundDuration,
        memberTarget: chamaInfo.memberTarget,
        currentRound: chamaInfo.currentRound,
        totalMembers: chamaInfo.totalMembers,
        isActive: chamaInfo.isActive,
        creator: chamaInfo.creator,
        userRole,
        contributionAmount,
        securityDepositAmount,
      };
    } catch (error) {
      console.error(`Failed to fetch chama data for ${chamaAddress}:`, error);
      return null;
    }
  }, [roscaHook.getChamaInfo, base.address]); // Only depend on stable references

  const fetchDashboardData = useCallback(async () => {
    if (!base.address || !roscaHook.publicClient) {
      console.log('No wallet connected, skipping dashboard data fetch');
      return;
    }

    // Prevent multiple simultaneous fetches
    if (base.isLoading) {
      console.log('Already loading, skipping fetch');
      return;
    }

    base.setLoading(true);
    base.setError(null);

    try {
      console.log('🔄 Fetching dashboard data...');
      
      // Fetch data for all known chamas
      const chamaDataPromises = chamaList.map(fetchChamaData);
      const chamaDataResults = await Promise.all(chamaDataPromises);
      
      // Filter out failed fetches and chamas where user is not involved
      const validChamas = chamaDataResults.filter((chama): chama is ChamaData => 
        chama !== null && chama.userRole !== 'none'
      );

      // Calculate dashboard stats
      const stats: DashboardStats = {
        totalChamas: chamaList.length,
        userChamas: validChamas.length,
        totalDeposited: validChamas.reduce((sum, chama) => 
          sum + chama.securityDepositAmount + (chama.contributionAmount * chama.currentRound), 0
        ),
        totalSaved: validChamas.reduce((sum, chama) => 
          sum + (chama.contributionAmount * chama.currentRound), 0
        ),
        averageRound: validChamas.length > 0 
          ? validChamas.reduce((sum, chama) => sum + chama.currentRound, 0) / validChamas.length 
          : 0,
      };

      setUserChamas(validChamas);
      setDashboardStats(stats);
      setLastRefresh(new Date());
      
      console.log('✅ Dashboard data fetched:', {
        userChamas: validChamas.length,
        totalDeposited: stats.totalDeposited,
        totalSaved: stats.totalSaved,
      });
      
    } catch (err: any) {
      console.error('❌ Failed to fetch dashboard data:', err);
      base.setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      base.setLoading(false);
    }
  }, [base, roscaHook.publicClient, chamaList, fetchChamaData]); // Stable dependencies only

  // Auto-fetch when chama list changes
  useEffect(() => {
    let mounted = true;
    
    if (base.address && roscaHook.publicClient && chamaList.length > 0 && !base.isLoading) {
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        if (mounted) {
          fetchDashboardData();
        }
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        mounted = false;
      };
    }
    
    return () => {
      mounted = false;
    };
  }, [base.address, roscaHook.publicClient, chamaList.length]); // Only trigger when chama list length changes

  // Manual refresh function
  const refresh = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Add a chama to the known list (called when user creates/joins a chama)
  const addChama = useCallback((chamaAddress: Address) => {
    console.log('➕ Adding chama to dashboard:', chamaAddress);
    
    if (!base.address) {
      console.warn('No user address, cannot add chama');
      return;
    }
    
    // Check if chama already exists
    if (chamaList.includes(chamaAddress)) {
      console.log('Chama already exists in list');
      refresh();
      return;
    }
    
    // Add to the list and save to localStorage
    const updatedChamas = [...chamaList, chamaAddress];
    saveChamas(updatedChamas);
    
    // Trigger a refresh to fetch the new chama data
    setTimeout(() => {
      refresh();
    }, 500); // Small delay to ensure the chama is fully deployed
  }, [base.address, chamaList, saveChamas, refresh]);

  return {
    userChamas,
    dashboardStats,
    isLoading: base.isLoading,
    error: base.error,
    lastRefresh,
    refresh,
    addChama,
    isConnected: base.isConnected,
  };
}
