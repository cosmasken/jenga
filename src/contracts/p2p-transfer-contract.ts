import { Address } from 'viem';

// Contract function types
export type P2PTransferContractFunctions = {
  sendP2P: readonly [Address];
  sendRedEnvelope: readonly [Address[], bigint, boolean, string];
  claimRedEnvelope: readonly [bigint];
  expireRedEnvelope: readonly [bigint];
  getRedEnvelopeDetails: readonly [bigint];
  hasClaimedRedEnvelope: readonly [bigint, Address];
  getUserTransactionHistory: readonly [Address];
  getUserRedEnvelopes: readonly [Address];
  getTransactionDetails: readonly [bigint];
  getUserP2PCount: readonly [Address];
  getUserRedEnvelopeCount: readonly [Address];
};

// Event types
export type P2PSentEvent = {
  sender: Address;
  receiver: Address;
  amount: bigint;
};

export type RedEnvelopeSentEvent = {
  envelopeId: bigint;
  sender: Address;
  totalAmount: bigint;
  recipientCount: bigint;
};

export type RedEnvelopeClaimedEvent = {
  envelopeId: bigint;
  recipient: Address;
  amount: bigint;
};

export type RedEnvelopeExpiredEvent = {
  envelopeId: bigint;
};
