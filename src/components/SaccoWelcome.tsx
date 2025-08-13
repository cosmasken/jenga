import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Coins, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  CheckCircle,
  Info,
  Wallet,
  DollarSign,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SaccoWelcomeProps {
  onGetStarted: () => void;
  onSkip: () => void;
  className?: string;
}

const features = [
  {
    icon: Shield,
    title: 'Bitcoin-Backed Lending',
    description: 'Use your cBTC as collateral to borrow USDC stablecoins',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Competitive Rates',
    description: 'Enjoy lower interest rates as a SACCO member vs platform users',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Users,
    title: 'Community Governance',
    description: 'Vote on proposals and earn governance tokens for participation',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Wallet,
    title: 'Flexible Management',
    description: 'Deposit, withdraw, borrow, and repay anytime with full control',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

const benefits = [
  'Lower interest rates for SACCO members',
  'No minimum deposit requirements',
  'Instant borrowing against collateral',
  'Transparent, on-chain operations',
  'Community-driven governance',
];

export function SaccoWelcome({ onGetStarted, onSkip, className = '' }: SaccoWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to SACCO DeFi',
      subtitle: 'Your Bitcoin-powered lending platform',
      content: (
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-bitcoin/20 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-10 h-10 text-bitcoin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to SACCO DeFi
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                A community-driven lending platform where you can use Bitcoin as collateral 
                to borrow stablecoins with competitive rates.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${feature.bgColor}`}>
                    <feature.icon className={`w-5 h-5 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'How It Works',
      subtitle: 'Simple 3-step process',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                <Coins className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">1. Deposit Collateral</h3>
                <p className="text-sm text-gray-400">
                  Deposit cBTC as collateral to secure your loans
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">2. Borrow USDC</h3>
                <p className="text-sm text-gray-400">
                  Borrow up to 75% of your collateral value in USDC
                </p>
              </div>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">3. Manage & Repay</h3>
                <p className="text-sm text-gray-400">
                  Monitor your loans and repay anytime to unlock collateral
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-400" />
              Member Benefits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 ${className}`}>
      <Card className="w-full max-w-4xl bg-gray-900/90 border-gray-700 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-bitcoin border-bitcoin">
              SACCO DeFi
            </Badge>
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-bitcoin' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl text-white">
            {currentStepData.title}
          </CardTitle>
          <p className="text-gray-400">{currentStepData.subtitle}</p>
        </CardHeader>

        <CardContent className="pb-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStepData.content}
          </motion.div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
            <Button
              variant="ghost"
              onClick={onSkip}
              className="text-gray-400 hover:text-white"
            >
              Skip Introduction
            </Button>

            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-bitcoin hover:bg-bitcoin/90"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-bitcoin to-orange-600 hover:scale-105 transition-transform font-semibold"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SaccoWelcome;
