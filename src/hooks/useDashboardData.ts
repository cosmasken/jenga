// src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { useBlockchainBase } from './useBlockchainBase';
import { useRosca } from '@/hooks/useRosca';
import { CONTRACT_ADDRESSES } from '@/config';
import { isLikelyOldContract } from '@/utils/migration';
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

export interface LoadingStates {
  isLoadingAddresses: boolean;
  isLoadingChamaData: boolean;
  isLoadingStats: boolean;
}

export function useDashboardData() {
  // Use base blockchain functionality
  const base = useBlockchainBase();
  const roscaHook = useRosca();
  
  // State management
  const [userChamas, setUserChamas] = useState<ChamaData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalChamas: 0,
    userChamas: 0,
    totalDeposited: 0,
    totalSaved: 0,
    averageRound: 0,
  });
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [chamaAddresses, setChamaAddresses] = useState<Address[]>([]);
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    isLoadingAddresses: false,
    isLoadingChamaData: false,
    isLoadingStats: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Load ROSCA addresses from localStorage only (auto-discovery disabled for testnet)
  const fetchUserROSCAAddresses = useCallback(async (): Promise<Address[]> => {
    if (!base.address) {
      return [];
    }

    setLoadingStates(prev => ({ ...prev, isLoadingAddresses: true }));
    setError(null);

    try {
      console.log('💾 Loading ROSCAs from localStorage for user:', base.address);
      
      // Load only from localStorage (auto-discovery disabled)
      const storedKey = `user_roscas_${base.address.toLowerCase()}`;
      const storedROSCAs: Address[] = JSON.parse(localStorage.getItem(storedKey) || '[]');
      
      // Filter out old contract addresses
      const validAddresses = storedROSCAs.filter(addr => {
        const isOld = isLikelyOldContract(addr);
        if (isOld) {
          console.log('🗑️ Filtering out old contract:', addr);
          return false;
        }
        return true;
      });
      
      console.log(`✅ Loaded ${validAddresses.length} valid ROSCA addresses from storage`);
      
      if (validAddresses.length === 0) {
        console.log('💡 No ROSCAs found in storage.');
        console.log('   → Create a new ROSCA to get started');
        console.log('   → Or use "Add ROSCA" to track an existing ROSCA address');
      }
      
      return validAddresses;
      
    } catch (error) {
      console.error('❌ Error loading ROSCA addresses from storage:', error);
      return [];
    } finally {
      setLoadingStates(prev => ({ ...prev, isLoadingAddresses: false }));
    }
  }, [base.address]);

  // Load addresses when user connects
  useEffect(() => {
    let mounted = true;
    
    if (base.address && roscaHook.publicClient) {
      fetchUserROSCAAddresses().then(addresses => {
        if (mounted) {
          setChamaAddresses(addresses);
        }
      });
    } else {
      setChamaAddresses([]);
      setUserChamas([]);
      setDashboardStats({
        totalChamas: 0,
        userChamas: 0,
        totalDeposited: 0,
        totalSaved: 0,
        averageRound: 0,
      });
    }
    
    return () => {
      mounted = false;
    };
  }, [base.address, roscaHook.publicClient, fetchUserROSCAAddresses]);

  // Enhanced chama data fetching with better error handling
  const fetchChamaData = useCallback(async (chamaAddress: Address): Promise<ChamaData | null> => {
    try {
      // First check if this address is an old contract
      if (isLikelyOldContract(chamaAddress)) {
        console.log('🚫 Skipping old contract address:', chamaAddress);
        return null;
      }
      
      const chamaInfo = await roscaHook.getChamaInfo(chamaAddress);
      if (!chamaInfo) {
        console.log('⚠️ No chama info returned for address:', chamaAddress);
        return null;
      }
      
      // Determine token symbol and decimals
      const isNative = chamaInfo.token === null || chamaInfo.token === '0x0000000000000000000000000000000000000000';
      const tokenSymbol = isNative ? 'cBTC' : 'USDC';
      const decimals = isNative ? 18 : 6;
      
      // Convert amounts to human readable format
      const contributionAmount = parseFloat(formatUnits(chamaInfo.contribution, decimals));
      const securityDepositAmount = parseFloat(formatUnits(chamaInfo.securityDeposit, decimals));
      
      // Determine user role more accurately
      let userRole: 'creator' | 'member' | 'none' = 'none';
      if (base.address) {
        if (chamaInfo.creator.toLowerCase() === base.address.toLowerCase()) {
          userRole = 'creator';
        } else {
          // Check if user is actually a member
          try {
            const isMember = await roscaHook.isMember(chamaAddress, base.address);
            userRole = isMember ? 'member' : 'none';
          } catch (memberError) {
            console.warn('Could not check membership status, assuming member:', memberError);
            userRole = 'member'; // Fallback assumption
          }
        }
      }
      
      return {
        address: chamaAddress,
        name: `ROSCA ${chamaAddress.slice(0, 6)}...${chamaAddress.slice(-4)}`,
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
      console.error(`❌ Failed to fetch chama data for ${chamaAddress}:`, error);
      return null;
    }
  }, [roscaHook, base.address]);

  // Fetch chama data with proper loading states
  const fetchDashboardData = useCallback(async () => {
    if (!base.address || !roscaHook.publicClient || chamaAddresses.length === 0) {
      console.log('No wallet connected or no addresses found, skipping dashboard data fetch');
      return;
    }

    // Prevent multiple simultaneous fetches
    if (loadingStates.isLoadingChamaData) {
      console.log('Already loading chama data, skipping fetch');
      return;
    }

    setLoadingStates(prev => ({ ...prev, isLoadingChamaData: true }));
    setError(null);

    try {
      console.log(`🔄 Fetching data for ${chamaAddresses.length} ROSCAs...`);
      
      // Fetch data for all ROSCA addresses with concurrency limit
      const BATCH_SIZE = 3; // Limit concurrent requests
      const results: (ChamaData | null)[] = [];
      
      for (let i = 0; i < chamaAddresses.length; i += BATCH_SIZE) {
        const batch = chamaAddresses.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(fetchChamaData);
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Small delay between batches to avoid overwhelming the RPC
        if (i + BATCH_SIZE < chamaAddresses.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Filter out failed fetches and chamas where user is not involved
      const validChamas = results.filter((chama): chama is ChamaData => 
        chama !== null && chama.userRole !== 'none'
      );
      
      console.log(`✅ Successfully loaded ${validChamas.length} valid ROSCAs out of ${chamaAddresses.length} total`);
      
      setUserChamas(validChamas);
      
      // Calculate stats in a separate step
      setLoadingStates(prev => ({ ...prev, isLoadingStats: true }));
      
      const stats: DashboardStats = {
        totalChamas: chamaAddresses.length,
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

      setDashboardStats(stats);
      setLastRefresh(new Date());
      
      console.log('📊 Dashboard stats calculated:', {
        userChamas: validChamas.length,
        totalDeposited: stats.totalDeposited.toFixed(4),
        totalSaved: stats.totalSaved.toFixed(4),
      });
      
    } catch (err: any) {
      console.error('❌ Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoadingStates(prev => ({ 
        ...prev, 
        isLoadingChamaData: false, 
        isLoadingStats: false 
      }));
    }
  }, [base.address, roscaHook.publicClient, chamaAddresses, fetchChamaData]);

  // Auto-fetch when addresses are loaded
  useEffect(() => {
    let mounted = true;
    
    if (base.address && roscaHook.publicClient && chamaAddresses.length > 0 && !loadingStates.isLoadingChamaData) {
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        if (mounted) {
          fetchDashboardData();
        }
      }, 200);
      
      return () => {
        clearTimeout(timeoutId);
        mounted = false;
      };
    }
  }, [base.address, roscaHook.publicClient, chamaAddresses, fetchDashboardData]);
  
  // Manual refresh function that reloads everything from chain
  const refreshData = useCallback(async () => {
    console.log('🔄 Manual refresh requested - reloading from blockchain');
    
    if (!base.address || !roscaHook.publicClient) {
      console.log('No wallet connected, cannot refresh');
      return;
    }
    
    try {
      // First refresh the addresses from blockchain
      const newAddresses = await fetchUserROSCAAddresses();
      setChamaAddresses(newAddresses);
      
      // Then fetch the data for those addresses
      // The useEffect will trigger automatically when addresses change
    } catch (error) {
      console.error('Failed to refresh data:', error);
      setError('Failed to refresh data from blockchain');
    }
  }, [base.address, roscaHook.publicClient, fetchUserROSCAAddresses]);
  
  // Function to manually add a ROSCA address
  const addROSCAAddress = useCallback((roscaAddress: Address) => {
    if (!base.address) {
      console.warn('No user connected, cannot add ROSCA');
      return;
    }
    
    if (isLikelyOldContract(roscaAddress)) {
      console.warn('Cannot add old/incompatible contract:', roscaAddress);
      return;
    }
    
    console.log('➕ Adding ROSCA manually:', roscaAddress);
    
    // Add to current list if not already present
    const newAddresses = [...new Set([...chamaAddresses, roscaAddress])];
    setChamaAddresses(newAddresses);
    
    // Store in localStorage for future sessions
    const storedKey = `user_roscas_${base.address.toLowerCase()}`;
    localStorage.setItem(storedKey, JSON.stringify(newAddresses));
    
    console.log('✅ ROSCA added and stored locally');
  }, [base.address, chamaAddresses]);
  
  // Function to remove a ROSCA address
  const removeROSCAAddress = useCallback((roscaAddress: Address) => {
    if (!base.address) {
      console.warn('No user connected, cannot remove ROSCA');
      return;
    }
    
    console.log('➖ Removing ROSCA:', roscaAddress);
    
    // Remove from current list
    const newAddresses = chamaAddresses.filter(addr => 
      addr.toLowerCase() !== roscaAddress.toLowerCase()
    );
    setChamaAddresses(newAddresses);
    
    // Update localStorage
    const storedKey = `user_roscas_${base.address.toLowerCase()}`;
    localStorage.setItem(storedKey, JSON.stringify(newAddresses));
    
    console.log('✅ ROSCA removed from list');
  }, [base.address, chamaAddresses]);
  
  // Combined loading state
  const isLoading = loadingStates.isLoadingAddresses || loadingStates.isLoadingChamaData || loadingStates.isLoadingStats;
  
  return {
    userChamas,
    dashboardStats,
    lastRefresh,
    isLoading,
    error,
    loadingStates, // Detailed loading states
    refreshData,
    chamaAddresses, // Expose the addresses for debugging
    
    // Manual ROSCA management
    addROSCAAddress,
    removeROSCAAddress,
    
    // Legacy compatibility (for components that might still use these)
    chamaList: chamaAddresses,
    addChama: addROSCAAddress, // Alias for backward compatibility
    saveChamas: (addresses: Address[]) => {
      if (!base.address) return;
      const storedKey = `user_roscas_${base.address.toLowerCase()}`;
      localStorage.setItem(storedKey, JSON.stringify(addresses));
      setChamaAddresses(addresses);
    },
  };
}
