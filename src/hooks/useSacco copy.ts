import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { 
  formatEther, 
  parseEther, 
  formatUnits, 
  parseUnits,
  createPublicClient,
  http,
  getContract,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient
} from 'viem';
// import { mainnet, sepolia } from 'viem/chains';
import { citreaTestnet } from 'viem/chains';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { NETWORK_CONFIG } from '../config';
import SACCO_ABI from '../abi/MicroSacco.json';

/* === CONFIG === */
export const USDC_DECIMALS = 6;
export const JOIN_FEE = parseEther('0.0001'); // 0.0001 ETH as per updated contract

export interface MemberData {
  isMember: boolean;
  ethDeposited: bigint;
  usdcBorrowed: bigint;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  time: string;
  status: string;
}

interface SaccoHook {
  /* state */
  isLoading: boolean;
  error: string | null;
  /* read */
  isConnected: boolean;
  address: Address | null;
  ethBalance: string;
  memberData: MemberData | null;
  maxBorrowableUSDC: bigint;
  totalOwedUSDC: bigint;
  treasuryBalance: bigint;
  currentInterestRate: bigint;
  transactions: Transaction[];
  publicClient: PublicClient;
  walletClient: Promise<WalletClient | null>;
  /* actions */
  connect: () => Promise<void>;
  refreshData: () => Promise<void>;
  join: () => Promise<Hash | undefined>;
  depositETH: (ethAmount: string) => Promise<Hash | undefined>;
  withdrawETH: (ethAmount: string) => Promise<Hash | undefined>;
  borrowUSDC: (usdcAmount: string) => Promise<Hash | undefined>;
  repayUSDC: (usdcAmount: string) => Promise<Hash | undefined>;
  fundTreasury: (usdcAmount: string) => Promise<Hash | undefined>;
}

