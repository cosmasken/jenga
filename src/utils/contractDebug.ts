import { type Address, type PublicClient } from 'viem';

/**
 * Test which functions are available on a contract
 */
export async function testContractFunctions(
  publicClient: PublicClient,
  contractAddress: Address
): Promise<{
  available: string[];
  failed: string[];
  results: Record<string, any>;
}> {
  const functionsToTest = [
    'contribution',
    'securityDeposit', 
    'currentRound',
    'memberCount',
    'memberTarget',
    'creator',
    'isActive',
    'roundDuration',
    'roundDeadline',
    'token',
    'name',
    'symbol'
  ];

  const available: string[] = [];
  const failed: string[] = [];
  const results: Record<string, any> = {};

  for (const functionName of functionsToTest) {
    try {
      // Create a minimal ABI for this function
      const abi = [
        {
          name: functionName,
          type: 'function',
          stateMutability: 'view',
          inputs: [],
          outputs: [{ name: '', type: 'uint256' }], // Generic output type
        },
      ];

      const result = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName,
      });

      available.push(functionName);
      results[functionName] = result;
      console.log(`✅ ${functionName}:`, result);
    } catch (error) {
      failed.push(functionName);
      console.log(`❌ ${functionName}:`, error instanceof Error ? error.message : 'Failed');
    }
  }

  return { available, failed, results };
}

/**
 * Get basic contract info
 */
export async function getContractInfo(
  publicClient: PublicClient,
  contractAddress: Address
): Promise<{
  isContract: boolean;
  bytecodeSize?: number;
  error?: string;
}> {
  try {
    const bytecode = await publicClient.getBytecode({ address: contractAddress });
    
    return {
      isContract: !!bytecode && bytecode !== '0x',
      bytecodeSize: bytecode ? bytecode.length : 0,
    };
  } catch (error) {
    return {
      isContract: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Debug a chama contract
 */
export async function debugChamaContract(
  publicClient: PublicClient,
  chamaAddress: Address
) {
  console.log('🔍 Debugging Chama Contract:', chamaAddress);
  
  // Check if it's a contract
  const contractInfo = await getContractInfo(publicClient, chamaAddress);
  console.log('Contract Info:', contractInfo);
  
  if (!contractInfo.isContract) {
    console.error('❌ Address is not a contract!');
    return { isContract: false };
  }
  
  // Test available functions
  const functionTest = await testContractFunctions(publicClient, chamaAddress);
  console.log('Available functions:', functionTest.available);
  console.log('Failed functions:', functionTest.failed);
  
  return {
    isContract: true,
    ...functionTest,
  };
}
