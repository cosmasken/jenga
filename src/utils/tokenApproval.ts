// src/utils/tokenApproval.ts
import {
  type Address,
  type PublicClient,
  type WalletClient,
  parseUnits,
  formatUnits,
} from 'viem';
import { citreaTestnet, TOKENS } from '@/config';
import { useRosca } from '@/hooks/useRosca';

const ERC20_ABI = [
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

/* ---------- helpers ---------- */
export async function checkAllowance(
  publicClient: PublicClient,
  tokenAddress: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  try {
    return (await publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'allowance',
      args: [owner, spender],
    })) as bigint;
  } catch {
    return 0n;
  }
}

export async function checkApprovalNeeded(
  publicClient: PublicClient,
  tokenAddress: Address,
  owner: Address,
  spender: Address,
  requiredAmount: string,
  decimals = 18
) {
  const required = parseUnits(requiredAmount, decimals);
  const current = await checkAllowance(publicClient, tokenAddress, owner, spender);

  return {
    needsApproval: current < required,
    currentAllowance: current,
    requiredAmount: required,
    shortfall: required - current,
  };
}

export function formatAllowance(
  allowance: bigint,
  decimals: number,
  symbol: string
): string {
  const maxUint256 = 2n ** 256n - 1n;

  if (allowance >= maxUint256 / 2n) return `Unlimited ${symbol}`;

  const formatted = formatUnits(allowance, decimals);
  const num = parseFloat(formatted);

  if (num === 0) return `0 ${symbol}`;
  if (num < 0.000001) return `<0.000001 ${symbol}`;
  if (decimals === 6) return `${num.toFixed(6)} ${symbol}`;

  return `${num.toLocaleString()} ${symbol}`;
}

export async function requestMaxApproval(
  walletClient: WalletClient,
  publicClient: PublicClient,
  tokenAddress: Address,
  spender: Address
) {
  const max = 2n ** 256n - 1n;

  try {
    const hash = await walletClient.writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [spender, max],
      chain: citreaTestnet,
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return { success: true, hash };
  } catch (error: any) {
    return { success: false, error: error.shortMessage ?? error.message };
  }
}

export async function handleUSDCApproval(
  walletClient: WalletClient,
  publicClient: PublicClient,
  owner: Address,
  spender: Address,
  requiredAmount: string
) {
  const check = await checkApprovalNeeded(
    publicClient,
    TOKENS.USDC.address,
    owner,
    spender,
    requiredAmount,
    TOKENS.USDC.decimals
  );

  if (!check.needsApproval)
    return { approved: true, wasAlreadyApproved: true };

  const res = await requestMaxApproval(
    walletClient,
    publicClient,
    TOKENS.USDC.address,
    spender
  );

  return {
    approved: res.success,
    hash: res.hash,
    error: res.error,
    wasAlreadyApproved: false,
  };
}