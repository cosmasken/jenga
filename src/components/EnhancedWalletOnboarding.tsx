import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Wallet, Network, User, Zap } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAccount, useChainId } from 'wagmi';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed' | 'error';
  action?: () => void;
  actionText?: string;
}

export const EnhancedWalletOnboarding = () => {
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: 'wallet',
      title: 'Connect Your Wallet',
      description: 'Connect MetaMask or any Web3 wallet to get started',
      icon: <Wallet className="w-5 h-5" />,
      status: isConnected ? 'completed' : 'active',
      action: () => setShowAuthFlow(true),
      actionText: 'Connect Wallet'
    },
    {
      id: 'network',
      title: 'Switch to Citrea',
      description: 'Enjoy Bitcoin-native transactions with lower fees',
      icon: <Network className="w-5 h-5" />,
      status: chainId === 5115 ? 'completed' : isConnected ? 'active' : 'pending',
      actionText: 'Switch Network'
    },
    {
      id: 'profile',
      title: 'Create Profile',
      description: 'Set up your identity for better lending terms',
      icon: <User className="w-5 h-5" />,
      status: 'pending', // You'd check if profile exists
      actionText: 'Create Profile'
    },
    {
      id: 'ready',
      title: 'You\'re Ready!',
      description: 'Start saving with your community',
      icon: <Zap className="w-5 h-5" />,
      status: 'pending',
      actionText: 'Explore Chamas'
    }
  ];

  useEffect(() => {
    const completedSteps = steps.filter(step => step.status === 'completed').length;
    setProgress((completedSteps / steps.length) * 100);
    setCurrentStep(completedSteps);
  }, [isConnected, chainId]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Welcome to Jenga</span>
          <Badge variant="secondary">{Math.round(progress)}% Complete</Badge>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              step.status === 'active' 
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                : step.status === 'completed'
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className={`p-2 rounded-full ${
              step.status === 'completed' 
                ? 'bg-green-500 text-white' 
                : step.status === 'active'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {step.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : step.icon}
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            
            {step.status === 'active' && step.action && (
              <Button onClick={step.action} size="sm">
                {step.actionText}
              </Button>
            )}
            
            {step.status === 'completed' && (
              <Badge variant="secondary">✓ Done</Badge>
            )}
          </div>
        ))}
        
        {chainId !== 5115 && isConnected && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're connected to the wrong network. Please switch to Citrea (Chain ID: 5115) for the best experience.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
