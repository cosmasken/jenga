import { ethers } from 'ethers';

export const formatBTC = (wei: string | number | bigint): string => {
  try {
    return ethers.formatEther(wei.toString());
  } catch {
    return '0';
  }
};

export const parseBTC = (btc: string): bigint => {
  try {
    return BigInt(ethers.parseEther(btc).toString());
  } catch {
    return 0n;
  }
};

export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};
  