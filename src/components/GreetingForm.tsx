import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { parseAbi } from "viem";
import { useState } from "react";

const CONTRACT_ABI = parseAbi([
    "function setGreeting(string memory _greeting) external",
]);
const CONTRACT_ADDRESS = "0xYourContractAddress";

export function GreetingForm() {
    const { primaryWallet } = useDynamicContext();
    const [hash, setHash] = useState<string>();

    const submit = async (greeting: string) => {
        if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;

        const walletClient = await primaryWallet.getWalletClient();

        const txHash = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "setGreeting",
            args: [greeting],
        });

        setHash(txHash);
    };

    return (
        <div className="bg-white p-3">
            <button className="bg-emerald-8 p-2 text-black" onClick={() => submit("Hello from Dynamic!")}>
                Set greeting
            </button>
            {hash && <p>Tx: {hash}</p>}
        </div>
    );
}