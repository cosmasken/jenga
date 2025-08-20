import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import {
  formatUnits,
  parseUnits,
  createPublicClient,
  http,
  getContract,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
  formatEther,
  parseEther
} from 'viem';
import { citreaTestnet, CONTRACT_ADDRESSES, NETWORK_CONFIG } from '@/config';

// Import the new enhanced contract ABIs
import ROSCA_ABI_JSON from '../abi/ROSCA.json';
import FACTORY_ABI_JSON from '../abi/ROSCAFactory.json';
import USDC_ABI_JSON from '../abi/MockUSDC.json';

const ROSCA_ABI = ROSCA_ABI_JSON.abi;
const FACTORY_ABI = FACTORY_ABI_JSON.abi;
const USDC_ABI = USDC_ABI_JSON.abi;

/* === TYPES === */
export enum ROSCAStatus {
  RECRUITING = 0,
  WAITING = 1,
  ACTIVE = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

export interface ROSCAInfo {
  token: Address;
  contributionAmount: bigint;
  roundDuration: number;
  maxMembers: number;
  status: ROSCAStatus;
  currentRound: number;
  totalMembers: number;
  totalRounds: number;
  recruitmentCompleteTime: number;
  nextPayoutIndex: number;
}

export interface MemberInfo {
  isActive: boolean;
  totalContributions: bigint;
  roundsPaid: number;
  missedRounds: number;
  hasReceivedPayout: boolean;
  payoutRound: number;
}

export interface RoundInfo {
  startTime: number;
  deadline: number;
  winner: Address;
  totalPot: bigint;
  contributionsReceived: number;
  isCompleted: boolean;
}

export interface FactoryStats {
  totalCreated: number;
  activeCount: number;
  creationFeeAmount: bigint;
  implementationAddress: Address;
}

/* === HOOK INTERFACE === */
export interface RoscaHook {
  // Factory functions
  createROSCA: (
    token: Address,
    contributionAmount: string,
    roundDuration: number,
    maxMembers: number
  ) => Promise<Hash | undefined>;
  getFactoryStats: () => Promise<FactoryStats | null>;
  
  // ROSCA functions
  joinROSCA: (roscaAddress: Address) => Promise<Hash | undefined>;
  contribute: (roscaAddress: Address) => Promise<Hash | undefined>;
  startROSCA: (roscaAddress: Address) => Promise<Hash | undefined>;
  forceStart: (roscaAddress: Address) => Promise<Hash | undefined>;
  completeRound: (roscaAddress: Address) => Promise<Hash | undefined>;
  
  // View functions
  getROSCAInfo: (roscaAddress: Address) => Promise<ROSCAInfo | null>;
  getMemberInfo: (roscaAddress: Address, memberAddress: Address) => Promise<MemberInfo | null>;
  getRoundInfo: (roscaAddress: Address, roundNumber: number) => Promise<RoundInfo | null>;
  getMembers: (roscaAddress: Address) => Promise<Address[]>;
  getRequiredDeposit: (roscaAddress: Address) => Promise<bigint | null>;
  getTimeUntilStart: (roscaAddress: Address) => Promise<number | null>;
  getTimeUntilRoundEnd: (roscaAddress: Address) => Promise<number | null>;
  hasContributedThisRound: (roscaAddress: Address, memberAddress: Address) => Promise<boolean>;
  
  // Token functions
  getUSDCBalance: (userAddress: Address) => Promise<bigint | null>;
  getUSDCAllowance: (owner: Address, spender: Address) => Promise<bigint | null>;
  approveUSDC: (spender: Address, amount: string) => Promise<Hash | undefined>;
  mintUSDC: (amount: string) => Promise<Hash | undefined>; // For testing only
  
  // State
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  address: Address | null;
  publicClient: PublicClient;
  getWalletClient: () => Promise<WalletClient | null>;
  
  // Utils
  clearError: () => void;
  formatAmount: (amount: bigint, decimals: number) => string;
  parseAmount: (amount: string, decimals: number) => bigint;

  // Legacy compatibility properties
  isWalletReady: boolean;

