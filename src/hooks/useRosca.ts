import { useDynamicContext, useBalance } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { parseAbi, parseEther, formatEther } from "viem";
import type { Address, Hash } from "viem";
import React, { useState, useCallback, useEffect } from "react";

// Contract configuration
const ROSCA_CONTRACT_ADDRESS = "0xd1d60342211284859F6F857cdC866Dec7b8F483C" as Address;

// Define the ABI directly to avoid JSON import issues
const roscaAbi = parseAbi([
  "function createGroup(address _token, uint96 _contribution, uint40 _roundLength) external returns (uint256 gid)",
  "function contribute(uint256 gid) external payable",
  "function leaveGroup(uint256 gid) external",
  "function rageQuit(uint256 gid) external",
  "function scheduleRoundLength(uint256 gid, uint40 newLen) external",
  "function groupCount() external view returns (uint256)",
  "function groups(uint256) external view returns (uint40 id, uint40 roundLength, uint40 nextDue, address token, uint96 contribution, uint8 currentRound, uint40 newRoundLength, uint40 changeActivates)",
  "event Created(uint256 indexed id, address indexed token, uint256 contribution, uint256 roundLength)",
  "event Contrib(uint256 indexed id, address indexed member, uint256 amount)",
  "event Payout(uint256 indexed id, address indexed recipient, uint256 amount)",
  "event Leave(uint256 indexed id, address indexed member)"
]);

// TypeScript interfaces for better type safety
export interface RoscaGroup {
  id: number;
  roundLength: number;
  nextDue: number;
  token: Address;
  contribution: bigint;
  currentRound: number;
  newRoundLength: number;
  changeActivates: number;
  members?: Address[];
}

export interface CreateGroupParams {
  token: Address;
  contribution: string; // in ETH/token units
  roundLength: number; // in seconds
}

export interface ContractError extends Error {
  code?: string;
  reason?: string;
}

/**
 * Custom hook for interacting with the ROSCA smart contract using viem
 * Provides functions for creating groups, contributing, and reading group data
 */
