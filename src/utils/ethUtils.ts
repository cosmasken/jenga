import { Contract, BrowserProvider, JsonRpcProvider, Signer, InterfaceAbi, ethers } from 'ethers';
import { CONTRACT_ADDRESSES, LOADING_MESSAGES } from '../config';

// Import the required utils
const { parseEther, formatUnits, parseUnits } = ethers;
import JengaRegistryABI from '@/abi/JengaRegistry.json';
import P2PTransfersABI from '@/abi/P2PTransfers.json';
import SaccoFactoryABI from '@/abi/SaccoFactory.json';
import StackingVaultABI from '@/abi/StackingVault.json';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { type Chain } from 'viem'

// Citrea Testnet Configuration
const citreaTestnet: Chain = {
  id: 5115,
  name: 'Citrea',
  nativeCurrency: {
    name: 'Citrea BTC',
    symbol: 'cBTC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.citrea.xyz'] },
    public: { http: ['https://rpc.testnet.citrea.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Citrea Explorer', url: 'https://explorer.testnet.citrea.xyz' },
  },
  testnet: true,
};
// ERC20 ABI for token interactions
const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)'
];

// Contract addresses are imported from config.ts

// Mock chama contract addresses - replace with actual chama contract addresses
export const CHAMA_ADDRESSES = {
  'Women Farmers Circle': '0x2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f2f',
  'Tech Builders Fund': '0x3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e',
  'Family Emergency Fund': '0x4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f4f'
} as const;

// Initialize provider for read operations
export const provider = new JsonRpcProvider(citreaTestnet.rpcUrls.default.http[0]);

// Re-export the utils for external use
export { parseEther, formatUnits, parseUnits };

// Get signer for write operations
export async function getSigner(): Promise<Signer | null> {
  if (typeof window === 'undefined' || !window.ethereum) return null;
  
  const provider = new BrowserProvider(window.ethereum);
  return await provider.getSigner();
}

// Get ERC20 token contract
export async function getTokenContract(tokenAddress: string, withSigner = false) {
  const signerOrProvider = withSigner ? await getSigner() : provider;
  if (!signerOrProvider) {
    throw new Error('No provider or signer available');
  }
  return new Contract(tokenAddress, ERC20_ABI, signerOrProvider);
}

/**
 * Check and approve token allowance if needed
 * @param tokenAddress The token contract address
 * @param spender The spender address (usually a contract)
 * @param amount The amount to approve (in smallest unit)
 * @returns Promise that resolves when approval is done
 */
export async function checkAndApproveToken(
  tokenAddress: string,
  spender: string,
  amount: bigint
): Promise<void> {
  const token = await getTokenContract(tokenAddress, true);
  const signer = await getSigner();
  if (!signer) throw new Error('No signer available');
  
  const address = await signer.getAddress();
  const currentAllowance = await token.allowance(address, spender);
  
  if (currentAllowance < amount) {
    const tx = await token.approve(spender, amount);
    await tx.wait();
  }
}

// Loading state management
let loadingHandler: ((message: string, isLoading: boolean) => void) | null = null;

export const setLoadingHandler = (handler: (message: string, isLoading: boolean) => void) => {
  loadingHandler = handler;
};

const withLoading = async <T>(
  message: string,
  action: () => Promise<T>
): Promise<T> => {
  try {
    loadingHandler?.(message, true);
    const result = await action();
    return result;
  } catch (error) {
    console.error('Contract interaction failed:', error);
    throw error;
  } finally {
    loadingHandler?.(message, false);
  }
};

// Contract factory functions
// Jenga Registry Functions
export async function createProfile(username: string) {
  return withLoading(LOADING_MESSAGES.CREATING_PROFILE, async () => {
    const contract = await getJengaRegistryContract(true);
    const tx = await contract.createProfile(username);
    await tx.wait();
    return tx.hash;
  });
}

export async function getProfile(address: string) {
  const contract = await getJengaRegistryContract();
  return contract.profiles(address);
}

export async function getJengaRegistryContract(withSigner = false) {
  const signerOrProvider = withSigner ? await getSigner() : provider;
  if (!signerOrProvider) throw new Error('Provider not available');
  
  return new Contract(
    CONTRACT_ADDRESSES.JENGA_REGISTRY,
    JengaRegistryABI,
    signerOrProvider
  );
}

export async function getP2PTransfersContract(withSigner = false) {
  const signerOrProvider = withSigner ? await getSigner() : provider;
  if (!signerOrProvider) throw new Error('Provider not available');
  
  return new Contract(
    CONTRACT_ADDRESSES.P2P_TRANSFERS,
    P2PTransfersABI,
    signerOrProvider
  );
}

// Sacco Factory Functions
export async function createPool(contribution: string, cycleDuration: number, totalCycles: number, initialMembers: string[] = []) {
  return withLoading(LOADING_MESSAGES.CREATING_POOL, async () => {
    const contract = await getSaccoFactoryContract(true);
    const tx = await contract.createPool(
      parseEther(contribution),
      cycleDuration,
      totalCycles,
      initialMembers
    );
    await tx.wait();
    return tx.hash;
  });
}

