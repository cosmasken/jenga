import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSacco } from "../../hooks/useSacco";
import { toast } from "../../lib/toast";
import { X, AlertTriangle } from "lucide-react";
import { type Address } from "viem";
import { type MemberData } from "../../hooks/useSacco";

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: Address;
  memberData: MemberData | null;
}

export default function BorrowModal({ isOpen, onClose, contractAddress, memberData }: BorrowModalProps) {
  const [amount, setAmount] = useState("");
  const [needsDeposit, setNeedsDeposit] = useState(false);
  const { borrowUSDC, isLoading } = useSacco(contractAddress);

  const ethDeposited = memberData ? (Number(memberData.ethDeposited) / 1e18).toFixed(4) : '0.0000';
  const usdcBorrowed = memberData ? (Number(memberData.usdcBorrowed) / 1e6).toFixed(2) : '0.00';

  // Check if user needs to deposit first
  useEffect(() => {
    const currentEth = parseFloat(ethDeposited);
    setNeedsDeposit(currentEth === 0);
  }, [ethDeposited]);

  const calculateMaxBorrow = () => {
    const currentEth = parseFloat(ethDeposited);
    const currentBorrowed = parseFloat(usdcBorrowed);
    const ethValueInUsd = currentEth * 2400; // cBTC price at $2400
    const maxBorrowable = (ethValueInUsd * 0.75) - currentBorrowed; // 75% collateral ratio
    return Math.max(0, maxBorrowable);
  };

  const handleBorrow = async () => {
    if (!amount) return;

    const borrowAmount = parseFloat(amount);
    const maxAllowed = calculateMaxBorrow();

    if (borrowAmount > maxAllowed) {
      toast.error(`Maximum borrowable amount is ${maxAllowed.toFixed(2)} USDC`);
      return;
    }

    try {
      await borrowUSDC(amount);
      toast.success("USDC borrowed successfully!");
      onClose();
      setAmount("");
    } catch (error) {
      toast.error("Failed to borrow USDC");
    }
  };

  const setMaxAmount = () => {
    const maxAmount = calculateMaxBorrow();
    setAmount(maxAmount.toFixed(2));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Borrow USDC
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-borrow"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Deposit Warning */}
          {needsDeposit && (
            <div className="p-4 bg-orange-900/20 border border-orange-600/50 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5" />
              <div>
                <p className="text-orange-400 font-medium">Deposit Required</p>
                <p className="text-sm text-orange-300 mt-1">
                  You need to deposit cBTC as collateral before you can borrow USDC.
                </p>
              </div>
            </div>
          )}

          {/* Loan Information */}
          {!needsDeposit && (
            <div className="space-y-3">
              <div className="p-4 bg-neutral-900/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Collateral Deposited:</span>
                  <span>{ethDeposited} cBTC (${(parseFloat(ethDeposited) * 2400).toFixed(2)})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Currently Borrowed:</span>
                  <span>{usdcBorrowed} USDC</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Available to Borrow:</span>
                  <span className="text-green-400">{calculateMaxBorrow().toFixed(2)} USDC</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="borrow-amount" className="text-sm font-medium">
              Borrow Amount (USDC)
            </Label>
            <div className="relative mt-2">
              <Input
                id="borrow-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={needsDeposit}
                className="bg-neutral-900 border-neutral-700 text-white pr-16"
                data-testid="input-borrow-amount"
              />
              <Button
                variant="link"
                onClick={setMaxAmount}
                disabled={needsDeposit}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-bitcoin text-sm font-medium hover:text-bitcoin/80 p-0"
                data-testid="button-max-borrow"
              >
                MAX
              </Button>
            </div>
          </div>

          {!needsDeposit && (
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
              <h4 className="font-medium mb-2">Loan Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Interest Rate:</span>
                  <span>5.2% APR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Collateral Ratio:</span>
                  <span>75% LTV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Liquidation Threshold:</span>
                  <span className="text-red-400">133%</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel-borrow"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBorrow}
              disabled={isLoading || !amount || needsDeposit}
              className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90 disabled:opacity-50"
              data-testid="button-confirm-borrow"
            >
              {isLoading ? "Processing..." : needsDeposit ? "Deposit cBTC First" : "Borrow USDC"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
