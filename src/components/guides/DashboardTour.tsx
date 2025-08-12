import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore } from "../../stores/userStore";
import { X, ArrowRight, Target } from "lucide-react";

interface DashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps = [
  {
    title: "Your Portfolio Overview",
    content: "The top section shows your connected wallet and network status. Here you can see your current connection details.",
    target: "wallet-info",
  },
  {
    title: "Collateral Management",
    content: "The first card shows your cBTC collateral. Use 'Deposit' to add more collateral or 'Withdraw' to remove excess collateral.",
    target: "collateral-card",
  },
  {
    title: "Active Loans",
    content: "Track your USDC borrowings and interest rates. Use 'Borrow More' for additional loans or 'Repay' to reduce your debt.",
    target: "loan-card",
  },
  {
    title: "Governance Participation",
    content: "Earn governance tokens and vote on platform proposals. Your voting power increases with your participation.",
    target: "governance-card",
  },
  {
    title: "Transaction History",
    content: "Monitor all your platform interactions including deposits, withdrawals, borrows, and repayments.",
    target: "transaction-history",
  },
  {
    title: "Platform Analytics",
    content: "Keep track of important metrics like utilization rates, interest rates, and your health factor.",
    target: "analytics-panel",
  },
];

export default function DashboardTour({ isOpen, onClose }: DashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const markGuideAsSeen = useUserStore((state) => state.markGuideAsSeen);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleClose = () => {
    markGuideAsSeen('dashboard');
    onClose();
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Dashboard Tour
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              data-testid="button-close-tour"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step Indicator */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-bitcoin" />
              <span className="text-sm text-neutral-400">
                {currentStep + 1} of {tourSteps.length}
              </span>
            </div>
          </div>

          {/* Step Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">
              {currentTourStep.title}
            </h3>
            <p className="text-neutral-300 text-center">
              {currentTourStep.content}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index <= currentStep ? 'bg-bitcoin' : 'bg-neutral-600'
                  }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleClose}
              data-testid="button-skip-tour"
            >
              Skip Tour
            </Button>

            <Button
              onClick={nextStep}
              className="bg-bitcoin text-black hover:bg-bitcoin/90 flex items-center"
              data-testid="button-tour-next"
            >
              {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
              {currentStep !== tourSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}