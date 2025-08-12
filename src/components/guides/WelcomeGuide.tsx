import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useUserStore } from "../../stores/userStore";
import { ChevronRight, ChevronLeft, Shield, Coins, Users, TrendingUp, Wallet, Bitcoin } from "lucide-react";

interface WelcomeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const guideSteps = [
  {
    title: "Welcome to Sacco & Chama",
    icon: <Bitcoin className="w-12 h-12 text-bitcoin" />,
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300">
          Experience two powerful ways to build Bitcoin wealth:
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-neutral-900 p-4 rounded-lg">
            <h4 className="text-bitcoin font-semibold mb-2">🏦 Sacco DeFi</h4>
            <ul className="space-y-1 text-xs text-neutral-400">
              <li>• Deposit cBTC collateral</li>
              <li>• Borrow USDC</li>
              <li>• Participate in governance</li>
            </ul>
          </div>
          <div className="bg-neutral-900 p-4 rounded-lg">
            <h4 className="text-blue-400 font-semibold mb-2">👥 Chama Circles</h4>
            <ul className="space-y-1 text-xs text-neutral-400">
              <li>• Join savings groups</li>
              <li>• Regular contributions</li>
              <li>• Rotating payouts</li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Sacco DeFi Lending",
    icon: <Coins className="w-12 h-12 text-bitcoin" />,
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300">
          Use your Bitcoin as collateral to access stable liquidity:
        </p>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li>• Deposit cBTC as collateral</li>
          <li>• Borrow USDC against your Bitcoin</li>
          <li>• Minimum collateral ratio: 150%</li>
          <li>• Keep your Bitcoin exposure while accessing liquidity</li>
        </ul>
        <div className="mt-4 p-3 bg-bitcoin/10 border border-bitcoin/30 rounded-lg">
          <p className="text-bitcoin text-sm font-medium">
            Recommended: Maintain 200%+ collateral ratio for safety
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Chama Savings Circles",
    icon: <Users className="w-12 h-12 text-blue-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300">
          Join community-powered savings groups with Bitcoin:
        </p>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li>• Create or join existing chamas</li>
          <li>• Make regular Bitcoin contributions</li>
          <li>• Receive collective savings in rotation</li>
          <li>• Build disciplined saving habits</li>
        </ul>
        <div className="mt-4 p-3 bg-blue-400/10 border border-blue-400/30 rounded-lg">
          <p className="text-blue-400 text-sm font-medium">
            Perfect for building Bitcoin wealth with community support
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "Cooperative Governance",
    icon: <Shield className="w-12 h-12 text-green-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300">
          Participate in platform governance and decision making:
        </p>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li>• Earn governance tokens from participation</li>
          <li>• Vote on platform proposals and changes</li>
          <li>• Help shape the future of both platforms</li>
          <li>• Access member-only features and benefits</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Safety & Security",
    icon: <TrendingUp className="w-12 h-12 text-purple-400" />,
    content: (
      <div className="space-y-4">
        <p className="text-neutral-300">
          Your security and fund safety are our top priorities:
        </p>
        <ul className="space-y-2 text-sm text-neutral-400">
          <li>• All smart contracts are audited and open-source</li>
          <li>• Your funds remain under your control</li>
          <li>• Real-time monitoring and alerts</li>
          <li>• Transparent operations for both platforms</li>
        </ul>
        <div className="mt-4 p-3 bg-green-400/10 border border-green-400/30 rounded-lg">
          <p className="text-green-400 text-sm font-medium">
            Start with small amounts to familiarize yourself with the platforms
          </p>
        </div>
      </div>
    ),
  },
];

export default function WelcomeGuide({ isOpen, onClose }: WelcomeGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const markGuideAsSeen = useUserStore((state) => state.markGuideAsSeen);

  const handleClose = () => {
    markGuideAsSeen('welcome');
    onClose();
  };

  const nextStep = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentGuideStep = guideSteps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-black border-neutral-800 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Getting Started Guide
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div>
            <Progress value={((currentStep + 1) / guideSteps.length) * 100} className="mb-2" />
            <p className="text-sm text-neutral-400 text-center">
              Step {currentStep + 1} of {guideSteps.length}
            </p>
          </div>

          {/* Step Content */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {currentGuideStep.icon}
            </div>
            <h3 className="text-xl font-semibold">{currentGuideStep.title}</h3>
            {currentGuideStep.content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center"
              data-testid="button-guide-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button
              onClick={nextStep}
              className="bg-bitcoin text-black hover:bg-bitcoin/90 flex items-center"
              data-testid="button-guide-next"
            >
              {currentStep === guideSteps.length - 1 ? "Get Started" : "Next"}
              {currentStep !== guideSteps.length - 1 && (
                <ChevronRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>

          {/* Skip Option */}
          <div className="text-center">
            <Button
              variant="link"
              onClick={handleClose}
              className="text-neutral-400 text-sm"
              data-testid="button-skip-guide"
            >
              Skip guide
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}