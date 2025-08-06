import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { parseAbi, parseEther, formatEther } from "viem";
import type { Abi, Address, Hash } from "viem";
import React, { useState, useCallback, useEffect } from "react";
import { CONTRACT_ADDRESSES, TRANSACTION_CONFIG } from "../config";

// Contract configuration
export const ROSCA_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.ROSCA;

// Define the ABI directly to avoid JSON import issues
export const roscaAbi = parseAbi([
  "struct GroupView { uint40 id; uint40 roundLength; uint40 nextDue; address token; uint96 contribution; uint8 currentRound; uint8 maxMembers; bool isActive; address creator; uint256 memberCount; uint256 totalPaidOut; uint256 groupDisputeCount; }",
  "event Contrib(uint256 indexed id, address indexed member, uint256 amount)",
  "function contribute(uint256 gid) external payable",
  "event Created(uint256 indexed id, address indexed creator, address indexed token, uint256 contribution, uint256 roundLength, uint8 maxMembers)",
  "function createDispute(uint256 gid, address defendant, string reason) external returns (uint256 disputeId)",
  "function createGroup(address _token, uint96 _contribution, uint40 _roundLength, uint8 _maxMembers) external payable returns (uint256 gid)",
  "event DisputeCreated(uint256 indexed disputeId, uint256 indexed groupId, address indexed complainant, address defendant, string reason)",
  "event DisputeResolved(uint256 indexed disputeId, bool upheld)",
  "event DisputeVoted(uint256 indexed disputeId, address indexed voter, bool support)",
  "event GroupStatusChanged(uint256 indexed id, bool isActive)",
  "event Joined(uint256 indexed id, address indexed member)",
  "function joinGroup(uint256 gid) external payable",
  "function kickMember(uint256 gid, address member) external",
  "event Leave(uint256 indexed id, address indexed member)",
  "function leaveGroup(uint256 gid) external",
  "event Payout(uint256 indexed id, address indexed recipient, uint256 amount, uint8 round)",
  "function rageQuit(uint256 gid) external",
  "event RoundLenChangeScheduled(uint256 indexed id, uint256 newLength, uint256 activates)",
  "function scheduleRoundLength(uint256 gid, uint40 newLen) external",
  "function setGroupStatus(uint256 gid, bool _isActive) external",
  "function voteOnDispute(uint256 disputeId, bool support) external",
  "function disputeCount() external view returns (uint256)",
  "function disputes(uint256) external view returns (uint256 groupId, address complainant, address defendant, string reason, uint8 status, uint256 createdAt, uint256 votesFor, uint256 votesAgainst)",
  "function getDispute(uint256 disputeId) external view returns (uint256 groupId, address complainant, address defendant, string reason, uint8 status, uint256 createdAt, uint256 votesFor, uint256 votesAgainst)",
  "function getGroupDetails(uint256 gid) external view returns (GroupView)",
  "function getGroupMembers(uint256 gid) external view returns (address[])",
  "function groupCount() external view returns (uint256)",
  "function groups(uint256) external view returns (uint40 id, uint40 roundLength, uint40 nextDue, address token, uint96 contribution, uint8 currentRound, uint8 maxMembers, bool isActive, address creator, uint256 memberCount, uint256 totalPaidOut, uint256 groupDisputeCount, uint40 newRoundLength, uint40 changeActivates)",
  "function hasVotedOnDispute(uint256 disputeId, address voter) external view returns (bool)"
]);
// Enhanced TypeScript interfaces
export interface RoscaGroup {
  id: number;
  roundLength: number;
  nextDue: number;
  token: Address;
  contribution: bigint;
  currentRound: number;
  maxMembers: number;
  isActive: boolean;
  creator: Address;
  memberCount: bigint;
  totalPaidOut: bigint;
  groupDisputeCount: bigint;
  members?: Address[];
}

export interface CreateGroupParams {
  token: Address;
  contribution: string; // in ETH/token units
  roundLength: number; // in seconds
  maxMembers: number; // 2-50
}

export interface DisputeInfo {
  id: number;
  groupId: number;
  complainant: Address;
  defendant: Address;
  reason: string;
  status: 'None' | 'Active' | 'Resolved' | 'Rejected';
  createdAt: number;
  votesFor: number;
  votesAgainst: number;
}

export interface ContractError extends Error {
  code?: string;
  reason?: string;
}

/**
 * Custom hook for interacting with the enhanced ROSCA smart contract
 * Provides functions for all group operations, disputes, and management
 */
