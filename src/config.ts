interface ChainConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  currency: string;
  explorer: string;
}

interface SmartContracts {
  jenga: string;
}

export const TESTNET_CONFIG: {
  chain: ChainConfig;
  smartContracts: SmartContracts;

} = {
  chain: {
    chainId: 5115,
    chainName: 'Citrea Testnet',
    rpcUrl: 'https://rpc.testnet.citrea.xyz',
    currency: 'cBTC',
    explorer: 'https://explorer.testnet.citrea.xyz',
  },
  smartContracts: {
    jenga: '0x57431659DB91Eae1EAfAF8aB3Fd1CE53A095c30b', 
  },
};


