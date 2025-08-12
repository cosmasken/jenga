import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSacco } from "@/hooks/useSacco";
import { useUserStore } from "../../stores/userStore";
import { toast } from "../../lib/toast";
import { X, Info } from "lucide-react";
import { formatEther, parseEther } from "viem";
import { SACCO_CONSTANTS, formatETH, validateETHAmount, getErrorMessage } from "../../lib/saccoUtils";
import type { Address } from "viem";



interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress?: Address;
}

export default function DepositModal({ isOpen, onClose, contractAddress }: DepositModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAmount, setDepositAmount] = useState(""); // User-selected amount

  const {
    depositETH,
    isLoading,
    error,
    ethBalance,
    memberData,
    isConnected,
    refreshData,

  } = useSacco(contractAddress);

  const { updateFinancials } = useUserStore();

  // Minimum deposit amount for collateral (much smaller than join fee)
  const minDepositAmount = "0.0001"; // 0.0001 ETH minimum for deposits
  const minDepositFormatted = "0.0001";

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    if (parseFloat(depositAmount) < parseFloat(minDepositAmount)) {
      toast.error(`Minimum deposit amount is ${minDepositFormatted} cBTC`);
      return;
    }

    // Validate the amount against user balance
    const validation = validateETHAmount(depositAmount, ethBalance);
    if (!validation.isValid) {
      toast.error(getErrorMessage(validation.error!));
      return;
    }

    setIsProcessing(true);

    try {
      const hash = await depositETH(depositAmount);

      if (hash) {
        // Update the deposited amount in store
        const currentDeposited = memberData?.ethDeposited || 0n;
        const depositAmountWei = parseEther(depositAmount);
        const newDepositAmount = formatETH(currentDeposited + depositAmountWei);

        // Calculate new max borrow (assuming ETH price of $2400 and 50% LTV)
        const newMaxBorrow = ((parseFloat(newDepositAmount) * 2400) * 0.5).toFixed(2);

        updateFinancials({
          ethDeposited: newDepositAmount,
          maxBorrowAmount: newMaxBorrow
        });

        toast.success(`Successfully deposited ${minDepositFormatted} ETH!`);
        onClose();

        // Refresh contract data
        await refreshData();
      }
    } catch (error: any) {
      console.error('Deposit failed:', error);
      toast.error(error?.message || "Failed to deposit ETH");
    } finally {
      setIsProcessing(false);
    }
  };

  const canDeposit = isConnected &&
    depositAmount &&
    parseFloat(depositAmount) >= parseFloat(minDepositAmount) &&
    parseFloat(ethBalance) >= parseFloat(depositAmount) &&
    !isLoading &&
    !isProcessing;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Deposit Collateral
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-deposit"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
              {/* <p className="text-red-400 text-sm text-truncate">{error}</p> */}
              <p className="text-red-400 text-sm text-truncate">Error</p>
            </div>
          )}

          {/* Deposit Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Deposit Amount (cBTC)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                min={minDepositAmount}
                placeholder="0.0000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 pr-16 text-white placeholder-neutral-500 focus:border-bitcoin focus:outline-none transition-colors text-lg font-mono"
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setDepositAmount(parseFloat(ethBalance).toFixed(4))}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs bg-bitcoin text-black rounded hover:bg-bitcoin/90 transition-colors"
                disabled={isProcessing}
              >
                Max
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              <p className="text-neutral-400">
                Wallet balance: <span className="text-white">{parseFloat(ethBalance).toFixed(4)} cBTC</span>
              </p>
              <p className="text-neutral-400">
                Minimum: <span className="text-bitcoin">{minDepositFormatted} cBTC</span>
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-bitcoin mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-2">About This Deposit</h4>
                <ul className="text-sm text-neutral-400 space-y-1">
                  <li>• Fixed minimum deposit amount from contract</li>
                  <li>• Increases your borrowing capacity</li>
                  <li>• Improves your collateral ratio</li>
                  <li>• Earns governance token rewards</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Balance Warning */}
          {parseFloat(ethBalance) < parseFloat(minDepositAmount) && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                Insufficient ETH balance. You need at least {minDepositFormatted} ETH to make a deposit.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-deposit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!canDeposit}
              className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-confirm-deposit"
            >
              {isProcessing || isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                `Deposit ${minDepositFormatted} ETH`
              )}
            </Button>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="text-center">
              <p className="text-neutral-400 text-sm">
                Connect your wallet to make a deposit
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
