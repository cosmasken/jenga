
export interface Web3Config {
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  explorerUrl: string;
  faucetUrl: string;
}

export interface ContractInstance {
  address: string;
  abi: unknown[];
  methods: {
    createChama: (name: string, amount: number, duration: number, maxMembers: number) => unknown;
    joinChama: (chamaId: number) => unknown;
    stackBTC: (chamaId: number) => unknown;
    sendP2P: (receiver: string) => unknown;
    generateInvite: (username: string, emailHash: string) => unknown;
    logInviteAcceptance: (referrerHash: string) => unknown;
    sendRedEnvelope: (recipients: string[], totalAmount: number, isRandom: boolean, message: string) => unknown;
    claimRedEnvelope: (envelopeId: number) => unknown;
  };
}

export interface Web3Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  blockNumber?: number;
  timestamp?: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface WalletConnection {
  address: string;
  chainId: number;
  balance: string; // in Wei
  isConnected: boolean;
  provider: unknown;
}
