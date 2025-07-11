import { createConnector } from 'wagmi';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, CustomChainConfig, IProvider } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { createWalletClient, custom, getAddress, type Address, type Chain } from 'viem';
import { citreaTestnet } from '../wagmi';

const citreaChainConfig: CustomChainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x13fb', // 5115 in hex
  rpcTarget: 'https://rpc.testnet.citrea.xyz',
  displayName: 'Citrea Testnet',
  blockExplorerUrl: 'https://explorer.testnet.citrea.xyz',
  ticker: 'cBTC',
  tickerName: 'cBTC',
  decimals: 18,
  logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
  isTestnet: true,
};

export interface Web3AuthConnectorOptions {
  clientId: string;
  chainConfig?: CustomChainConfig;
  web3AuthNetwork?: 'mainnet' | 'testnet' | 'cyan' | 'aqua' | 'sapphire_devnet' | 'sapphire_mainnet';
}

export function web3AuthConnector(options: Web3AuthConnectorOptions) {
  let web3auth: Web3Auth | null = null;
  let provider: IProvider | null = null;

  return createConnector<IProvider>((config) => ({
    id: 'web3auth',
    name: 'Web3Auth',
    type: 'web3Auth',
    
    async setup() {
      const privateKeyProvider = new EthereumPrivateKeyProvider({
        config: { chainConfig: options.chainConfig || citreaChainConfig },
      });

      web3auth = new Web3Auth({
        clientId: options.clientId,
        web3AuthNetwork: options.web3AuthNetwork || 'sapphire_devnet',
        chainConfig: options.chainConfig || citreaChainConfig,
        privateKeyProvider,
        uiConfig: {
          theme: {
            primary: '#f97316', // Orange theme
          },
          mode: 'dark',
          logoLight: 'https://web3auth.io/images/web3authlog.png',
          logoDark: 'https://web3auth.io/images/web3authlogodark.png',
          defaultLanguage: 'en',
          loginMethodsOrder: ['google', 'facebook', 'twitter', 'discord'],
        },
      });

      await web3auth.initModal();
    },

    async connect({ chainId } = {}) {
      if (!web3auth) {
        throw new Error('Web3Auth not initialized');
      }

      provider = await web3auth.connect();
      
      if (!provider) {
        throw new Error('Failed to connect to Web3Auth');
      }

      const walletClient = createWalletClient({
        chain: citreaTestnet,
        transport: custom(provider),
      });

      const [address] = await walletClient.getAddresses();
      
      return {
        accounts: [address],
        chainId: chainId || citreaTestnet.id,
      };
    },

    async disconnect() {
      if (web3auth) {
        await web3auth.logout();
        provider = null;
      }
    },

    async getAccounts() {
      if (!provider) return [];
      
      const walletClient = createWalletClient({
        chain: citreaTestnet,
        transport: custom(provider),
      });

      return await walletClient.getAddresses();
    },

    async getChainId() {
      if (!provider) return citreaTestnet.id;
      
      const walletClient = createWalletClient({
        chain: citreaTestnet,
        transport: custom(provider),
      });

      return await walletClient.getChainId();
    },

    async getProvider() {
      return provider;
    },

    async isAuthorized() {
      if (!web3auth) return false;
      return web3auth.connected;
    },

    async switchChain({ chainId }) {
      throw new Error('Switching chains is not supported with Web3Auth');
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) {
        config.emitter.emit('disconnect');
      } else {
        config.emitter.emit('change', {
          accounts: accounts.map((x) => getAddress(x)),
        });
      }
    },

    onChainChanged(chain) {
      const chainId = Number(chain);
      config.emitter.emit('change', { chainId });
    },

    onConnect(connectInfo) {
      const chainId = Number(connectInfo.chainId);
      config.emitter.emit('connect', { chainId });
    },

    onDisconnect(error) {
      config.emitter.emit('disconnect');
    },
  }));
}
