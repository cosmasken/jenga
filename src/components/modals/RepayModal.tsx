import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSacco } from "@/hooks/useSacco";
import { useUserStore } from "../../stores/userStore";
import { toast } from "../../lib/toast";
import { X } from "lucide-react";
import { type Address } from "viem";

interface RepayModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: Address;
}

export default function RepayModal({ isOpen, onClose, contractAddress }: RepayModalProps) {
  const [amount, setAmount] = useState("");
  const { repayUSDC, isLoading } = useSacco(contractAddress);
  const { usdcBorrowed, updateFinancials } = useUserStore();

  const handleRepay = async () => {
    if (!amount) return;

    const repayAmount = parseFloat(amount);
    const currentBorrowed = parseFloat(usdcBorrowed);

    if (repayAmount > currentBorrowed) {
      toast.error(`Cannot repay more than borrowed amount: ${currentBorrowed} USDC`);
      return;
    }

    try {
      await repayUSDC(amount);

      // Update the borrowed amount in store
      const newBorrowedAmount = Math.max(0, currentBorrowed - repayAmount).toFixed(2);
      updateFinancials({ usdcBorrowed: newBorrowedAmount });

      toast.success("USDC repaid successfully!");
      onClose();
      setAmount("");
    } catch (error) {
      toast.error("Failed to repay USDC");
    }
  };

  const setMaxAmount = () => {
    setAmount(usdcBorrowed);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Repay Loan
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-repay"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="repay-amount" className="text-sm font-medium">
              Repayment Amount (USDC)
            </Label>
            <div className="relative mt-2">
              <Input
                id="repay-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white pr-16"
                data-testid="input-repay-amount"
              />
              <Button
                variant="link"
                onClick={setMaxAmount}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bitcoin text-sm font-medium hover:text-bitcoin/80 p-0"
                data-testid="button-max-repay"
              >
                MAX
              </Button>
            </div>
            <p className="text-neutral-400 text-xs mt-1">
              Outstanding debt:{" "}
              <span data-testid="text-outstanding-debt">{usdcBorrowed} USDC</span>
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-repay"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRepay}
              disabled={isLoading || !amount}
              className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90"
              data-testid="button-confirm-repay"
            >
              {isLoading ? "Processing..." : "Repay Loan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