export function useRosca() {
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ContractError | null>(null);
  const [groupCount, setGroupCount] = useState<number>(0);

  // Use Dynamic's built-in balance hook
  const { 
    data: balanceData, 
    isLoading: isLoadingBalance, 
    refetch: refreshBalance 
  } = useBalance({
    address: primaryWallet?.address as Address
  });

  // Format balance for display with debugging
  const balance = React.useMemo(() => {
    console.log('🔍 Balance data from Dynamic:', balanceData);
    if (!balanceData) {
      console.log('🔍 No balance data, returning 0');
      return '0';
    }
    
    try {
      const formattedBalance = formatEther(BigInt(balanceData.balance));
      console.log('🔍 Formatted balance:', formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('❌ Error formatting balance:', error);
      return '0';
    }
  }, [balanceData]);

  // Clear error when wallet changes
  useEffect(() => {
    setError(null);
  }, [primaryWallet]);

  /**
   * Get user's cBTC balance (using Dynamic's balance)
   */
  const getBalance = useCallback(async (): Promise<string> => {
    console.log('🔍 getBalance: Using Dynamic balance:', balance);
    return balance;
  }, [balance]);

  /**
   * Calculate maximum spendable amount (balance - estimated gas)
   */
  const getMaxSpendableAmount = useCallback(async (): Promise<string> => {
    try {
      const balanceNum = parseFloat(balance);
      console.log('🔍 getMaxSpendableAmount: Current balance:', balanceNum);
      
      // Estimate gas for createGroup transaction (conservative estimate)
      const estimatedGasInEth = 0.001; // ~0.001 cBTC for gas (conservative)
      
      const maxSpendable = Math.max(0, balanceNum - estimatedGasInEth);
      console.log('🔍 getMaxSpendableAmount: Max spendable:', maxSpendable);
      return maxSpendable.toFixed(6); // 6 decimal places for precision
    } catch (error) {
      console.error('Error calculating max spendable amount:', error);
      return '0';
    }
  }, [balance]);

  /**
   * Create a new ROSCA group
   * @param params - Group creation parameters
   * @returns Transaction hash if successful
   */
  const createGroup = useCallback(async (params: CreateGroupParams): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      // Convert contribution to wei for ETH, or token units for ERC20
      const contributionWei = parseEther(params.contribution);
      
      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "createGroup",
        args: [
          params.token,
          contributionWei,
          BigInt(params.roundLength)
        ],
      } as any);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Contribute to a ROSCA group
   * @param groupId - The group ID to contribute to
   * @returns Transaction hash if successful
   */
  const contribute = useCallback(async (groupId: number): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      const publicClient = await primaryWallet.getPublicClient();

      // First, get the group info to determine contribution amount
      const groupInfo = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "groups",
        args: [BigInt(groupId)],
      }) as readonly [number, number, number, Address, bigint, number, number, number];

      const contribution = groupInfo[4]; // contribution is at index 4
      const token = groupInfo[3]; // token is at index 3

      // If token is zero address, it's ETH
      const isEthGroup = token === "0x0000000000000000000000000000000000000000";

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "contribute",
        args: [BigInt(groupId)],
        value: isEthGroup ? contribution : undefined,
      } as any);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Get information about a specific ROSCA group
   * @param groupId - The group ID to query
   * @returns Group information
   */
  const getGroupInfo = useCallback(async (groupId: number): Promise<RoscaGroup | null> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return null;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      
      const groupData = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "groups",
        args: [BigInt(groupId)],
      }) as readonly [number, number, number, Address, bigint, number, number, number];

      if (!groupData || groupData[0] === 0) {
        return null; // Group doesn't exist
      }

      return {
        id: Number(groupData[0]),
        roundLength: Number(groupData[1]),
        nextDue: Number(groupData[2]),
        token: groupData[3] as Address,
        contribution: groupData[4] as bigint,
        currentRound: Number(groupData[5]),
        newRoundLength: Number(groupData[6]),
        changeActivates: Number(groupData[7]),
      };
    } catch (err) {
      console.error("Error fetching group info:", err);
      return null;
    }
  }, [primaryWallet]);

  /**
   * Get the total number of groups created
   * @returns Total group count
   */
  const getGroupCount = useCallback(async (): Promise<number> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return 0;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      
      const count = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "groupCount",
        args: [],
      } as any) as bigint;

      const countNumber = Number(count);
      setGroupCount(countNumber);
      return countNumber;
    } catch (err) {
      console.error("Error fetching group count:", err);
      return 0;
    }
  }, [primaryWallet]);

  /**
   * Leave a ROSCA group (only after being paid out)
   * @param groupId - The group ID to leave
   * @returns Transaction hash if successful
   */
  const leaveGroup = useCallback(async (groupId: number): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "leaveGroup",
        args: [BigInt(groupId)],
      } as any);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Rage quit from a group during the change window
   * @param groupId - The group ID to rage quit from
   * @returns Transaction hash if successful
   */
  const rageQuit = useCallback(async (groupId: number): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "rageQuit",
        args: [BigInt(groupId)],
      } as any);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Utility function to format contribution amounts
   * @param contribution - Contribution amount in wei
   * @returns Formatted string in ETH
   */
  const formatContribution = useCallback((contribution: bigint): string => {
    return formatEther(contribution);
  }, []);

  /**
   * Check if user is connected and has an Ethereum wallet
   */
  const isConnected = Boolean(primaryWallet && isEthereumWallet(primaryWallet));

  return {
    // State
    isLoading,
    error,
    isConnected,
    groupCount,
    balance,
    isLoadingBalance,
    
    // Contract interactions
    createGroup,
    contribute,
    getGroupInfo,
    getGroupCount,
    leaveGroup,
    rageQuit,
    
    // Balance functions
    getBalance,
    refreshBalance,
    getMaxSpendableAmount,
    
    // Utilities
    formatContribution,
    
    // Constants
    contractAddress: ROSCA_CONTRACT_ADDRESS,
  };
}
