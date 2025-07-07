import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Lightbulb, Users, Coins, Send } from 'lucide-react';

interface SimpleTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Jenga!',
    content: 'Your Bitcoin-native community lending platform is ready. Let\'s take a quick tour!',
    icon: Lightbulb
  },
  {
    id: 'chamas',
    title: 'Join Chamas',
    content: 'Create or join rotating savings circles with your community. Build trust and save together.',
    icon: Users
  },
  {
    id: 'stacking',
    title: 'Personal Stacking',
    content: 'Stack sats individually with automated savings goals and Bitcoin-native rewards.',
    icon: Coins
  },
  {
    id: 'p2p',
    title: 'Send & Receive',
    content: 'Send Bitcoin instantly to friends and family with low fees on Citrea L2.',
    icon: Send
  }
];

export const SimpleTutorial = ({ isOpen, onClose }: SimpleTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-orange-500/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">{step.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-center">
            {step.content}
          </p>
          
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            
            <Button variant="ghost" size="sm" onClick={skipTutorial}>
              Skip Tour
            </Button>
            
            <Button size="sm" onClick={nextStep}>
              {currentStep === tutorialSteps.length - 1 ? 'Get Started' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
