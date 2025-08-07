# EVM Wallets

There are methods in the Ethereum wallet specific to EVM which we list below, but in general all the methods you need are present on the generic Wallet [described here](/wallets/using-wallets/interacting-with-wallets).

## Check if a wallet is an Ethereum wallet

You can use the `isEthereumWallet` helper method to check if a wallet is a Ethereum wallet. That way, TypeScript will know which methods are available to you.

```ts
import { isEthereumWallet } from '@dynamic-labs/ethereum';

if (!isEthereumWallet(wallet)) {
  throw new Error('This wallet is not a Ethereum wallet');
}

const client = await primaryWallet.getWalletClient();

```

## Ethereum Wallet Methods

| Method                                                                                                                            | Description                                                        |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| getPublicClient(): Promise\<PublicClient\<Transport, Chain>>                                                                      | Retrieves the public client.                                       |
| getWalletClient(chainId?: string): Promise\<WalletClient\<Transport, Chain, Account>>                                             | Retrieves the wallet client.                                       |
| isAtomicSupported(chainId?: number): Promise\<boolean>                                                                            | If the wallet supports atomic actions (EIP-5792).                  |
| isPaymasterServiceSupported(chainId?: number): Promise\<boolean>                                                                  | If the wallet supports paymaster services (EIP-5792).              |
| sendCalls(callParams: Omit\<SendCallsParameters, 'account'>, options?: \{ paymasterURL?: string }): Promise\<SendCallsReturnType> | Sends multiple transactions atomically. Requires EIP-5792 support. |

### Read only actions

