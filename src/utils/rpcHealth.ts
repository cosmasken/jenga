import { createPublicClient, http } from 'viem';
import { citreaTestnet, NETWORK_CONFIG } from '@/config';

/**
 * Check if the RPC endpoint is working
 */
export async function checkRPCHealth(): Promise<{
  isHealthy: boolean;
  rpcUrl: string;
  chainId?: number;
  blockNumber?: bigint;
  error?: string;
}> {
  const rpcUrl = NETWORK_CONFIG.RPC_URL;
  
  try {
    const publicClient = createPublicClient({
      chain: citreaTestnet,
      transport: http()
    });

    // Try to get chain ID and latest block number
    const [chainId, blockNumber] = await Promise.all([
      publicClient.getChainId(),
      publicClient.getBlockNumber()
    ]);

    return {
      isHealthy: true,
      rpcUrl,
      chainId,
      blockNumber,
    };
  } catch (error) {
    console.error('RPC Health Check Failed:', error);
    return {
      isHealthy: false,
      rpcUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test token contract connectivity
 */
export async function testTokenContract(tokenAddress: string): Promise<{
  isAccessible: boolean;
  tokenAddress: string;
  error?: string;
}> {
  try {
    const publicClient = createPublicClient({
      chain: citreaTestnet,
      transport: http()
    });

    // Try to read token name (basic contract call)
    await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: [
        {
          name: 'name',
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'string' }],
        },
      ],
      functionName: 'name',
    });

    return {
      isAccessible: true,
      tokenAddress,
    };
  } catch (error) {
    return {
      isAccessible: false,
      tokenAddress,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Run comprehensive connectivity tests
 */
export async function runConnectivityTests() {
  console.log('🔍 Running connectivity tests...');
  
  const rpcHealth = await checkRPCHealth();
  console.log('RPC Health:', rpcHealth);
  
  if (rpcHealth.isHealthy) {
    const usdcTest = await testTokenContract('0x2b7C40E9B01b342f3730a886d65168eD501a88b8');
    console.log('USDC Contract Test:', usdcTest);
  }
  
  return { rpcHealth };
}
