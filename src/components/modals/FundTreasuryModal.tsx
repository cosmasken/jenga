import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSacco } from "@/hooks/useSacco";
import { CONTRACT_ADDRESSES } from "../../config";
import { toast } from "../../lib/toast";
import { X, CheckCircle } from "lucide-react";
import { parseUnits } from "viem";

interface FundTreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundTreasuryModal({
  isOpen,
  onClose,
}: FundTreasuryModalProps) {
  const [usdcAmount, setUsdcAmount] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);

  const {
    fundTreasury,
    isLoading,
    error,
    treasuryBalance,
    publicClient,
    walletClient,
    address
  } = useSacco(CONTRACT_ADDRESSES.MICRO_SACCO);


  // USDC Contract ABI for approval
  const USDC_ABI = [
    {
      type: 'function',
      name: 'approve',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' }
      ],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      type: 'function',
      name: 'allowance',
      stateMutability: 'view',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' }
      ],
      outputs: [{ name: '', type: 'uint256' }]
    }
  ] as const;

  // Check current USDC allowance
  const checkAllowance = async () => {
    if (!address || !usdcAmount || parseFloat(usdcAmount) <= 0 || !publicClient) {
      setCurrentAllowance(0n);
      setIsApproved(false);
      return;
    }

    try {
      const allowance = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        functionName: 'allowance',
        args: [address, CONTRACT_ADDRESSES.MICRO_SACCO]
      });

      const neededAmount = parseUnits(usdcAmount, 6); // USDC has 6 decimals
      setCurrentAllowance(allowance);
      setIsApproved(allowance >= neededAmount);
    } catch (error) {
      console.error('Error checking allowance:', error);
      setCurrentAllowance(0n);
      setIsApproved(false);
    }
  };

  // Check allowance when amount changes
  useEffect(() => {
    if (isOpen && usdcAmount) {
      checkAllowance();
    }
  }, [usdcAmount, isOpen, address]);

  const handleApprove = async () => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      toast.error("Please enter a valid USDC amount first");
      return;
    }

    if (!publicClient) {
      toast.error("Public client not available");
      return;
    }

    setIsApproving(true);
    try {
      const client = await walletClient;
      if (!client) {
        throw new Error('Wallet client not available');
      }

      const neededAmount = parseUnits(usdcAmount, 6);

      console.log('Approving USDC spending...');
      console.log('Amount to approve:', neededAmount.toString());
      console.log('Spender (Sacco contract):', CONTRACT_ADDRESSES.MICRO_SACCO);

      const txHash = await client.writeContract({
        address: CONTRACT_ADDRESSES.USDC,
        abi: USDC_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESSES.MICRO_SACCO, neededAmount]
      });

      console.log('Approval transaction hash:', txHash);

      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      toast.success("USDC spending approved successfully!");

      // Recheck allowance
      await checkAllowance();

    } catch (error) {
      console.error('Approval error:', error);

      let errorMessage = "Failed to approve USDC spending";
      if (error?.message?.includes('User rejected')) {
        errorMessage = "Approval transaction was rejected";
      } else if (error?.message) {
        errorMessage = `Approval failed: ${error.message}`;
      }

      toast.error(errorMessage);
    } finally {
      setIsApproving(false);
    }
  };

  const handleFundTreasury = async () => {
    if (!usdcAmount || parseFloat(usdcAmount) <= 0) {
      toast.error("Please enter a valid USDC amount");
      return;
    }

    try {
      console.log("Starting fund treasury process with amount:", usdcAmount);
      const txHash = await fundTreasury(usdcAmount);

      if (txHash) {
        console.log("Fund treasury transaction successful:", txHash);
        toast.success(`Successfully funded treasury with ${usdcAmount} USDC!`);
        setUsdcAmount(""); // Clear the input
        onClose(); // Close the modal
      } else {
        console.error("Fund treasury failed - no transaction hash returned");
        toast.error("Failed to fund treasury - no transaction hash returned");
      }
    } catch (error) {
      console.error("Fund treasury error:", error);

      // More specific error messages
      let errorMessage = "Failed to fund treasury";

      if (error?.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient USDC balance";
      } else if (error?.message?.includes('allowance')) {
        errorMessage = "Please approve USDC spending first";
      } else if (error?.message?.includes('User rejected')) {
        errorMessage = "Transaction was rejected";
      } else if (error?.message) {
        errorMessage = `Failed to fund treasury: ${error.message}`;
      }

      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    setUsdcAmount("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Fund Treasury
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              data-testid="button-close-fund-treasury"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div className="text-center">
            <p className="text-neutral-300 mb-4">
              Add USDC to the treasury to increase lending capacity and support the Sacco community.
            </p>

            {/* Current Treasury Balance */}
            <div className="p-3 bg-neutral-900/50 border border-neutral-700 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-sm">Current Treasury Balance</span>
                <span className="font-semibold text-green-400">
                  {treasuryBalance ? (Number(treasuryBalance) / 1e6).toLocaleString() : '0'} USDC
                </span>
              </div>
            </div>

            <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <p className="text-green-400 text-sm">
                💡 Funding the treasury helps other members access loans and strengthens the cooperative.
              </p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                USDC Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={usdcAmount}
                onChange={(e) => setUsdcAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-green-400 focus:outline-none transition-colors"
                data-testid="input-usdc-amount"
                disabled={isLoading || isApproving}
              />
              <p className="text-neutral-400 text-xs mt-1">
                Minimum amount: 1.00 USDC
              </p>
            </div>

            {/* Approval Status */}
            {usdcAmount && parseFloat(usdcAmount) > 0 && (
              <div className={`p-3 border rounded-lg ${isApproved
                ? 'bg-green-900/20 border-green-700/30'
                : 'bg-yellow-900/20 border-yellow-700/30'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isApproved ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-yellow-400 rounded-full" />
                    )}
                    <span className={`text-sm font-medium ${isApproved ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                      USDC Spending {isApproved ? 'Approved' : 'Approval Required'}
                    </span>
                  </div>
                  {!isApproved && (
                    <Button
                      onClick={handleApprove}
                      disabled={isApproving || !usdcAmount || parseFloat(usdcAmount) <= 0}
                      size="sm"
                      className="bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      {isApproving ? 'Approving...' : 'Approve'}
                    </Button>
                  )}
                </div>
                <p className={`text-xs mt-1 ${isApproved ? 'text-green-400/80' : 'text-yellow-400/80'
                  }`}>
                  {isApproved
                    ? 'You can now fund the treasury with this amount'
                    : 'Approve USDC spending before funding the treasury'
                  }
                </p>
              </div>
            )}

            {/* Treasury Impact Preview */}
            {usdcAmount && parseFloat(usdcAmount) > 0 && (
              <div className="p-3 bg-neutral-900/50 border border-neutral-700 rounded-lg">
                <h4 className="font-medium text-green-400 mb-2">Impact Preview</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Your contribution:</span>
                    <span className="text-white">{parseFloat(usdcAmount).toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Current treasury:</span>
                    <span className="text-neutral-300">
                      {treasuryBalance ? (Number(treasuryBalance) / 1e6).toLocaleString() : '0'} USDC
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-700 pt-1 mt-2">
                    <span className="text-neutral-400">New treasury balance:</span>
                    <span className="text-green-400 font-semibold">
                      {treasuryBalance
                        ? ((Number(treasuryBalance) / 1e6) + parseFloat(usdcAmount)).toLocaleString()
                        : parseFloat(usdcAmount).toLocaleString()
                      } USDC
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading || isApproving}
              data-testid="button-cancel-fund"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFundTreasury}
              disabled={
                isLoading ||
                isApproving ||
                !usdcAmount ||
                parseFloat(usdcAmount) <= 0 ||
                !isApproved
              }
              className="flex-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              data-testid="button-fund-treasury"
            >
              {isLoading ? "Processing..." : "Fund Treasury"}
            </Button>
          </div>

          {/* Info Note */}
          <div className="text-center">
            <p className="text-xs text-neutral-500">
              {!isApproved && usdcAmount && parseFloat(usdcAmount) > 0
                ? "Please approve USDC spending first, then fund the treasury."
                : "This transaction will transfer USDC tokens to the treasury contract."
              }
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
