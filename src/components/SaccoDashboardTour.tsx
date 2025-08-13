import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Target, 
  Shield, 
  Coins, 
  TrendingUp,
  Users,
  BarChart3,
  History,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SaccoDashboardTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Your SACCO Dashboard',
    description: 'Let\'s take a quick tour of your new lending and borrowing platform.',
    icon: Shield,
    color: 'text-bitcoin',
    bgColor: 'bg-bitcoin/10',
    target: null,
    content: (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-bitcoin/20 rounded-full flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-bitcoin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            You're now a SACCO member!
          </h3>
          <p className="text-gray-400">
            This dashboard gives you full control over your Bitcoin-backed lending activities.
            Let's explore the key features together.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'wallet-info',
    title: 'Wallet & Network Status',
    description: 'Monitor your connection status and wallet information at the top.',
    icon: Target,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    target: 'wallet-info',
    content: (
      <div className="space-y-3">
        <p className="text-gray-300">
          The header shows your connected wallet address and current network. 
          You can also view your token balances and manage your wallet connection here.
        </p>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-300">Always verify you're on Citrea Testnet</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'collateral-card',
    title: 'Collateral Management',
    description: 'Deposit and manage your cBTC collateral to secure loans.',
    icon: Coins,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    target: 'collateral-card',
    content: (
      <div className="space-y-3">
        <p className="text-gray-300">
          Your collateral is the foundation of the lending system. Deposit cBTC to:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Secure your borrowing capacity</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Maintain healthy loan ratios</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Withdraw excess collateral anytime</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'loan-card',
    title: 'Active Loans',
    description: 'Track your USDC borrowings and manage repayments.',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    target: 'loan-card',
    content: (
      <div className="space-y-3">
        <p className="text-gray-300">
          Monitor your borrowing activity and loan health:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>View current debt and interest rates</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Borrow more USDC (up to 75% of collateral)</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Repay loans to reduce interest and unlock collateral</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'governance-card',
    title: 'Governance & Rewards',
    description: 'Participate in community governance and earn rewards.',
    icon: Users,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    target: 'governance-card',
    content: (
      <div className="space-y-3">
        <p className="text-gray-300">
          As a SACCO member, you have governance rights:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Vote on platform proposals and changes</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Earn governance tokens for participation</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Influence interest rates and platform policies</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'analytics-panel',
    title: 'Platform Analytics',
    description: 'Monitor key metrics and your account health.',
    icon: BarChart3,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    target: 'analytics-panel',
    content: (
      <div className="space-y-3">
        <p className="text-gray-300">
          Keep track of important metrics:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Your health factor and liquidation risk</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Platform utilization and interest rates</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Treasury balance and community stats</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: 'transaction-history',
    title: 'Transaction History',
    description: 'Review all your platform interactions and activities.',
    icon: History,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    target: 'transaction-history',
    content: (
      <div className="space-y-3">
        <p className="text-gray-300">
          Track your complete activity history:
        </p>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>All deposits, withdrawals, and loans</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Transaction hashes for blockchain verification</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Interest accrual and payment history</span>
          </li>
        </ul>
      </div>
    ),
  },
];

export function SaccoDashboardTour({ isOpen, onClose, onComplete }: SaccoDashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);

  const currentStepData = tourSteps[currentStep];

  useEffect(() => {
    if (isOpen && currentStepData.target) {
      setHighlightedElement(currentStepData.target);
      
      // Scroll to the target element
      const element = document.getElementById(currentStepData.target);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen, currentStepData.target]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setHighlightedElement(null);
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    setHighlightedElement(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
      
      {/* Highlight overlay for targeted elements */}
      {highlightedElement && (
        <div className="fixed inset-0 z-45 pointer-events-none">
          <style>
            {`
              #${highlightedElement} {
                position: relative;
                z-index: 46;
                box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.6);
                border-radius: 8px;
              }
            `}
          </style>
        </div>
      )}

      {/* Tour Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="w-full max-w-md bg-gray-900/95 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${currentStepData.bgColor}`}>
                      <currentStepData.icon className={`w-5 h-5 ${currentStepData.color}`} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {currentStep + 1} of {tourSteps.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {currentStepData.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                      {currentStepData.description}
                    </p>
                  </div>

                  {currentStepData.content}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Skip Tour
                  </Button>

                  <div className="flex space-x-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}

                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="bg-bitcoin hover:bg-bitcoin/90"
                    >
                      {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* Progress indicator */}
                <div className="flex space-x-1 mt-4 justify-center">
                  {tourSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-bitcoin' : 
                        index < currentStep ? 'bg-bitcoin/60' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default SaccoDashboardTour;