  // Legacy compatibility methods (mapped to new methods)
  createChama: (
    token: Address | null,
    contribution: string,
    securityDeposit: string,
    roundDuration: number,
    lateWindow: number,
    latePenalty: string,
    memberTarget: number
  ) => Promise<Address | undefined>;
  join: (chamaAddress: Address) => Promise<Hash | undefined>;
  leave: (chamaAddress: Address) => Promise<Hash | undefined>;
  getChamaInfo: (chamaAddress: Address) => Promise<{
    token: Address | null;
    contribution: bigint;
    securityDeposit: bigint;
    roundDuration: number;
    memberTarget: number;
    currentRound: number;
    totalMembers: number;
    isActive: boolean;
    creator: Address;
  }>;
  isMember: (chamaAddress: Address, userAddress: Address) => Promise<boolean>;
  hasContributed: (chamaAddress: Address, userAddress: Address, round: number) => Promise<boolean>;
}

/* === HOOK IMPLEMENTATION === */
export function useRosca(
  factoryAddress?: Address // Made optional for backward compatibility
): RoscaHook {
  const { primaryWallet } = useDynamicContext();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Clients
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain: citreaTestnet,
      transport: http(NETWORK_CONFIG.RPC_URL)
    });
  }, []);
  
  const getWalletClient = useCallback(async (): Promise<WalletClient | null> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      console.error('No primary wallet or not Ethereum wallet');
      return null;
    }
    
    try {
      console.log('🔗 Getting wallet client from Dynamic Labs...');
      const client = await primaryWallet.getWalletClient();
      console.log('✅ Wallet client obtained successfully');
      return client;
    } catch (error) {
      console.error('❌ Failed to get wallet client:', error);
      
      // Try to reconnect the wallet
      try {
        console.log('🔄 Attempting to reconnect wallet...');
        await primaryWallet.connector?.connect?.();
        const retryClient = await primaryWallet.getWalletClient();
        console.log('✅ Wallet client obtained after reconnection');
        return retryClient;
      } catch (retryError) {
        console.error('❌ Failed to reconnect and get wallet client:', retryError);
        return null;
      }
    }
  }, [primaryWallet]);
  
  // Contract instances
  const factoryContract = useMemo(() => {
    return getContract({
      address: CONTRACT_ADDRESSES.ROSCA_FACTORY,
      abi: FACTORY_ABI,
      client: publicClient
    });
  }, [publicClient]);
  
  const getROSCAContract = useCallback((roscaAddress: Address) => {
    return getContract({
      address: roscaAddress,
      abi: ROSCA_ABI,
      client: publicClient
    });
  }, [publicClient]);
  
  const usdcContract = useMemo(() => {
    return getContract({
      address: CONTRACT_ADDRESSES.USDC,
      abi: USDC_ABI,
      client: publicClient
    });
  }, [publicClient]);
  
  // Helpers
  const isConnected = Boolean(primaryWallet && isEthereumWallet(primaryWallet));
  const address = (primaryWallet?.address as Address) || null;
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  const formatAmount = useCallback((amount: bigint, decimals: number): string => {
    return formatUnits(amount, decimals);
  }, []);
  
  const parseAmount = useCallback((amount: string, decimals: number): bigint => {
    return parseUnits(amount, decimals);
  }, []);
  
  // Transaction wrapper
  const executeTransaction = async (
    txFunction: () => Promise<Hash>
  ): Promise<Hash | undefined> => {
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }
    
    const client = await getWalletClient();
    if (!client) {
      setError('Wallet client not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const hash = await txFunction();
      console.log('✅ Transaction submitted:', hash);
      
      // Wait for transaction confirmation
      console.log('⏳ Waiting for transaction confirmation...');
      await publicClient.waitForTransactionReceipt({ hash });
      console.log('✅ Transaction confirmed:', hash);
      
      return hash;
    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      
      // Parse error message
      let errorMessage = 'Transaction failed';
      if (err.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction';
      } else if (err.shortMessage) {
        errorMessage = err.shortMessage;
      }
      
      setError(errorMessage);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  // Factory Functions
  const createROSCA = useCallback(async (
    token: Address,
    contributionAmount: string,
    roundDuration: number,
    maxMembers: number
  ): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      // Factory only supports native ETH ROSCAs - token parameter is ignored
      const contributionWei = parseUnits(contributionAmount, 18); // Native ETH has 18 decimals
      const creationFee = parseEther('0.001'); // 0.001 ETH creation fee
      
      const factoryWithWallet = getContract({
        address: CONTRACT_ADDRESSES.ROSCA_FACTORY,
        abi: FACTORY_ABI,
        client: client
      });
      
      // Factory createROSCA expects only 3 parameters: contributionAmount, roundDuration, maxMembers
      return await factoryWithWallet.write.createROSCA([
        contributionWei,
        BigInt(roundDuration),
        BigInt(maxMembers)
      ], { value: creationFee });
    });
  }, [executeTransaction, getWalletClient]);
  
  // Helper method for creating native ETH ROSCAs
  const createNativeROSCA = useCallback(async (
    contributionAmount: string,
    roundDuration: number,
    maxMembers: number
  ): Promise<Hash | undefined> => {
    return createROSCA(
      '0x0000000000000000000000000000000000000000', // Native ETH token address
      contributionAmount,
      roundDuration,
      maxMembers
    );
  }, [createROSCA]);
  
  // Utility function to extract ROSCA address from transaction receipt
  const extractROSCAAddressFromReceipt = useCallback(async (txHash: Hash): Promise<Address | null> => {
    try {
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
      
      // ROSCACreated event signature: 0x1b1b671cffa95fbc16baba6325184278f6c7cf89547ade16bfed77418756cfc2
      const roscaCreatedEventSignature = '0x1b1b671cffa95fbc16baba6325184278f6c7cf89547ade16bfed77418756cfc2';
      
      const roscaCreatedLog = receipt.logs.find(log => 
        log.topics.length >= 4 && log.topics[0] === roscaCreatedEventSignature
      );
      
      if (roscaCreatedLog && roscaCreatedLog.topics[3]) {
        // Extract ROSCA address from the third indexed topic (topics[3] = roscaAddress)
        const roscaAddress = `0x${roscaCreatedLog.topics[3].slice(-40)}` as Address;
        console.log('✅ Extracted ROSCA address from receipt:', roscaAddress);
        return roscaAddress;
      }
      
      console.warn('⚠️ ROSCACreated event not found in transaction logs');
      console.log('📋 Available logs:', receipt.logs.map(log => ({ topics: log.topics, address: log.address })));
      return null;
    } catch (error) {
      console.error('❌ Failed to extract ROSCA address from receipt:', error);
      return null;
    }
  }, [publicClient]);
  
  // Utility function to discover ROSCAs created by a user
  // Note: Disabled automatic blockchain scanning due to RPC limitations on Citrea testnet
  const getUserCreatedROSCAs = useCallback(async (userAddress: Address): Promise<Address[]> => {
    console.log('🔍 ROSCA discovery requested for user:', userAddress);
    console.log('⚠️ Automatic blockchain scanning is disabled due to Citrea testnet RPC limitations.');
    console.log('💡 Please use manual ROSCA address management:');
    console.log('   - When you create a ROSCA, note down its address');
    console.log('   - Use the "Add ROSCA" function in the dashboard to track existing ROSCAs');
    console.log('   - ROSCAs will be stored locally for future sessions');
    
    // Return empty array - relying on manual management and localStorage
    return [];
  }, []);
  
  const getFactoryStats = useCallback(async (): Promise<FactoryStats | null> => {
    try {
      const stats = await factoryContract.read.getFactoryStats();
      return {
        totalCreated: Number(stats[0]),
        activeCount: Number(stats[1]),
        creationFeeAmount: stats[2],
        implementationAddress: stats[3]
      };
    } catch (err) {
      console.error('Failed to get factory stats:', err);
      return null;
    }
  }, [factoryContract]);
  
  // ROSCA Functions
  const joinROSCA = useCallback(async (roscaAddress: Address): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const roscaContract = getROSCAContract(roscaAddress);
      
      // New factory ROSCAs are native ETH only - no token approval needed
      // Just get the required deposit and send ETH with the transaction
      const roscaWithWallet = getContract({
        address: roscaAddress,
        abi: ROSCA_ABI,
        client: client
      });
      
      const requiredDeposit = await roscaContract.read.getRequiredDeposit();
      return await roscaWithWallet.write.joinROSCA({ value: requiredDeposit });
    });
  }, [executeTransaction, getWalletClient, getROSCAContract]);
  
  const contribute = useCallback(async (roscaAddress: Address): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const roscaContract = getROSCAContract(roscaAddress);
      
      // New factory ROSCAs are native ETH only
      // Just get the contribution amount and send ETH with the transaction
      const contributionAmount = await roscaContract.read.contributionAmount();
      
      const roscaWithWallet = getContract({
        address: roscaAddress,
        abi: ROSCA_ABI,
        client: client
      });
      
      // Send ETH with the contribution transaction
      return await roscaWithWallet.write.contribute({ value: contributionAmount });
    });
  }, [executeTransaction, getWalletClient, getROSCAContract]);
  
  const startROSCA = useCallback(async (roscaAddress: Address): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const roscaWithWallet = getContract({
        address: roscaAddress,
        abi: ROSCA_ABI,
        client: client
      });
      
      return await roscaWithWallet.write.startROSCA();
    });
  }, [executeTransaction, getWalletClient]);
  
  const forceStart = useCallback(async (roscaAddress: Address): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const roscaWithWallet = getContract({
        address: roscaAddress,
        abi: ROSCA_ABI,
        client: client
      });
      
      return await roscaWithWallet.write.forceStart();
    });
  }, [executeTransaction, getWalletClient]);
  
  const completeRound = useCallback(async (roscaAddress: Address): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const roscaWithWallet = getContract({
        address: roscaAddress,
        abi: ROSCA_ABI,
        client: client
      });
      
      return await roscaWithWallet.write.completeRound();
    });
  }, [executeTransaction, getWalletClient]);
  
  // View Functions
  const getROSCAInfo = useCallback(async (roscaAddress: Address): Promise<ROSCAInfo | null> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      
      // First check if this is a valid enhanced ROSCA contract by testing if it has the new functions
      try {
        // Test call to verify this is an enhanced ROSCA contract
        await contract.read.status();
      } catch (statusError: any) {
        console.warn(`⚠️ Contract at ${roscaAddress} appears to be an old ROSCA contract without enhanced features. Skipping.`);
        console.warn('This is likely an old contract from before the migration to enhanced ROSCA system.');
        return null;
      }
      
      // Native ETH ROSCAs don't have a token function - they are native ETH only
      const [
        contributionAmount,
        roundDuration,
        maxMembers,
        status,
        currentRound,
        totalMembers,
        totalRounds,
        recruitmentCompleteTime,
        nextPayoutIndex
      ] = await Promise.all([
        contract.read.contributionAmount(),
        contract.read.roundDuration(),
        contract.read.maxMembers(),
        contract.read.status(),
        contract.read.currentRound(),
        contract.read.totalMembers(),
        contract.read.totalRounds(),
        contract.read.recruitmentCompleteTime(),
        contract.read.nextPayoutIndex()
      ]);
      
      return {
        token: '0x0000000000000000000000000000000000000000', // Native ETH address
        contributionAmount,
        roundDuration: Number(roundDuration),
        maxMembers: Number(maxMembers),
        status: Number(status) as ROSCAStatus,
        currentRound: Number(currentRound),
        totalMembers: Number(totalMembers),
        totalRounds: Number(totalRounds),
        recruitmentCompleteTime: Number(recruitmentCompleteTime),
        nextPayoutIndex: Number(nextPayoutIndex)
      };
    } catch (err) {
      console.error('Failed to get ROSCA info:', err);
      return null;
    }
  }, [getROSCAContract]);
  
  const getMemberInfo = useCallback(async (
    roscaAddress: Address, 
    memberAddress: Address
  ): Promise<MemberInfo | null> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      const memberInfo = await contract.read.members([memberAddress]);
      
      return {
        isActive: memberInfo[0],
        totalContributions: memberInfo[3], // totalContributions is at index 3
        roundsPaid: Number(memberInfo[4]), // roundsPaid is at index 4
        missedRounds: Number(memberInfo[5]), // missedRounds is at index 5
        hasReceivedPayout: memberInfo[6], // hasReceivedPayout is at index 6
        payoutRound: Number(memberInfo[7]) // payoutRound is at index 7
      };
    } catch (err) {
      console.error('Failed to get member info:', err);
      return null;
    }
  }, [getROSCAContract]);
  
  const getRoundInfo = useCallback(async (
    roscaAddress: Address, 
    roundNumber: number
  ): Promise<RoundInfo | null> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      const info = await contract.read.getRoundInfo([BigInt(roundNumber)]);
      
      return {
        startTime: Number(info[0]),
        deadline: Number(info[1]),
        winner: info[2],
        totalPot: info[3],
        contributionsReceived: Number(info[4]),
        isCompleted: info[5]
      };
    } catch (err) {
      console.error('Failed to get round info:', err);
      return null;
    }
  }, [getROSCAContract]);
  
  const getMembers = useCallback(async (roscaAddress: Address): Promise<Address[]> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      const totalMembers = await contract.read.totalMembers();
      const members: Address[] = [];
      
      // Get each member address from the membersList array
      for (let i = 0; i < Number(totalMembers); i++) {
        try {
          const memberAddress = await contract.read.membersList([BigInt(i)]);
          members.push(memberAddress);
        } catch (error) {
          console.warn(`Failed to get member at index ${i}:`, error);
        }
      }
      
      return members;
    } catch (err) {
      console.error('Failed to get members:', err);
      return [];
    }
  }, [getROSCAContract]);
  
  const getRequiredDeposit = useCallback(async (roscaAddress: Address): Promise<bigint | null> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      return await contract.read.getRequiredDeposit();
    } catch (err) {
      console.error('Failed to get required deposit:', err);
      return null;
    }
  }, [getROSCAContract]);
  
  const getTimeUntilStart = useCallback(async (roscaAddress: Address): Promise<number | null> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      const time = await contract.read.getTimeUntilStart();
      return Number(time);
    } catch (err) {
      console.error('Failed to get time until start:', err);
      return null;
    }
  }, [getROSCAContract]);
  
  const getTimeUntilRoundEnd = useCallback(async (roscaAddress: Address): Promise<number | null> => {
    try {
      const contract = getROSCAContract(roscaAddress);
      const time = await contract.read.getTimeUntilRoundEnd();
      return Number(time);
    } catch (err) {
      console.error('Failed to get time until round end:', err);
      return null;
    }
  }, [getROSCAContract]);
  
  const hasContributedThisRound = useCallback(async (
    roscaAddress: Address, 
    memberAddress: Address
  ): Promise<boolean> => {
    try {
      // Since there's no direct function in the ABI, we'll check the member's
      // contribution status by looking at recent ContributionMade events
      const contract = getROSCAContract(roscaAddress);
      const currentRound = await contract.read.currentRound();
      
      // Get recent blocks to search for contribution events
      const currentBlock = await publicClient.getBlockNumber();
      const fromBlock = currentBlock - 1000n; // Search last ~1k blocks
      
      try {
        const logs = await publicClient.getLogs({
          address: roscaAddress,
          event: {
            type: 'event',
            name: 'ContributionMade',
            inputs: [
              { name: 'member', type: 'address', indexed: true },
              { name: 'roundNumber', type: 'uint256', indexed: true },
              { name: 'amount', type: 'uint256', indexed: false }
            ]
          },
          args: {
            member: memberAddress,
            roundNumber: currentRound
          },
          fromBlock,
          toBlock: 'latest'
        });
        
        return logs.length > 0;
      } catch (eventError) {
        // If event querying fails, fall back to checking if roundsPaid >= currentRound
        // This is less accurate but provides a reasonable approximation
        const memberInfo = await contract.read.members([memberAddress]);
        const roundsPaid = Number(memberInfo[4]); // roundsPaid is at index 4
        return roundsPaid >= Number(currentRound);
      }
    } catch (err) {
      console.error('Failed to check contribution status:', err);
      return false;
    }
  }, [getROSCAContract, publicClient]);
  
  // Token Functions
  const getUSDCBalance = useCallback(async (userAddress: Address): Promise<bigint | null> => {
    try {
      return await usdcContract.read.balanceOf([userAddress]);
    } catch (err) {
      console.error('Failed to get USDC balance:', err);
      return null;
    }
  }, [usdcContract]);
  
  const getUSDCAllowance = useCallback(async (
    owner: Address, 
    spender: Address
  ): Promise<bigint | null> => {
    try {
      return await usdcContract.read.allowance([owner, spender]);
    } catch (err) {
      console.error('Failed to get USDC allowance:', err);
      return null;
    }
  }, [usdcContract]);
  
  const approveUSDC = useCallback(async (
    spender: Address, 
    amount: string
  ): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      
      const usdcWithWallet = getContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        client: client
      });
      
      return await usdcWithWallet.write.approve([spender, amountWei]);
    });
  }, [executeTransaction, getWalletClient]);
  
  const mintUSDC = useCallback(async (amount: string): Promise<Hash | undefined> => {
    const client = await getWalletClient();
    if (!client) return;
    
    return executeTransaction(async () => {
      const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
      
      const usdcWithWallet = getContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        client: client
      });
      
      return await usdcWithWallet.write.mint([address!, amountWei]);
    });
  }, [executeTransaction, getWalletClient, address]);

  // Legacy compatibility methods (mapped to new methods)
  const createChama: RoscaHook['createChama'] = useCallback(async (
    token: Address | null,
    contribution: string,
    securityDeposit: string, // Ignored in new system
    roundDuration: number,
    lateWindow: number, // Ignored in new system
    latePenalty: string, // Ignored in new system
    memberTarget: number
  ): Promise<Address | undefined> => {
    console.warn('⚠️ Using legacy createChama - some parameters are ignored in enhanced ROSCA');
    
    // Use USDC by default if token is null (legacy behavior)
    const tokenAddress = token || CONTRACT_ADDRESSES.USDC;
    
    const hash = await createROSCA(
      tokenAddress,
      contribution,
      roundDuration,
      memberTarget
    );
    
    if (!hash) return undefined;
    
    // TODO: Extract address from transaction receipt/logs
    // For now, we return undefined and let the caller handle this
    console.warn('⚠️ Legacy createChama does not return ROSCA address - please use createROSCA instead');
    return undefined;
  }, [createROSCA]);
  
  const join = useCallback((chamaAddress: Address) => {
    return joinROSCA(chamaAddress);
  }, [joinROSCA]);
  
  const leave = useCallback(async (chamaAddress: Address): Promise<Hash | undefined> => {
    console.warn('⚠️ Leave functionality not available in enhanced ROSCA');
    return undefined;
  }, []);
  
  const getChamaInfo = useCallback(async (chamaAddress: Address) => {
    try {
      const info = await getROSCAInfo(chamaAddress);
      if (!info) {
        console.error('Failed to get ROSCA info for:', chamaAddress);
        throw new Error('Failed to get ROSCA info');
      }
      
      // Get the actual owner/creator from the contract
      let creator: Address = '0x0000000000000000000000000000000000000000';
      try {
        const contract = getROSCAContract(chamaAddress);
        creator = await contract.read.owner();
        console.log('✅ Retrieved actual creator/owner from contract:', creator);
      } catch (err) {
        console.warn('Could not fetch owner from contract:', err);
        // Fallback: try to get first member as creator (legacy behavior)
        try {
          const members = await getMembers(chamaAddress);
          if (members.length > 0) {
            creator = members[0]; // Fallback: First member
            console.log('⚠️ Fallback: Using first member as creator:', creator);
          }
        } catch (memberErr) {
          console.warn('Could not fetch members either:', memberErr);
        }
      }
      
      // Map to legacy format
      return {
        token: info.token,
        contribution: info.contributionAmount,
        securityDeposit: info.contributionAmount * 2n, // Deposit is 2x contribution
        roundDuration: info.roundDuration,
        memberTarget: info.maxMembers,
        currentRound: info.currentRound,
        totalMembers: info.totalMembers,
        isActive: info.status === ROSCAStatus.ACTIVE || info.status === ROSCAStatus.RECRUITING,
        creator
      };
    } catch (err) {
      console.error('Failed to get chama info:', err);
      throw new Error('Failed to get ROSCA info');
    }
  }, [getROSCAInfo, getMembers]);
  
  const isMember = useCallback(async (chamaAddress: Address, userAddress: Address): Promise<boolean> => {
    const memberInfo = await getMemberInfo(chamaAddress, userAddress);
    return memberInfo?.isActive || false;
  }, [getMemberInfo]);
  
  const hasContributed = useCallback(async (chamaAddress: Address, userAddress: Address, round: number): Promise<boolean> => {
    return hasContributedThisRound(chamaAddress, userAddress);
  }, [hasContributedThisRound]);
  
  return {
    // Factory functions
    createROSCA,
    createNativeROSCA, // Helper for native ETH ROSCAs
    getFactoryStats,
    
    // ROSCA functions
    joinROSCA,
    contribute,
    startROSCA,
    forceStart,
    completeRound,
    
    // View functions
    getROSCAInfo,
    getMemberInfo,
    getRoundInfo,
    getMembers,
    getRequiredDeposit,
    getTimeUntilStart,
    getTimeUntilRoundEnd,
    hasContributedThisRound,
    
    // Token functions
    getUSDCBalance,
    getUSDCAllowance,
    approveUSDC,
    mintUSDC,
    
    // State
    isLoading,
    error,
    isConnected,
    address,
    publicClient,
    getWalletClient,
    
    // Utils
    clearError,
    formatAmount,
    parseAmount,
    
    // Utility functions
    extractROSCAAddressFromReceipt,
    getUserCreatedROSCAs,
    
    // Legacy compatibility
    isWalletReady: isConnected,
    createChama,
    join,
    leave,
    getChamaInfo,
    isMember,
    hasContributed
  };
}
