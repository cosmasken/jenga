import { create } from 'zustand';
import { ethers } from 'ethers';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, CustomChainConfig } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

const citrea: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13fb',
  rpcTarget: 'https://rpc.testnet.citrea.xyz',
  displayName: 'Citrea',
  blockExplorerUrl: 'https://explorer.testnet.citrea.xyz',
  ticker: 'cBTC',
  tickerName: 'cBTC',
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  isTestnet: true,
};

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID as string;


interface WalletStore {
  isConnected: boolean;
  isInitialized: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
  initWeb3Auth: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const useWallet = create<WalletStore>((set) => {
  const privateKeyProvider = new EthereumPrivateKeyProvider({
    config: { chainConfig: citrea },
  });

  const web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: 'sapphire_devnet',
    chainConfig: citrea,
    privateKeyProvider, // Added privateKeyProvider
  });


  return {
    isConnected: false,
    isInitialized: false,
    provider: null,
    signer: null,
    address: null,
    isLoading: false,
    error: null,
    initWeb3Auth: async () => {
      try {
        set({ isLoading: true });
        await web3auth.initModal();
        set({ isInitialized: true, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },
    connect: async () => {
      try {
        set({ isLoading: true });
        const provider = await web3auth.connect();
        const ethersProvider = new ethers.BrowserProvider(provider);
        const signer = await ethersProvider.getSigner();
        const address = await signer.getAddress();
        console.log('Connected wallet address:', address);

        set({ provider: ethersProvider, signer, address, isConnected: true, isLoading: false });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },
    disconnect: async () => {
      try {
        set({ isLoading: true });
        await web3auth.logout();
        
        // Reset wallet state
        set({
          provider: null,
          signer: null,
          address: null,
          isConnected: false,
          isLoading: false,
        });

        
      } catch (error) {
        console.error('Error during disconnect:', error);
        set({ error: (error as Error).message, isLoading: false });
      }
    },
  };
});

export default useWallet;