If you want to read data from the blockchain, you will want either a ["Public Client"](https://viem.sh/docs/clients/public.html) (Viem terminology), or a ["Provider"](https://docs.ethers.org/v5/getting-started/#getting-started--glossary) (Ethers terminology). Both allow you read only access to the blockchain.

<Tabs>
  <Tab title="Viem">
    ```jsx
    import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

    const { primaryWallet } = useDynamicContext();

    const getEnsName = async () => {
      const publicClient = await primaryWallet?.getPublicClient()

      // Now you can use the public client to read data from the blockchain
      const ens = await publicClient?.getEnsName({ address: primaryWallet.address })
      return ens
    }
    ```
  </Tab>

  <Tab title="Ethers">
    ```jsx
    import { getWeb3Provider } from '@dynamic-labs/ethers-v6';
    import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

    const { primaryWallet } = useDynamicContext();

    const getBalance = async () => {
      const provider = await getWeb3Provider(primaryWallet);

      // Now you can use the provider to read data from the blockchain
      const balance = await provider?.getBalance(primaryWallet.address);
      return balance
    }
    ```
  </Tab>
</Tabs>

### Write actions

If you want to write data to the blockchain, you will need a ["Wallet Client"](https://viem.sh/docs/clients/wallet.html) (Viem terminology), or a ["Signer"](https://docs.ethers.io/v5/api/signer/) (Ethers terminology). Both allow you to sign transactions with the private key.

<Tabs>
  <Tab title="Viem">
    ```jsx
    import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
    import { isEthereumWallet } from '@dynamic-labs/ethereum';
    const { primaryWallet } = useDynamicContext();

    const sendTransaction = async () => {
      if(!primaryWallet || !isEthereumWallet(primaryWallet)) {
        return;
      }

      const walletClient = await primaryWallet.getWalletClient();

      // Now you can use the wallet client to write data to the blockchain
      const tx = await walletClient?.sendTransaction({
        to: '0x1234567890abcdef',
        value: '1000000000000000000'
      });
      return tx
    }
    ```
  </Tab>

  <Tab title="Ethers">
    ```jsx
    import { getSigner } from '@dynamic-labs/ethers-v6';
    import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

    const { primaryWallet } = useDynamicContext();

    const sendTransaction = async () => {
      const signer = await getSigner(primaryWallet);

      // Now you can use the signer to write data to the blockchain
      const tx = await signer?.sendTransaction({
        to: '0x1234567890abcdef',
        value: '1000000000000000000'
      });
      return tx
    }
    ```
  </Tab>
</Tabs>

## Send multiple transactions atomically

If you want to send multiple transactions atomically, you can use the `sendCalls` method. This requires the wallet to support EIP-5792.

```jsx
    import { parseEther } from 'viem';
    import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
    import { isEthereumWallet } from '@dynamic-labs/ethereum';

    const { primaryWallet } = useDynamicContext();

    const sendTransactions = async () => {
      if(!primaryWallet || !isEthereumWallet(primaryWallet) || !primaryWallet.isAtomicSupported()) {
        return;
      }

      // Now you can use the wallet client to write data to the blockchain
      const { id } = await primaryWallet.sendCalls({
        calls: [
          {
            to: '0x1111111111111111111111111111111111111111',
            value: parseEther('0.001'),
          },
          {
            to: '0x2222222222222222222222222222222222222222',
            value: parseEther('0.001'),
          },
        ],
        version: '2.0.0',
      });

      return id
    }
```

## Examples
# Get balance for all wallets

> In this example, we will get the balance for each connected wallet.

For each wallet, we will get the provider with [useRpcProviders](/react-sdk/hooks/userpcproviders), to fetch the
balance by calling the `getBalance` with the wallet address.

```JavaScript
import { useUserWallets } from '@dynamic-labs/sdk-react-core';
import { useRpcProviders } from '@dynamic-labs/sdk-react-core'
import { evmProvidersSelector } from '@dynamic-labs/ethereum-core'


const App = () => {
  const userWallets = useUserWallets();
  const { defaultProvider } = useRpcProviders(evmProvidersSelector)

  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;

      // Get the EVM Mainnet provider
     const provider = defaultProvider?.provider;

      if (!provider) return;

      // Fetch the wallet balance
      const balance = await provider.getBalance({ address: wallet.address });

      console.log('balance', balance.toString());
    });
  }, [userWallets, defaultProvider]);

  ...
}

```

# Get balance for all wallets

> In this example, we will get the balance for each connected wallet.

For each wallet, we will get the provider with [useRpcProviders](/react-sdk/hooks/userpcproviders), to fetch the
balance by calling the `getBalance` with the wallet address.

```JavaScript
import { useUserWallets } from '@dynamic-labs/sdk-react-core';
import { useRpcProviders } from '@dynamic-labs/sdk-react-core'
import { evmProvidersSelector } from '@dynamic-labs/ethereum-core'


const App = () => {
  const userWallets = useUserWallets();
  const { defaultProvider } = useRpcProviders(evmProvidersSelector)

  useEffect(() => {
    userWallets.forEach(async (wallet) => {
      if (!wallet) return;

      // Get the EVM Mainnet provider
     const provider = defaultProvider?.provider;

      if (!provider) return;

      // Fetch the wallet balance
      const balance = await provider.getBalance({ address: wallet.address });

      console.log('balance', balance.toString());
    });
  }, [userWallets, defaultProvider]);

  ...
}

```
# Estimate Gas

Before sending a transaction, you can use the public client to estimate the gas
fees. Some chains also support custom gas estimation methods.

Here are examples of how to get a gas estimate using viem:

## Setup

```tsx
import { FC } from 'react';

import { parseEther, toHex } from 'viem';

import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { isEthereumWallet } from '@dynamic-labs/ethereum-core';

export const EVMEstimateGas: FC = () => {
  const toAddress = '0x0000000000000000000000000000000000000000';
  const amount = '0.001';

  const { primaryWallet } = useDynamicContext();

  if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
    return (
      <div>EVM Wallet not found</div>
    );
  }
  
  const estimateGas = async () => {
    // See [Estimate Gas Function]
  }

  return (
    <div>
      <button onClick={estimateGas}>Estimate Gas</button>
    </div>
  )
};
```

## Estimate Gas Function

<Tabs>
  <Tab title="General">
    ```tsx
    const estimateGas = async () => {
      const client = await primaryWallet.getPublicClient();

      if (!client) {
        console.error('Failed to get wallet client');
        return;
      }

      const estimate = await client.transport.request({
        method: 'eth_estimateGas',
        params: [
          {
            from: primaryWallet.address as `0x${string}`,
            to: toAddress as `0x${string}`,
            value: toHex(parseEther(amount)),
          },
        ],
      });

      // On success, the estimate will be a hex string
      console.log(estimate);
    }
    ```
  </Tab>

  <Tab title="Linea">
    ```tsx
    const estimateGas = async () => {
      const client = await primaryWallet.getPublicClient();

      if (!client) {
        console.error('Failed to get wallet client');
        return;
      }

      const estimate = await client.transport.request({
        method: 'linea_estimateGas',
        params: [
          {
            from: primaryWallet.address as `0x${string}`,
            to: toAddress as `0x${string}`,
            value: toHex(parseEther(amount)),
          },
        ],
      });

      // On success, the estimate will be an object like:
      // {
      //   baseFeePerGas: "0x7",
      //   gasLimit: "0xcf08",
      //   priorityFeePerGas: "0x43a82a4"
      // }
      console.log(estimate);
    }
    ```
  </Tab>
</Tabs>
# Sign a message in Ethereum/EVM

> In this example, we are creating a button to sign a message and log the signature to the console.

```JavaScript
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const SignMessageButton = () => {
  const { primaryWallet } = useDynamicContext();

  const signMessage = async () => {
    if (!primaryWallet) return;

    const signature = await primaryWallet.signMessage('example');

    console.log('signature', signature);
  };

  return <button onClick={signMessage}>Sign message</button>;
};
```
# Decode Signatures using Viem

> Learn how to decode and verify signatures using viem in your Dynamic application.

## Overview

After signing messages, you'll often need to decode and verify signatures. Viem provides utilities for signature verification and recovery. This guide shows you how to decode signatures to extract the signer's address and verify message authenticity.

## Decode a Simple Message Signature

```typescript
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { recoverMessageAddress, verifyMessage } from 'viem';

const DecodeSignatureButton = () => {
  const { primaryWallet } = useDynamicContext();

  const decodeSignature = async () => {
    if (!primaryWallet) return;

    // First, sign a message
    const message = "Hello, this is a test message";
    const signature = await primaryWallet.signMessage(message);

    // Decode the signature to recover the signer's address
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature,
    });

    // Verify the signature
    const isValid = await verifyMessage({
      address: primaryWallet.address,
      message,
      signature,
    });

    const decodedInfo = {
      originalMessage: message,
      signature,
      signerAddress: primaryWallet.address,
      recoveredAddress,
      isValidSignature: isValid,
      addressMatch: recoveredAddress.toLowerCase() === primaryWallet.address.toLowerCase(),
    };

    console.log('Decoded signature info:', decodedInfo);

    return decodedInfo;
  };

  return <button onClick={decodeSignature}>Decode Signature</button>;
};
```

## Best Practices

1. **Always verify signatures**: Don't just recover the address - also verify the signature is valid
2. **Handle errors gracefully**: Signature decoding can fail for various reasons
3. **Validate addresses**: Ensure the recovered address matches the expected signer
4. **Use case-insensitive comparison**: Compare addresses using `toLowerCase()` for consistency

