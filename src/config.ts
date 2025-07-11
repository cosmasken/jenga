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
  smartContracts: SmartContracts; // Optional for testnet

} = {
  chain: {
    chainId: 5115,
    chainName: 'Citrea Testnet',
    rpcUrl: 'https://rpc.testnet.citrea.xyz',
    currency: 'cBTC',
    explorer: 'https://explorer.testnet.citrea.xyz',
  },
  smartContracts: {
    jenga: '0xbCd9c60030c34dF782eec0249b931851BD941235', 
  },
};


