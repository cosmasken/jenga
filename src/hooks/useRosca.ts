import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import {
  formatEther,
  parseEther,
  decodeEventLog,
  encodeEventTopics,
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
import { citreaTestnet } from '@/config';
import { handleUSDCApproval } from '@/utils/tokenApproval';
import { NETWORK_CONFIG } from '@/config';
import FACTORY_ABI from '../abi/ChamaFactory.json';
import CIRCLE_ABI from '../abi/ChamaCircle.json';
import { FACTORY_ADDRESS } from '@/utils/constants';

/* === CONFIG === */
export const USDC_DECIMALS = 6;
export const NATIVE_DECIMALS = 18;

/* === HOOK === */
export interface RoscaHook {
  /* factory */
  // createChama: (
  //   token: Address | null,               // null = native
  //   contribution: string,                // human readable
  //   securityDeposit: string,             // human readable
  //   roundDuration: string,               // human readable
  //   lateWindow: string,
  //   latePenalty: string,
  //   memberTarget: string
  // ) => Promise<Address>;                 // returns new chama address
  createChama: (
    token: Address | null,
    contribution: string,
    securityDeposit: string,
    roundDuration: number,
    lateWindow: number,
    latePenalty: string,
    memberTarget: number
  ) => Promise<Address | undefined>;
  address: Address | null;
  // refreshData: () => Promise<void>;
  /* circle (single chama) */
  join: (chamaAddress: Address) => Promise<Hash | undefined>;
  contribute: (chamaAddress: Address) => Promise<Hash | undefined>;
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
  
  /* membership */
  isMember: (chamaAddress: Address, userAddress: Address) => Promise<boolean>;
  hasContributed: (chamaAddress: Address, userAddress: Address, round: number) => Promise<boolean>;
  
  /* state */
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  isWalletReady: boolean;
  publicClient: PublicClient;
  getWalletClient: () => Promise<WalletClient | null>;
  
}

export function useRosca(
  factoryAddress: Address
): RoscaHook {
  const { primaryWallet } = useDynamicContext();

  // USDC Contract ABI for approval
  const ERC20_ABI = [
    {
      type: 'function',
      name: 'approve',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      type: 'function',
      name: 'allowance',
      stateMutability: 'view',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      outputs: [{ name: '', type: 'uint256' }]
    }
  ] as const;


    /* --- clients --- */
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain : citreaTestnet,
      transport: http(NETWORK_CONFIG.RPC_URL)
    });
  }, []);
  const getWalletClient = useCallback(async () => {
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

  const contract = useMemo(() => {
    if (!factoryAddress) return null;
    return getContract({
      address: factoryAddress,
      abi: FACTORY_ABI,
      client: publicClient
    });
  }, [factoryAddress, publicClient]);

  
  /* --- state --- */
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


 

  const getChama = useCallback(
    (chamaAddress: Address) =>
      getContract({
        address: chamaAddress,
        abi: CIRCLE_ABI,
        client: publicClient
      }),
    [publicClient]
  );
   /* --- helpers --- */
  const isConnected = Boolean(primaryWallet && isEthereumWallet(primaryWallet));
  const address = primaryWallet?.address as Address | null;

     /* --- transaction wrapper --- */
      const executeTransaction = async (
        txFunction: () => Promise<Hash>
      ): Promise<Hash | undefined> => {
        if (!isConnected) {
          setError('Wallet not connected');
          return;
        }
    
        if (!factoryAddress) {
          setError('Contract not available');
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
          
          // Wait for transaction confirmation
          await publicClient.waitForTransactionReceipt({ hash });
          
          // Refresh data after successful transaction
          // await refreshData();
          
          return hash;
        } catch (err: any) {
          console.error('Transaction failed:', err);
          setError(err?.shortMessage || err?.message || 'Transaction failed');
          return undefined;
        } finally {
          setIsLoading(false);
        }
      };


  /* --- factory create --- */
const createChama: RoscaHook['createChama'] = async (
  token,
  contribution,
  securityDeposit,
  roundDuration,
  lateWindow,
  latePenalty,
  memberTarget
) => {
  const decimals = token === null ? NATIVE_DECIMALS : USDC_DECIMALS;
  const contrib  = parseUnits(contribution, decimals);
  const security = parseUnits(securityDeposit, decimals);
  const penalty  = parseUnits(latePenalty, decimals);

  if (!isConnected) {
    setError('Wallet not connected');
    return;
  }

  if (!factoryAddress) {
    setError('Contract not available');
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
    // Handle token approval for ERC20 tokens
    if (token !== null) {
      console.log('🔐 Checking token approval for USDC...');
      
      // Calculate total amount needed (security deposit + first contribution)
      const totalAmountNeeded = (parseFloat(securityDeposit) + parseFloat(contribution)).toString();
      
      console.log(`💰 Total USDC needed: ${totalAmountNeeded} (${securityDeposit} deposit + ${contribution} contribution)`);
      
      // Check current allowance
      const allowance = await publicClient.readContract({
        address: token as Address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address!, FACTORY_ADDRESS]
      });

      const neededAmount = parseUnits(totalAmountNeeded, USDC_DECIMALS);
      
      if (allowance < neededAmount) {
        console.log('🔓 Approving USDC for factory...');
        const approveHash = await client.writeContract({
          address: token as Address,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [FACTORY_ADDRESS, neededAmount]
        });
        
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
        console.log('✅ USDC approval successful:', approveHash);
      }

      console.log('✅ USDC approval verified');
    }

    console.log('🚀 Creating chama with factory...');
    const hash = await client.writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: 'createChama',
      args: [
        token ?? '0x0000000000000000000000000000000000000000',
        contrib,
        security,
        BigInt(roundDuration),
        BigInt(lateWindow),
        penalty,
        BigInt(memberTarget)
      ],
      value: token === null ? security : 0n
    });

    console.log('⏳ Waiting for chama creation confirmation...', hash);
    
    // Wait for transaction receipt with better error handling
    let receipt;
    try {
      receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60000 // 60 second timeout
      });
      console.log('✅ Transaction confirmed:', receipt.transactionHash);
    } catch (receiptError: any) {
      console.error('❌ Failed to get transaction receipt:', receiptError);
      // If we can't get the receipt but the transaction was sent, 
      // we should still try to continue or at least give a better error
      throw new Error(`Transaction was sent but confirmation failed. Hash: ${hash}. Please check the transaction manually.`);
    }
    
    // Parse the ChamaCreated event
    const logs = receipt.logs;
    const topics = encodeEventTopics({
      abi: FACTORY_ABI,
      eventName: 'ChamaCreated'
    });
    
    const chamaLog = logs.find(log => 
      log.topics[0] === topics[0] && 
      log.address.toLowerCase() === factoryAddress.toLowerCase()
    );
    
    if (!chamaLog) {
      console.error('❌ ChamaCreated event not found in logs:', logs);
      throw new Error('ChamaCreated event not found in transaction receipt');
    }
    
    const decodedLog = decodeEventLog({
      abi: FACTORY_ABI,
      data: chamaLog.data,
      topics: chamaLog.topics
    });

    if (decodedLog.eventName !== 'ChamaCreated') {
      throw new Error('Unexpected event type');
    }

    // Type-cast to avoid "possibly undefined"
    const chamaAddress = (decodedLog.args as any).chama as Address;
    console.log('🎉 Chama created successfully:', chamaAddress);
    
    return chamaAddress;
    
  } catch (err: any) {
    console.error('❌ Chama creation failed:', err);
    setError(err?.shortMessage || err?.message || 'Chama creation failed');
    return undefined;
  } finally {
    setIsLoading(false);
  }
};

  /* --- get chama info --- */
  const getChamaInfo = async (chamaAddress: Address) => {
    console.log('🔍 Getting chama info for:', chamaAddress);
    console.log('🌐 Network config:', NETWORK_CONFIG.RPC_URL);
    console.log('🔗 Public client:', publicClient);
    
    const chama = getChama(chamaAddress);
    console.log('📄 Chama contract instance created');
    
    try {
      // Get core data that definitely exists on the contract
      console.log('📡 Fetching core chama data...');
      const coreData = await Promise.all([
        chama.read.contribution(),
        chama.read.securityDeposit(), 
        chama.read.currentRound(),
        chama.read.memberCount(),
        chama.read.memberTarget(),
        chama.read.roundDuration(),
        chama.read.token(),
        chama.read.factory(),
      ]);

      const [
        contribution,
        securityDeposit,
        currentRound,
        memberCount,
        memberTarget,
        roundDuration,
        token,
        factory
      ] = coreData;

      console.log('✅ Core chama data loaded:', {
        contribution: contribution.toString(),
        securityDeposit: securityDeposit.toString(),
        currentRound: Number(currentRound),
        memberCount: Number(memberCount),
        memberTarget: Number(memberTarget),
        roundDuration: Number(roundDuration),
        token,
        factory
      });

      // For creator, we need to get the first member (creator auto-joins)
      let creator: Address = '0x0000000000000000000000000000000000000000' as Address;
      try {
        if (Number(memberCount) > 0) {
          console.log('👤 Getting creator (first member)...');
          creator = await chama.read.members([0n]); // First member is the creator
          console.log('✅ Creator found:', creator);
        }
      } catch (error) {
        console.warn('⚠️ Could not get creator (first member):', error);
      }

      // Determine if chama is active (has members and hasn't finished all rounds)
      const isActive = Number(memberCount) > 0 && Number(currentRound) <= Number(memberTarget);

      const result = {
        token: token as Address | null,
        contribution: contribution as bigint,
        securityDeposit: securityDeposit as bigint,
        roundDuration: Number(roundDuration),
        memberTarget: Number(memberTarget),
        currentRound: Number(currentRound),
        totalMembers: Number(memberCount),
        isActive,
        creator
      };

      console.log('✅ Final chama info:', result);
      return result;

    } catch (error) {
      console.error('❌ Error getting chama info:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        chamaAddress,
        networkRPC: NETWORK_CONFIG.RPC_URL
      });
      throw new Error(`Failed to get chama info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

/* ------------------------------------------------------------------ */
/*  MEMBERSHIP CHECKS                                                 */
/* ------------------------------------------------------------------ */
const isMember = async (chamaAddress: Address, userAddress: Address): Promise<boolean> => {
  try {
    const chama = getChama(chamaAddress);
    const result = await chama.read.isMember([userAddress]);
    return result as boolean;
  } catch (error) {
    console.error('Error checking membership:', error);
    return false;
  }
};

const hasContributed = async (chamaAddress: Address, userAddress: Address, round: number): Promise<boolean> => {
  try {
    const chama = getChama(chamaAddress);
    const result = await chama.read.contributed([BigInt(round), userAddress]);
    return result as boolean;
  } catch (error) {
    console.error('Error checking contribution:', error);
    return false;
  }
};

/* ------------------------------------------------------------------ */
/*  JOIN                                                              */
/* ------------------------------------------------------------------ */
const join = async (chama: Address): Promise<Hash | undefined> => {
  if (!isConnected) {
    setError('Wallet not connected');
    return;
  }

  if (!factoryAddress) {
    setError('Contract not available');
    return;
  }

  if (!primaryWallet) {
    setError('No wallet found');
    return;
  }

  console.log('🔗 Starting join process for chama:', chama);
  console.log('🔗 Wallet connected:', !!primaryWallet);
  console.log('🔗 Is Ethereum wallet:', isEthereumWallet(primaryWallet));

  setIsLoading(true);
  setError(null);

  try {
    console.log('🔗 Getting wallet client directly...');
    
    // Get wallet client directly like in createChama - don't use the shared getWalletClient function
    const client = await getWalletClient();
  // if (!client) {
  //   setError('Wallet client not available');
  //   return;
  // }
  //   try {
  //     client = await primaryWallet.getWalletClient();
  //     console.log('✅ Wallet client obtained successfully');
  //   } catch (walletError: any) {
  //     console.error('❌ Failed to get wallet client:', walletError);
  //     throw new Error('Unable to connect to wallet. Please ensure your wallet is connected and try again.');
  //   }

    if (!client) {
      throw new Error('Wallet client is null. Please reconnect your wallet.');
    }

    console.log('🔗 Joining chama:', chama);

    // Get security deposit and token info from contract
    console.log('📋 Fetching chama details...');
    const [security, token] = await Promise.all([
      publicClient.readContract({
        address: chama,
        abi: FACTORY_ABI,
        functionName: 'securityDeposit',
      }),
      publicClient.readContract({
        address: chama,
        abi: FACTORY_ABI,
        functionName: 'token',
      })
    ]);

    console.log('💰 Security deposit required:', formatUnits(security, token !== '0x0000000000000000000000000000000000000000' ? USDC_DECIMALS : NATIVE_DECIMALS));

    // Handle ERC-20 chama (USDC)
    if (token !== '0x0000000000000000000000000000000000000000') {
      console.log('🔐 Handling USDC approval for join...');
      
      await handleUSDCApproval(
        client,
        publicClient,
        address!,
        chama,
        formatUnits(security, USDC_DECIMALS)
      );

      console.log('✅ USDC approval completed, joining chama...');
      const hash = await client.writeContract({
        address: chama,
        abi: FACTORY_ABI,
        functionName: 'join',
      });

      console.log('⏳ Waiting for join transaction confirmation...', hash);
      await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60000 
      });
      
      console.log('🎉 Successfully joined USDC chama!');
      return hash;
    }

    // Handle native chama (cBTC)
    console.log('🪙 Joining native cBTC chama...');
    const hash = await client.writeContract({
      address: chama,
      abi: FACTORY_ABI,
      functionName: 'join',
      value: security,
    });

    console.log('⏳ Waiting for join transaction confirmation...', hash);
    await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60000 
    });
    
    console.log('🎉 Successfully joined cBTC chama!');
    return hash;

  } catch (err: any) {
    console.error('❌ Join failed:', err);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to join chama';
    if (err.message?.includes('Unable to retrieve WalletClient')) {
      errorMessage = 'Wallet connection issue. Please disconnect and reconnect your wallet, then try again.';
    } else if (err.message?.includes('User rejected')) {
      errorMessage = 'Transaction was rejected by user.';
    } else if (err.message?.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds to join this chama.';
    } else if (err.shortMessage) {
      errorMessage = err.shortMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    return undefined;
  } finally {
    setIsLoading(false);
  }
};

/* ------------------------------------------------------------------ */
/*  CONTRIBUTE                                                        */
/* ------------------------------------------------------------------ */
const contribute = async (chama: Address): Promise<Hash | undefined> => {
  if (!isConnected) {
    setError('Wallet not connected');
    return;
  }

  if (!factoryAddress) {
    setError('Contract not available');
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
    console.log('💰 Contributing to chama:', chama);

    // Get contribution amount and token info from contract
    const [contributionAmount, token] = await Promise.all([
      publicClient.readContract({
        address: chama,
        abi: FACTORY_ABI,
        functionName: 'contribution',
      }),
      publicClient.readContract({
        address: chama,
        abi: FACTORY_ABI,
        functionName: 'token',
      })
    ]);

    const isNative = token === '0x0000000000000000000000000000000000000000';
    const decimals = isNative ? NATIVE_DECIMALS : USDC_DECIMALS;
    const amount = formatUnits(contributionAmount, decimals);

    console.log('💰 Contribution amount:', amount, isNative ? 'cBTC' : 'USDC');

    // Handle ERC-20 chama (USDC)
    if (!isNative) {
      console.log('🔐 Handling USDC approval for contribution...');
      
      await handleUSDCApproval(client, publicClient, address!, chama, amount);

      console.log('✅ USDC approval completed, contributing to chama...');
      const hash = await client.writeContract({
        address: chama,
        abi: FACTORY_ABI,
        functionName: 'contribute',
      });

      console.log('⏳ Waiting for contribution transaction confirmation...', hash);
      await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60000 
      });
      
      console.log('🎉 Successfully contributed to USDC chama!');
      return hash;
    }

    // Handle native chama (cBTC)
    console.log('🪙 Contributing to native cBTC chama...');
    const hash = await client.writeContract({
      address: chama,
      abi: FACTORY_ABI,
      functionName: 'contribute',
      value: contributionAmount,
    });

    console.log('⏳ Waiting for contribution transaction confirmation...', hash);
    await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60000 
    });
    
    console.log('🎉 Successfully contributed to cBTC chama!');
    return hash;

  } catch (err: any) {
    console.error('❌ Contribution failed:', err);
    setError(err?.shortMessage || err?.message || 'Failed to contribute to chama');
    return undefined;
  } finally {
    setIsLoading(false);
  }
};

/* ------------------------------------------------------------------ */
/*  LEAVE                                                             */
/* ------------------------------------------------------------------ */
const leave = async (chama: Address): Promise<Hash | undefined> => {
  if (!isConnected) {
    setError('Wallet not connected');
    return;
  }

  if (!factoryAddress) {
    setError('Contract not available');
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
    console.log('🚪 Leaving chama:', chama);

    const hash = await client.writeContract({
      address: chama,
      abi: FACTORY_ABI,
      functionName: 'leave',
    });

    console.log('⏳ Waiting for leave transaction confirmation...', hash);
    await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60000 
    });
    
    console.log('👋 Successfully left chama!');
    return hash;

  } catch (err: any) {
    console.error('❌ Leave failed:', err);
    setError(err?.shortMessage || err?.message || 'Failed to leave chama');
    return undefined;
  } finally {
    setIsLoading(false);
  }
};

  /* --- return object --- */
  return {
    createChama,
    join,
    contribute,
    address,
    leave,
    getChamaInfo,
    isMember,
    hasContributed,
    isLoading,
    error,
    isConnected,
    isWalletReady: isConnected,
    publicClient,
    getWalletClient
  };
}