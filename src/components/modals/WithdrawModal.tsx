import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSacco } from "@/hooks/useSacco";
import { toast } from "../../lib/toast";
import { X, AlertTriangle } from "lucide-react";
import { type Address } from "viem";
import { useUserStore } from "../../stores/userStore";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: Address;
}

export default function WithdrawModal({ isOpen, onClose, contractAddress }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const { withdrawETH, isLoading } = useSacco(contractAddress);
  const { ethDeposited, updateFinancials } = useUserStore();

  const handleWithdraw = async () => {
    if (!amount) return;

    const withdrawAmount = parseFloat(amount);
    const currentDeposited = parseFloat(ethDeposited);

    if (withdrawAmount > currentDeposited) {
      toast.error("You cannot withdraw more than you have deposited.");
      return;
    }

    try {
      await withdrawETH(amount);
      const newDeposited = currentDeposited - withdrawAmount;
      updateFinancials({ ethDeposited: newDeposited.toString() });
      toast.success("cBTC withdrawn successfully!");
      onClose();
      setAmount("");
    } catch (error) {
      toast.error("Failed to withdraw cBTC");
    }
  };

  const setMaxAmount = () => {
    setAmount(ethDeposited);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Withdraw Collateral
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-withdraw"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Withdrawal Amount (cBTC)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 pr-16 text-white placeholder-neutral-500 focus:border-bitcoin focus:outline-none transition-colors"
                data-testid="input-withdraw-amount"
              />
              <Button
                variant="link"
                onClick={setMaxAmount}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bitcoin text-sm font-medium hover:text-bitcoin/80 p-0"
                data-testid="button-max-withdraw"
              >
                MAX
              </Button>
            </div>
            <p className="text-neutral-400 text-xs mt-1">
              Available to withdraw:{" "}
              <span data-testid="text-available-withdraw">{ethDeposited} cBTC</span>
            </p>
          </div>

          {/* Warning */}
          <Alert className="bg-yellow-900/20 border-yellow-700/50">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-400 text-xs">
              Ensure your collateral ratio stays above 150% to avoid liquidation.
            </AlertDescription>
          </Alert>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-withdraw"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={isLoading || !amount}
              className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90"
              data-testid="button-confirm-withdraw"
            >
              {isLoading ? "Processing..." : "Withdraw cBTC"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