export async function joinPool(poolId: number, amount: string) {
  return withLoading(LOADING_MESSAGES.JOINING_POOL, async () => {
    const contract = await getSaccoFactoryContract(true);
    const tx = await contract.joinPool(poolId, { value: parseEther(amount) });
    await tx.wait();
    return tx.hash;
  });
}

export async function contributeToCycle(poolId: number, amount: string) {
  return withLoading(LOADING_MESSAGES.CONTRIBUTING, async () => {
    const contract = await getSaccoFactoryContract(true);
    const tx = await contract.contributeToCycle(poolId, { value: parseEther(amount) });
    await tx.wait();
    return tx.hash;
  });
}

export async function getSaccoFactoryContract(withSigner = false) {
  const signerOrProvider = withSigner ? await getSigner() : provider;
  if (!signerOrProvider) throw new Error('Provider not available');
  
  return new Contract(
    CONTRACT_ADDRESSES.SACCO_FACTORY,
    SaccoFactoryABI,
    signerOrProvider
  );
}

// Stacking Vault Functions
export async function createStackingGoal(dailyAmount: string) {
  return withLoading(LOADING_MESSAGES.CREATING_GOAL, async () => {
    const contract = await getStackingVaultContract(true);
    const tx = await contract.createStackingGoal(parseEther(dailyAmount));
    await tx.wait();
    return tx.hash;
  });
}

export async function makeDeposit(amount: string) {
  return withLoading(LOADING_MESSAGES.PROCESSING_DEPOSIT, async () => {
    const contract = await getStackingVaultContract(true);
    const tx = await contract.makeDeposit({ value: parseEther(amount) });
    await tx.wait();
    return tx.hash;
  });
}

export async function getStackingGoal(address: string) {
  const contract = await getStackingVaultContract();
  return contract.goals(address);
}

export async function getStackingVaultContract(withSigner = false) {
  const signerOrProvider = withSigner ? await getSigner() : provider;
  if (!signerOrProvider) throw new Error('Provider not available');
  
  return new Contract(
    CONTRACT_ADDRESSES.STACKING_VAULT,
    StackingVaultABI,
    signerOrProvider
  );
}

// Helper function to get the connected wallet address
export async function getConnectedAddress(): Promise<string> {
  if (!window.ethereum) throw new Error('No ethereum provider found');
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return signer.getAddress();
}

// Helper function to switch to Citrea network if needed
export async function switchToCitreaNetwork() {
  if (!window.ethereum) throw new Error('No ethereum provider found');
  
  const chainId = `0x${citreaTestnet.id.toString(16)}`;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError: unknown) {
    interface ProviderRpcError extends Error {
      code: number;
      message: string;
      data?: unknown;
    }
    
    // Type guard to check if the error is a ProviderRpcError
    const isProviderRpcError = (error: unknown): error is ProviderRpcError => {
      return (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        'message' in error
      );
    };

    // This error code indicates that the chain has not been added to MetaMask
    if (isProviderRpcError(switchError) && switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName: citreaTestnet.name,
              nativeCurrency: citreaTestnet.nativeCurrency,
              rpcUrls: citreaTestnet.rpcUrls.default.http,
              blockExplorerUrls: citreaTestnet.blockExplorers ? [citreaTestnet.blockExplorers.default.url] : [],
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding Citrea network:', addError);
        throw new Error('Failed to add Citrea network to wallet');
      }
    } else {
      console.error('Error switching to Citrea network:', switchError);
      throw new Error('Failed to switch to Citrea network');
    }
  }
}

// Example usage with Dynamic
// 1. First, ensure the user is connected via Dynamic
// 2. Then use these utilities to interact with contracts

export async function exampleContractInteraction() {
  try {
    // Ensure we're on the right network
    await switchToCitreaNetwork();
    
    // Get the contract instance with signer for write operations
    const jengaRegistry = await getJengaRegistryContract(true);
    
    // Make a read call (no signer needed)
    const owner = await jengaRegistry.owner();
    console.log('Jenga Registry Owner:', owner);
    
    // Make a write call (requires signer)
    // const tx = await jengaRegistry.someWriteFunction(param1, param2);
    // await tx.wait(); // Wait for the transaction to be mined
    // console.log('Transaction hash:', tx.hash);
    
    return owner;
  } catch (error) {
    console.error('Error in contract interaction:', error);
    throw error;
  }
}

// Utility to format token amounts (e.g., from wei to ether)
export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  return formatUnits(amount.toString(), decimals);
}

// Utility to parse token amounts (e.g., from ether to wei)
export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  return BigInt(parseUnits(amount, decimals).toString());
}

// Utility to get the current block number
export async function getBlockNumber(): Promise<number> {
  return await provider.getBlockNumber();
}

// Utility to get transaction receipt
export async function getTransactionReceipt(hash: string) {
  return await provider.getTransactionReceipt(hash);
}
