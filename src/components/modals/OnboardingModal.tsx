import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useSacco } from "@/hooks/useSacco";
import { useUserStore } from "../../stores/userStore";
import { CONTRACT_ADDRESSES } from "../../config";
import { toast } from "../../lib/toast";
import { X } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({
  isOpen,
  onClose,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  
  // Use useSacco hook with the contract address
  const { join, depositETH, borrowUSDC, isLoading, error, memberData, refreshData } = useSacco(CONTRACT_ADDRESSES.MICRO_SACCO);
  const { completeOnboarding, updateFinancials, setMemberStatus } = useUserStore();

  const steps = [
    { number: 1, title: "Register", description: "Pay 0.0001 cBTC to join" },
    { number: 2, title: "Deposit", description: "Deposit cBTC as collateral" },
    { number: 3, title: "Borrow", description: "Borrow USDC against collateral" },
  ];

  const handleJoin = async () => {
    // Check if user is already a member
    if (memberData?.isMember) {
      toast.success("You are already a member!");
      setCurrentStep(2);
      return;
    }

    try {
      console.log("=== ONBOARDING JOIN DEBUG ===");
      console.log("Starting join process...");
      console.log("Current member status:", memberData?.isMember);
      console.log("Member data:", memberData);
      
      const txHash = await join();
      
      if (txHash) {
        console.log("Join transaction successful:", txHash);
        
        // Refresh data to get updated membership status
        await refreshData();
        
        // Mark user as member in Zustand store
        setMemberStatus(true);
        toast.success("Successfully joined Sacco!");
        setCurrentStep(2);
      } else {
        console.error("Join failed - no transaction hash returned");
        toast.error("Failed to join Sacco - no transaction hash returned");
      }
    } catch (error) {
      console.error("Join error:", error);
      
      // More specific error messages
      let errorMessage = "Failed to join Sacco";
      
      if (error?.message?.includes('already a member')) {
        errorMessage = "You are already a member of Sacco";
        setCurrentStep(2); // Skip to deposit step
      } else if (error?.message?.includes('insufficient funds')) {
        errorMessage = "Insufficient funds. You need at least 0.0001 cBTC to join";
      } else if (error?.message?.includes('User rejected')) {
        errorMessage = "Transaction was rejected";
      } else if (error?.message) {
        errorMessage = `Failed to join Sacco: ${error.message}`;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid deposit amount");
      return;
    }

    try {
      console.log("Starting deposit process with amount:", depositAmount);
      const txHash = await depositETH(depositAmount);
      
      if (txHash) {
        // Update financial data in Zustand store
        const newDepositAmount = parseFloat(depositAmount);
        const newMaxBorrow = ((newDepositAmount * 2400) * 0.75).toFixed(2); // 75% LTV
        updateFinancials({
          ethDeposited: newDepositAmount.toFixed(4),
          maxBorrowAmount: newMaxBorrow
        });

        toast.success("cBTC deposited successfully!");
        setCurrentStep(3);
      } else {
        toast.error("Failed to deposit cBTC - no transaction hash returned");
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error(`Failed to deposit cBTC: ${error?.message || 'Unknown error'}`);
    }
  };

  const handleBorrow = async () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast.error("Please enter a valid borrow amount");
      return;
    }

    try {
      console.log("Starting borrow process with amount:", borrowAmount);
      const txHash = await borrowUSDC(borrowAmount);
      
      if (txHash) {
        // Update borrowed amount in Zustand store
        const borrowAmountNum = parseFloat(borrowAmount);
        updateFinancials({ usdcBorrowed: borrowAmountNum.toFixed(2) });

        toast.success("USDC borrowed successfully!");
        completeOnboarding(); // Mark onboarding as complete
        onClose();
        setCurrentStep(1); // Reset for next time
      } else {
        toast.error("Failed to borrow USDC - no transaction hash returned");
      }
    } catch (error) {
      console.error("Borrow error:", error);
      toast.error(`Failed to borrow USDC: ${error?.message || 'Unknown error'}`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pay Registration Fee</h3>
            <p className="text-neutral-400 text-sm">
              Join the Sacco cooperative by paying a one-time registration fee of
              0.0001 cBTC.
            </p>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Registration Fee</span>
                <span className="font-semibold">0.0001 cBTC</span>
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
                data-testid="button-cancel-join"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoin}
                disabled={isLoading}
                className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90"
                data-testid="button-join-sacco"
              >
                {isLoading ? "Processing..." : "Pay & Join"}
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Deposit Collateral</h3>
            <p className="text-neutral-400 text-sm">
              Deposit cBTC as collateral to enable borrowing.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                Deposit Amount (cBTC)
              </label>
              <input
                type="number"
                step="0.0001"
                min="0"
                placeholder="0.0000"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-bitcoin focus:outline-none transition-colors"
                data-testid="input-deposit-amount"
                disabled={isLoading}
              />
              <p className="text-neutral-400 text-xs mt-1">
                Minimum: 0.0001 cBTC (you can deposit any amount above this)
              </p>
            </div>
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="flex-1"
                disabled={isLoading}
                data-testid="button-back-deposit"
              >
                Back
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={isLoading || !depositAmount || parseFloat(depositAmount) <= 0}
                className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90"
                data-testid="button-deposit-eth"
              >
                {isLoading ? "Processing..." : "Deposit cBTC"}
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Borrow USDC</h3>
            <p className="text-neutral-400 text-sm">
              Borrow USDC against your cBTC collateral.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">
                Borrow Amount (USDC)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-neutral-500 focus:border-bitcoin focus:outline-none transition-colors"
                data-testid="input-borrow-amount"
                disabled={isLoading}
              />
              <p className="text-neutral-400 text-xs mt-1">
                Max available: {depositAmount ? (parseFloat(depositAmount) * 2400 * 0.75).toFixed(2) : '0.00'} USDC
              </p>
            </div>
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="flex-1"
                disabled={isLoading}
                data-testid="button-back-borrow"
              >
                Back
              </Button>
              <Button
                onClick={handleBorrow}
                disabled={isLoading || !borrowAmount || parseFloat(borrowAmount) <= 0}
                className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90"
                data-testid="button-borrow-usdc"
              >
                {isLoading ? "Processing..." : "Borrow USDC"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Join Sacco
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-onboarding"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Stepper */}
        <div className="mb-6">
          <Progress value={(currentStep / 3) * 100} className="mb-4" />
          <div className="flex justify-between text-sm">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center ${currentStep >= step.number
                  ? "text-bitcoin"
                  : "text-neutral-400"
                  }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-2 ${currentStep >= step.number
                    ? "bg-bitcoin text-black"
                    : "border-2 border-neutral-600"
                    }`}
                >
                  {step.number}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
}
