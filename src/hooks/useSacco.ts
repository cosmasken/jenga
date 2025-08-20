import { 
  formatEther, 
  parseEther, 
  formatUnits, 
  parseUnits,
  getContract,
  type Address,
  type Hash,
  type PublicClient,
  type WalletClient,
} from 'viem';
import { useState, useCallback, useMemo } from 'react';
import { useBlockchainBase, createDataFetcher } from './useBlockchainBase';
import SACCO_ABI_JSON from '../abi/MicroSacco.json';

const SACCO_ABI = SACCO_ABI_JSON.abi;

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
  // Use base blockchain functionality
  const base = useBlockchainBase();
  
  /* --- Sacco-specific state --- */
  const [ethBalance, setEthBalance] = useState('0');
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [maxBorrowableUSDC, setMaxBorrowableUSDC] = useState<bigint>(0n);
  const [totalOwedUSDC, setTotalOwedUSDC] = useState<bigint>(0n);
  const [treasuryBalance, setTreasuryBalance] = useState<bigint>(0n);
  const [currentInterestRate, setCurrentInterestRate] = useState<bigint>(0n);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  /* --- Contract instance --- */
  const contract = useMemo(() => {
    if (!contractAddress) return null;
    return getContract({
      address: contractAddress,
      abi: SACCO_ABI,
      client: base.publicClient
    });
  }, [contractAddress, base.publicClient]);

  const fetchTransactions = useCallback(async () => {
    if (!base.address || !contract) return;

    const latestBlock = await base.publicClient.getBlockNumber();
    const fromBlock = latestBlock > 100n ? latestBlock - 1000n : 0n; // Fetch last 1000 blocks

    const getLogsInChunks = async (event: any) => {
      const chunks = [];
      for (let fromBlockChunk = fromBlock; fromBlockChunk <= latestBlock; fromBlockChunk += 1000n) {
        const toBlock = fromBlockChunk + 999n > latestBlock ? latestBlock : fromBlockChunk + 999n;
        chunks.push(base.publicClient.getLogs({ address: contractAddress, event, fromBlock: fromBlockChunk, toBlock }));
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

    const userAddress = base.address.toLowerCase();

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

  }, [base.address, contract, base.publicClient]);

  /* --- read data --- */
  const fetchSaccoData = useCallback(async () => {
    if (!base.address || !contract) return;
    
    console.log('Fetching data for address:', base.address);
    console.log('Contract address:', contractAddress);
    console.log('Public client chain ID:', base.publicClient.chain.id);
    
    const [
      balance,
      member,
      maxUSDC,
      owedUSDC,
      treasury,
      rate
    ] = await Promise.all([
      base.publicClient.getBalance({ address: base.address }),
      base.publicClient.readContract({
        address: contractAddress,
        abi: SACCO_ABI,
        functionName: 'members',
        args: [base.address]
      }),
      base.publicClient.readContract({
        address: contractAddress,
        abi: SACCO_ABI,
        functionName: 'maxUSDC',
        args: [base.address]
      }),
      base.publicClient.readContract({
        address: contractAddress,
        abi: SACCO_ABI,
        functionName: 'totalUSDCOwed',
        args: [base.address]
      }),
      base.publicClient.readContract({
        address: contractAddress,
        abi: SACCO_ABI,
        functionName: 'treasuryUSDC'
      }),
      base.publicClient.readContract({
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
  }, [base.address, contract, base.publicClient, contractAddress]);

  // Create data fetcher with consistent error handling
  const refreshData = createDataFetcher(fetchSaccoData, base.setLoading, base.setError);

  /* --- Transaction actions using base executeTransaction --- */
  const join = useCallback(() => {
    if (!contractAddress) {
      base.setError('Contract not available');
      return Promise.resolve(undefined);
    }

    return base.executeTransaction(async () => {
      const client = await base.walletClient;
      if (!client) throw new Error('Wallet client not available');
      
      console.log('=== JOIN TRANSACTION DEBUG ===');
      console.log('Contract address:', contractAddress);
      console.log('JOIN_FEE (wei):', JOIN_FEE.toString());
      console.log('JOIN_FEE (ether):', formatEther(JOIN_FEE));
      console.log('User address:', base.address);
      console.log('Current member status:', memberData?.isMember);
      
      // Get current balance to ensure user has enough ETH
      const balance = await base.publicClient.getBalance({ address: base.address! });
      console.log('User ETH balance (wei):', balance.toString());
      console.log('User ETH balance (ether):', formatEther(balance));
      console.log('Has enough balance?', balance >= JOIN_FEE);
      
      // Read JOIN_FEE from contract to verify it matches our constant
      try {
        const contractJoinFee = await base.publicClient.readContract({
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
        const memberInfo = await base.publicClient.readContract({
          address: contractAddress!,
          abi: SACCO_ABI,
          functionName: 'members',
          args: [base.address!]
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
      
      const hash = await client.writeContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'join',
        value: JOIN_FEE,
        gas: 100000n, // Add explicit gas limit
      });

      // Refresh data after successful transaction
      await refreshData();
      return hash;
    });
  }, [contractAddress, base, memberData?.isMember, refreshData]);

  const depositETH = useCallback((ethAmount: string) => {
    if (!contractAddress) {
      base.setError('Contract not available');
      return Promise.resolve(undefined);
    }

    return base.executeTransaction(async () => {
      const client = await base.walletClient;
      if (!client) throw new Error('Wallet client not available');
      
      const hash = await client.writeContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'depositETH',
        value: parseEther(ethAmount)
      });

      // Refresh data after successful transaction
      await refreshData();
      return hash;
    });
  }, [contractAddress, base, refreshData]);

  const withdrawETH = useCallback((ethAmount: string) => {
    if (!contractAddress) {
      base.setError('Contract not available');
      return Promise.resolve(undefined);
    }

    return base.executeTransaction(async () => {
      const client = await base.walletClient;
      if (!client) throw new Error('Wallet client not available');
      
      const hash = await client.writeContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'withdrawETH',
        args: [parseEther(ethAmount)]
      });

      // Refresh data after successful transaction
      await refreshData();
      return hash;
    });
  }, [contractAddress, base, refreshData]);

  const borrowUSDC = useCallback((usdcAmount: string) => {
    if (!contractAddress) {
      base.setError('Contract not available');
      return Promise.resolve(undefined);
    }

    return base.executeTransaction(async () => {
      const client = await base.walletClient;
      if (!client) throw new Error('Wallet client not available');
      
      const hash = await client.writeContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'borrowUSDC',
        args: [parseUnits(usdcAmount, USDC_DECIMALS)]
      });

      // Refresh data after successful transaction
      await refreshData();
      return hash;
    });
  }, [contractAddress, base, refreshData]);

  const repayUSDC = useCallback((usdcAmount: string) => {
    if (!contractAddress) {
      base.setError('Contract not available');
      return Promise.resolve(undefined);
    }

    return base.executeTransaction(async () => {
      const client = await base.walletClient;
      if (!client) throw new Error('Wallet client not available');
      
      const hash = await client.writeContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'repayUSDC',
        args: [parseUnits(usdcAmount, USDC_DECIMALS)]
      });

      // Refresh data after successful transaction
      await refreshData();
      return hash;
    });
  }, [contractAddress, base, refreshData]);

  const fundTreasury = useCallback((usdcAmount: string) => {
    if (!contractAddress) {
      base.setError('Contract not available');
      return Promise.resolve(undefined);
    }

    return base.executeTransaction(async () => {
      const client = await base.walletClient;
      if (!client) throw new Error('Wallet client not available');
      
      const hash = await client.writeContract({
        address: contractAddress!,
        abi: SACCO_ABI,
        functionName: 'fundTreasury',
        args: [parseUnits(usdcAmount, USDC_DECIMALS)]
      });

      // Refresh data after successful transaction
      await refreshData();
      return hash;
    });
  }, [contractAddress, base, refreshData]);

  /* --- Return object maintaining original API --- */
  return {
    // State from base
    isLoading: base.isLoading,
    error: base.error,
    isConnected: base.isConnected,
    address: base.address,
    publicClient: base.publicClient,
    walletClient: base.walletClient,
    // Sacco-specific state
    ethBalance,
    memberData,
    maxBorrowableUSDC,
    totalOwedUSDC,
    treasuryBalance,
    currentInterestRate,
    transactions,
    // Actions
    connect: base.connect,
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
