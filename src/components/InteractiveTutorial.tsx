import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Jenga!',
    content: 'Jenga helps you save Bitcoin with your community through rotating savings circles called "Chamas".',
    target: '.dashboard-header',
    position: 'bottom'
  },
  {
    id: 'create-chama',
    title: 'Create Your First Chama',
    content: 'Start a savings circle with friends, family, or community members. Set weekly targets and watch your Bitcoin grow!',
    target: '.create-chama-button',
    position: 'bottom',
    action: 'Try creating a chama'
  },
  {
    id: 'join-existing',
    title: 'Or Join an Existing One',
    content: 'Browse active chamas in your community and join one that matches your savings goals.',
    target: '.join-chama-section',
    position: 'top'
  },
  {
    id: 'personal-stacking',
    title: 'Personal Bitcoin Stacking',
    content: 'Set daily stacking goals and build a consistent Bitcoin savings habit.',
    target: '.stacking-section',
    position: 'left'
  },
  {
    id: 'reputation',
    title: 'Build Your Reputation',
    content: 'Consistent contributions build your on-chain reputation, unlocking better lending terms and trust.',
    target: '.reputation-score',
    position: 'bottom'
  }
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveTutorial = ({ isOpen, onClose }: InteractiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && tutorialSteps[currentStep]) {
      const element = document.querySelector(tutorialSteps[currentStep].target) as HTMLElement;
      setTargetElement(element);
      
      // Scroll element into view
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('tutorial-highlight');
      }
    }
    
    return () => {
      // Clean up highlights
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [currentStep, isOpen]);

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
    localStorage.setItem('jenga-tutorial-completed', 'true');
    onClose();
  };

  if (!isOpen || !tutorialSteps[currentStep]) return null;

  const step = tutorialSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      
      {/* Tutorial Card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-50 w-80"
          style={{
            // Position based on target element
            top: targetElement ? targetElement.offsetTop + targetElement.offsetHeight + 10 : '50%',
            left: targetElement ? targetElement.offsetLeft : '50%',
            transform: !targetElement ? 'translate(-50%, -50%)' : 'none'
          }}
        >
          <Card className="bg-card border-orange-500 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-orange-500" />
                  <Badge variant="secondary">
                    {currentStep + 1} of {tutorialSteps.length}
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{step.content}</p>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
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
                  {currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

// CSS for highlighting elements
const tutorialStyles = `
.tutorial-highlight {
  position: relative;
  z-index: 30;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.5), 0 0 20px rgba(249, 115, 22, 0.3);
  border-radius: 8px;
  animation: pulse-highlight 2s infinite;
}

@keyframes pulse-highlight {
  0%, 100% { box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.5), 0 0 20px rgba(249, 115, 22, 0.3); }
  50% { box-shadow: 0 0 0 8px rgba(249, 115, 22, 0.3), 0 0 30px rgba(249, 115, 22, 0.5); }
}
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = tutorialStyles;
  document.head.appendChild(styleSheet);
}