/* ------------------------------------------------------------------ */
export function useSacco(contractAddress?: Address): SaccoHook {
  const { primaryWallet } = useDynamicContext();
  
  /* --- state --- */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState('0');
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [maxBorrowableUSDC, setMaxBorrowableUSDC] = useState<bigint>(0n);
  const [totalOwedUSDC, setTotalOwedUSDC] = useState<bigint>(0n);
  const [treasuryBalance, setTreasuryBalance] = useState<bigint>(0n);
  const [currentInterestRate, setCurrentInterestRate] = useState<bigint>(0n);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /* --- clients --- */
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain : citreaTestnet,
      transport: http(NETWORK_CONFIG.RPC_URL)
    });
  }, []);

  const walletClient = useMemo(async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return null;
    try {
      return await primaryWallet.getWalletClient();
    } catch (error) {
      console.error('Failed to get wallet client:', error);
      return null;
    }
  }, [primaryWallet]);

  const contract = useMemo(() => {
    if (!contractAddress) return null;
    return getContract({
      address: contractAddress,
      abi: SACCO_ABI,
      client: publicClient
    });
  }, [contractAddress, publicClient]);

  /* --- helpers --- */
  const isConnected = Boolean(primaryWallet && isEthereumWallet(primaryWallet));
  const address = primaryWallet?.address as Address | null;

  const fetchTransactions = useCallback(async () => {
    if (!address || !contract) return;

    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock > 100n ? latestBlock - 1000n : 0n; // Fetch last 1000 blocks

    const getLogsInChunks = async (event: any) => {
      const chunks = [];
      for (let fromBlockChunk = fromBlock; fromBlockChunk <= latestBlock; fromBlockChunk += 1000n) {
        const toBlock = fromBlockChunk + 999n > latestBlock ? latestBlock : fromBlockChunk + 999n;
        chunks.push(publicClient.getLogs({ address: contractAddress, event, fromBlock: fromBlockChunk, toBlock }));
      }
      return (await Promise.all(chunks)).flat();
    }

    const joinedEvents = await getLogsInChunks({
      type: 'event',
      name: 'Joined',
      inputs: [
        { name: 'member', type: 'address', indexed: true },
        { name: 'ethFee', type: 'uint256' }
      ]
    });

    const depositEvents = await getLogsInChunks({
      type: 'event',
      name: 'DepositETH',
      inputs: [
        { name: 'member', type: 'address', indexed: true },
        { name: 'ethAmount', type: 'uint256' }
      ]
    });

    const withdrawEvents = await getLogsInChunks({
      type: 'event',
      name: 'WithdrawETH',
      inputs: [
        { name: 'member', type: 'address', indexed: true },
        { name: 'ethAmount', type: 'uint256' }
      ]
    });

    const borrowEvents = await getLogsInChunks({
      type: 'event',
      name: 'BorrowUSDC',
      inputs: [
        { name: 'member', type: 'address', indexed: true },
        { name: 'usdcAmount', type: 'uint256' }
      ]
    });

    const repayEvents = await getLogsInChunks({
      type: 'event',
      name: 'RepayUSDC',
      inputs: [
        { name: 'member', type: 'address', indexed: true },
        { name: 'usdcAmount', type: 'uint256' }
      ]
    });

    const userAddress = address.toLowerCase();

    const allTxs = [
      ...joinedEvents
        .filter(e => e.args.member?.toLowerCase() === userAddress)
        .map(e => ({
          id: e.transactionHash!,
          type: 'Join',
          amount: `${formatEther(e.args.ethFee!)} cBTC`,
          time: new Date().toLocaleString(), // Placeholder, we need block timestamp
          status: 'Confirmed'
        })),
      ...depositEvents
        .filter(e => e.args.member?.toLowerCase() === userAddress)
        .map(e => ({
          id: e.transactionHash!,
          type: 'Deposit',
          amount: `${formatEther(e.args.ethAmount!)} cBTC`,
          time: new Date().toLocaleString(), // Placeholder, we need block timestamp
          status: 'Confirmed'
        })),
      ...withdrawEvents
        .filter(e => e.args.member?.toLowerCase() === userAddress)
        .map(e => ({
          id: e.transactionHash!,
          type: 'Withdraw',
          amount: `${formatEther(e.args.ethAmount!)} cBTC`,
          time: new Date().toLocaleString(), // Placeholder, we need block timestamp
          status: 'Confirmed'
        })),
      ...borrowEvents
        .filter(e => e.args.member?.toLowerCase() === userAddress)
        .map(e => ({
          id: e.transactionHash!,
          type: 'Borrow',
          amount: `${formatUnits(e.args.usdcAmount!, USDC_DECIMALS)} USDC`,
          time: new Date().toLocaleString(), // Placeholder, we need block timestamp
          status: 'Confirmed'
        })),
      ...repayEvents
        .filter(e => e.args.member?.toLowerCase() === userAddress)
        .map(e => ({
          id: e.transactionHash!,
          type: 'Repay',
          amount: `${formatUnits(e.args.usdcAmount!, USDC_DECIMALS)} USDC`,
          time: new Date().toLocaleString(), // Placeholder, we need block timestamp
          status: 'Confirmed'
        }))
    ];
    // TODO: Sort by block number
    setTransactions(allTxs);

  }, [address, contract, publicClient]);

  /* --- read data --- */
  const refreshData = useCallback(async () => {
    if (!address || !contract) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all data in parallel
      console.log('Fetching data for address:', address);
      console.log('Contract address:', contractAddress);
      console.log('Public client chain ID:', publicClient.chain.id);
      const [
        balance,
        member,
        maxUSDC,
        owedUSDC,
        treasury,
        rate
      ] = await Promise.all([
        publicClient.getBalance({ address }),
        publicClient.readContract({
          address: contractAddress,
          abi: SACCO_ABI,
          functionName: 'members',
          args: [address]
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: SACCO_ABI,
          functionName: 'maxUSDC',
          args: [address]
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: SACCO_ABI,
          functionName: 'totalUSDCOwed',
          args: [address]
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: SACCO_ABI,
          functionName: 'treasuryUSDC'
        }),
        publicClient.readContract({
          address: contractAddress,
          abi: SACCO_ABI,
          functionName: 'globalRateBps'
        })
      ]);

      setEthBalance(formatEther(balance));
      setMemberData({
        isMember: member[0],
        ethDeposited: member[1],
        usdcBorrowed: member[2]
      });
      setMaxBorrowableUSDC(maxUSDC);
      setTotalOwedUSDC(owedUSDC);
      setTreasuryBalance(treasury);
      setCurrentInterestRate(rate);

      // fetchTransactions is now called explicitly from Dashboard.tsx

    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err?.message || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [address, contract, publicClient]);

  // Removed useEffect that calls refreshData on mount

  /* --- transaction wrapper --- */
  const executeTransaction = async (
    txFunction: () => Promise<Hash>
  ): Promise<Hash | undefined> => {
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }

    if (!contractAddress) {
      setError('Contract not available');
      return;
    }

    const client = await walletClient;
    if (!client) {
      setError('Wallet client not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const hash = await txFunction();
      
      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh data after successful transaction
      await refreshData();
      
      return hash;
    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err?.shortMessage || err?.message || 'Transaction failed');
      return undefined;
    } finally {
      setIsLoading(false);
    }
  };

  /* --- actions --- */
  const connect = async () => {
    if (primaryWallet) {
      await primaryWallet.connector.connect();
    }
  };

  const join = () => executeTransaction(async () => {
    const client = await walletClient;
    if (!client) throw new Error('Wallet client not available');
    
    console.log('=== JOIN TRANSACTION DEBUG ===');
    console.log('Contract address:', contractAddress);
    console.log('JOIN_FEE (wei):', JOIN_FEE.toString());
    console.log('JOIN_FEE (ether):', formatEther(JOIN_FEE));
    console.log('User address:', address);
    console.log('Current member status:', memberData?.isMember);
    console.log('Current ETH deposited:', memberData?.ethDeposited?.toString());
    console.log('Current USDC borrowed:', memberData?.usdcBorrowed?.toString());
    
    // Get current balance to ensure user has enough ETH
    const balance = await publicClient.getBalance({ address: address! });
    console.log('User ETH balance (wei):', balance.toString());
    console.log('User ETH balance (ether):', formatEther(balance));
    console.log('Has enough balance?', balance >= JOIN_FEE);
    
    // Read JOIN_FEE from contract to verify it matches our constant
    try {
      const contractJoinFee = await publicClient.readContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'JOIN_FEE'
      });
      console.log('Contract JOIN_FEE (wei):', contractJoinFee.toString());
      console.log('Contract JOIN_FEE (ether):', formatEther(contractJoinFee));
      console.log('JOIN_FEE matches contract?', JOIN_FEE === contractJoinFee);
      
      if (JOIN_FEE !== contractJoinFee) {
        console.warn('JOIN_FEE mismatch! Using contract value:', contractJoinFee.toString());
        // Use the contract's JOIN_FEE value instead
        return client.writeContract({
          address: contractAddress!,
          abi: SACCO_ABI,
          functionName: 'join',
          value: contractJoinFee,
          gas: 100000n,
        });
      }
    } catch (feeReadError) {
      console.error('Error reading JOIN_FEE from contract:', feeReadError);
    }
    
    // Check if user is already a member by calling the contract directly
    try {
      const memberInfo = await publicClient.readContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'members',
        args: [address!]
      });
      console.log('Contract member info:', memberInfo);
      console.log('Is member from contract:', memberInfo[0]);
      
      if (memberInfo[0]) {
        throw new Error('User is already a member according to the contract');
      }
    } catch (readError) {
      console.error('Error reading member status:', readError);
    }
    
    console.log('=== EXECUTING JOIN TRANSACTION ===');
    
    return client.writeContract({
      address: contractAddress!,
      abi: SACCO_ABI,
      functionName: 'join',
      value: JOIN_FEE,
      gas: 100000n, // Add explicit gas limit
    });
  });

  const depositETH = (ethAmount: string) => executeTransaction(async () => {
    const client = await walletClient;
    if (!client) throw new Error('Wallet client not available');
    
    return client.writeContract({
      address: contractAddress!,
      abi: SACCO_ABI,
      functionName: 'depositETH',
      value: parseEther(ethAmount)
    });
  });

  const withdrawETH = (ethAmount: string) => executeTransaction(async () => {
    const client = await walletClient;
    if (!client) throw new Error('Wallet client not available');
    
    return client.writeContract({
      address: contractAddress!,
      abi: SACCO_ABI,
      functionName: 'withdrawETH',
      args: [parseEther(ethAmount)]
    });
  });

  const borrowUSDC = (usdcAmount: string) => executeTransaction(async () => {
    const client = await walletClient;
    if (!client) throw new Error('Wallet client not available');
    
    return client.writeContract({
      address: contractAddress!,
      abi: SACCO_ABI,
      functionName: 'borrowUSDC',
      args: [parseUnits(usdcAmount, USDC_DECIMALS)]
    });
  });

  const repayUSDC = (usdcAmount: string) => executeTransaction(async () => {
    const client = await walletClient;
    if (!client) throw new Error('Wallet client not available');
    
    return client.writeContract({
      address: contractAddress!,
      abi: SACCO_ABI,
      functionName: 'repayUSDC',
      args: [parseUnits(usdcAmount, USDC_DECIMALS)]
    });
  });

  const fundTreasury = (usdcAmount: string) => executeTransaction(async () => {
    const client = await walletClient;
    if (!client) throw new Error('Wallet client not available');
    
    return client.writeContract({
      address: contractAddress!,
      abi: SACCO_ABI,
      functionName: 'fundTreasury',
      args: [parseUnits(usdcAmount, USDC_DECIMALS)]
    });
  });

  /* --- return object --- */
  return {
    isLoading,
    error,
    isConnected,
    address,
    ethBalance,
    memberData,
    maxBorrowableUSDC,
    totalOwedUSDC,
    treasuryBalance,
    currentInterestRate,
    transactions,
    publicClient,
    walletClient,
    connect,
    refreshData,
    join,
    depositETH,
    withdrawETH,
    borrowUSDC,
    repayUSDC,
    fundTreasury,
  };
}

/* === UTILITY FUNCTIONS === */

/**
 * Format USDC amount from wei to human readable string
 */
export function formatUSDC(amount: bigint): string {
  return formatUnits(amount, USDC_DECIMALS);
}

/**
 * Parse USDC amount from string to wei
 */
export function parseUSDC(amount: string): bigint {
  return parseUnits(amount, USDC_DECIMALS);
}

/**
 * Calculate health factor (collateral / debt ratio)
 */
export function calculateHealthFactor(ethDeposited: bigint, usdcBorrowed: bigint, ethPrice: bigint): number {
  if (usdcBorrowed === 0n) return Infinity;
  
  const collateralValue = ethDeposited * ethPrice / parseEther('1');
  const debtValue = usdcBorrowed * parseUnits('1', 18 - USDC_DECIMALS); // Normalize to 18 decimals
  
  return Number(collateralValue * 100n / debtValue) / 100;
}
