import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Users, 
  Plus, 
  DollarSign,
  Clock,
  Trophy,
  AlertCircle
} from 'lucide-react';

interface TestStep {
  id: string;
  title: string;
  description: string;
  action: string;
  completed: boolean;
  current: boolean;
}

interface TestFlowGuideProps {
  onCreateChama?: () => void;
  onJoinChama?: () => void;
  onContribute?: () => void;
}

export const TestFlowGuide: React.FC<TestFlowGuideProps> = ({
  onCreateChama,
  onJoinChama,
  onContribute
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const testSteps: TestStep[] = [
    {
      id: 'create',
      title: 'Create a Test Chama',
      description: 'Create a new chama with 8-minute cycles for quick testing',
      action: 'Create Chama',
      completed: false,
      current: currentStep === 0
    },
    {
      id: 'join',
      title: 'Join with Another Account',
      description: 'Switch to a different wallet/account and join the chama',
      action: 'Join Chama',
      completed: false,
      current: currentStep === 1
    },
    {
      id: 'fill',
      title: 'Fill the Chama',
      description: 'Add more members until the chama is full (3 members total)',
      action: 'Add Members',
      completed: false,
      current: currentStep === 2
    },
    {
      id: 'contribute',
      title: 'Make Contributions',
      description: 'Once full, all members can contribute to the current cycle',
      action: 'Contribute',
      completed: false,
      current: currentStep === 3
    },
    {
      id: 'cycle',
      title: 'Wait for Cycle',
      description: 'Wait 8 minutes for the cycle to complete and payout to occur',
      action: 'Wait & Watch',
      completed: false,
      current: currentStep === 4
    },
    {
      id: 'complete',
      title: 'Complete All Cycles',
      description: 'Repeat until all members have received their payout',
      action: 'Finish',
      completed: false,
      current: currentStep === 5
    }
  ];

  const markStepCompleted = (stepIndex: number) => {
    setCurrentStep(Math.min(stepIndex + 1, testSteps.length - 1));
  };

  const resetFlow = () => {
    setCurrentStep(0);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Test Flow Guide
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Follow this guide to test the complete chama lifecycle
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">Progress:</div>
            <Badge variant="outline">
              Step {currentStep + 1} of {testSteps.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFlow}
            className="text-xs"
          >
            Reset
          </Button>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {testSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                step.current 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                  : step.completed
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Step Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {step.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : step.current ? (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium ${
                    step.current ? 'text-blue-900 dark:text-blue-100' : 
                    step.completed ? 'text-green-900 dark:text-green-100' : 
                    'text-gray-900 dark:text-gray-100'
                  }`}>
                    {step.title}
                  </h4>
                  <Badge 
                    variant={step.current ? 'default' : 'outline'}
                    className="text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
                <p className={`text-sm mt-1 ${
                  step.current ? 'text-blue-700 dark:text-blue-300' : 
                  step.completed ? 'text-green-700 dark:text-green-300' : 
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.description}
                </p>

                {/* Action Button */}
                {step.current && (
                  <div className="mt-3 flex items-center gap-2">
                    {step.id === 'create' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onCreateChama?.();
                          markStepCompleted(index);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        {step.action}
                      </Button>
                    )}
                    
                    {step.id === 'join' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onJoinChama?.();
                          markStepCompleted(index);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Users className="w-4 h-4" />
                        {step.action}
                      </Button>
                    )}
                    
                    {step.id === 'contribute' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onContribute?.();
                          markStepCompleted(index);
                        }}
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        {step.action}
                      </Button>
                    )}
                    
                    {(step.id === 'fill' || step.id === 'cycle' || step.id === 'complete') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markStepCompleted(index)}
                        className="flex items-center gap-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Mark Complete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Test Settings */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Recommended Test Settings
              </h4>
              <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <div>• <strong>Cycle Duration:</strong> 8 minutes (for quick testing)</div>
                <div>• <strong>Members:</strong> 3 (minimum for testing)</div>
                <div>• <strong>Contribution:</strong> 10,000 sats (minimum amount)</div>
                <div>• <strong>Multiple Accounts:</strong> Use different wallets to test joining</div>
              </div>
            </div>
          </div>
        </div>

        {/* Timer for Current Cycle */}
        {currentStep === 4 && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Cycle Timer
              </h4>
            </div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Wait for the 8-minute cycle to complete. You should see notifications when:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 mt-2 space-y-1">
              <li>• Payout is distributed to the selected member</li>
              <li>• New cycle begins (if more cycles remaining)</li>
              <li>• Chama completes (if all members have received payouts)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