export function useRosca() {
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ContractError | null>(null);
  const [groupCount, setGroupCount] = useState<number>(0);
  const [balance, setBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Clear error when wallet changes
  useEffect(() => {
    setError(null);
  }, [primaryWallet]);

  /**
   * Get user's cBTC balance using Dynamic's getPublicClient
   */
  const getBalance = useCallback(async (): Promise<string> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      console.log('🔍 getBalance: No wallet or not Ethereum wallet');
      setBalance('0');
      return '0';
    }

    try {
      setIsLoadingBalance(true);
      console.log('🔍 getBalance: Fetching balance for address:', primaryWallet.address);
      
      // Use Dynamic's getPublicClient method as per documentation
      const publicClient = await primaryWallet.getPublicClient();
      console.log('🔍 getBalance: Got public client:', publicClient);
      
      const balance = await publicClient.getBalance({
        address: primaryWallet.address as Address
      });
      
      console.log('🔍 getBalance: Raw balance:', balance);
      const formattedBalance = formatEther(balance);
      console.log('🔍 getBalance: Formatted balance:', formattedBalance);
      
      setBalance(formattedBalance);
      return formattedBalance;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      setBalance('0');
      return '0';
    } finally {
      setIsLoadingBalance(false);
    }
  }, [primaryWallet]);

  /**
   * Manually refresh balance
   */
  const refreshBalance = useCallback(async (): Promise<void> => {
    console.log('🔄 Manual balance refresh triggered');
    await getBalance();
  }, [getBalance]);

  // Auto-fetch balance when wallet connects
  useEffect(() => {
    if (primaryWallet && isEthereumWallet(primaryWallet)) {
      console.log('🔍 useEffect: Auto-fetching balance for wallet:', primaryWallet.address);
      getBalance();
    } else {
      console.log('🔍 useEffect: No wallet connected, setting balance to 0');
      setBalance('0');
    }
  }, [primaryWallet, getBalance]);



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
   * Create a new ROSCA group with enhanced parameters
   * @param params - Group creation parameters including maxMembers
   * @returns Object with transaction hash and group ID if successful
   */
  const createGroup = useCallback(async (params: CreateGroupParams): Promise<{ hash: Hash; groupId?: number } | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get both public and wallet clients as per Dynamic documentation
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();
      
      console.log('🔍 createGroup: Creating group with params:', params);
      
      // Convert contribution to wei for ETH, or token units for ERC20
      const contributionWei = parseEther(params.contribution);
      console.log('🔍 createGroup: Contribution in wei:', contributionWei);
      
      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "createGroup",
        args: [
          params.token,
          contributionWei,
          BigInt(params.roundLength),
          params.maxMembers
        ],
      } as any);

      console.log('🔍 createGroup: Transaction hash:', hash);

      // Wait for transaction to be mined and confirmed
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TRANSACTION_CONFIG.TIMEOUT_MS,
      });

      console.log('✅ createGroup: Transaction confirmed:', receipt);

      // Extract group ID from the Created event logs
      let extractedGroupId: number | undefined;
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          // Look for the Created event in the logs
          for (const log of receipt.logs) {
            try {
              // Check if this log is from our contract
              if (log.address.toLowerCase() !== ROSCA_CONTRACT_ADDRESS.toLowerCase()) {
                continue;
              }

              const decodedLog = publicClient.decodeEventLog({
                abi: roscaAbi,
                data: log.data,
                topics: log.topics,
              });
              
              console.log('🔍 createGroup: Decoded log:', decodedLog);
              
              if (decodedLog.eventName === 'Created') {
                extractedGroupId = Number(decodedLog.args.id);
                console.log('🔍 createGroup: Extracted group ID:', extractedGroupId);
                break;
              }
            } catch (decodeError) {
              console.log('🔍 createGroup: Could not decode log:', decodeError);
              continue;
            }
          }
        } catch (logError) {
          console.warn('⚠️ createGroup: Could not decode logs:', logError);
        }
      }

      // Automatically activate the group after creation (groups should be active by default, but just in case)
      if (extractedGroupId !== undefined) {
        try {
          console.log('🔄 createGroup: Ensuring group is active:', extractedGroupId);
          const activateHash = await walletClient.writeContract({
            address: ROSCA_CONTRACT_ADDRESS,
            abi: roscaAbi,
            functionName: "setGroupStatus",
            args: [BigInt(extractedGroupId), true],
          } as any);

          console.log('🔍 createGroup: Group activation hash:', activateHash);
          
          // Wait for activation transaction
          await publicClient.waitForTransactionReceipt({
            hash: activateHash,
            timeout: TRANSACTION_CONFIG.TIMEOUT_MS,
          });
          
          console.log('✅ createGroup: Group activated successfully');
        } catch (activateError) {
          console.error('⚠️ createGroup: Failed to activate group, but creation succeeded:', activateError);
          // Don't throw here - group creation was successful, activation can be done manually
        }
      } else {
        console.warn('⚠️ createGroup: Could not extract group ID from receipt, group may need manual activation');
      }

      // Refresh balance after successful transaction
      await getBalance();

      return { hash, groupId: extractedGroupId };
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ createGroup error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, getBalance]);

  /**
   * Join an existing ROSCA group
   * @param groupId - The group ID to join
   * @returns Transaction hash if successful
   */
  const joinGroup = useCallback(async (groupId: number): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();

      console.log('🔍 joinGroup: Joining group:', groupId);

      // First, get the group info to determine contribution amount and token
      const groupDetails = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "getGroupDetails",
        args: [BigInt(groupId)],
      }) as {
        id: number;
        roundLength: number;
        nextDue: number;
        token: Address;
        contribution: bigint;
        currentRound: number;
        maxMembers: number;
        isActive: boolean;
        creator: Address;
        memberCount: bigint;
        totalPaidOut: bigint;
        groupDisputeCount: bigint;
      };

      const contribution = groupDetails.contribution;
      const token = groupDetails.token;
      const isActive = groupDetails.isActive;

      if (!isActive) {
        console.log('❌ joinGroup: Group is not active:', {
          groupId,
          isActive,
          creator: groupDetails.creator,
          memberCount: Number(groupDetails.memberCount),
          maxMembers: groupDetails.maxMembers
        });
        throw new Error(`Group ${groupId} is currently closed to new members. The group creator may need to activate it first.`);
      }

      console.log('🔍 joinGroup: Group contribution amount:', contribution);

      // If token is zero address, it's ETH - send contribution as value
      const isEthGroup = token === "0x0000000000000000000000000000000000000000";

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "joinGroup",
        args: [BigInt(groupId)],
        value: isEthGroup ? contribution : undefined,
      } as any);

      console.log('🔍 joinGroup: Transaction hash:', hash);

      // Wait for transaction to be mined and confirmed
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TRANSACTION_CONFIG.TIMEOUT_MS,
      });

      console.log('✅ joinGroup: Transaction confirmed:', receipt);

      // Refresh balance after successful transaction
      await getBalance();

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ joinGroup error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, getBalance]);

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
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();

      console.log('🔍 contribute: Contributing to group:', groupId);

      // First, get the group info to determine contribution amount
      const groupInfo = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "getGroupDetails",
        args: [BigInt(groupId)],
      }) as RoscaGroup;

      const contribution = groupInfo.contribution;
      const token = groupInfo.token;

      console.log('🔍 contribute: Group contribution amount:', contribution);

      // If token is zero address, it's ETH
      const isEthGroup = token === "0x0000000000000000000000000000000000000000";

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "contribute",
        args: [BigInt(groupId)],
        value: isEthGroup ? contribution : undefined,
      } as any);

      console.log('🔍 contribute: Transaction hash:', hash);

      // Wait for transaction to be mined and confirmed
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TRANSACTION_CONFIG.TIMEOUT_MS,
      });

      console.log('✅ contribute: Transaction confirmed:', receipt);

      // Refresh balance after successful transaction
      await getBalance();

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ contribute error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, getBalance]);

  /**
   * Send a simple transaction (for testing or transfers)
   * Following Dynamic documentation pattern
   */
  const sendTransaction = useCallback(async (to: Address, amount: string): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const publicClient = await primaryWallet.getPublicClient();
      const walletClient = await primaryWallet.getWalletClient();

      console.log('🔍 sendTransaction: Sending', amount, 'cBTC to', to);

      const transaction = {
        to: to,
        value: amount ? parseEther(amount) : undefined,
      };

      const hash = await walletClient.sendTransaction(transaction);
      console.log('🔍 sendTransaction: Transaction hash:', hash);

      // Wait for transaction to be mined and confirmed
      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
        timeout: TRANSACTION_CONFIG.TIMEOUT_MS,
      });

      console.log('✅ sendTransaction: Transaction confirmed:', receipt);

      // Refresh balance after successful transaction
      await getBalance();

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ sendTransaction error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet, getBalance]);

  /**
   * Get comprehensive information about a specific ROSCA group
   * @param groupId - The group ID to query
   * @returns Enhanced group information
   */
  const getGroupInfo = useCallback(async (groupId: number): Promise<RoscaGroup | null> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return null;
    }

    // Validate groupId
    if (!groupId || isNaN(groupId) || groupId < 0) {
      console.warn(`🔍 getGroupInfo: Invalid group ID: ${groupId}`);
      return null;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      
      const groupData = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "getGroupDetails",
        args: [BigInt(groupId)],
      }) as RoscaGroup;

      console.log(`🔍 getGroupInfo: Raw contract data for group ${groupId}:`, {
        id: groupData.id,
        isActive: groupData.isActive,
        isActiveType: typeof groupData.isActive,
        creator: groupData.creator,
        memberCount: groupData.memberCount,
        maxMembers: groupData.maxMembers,
        currentRound: groupData.currentRound
      });

      if (!groupData || groupData.id === 0) {
        console.warn(`🔍 getGroupInfo: Group ${groupId} does not exist on contract`);
        return null; // Group doesn't exist
      }

      // Also get the members list
      const members = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "getGroupMembers",
        args: [BigInt(groupId)],
      }) as readonly Address[];

      const groupResult = {
        id: Number(groupData.id),
        roundLength: Number(groupData.roundLength),
        nextDue: Number(groupData.nextDue),
        token: groupData.token as Address,
        contribution: groupData.contribution as bigint,
        currentRound: Number(groupData.currentRound),
        maxMembers: Number(groupData.maxMembers),
        isActive: groupData.isActive as boolean,
        creator: groupData.creator as Address,
        memberCount: groupData.memberCount as bigint,
        totalPaidOut: groupData.totalPaidOut as bigint,
        groupDisputeCount: groupData.groupDisputeCount as bigint,
        members: members as Address[],
      };

      // Debug logging for group status
      console.log(`🔍 Group ${groupId} status:`, {
        isActive: groupResult.isActive,
        creator: groupResult.creator,
        memberCount: Number(groupResult.memberCount),
        currentRound: groupResult.currentRound,
        maxMembers: groupResult.maxMembers
      });

      return groupResult;
    } catch (err) {
      console.error("Error fetching group info:", err);
      return null;
    }
  }, [primaryWallet]);

  /**
   * Get information about a specific dispute
   * @param disputeId - The dispute ID to query
   * @returns Dispute information
   */
  const getDisputeInfo = useCallback(async (disputeId: number): Promise<DisputeInfo | null> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return null;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      
      const disputeData = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "getDispute",
        args: [BigInt(disputeId)],
      }) as readonly [bigint, Address, Address, string, number, bigint, bigint, bigint];

      if (!disputeData || disputeData[0] === 0n) {
        return null; // Dispute doesn't exist
      }

      const statusMap = ['None', 'Active', 'Resolved', 'Rejected'] as const;

      return {
        id: disputeId,
        groupId: Number(disputeData[0]),
        complainant: disputeData[1] as Address,
        defendant: disputeData[2] as Address,
        reason: disputeData[3] as string,
        status: statusMap[disputeData[4]] || 'None',
        createdAt: Number(disputeData[5]),
        votesFor: Number(disputeData[6]),
        votesAgainst: Number(disputeData[7]),
      };
    } catch (err) {
      console.error("Error fetching dispute info:", err);
      return null;
    }
  }, [primaryWallet]);

  /**
   * Check if user has voted on a specific dispute
   * @param disputeId - The dispute ID to check
   * @param voter - The voter address (defaults to current user)
   * @returns True if user has voted
   */
  const hasVotedOnDispute = useCallback(async (disputeId: number, voter?: Address): Promise<boolean> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return false;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      const voterAddress = voter || (primaryWallet.address as Address);
      
      const hasVoted = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "hasVotedOnDispute",
        args: [BigInt(disputeId), voterAddress],
      }) as boolean;

      return hasVoted;
    } catch (err) {
      console.error("Error checking vote status:", err);
      return false;
    }
  }, [primaryWallet]);

  /**
   * Get the total number of disputes created
   * @returns Total dispute count
   */
  const getDisputeCount = useCallback(async (): Promise<number> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return 0;
    }

    try {
      const publicClient = await primaryWallet.getPublicClient();
      
      const count = await publicClient.readContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "disputeCount",
        args: [],
      } as any) as bigint;

      return Number(count);
    } catch (err) {
      console.error("Error fetching dispute count:", err);
      return 0;
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
   * Create a dispute against another group member
   * @param groupId - The group ID where the dispute occurs
   * @param defendant - Address of the member being disputed
   * @param reason - Reason for the dispute
   * @returns Transaction hash if successful
   */
  const createDispute = useCallback(async (groupId: number, defendant: Address, reason: string): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      console.log('🔍 createDispute: Creating dispute in group:', groupId, 'against:', defendant);

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "createDispute",
        args: [BigInt(groupId), defendant, reason],
      } as any);

      console.log('🔍 createDispute: Transaction hash:', hash);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ createDispute error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Vote on a dispute
   * @param disputeId - The dispute ID to vote on
   * @param support - True to support the dispute, false to reject
   * @returns Transaction hash if successful
   */
  const voteOnDispute = useCallback(async (disputeId: number, support: boolean): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      console.log('🔍 voteOnDispute: Voting on dispute:', disputeId, 'support:', support);

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "voteOnDispute",
        args: [BigInt(disputeId), support],
      } as any);

      console.log('🔍 voteOnDispute: Transaction hash:', hash);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ voteOnDispute error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Set group status (active/inactive) - only for group creator
   * @param groupId - The group ID to modify
   * @param isActive - Whether the group should accept new members
   * @returns Transaction hash if successful
   */
  const setGroupStatus = useCallback(async (groupId: number, isActive: boolean): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      console.log('🔍 setGroupStatus: Setting group status:', groupId, 'active:', isActive);

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "setGroupStatus",
        args: [BigInt(groupId), isActive],
      } as any);

      console.log('🔍 setGroupStatus: Transaction hash:', hash);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ setGroupStatus error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);

  /**
   * Kick a member from the group - only for group creator, before round starts
   * @param groupId - The group ID
   * @param member - Address of the member to kick
   * @returns Transaction hash if successful
   */
  const kickMember = useCallback(async (groupId: number, member: Address): Promise<Hash | undefined> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      throw new Error("Wallet not connected or not Ethereum compatible");
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletClient = await primaryWallet.getWalletClient();
      
      console.log('🔍 kickMember: Kicking member:', member, 'from group:', groupId);

      const hash = await walletClient.writeContract({
        address: ROSCA_CONTRACT_ADDRESS,
        abi: roscaAbi,
        functionName: "kickMember",
        args: [BigInt(groupId), member],
      } as any);

      console.log('🔍 kickMember: Transaction hash:', hash);

      return hash;
    } catch (err) {
      const contractError = err as ContractError;
      console.error('❌ kickMember error:', contractError);
      setError(contractError);
      throw contractError;
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet]);
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
  const formatContribution = useCallback((contribution: bigint | undefined | null): string => {
    if (!contribution || contribution === undefined || contribution === null) {
      return "0.00";
    }
    try {
      return formatEther(contribution);
    } catch (error) {
      console.warn('Error formatting contribution:', error, 'value:', contribution);
      return "0.00";
    }
  }, []);

  /**
   * Check if current user is a member of a specific group
   * @param groupId - The group ID to check membership for
   * @returns True if user is a member, false otherwise
   */
  const isGroupMember = useCallback(async (groupId: number): Promise<boolean> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return false;
    }

    try {
      const groupInfo = await getGroupInfo(groupId);
      if (!groupInfo || !groupInfo.members) {
        return false;
      }

      const userAddress = primaryWallet.address.toLowerCase();
      return groupInfo.members.some(member => member.toLowerCase() === userAddress);
    } catch (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
  }, [primaryWallet, getGroupInfo]);

  /**
   * Check if current user is the creator of a specific group
   * @param groupId - The group ID to check creator status for
   * @returns True if user is the creator, false otherwise
   */
  const isGroupCreator = useCallback(async (groupId: number): Promise<boolean> => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      return false;
    }

    try {
      const groupInfo = await getGroupInfo(groupId);
      if (!groupInfo) {
        return false;
      }

      const userAddress = primaryWallet.address.toLowerCase();
      return groupInfo.creator.toLowerCase() === userAddress;
    } catch (error) {
      console.error('Error checking group creator status:', error);
      return false;
    }
  }, [primaryWallet, getGroupInfo]);

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
    
    // Core group operations
    createGroup,
    joinGroup,
    contribute,
    leaveGroup,
    rageQuit,
    
    // Group management (creator only)
    setGroupStatus,
    kickMember,
    
    // Dispute resolution
    createDispute,
    voteOnDispute,
    
    // View functions
    getGroupInfo,
    getGroupCount,
    getDisputeInfo,
    getDisputeCount,
    hasVotedOnDispute,
    
    // Membership checking
    isGroupMember,
    isGroupCreator,
    
    // Utility functions
    sendTransaction,
    getBalance,
    refreshBalance,
    getMaxSpendableAmount,
    formatContribution,
    
    // Constants
    contractAddress: ROSCA_CONTRACT_ADDRESS,
  };
}
