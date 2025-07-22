interface ChainConfig {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  currency: string;
  explorer: string;
}

interface SmartContracts {
  jenga: string;
  sacco: string;
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
    jenga: '0x31e34B3884Ec2Fff40623855D0B15981Cfc31314', 
    sacco: '0x0000000000000000000000000000000000000000', // Replace with the actual address of your smart contract
  },
};


