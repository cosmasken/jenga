import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Circle, 
  ArrowRight, 
  Users, 
  Plus, 
  DollarSign,
  Clock,
  Trophy,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Play,
  Eye,
  Copy,
  Zap
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGetAllChamas, useStartChama } from '@/hooks/useJengaContract';
import { useEventPolling } from '@/hooks/useEventPolling';

interface TestStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  completed: boolean;
  current: boolean;
  requiresNewTab?: boolean;
  autoDetect?: boolean;
}

interface InteractiveTestFlowProps {
  onCreateChama?: () => void;
  onJoinChama?: (chamaId: bigint) => void;
  onContribute?: (chamaId: bigint) => void;
}

export const InteractiveTestFlow: React.FC<InteractiveTestFlowProps> = ({
  onCreateChama,
  onJoinChama,
  onContribute
}) => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState(0);
  const [createdChamaId, setCreatedChamaId] = useState<bigint | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [memberCount, setMemberCount] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  // Event polling
  const { events, isPolling, clearEvents, addManualEvent, pollNow } = useEventPolling(true);
  
  // Get all chamas to monitor state
  const { data: allChamas, refetch: refetchChamas } = useGetAllChamas();
  
  // Start chama hook (for creator only)
  const { startChama, isPending: isStarting, isConfirmed: startConfirmed } = useStartChama();

  const testSteps: TestStep[] = [
    {
      id: 'create',
      title: 'Create Test Chama',
      description: 'Create a new chama with 8-minute cycles',
      instruction: 'Click "Create Chama" and use these settings:\n• Name: "Demo Chama"\n• Contribution: 10,000 sats\n• Cycle: 8 minutes\n• Members: 3',
      completed: false,
      current: currentStep === 0,
      autoDetect: true
    },
    {
      id: 'join1',
      title: 'Join with Account 2',
      description: 'Open new tab and join with different account',
      instruction: 'Open a NEW TAB/WINDOW → Connect different wallet → Join the chama',
      completed: false,
      current: currentStep === 1,
      requiresNewTab: true,
      autoDetect: true
    },
    {
      id: 'join2',
      title: 'Join with Account 3',
      description: 'Open another tab and join with third account',
      instruction: 'Open ANOTHER TAB/WINDOW → Connect third wallet → Join the chama',
      completed: false,
      current: currentStep === 2,
      requiresNewTab: true,
      autoDetect: true
    },
    {
      id: 'start',
      title: 'Start Chama (Creator Only)',
      description: 'Creator manually starts the chama when full',
      instruction: 'As the creator, click "Start Chama" to begin first cycle',
      completed: false,
      current: currentStep === 3,
      autoDetect: false
    },
    {
      id: 'contribute',
      title: 'All Members Contribute',
      description: 'Each account contributes to the current cycle',
      instruction: 'In each tab, click "Contribute" to add funds to the cycle',
      completed: false,
      current: currentStep === 4,
      autoDetect: true
    },
    {
      id: 'wait',
      title: 'Wait for Payout',
      description: 'Wait 8 minutes for cycle completion and payout',
      instruction: 'Watch for payout notification and next cycle start',
      completed: false,
      current: currentStep === 5,
      autoDetect: true
    }
  ];

  // Monitor chama state changes
  useEffect(() => {
    if (!allChamas || !createdChamaId) return;

    const myChama = allChamas.find(c => c.id === createdChamaId);
    if (!myChama) return;

    const members = Array.isArray(myChama.members) ? myChama.members : [];
    const newMemberCount = members.length;
    const maxMembers = Number(myChama.maxMembers) || 3;
    const currentCycle = Number(myChama.currentCycle) || 0;
    const isFull = newMemberCount >= maxMembers;
    const hasStarted = currentCycle > 0;

    // Update member count
    if (newMemberCount !== memberCount) {
      setMemberCount(newMemberCount);
      
      // Auto-advance steps based on member count
      if (newMemberCount === 2 && currentStep === 1) {
        setCurrentStep(2); // Move to "Join with Account 3"
      } else if (newMemberCount === 3 && currentStep === 2) {
        setCurrentStep(3); // Move to "Start Chama"
        setShowStartButton(true);
      }
    }

    // Check if chama has started
    if (hasStarted && currentStep === 3) {
      setCurrentStep(4); // Move to "Contribute"
      setShowStartButton(false);
    }

    // Check creator status
    if (address && members.includes(address) && members[0] === address) {
      setIsCreator(true);
    }
  }, [allChamas, createdChamaId, memberCount, currentStep, address]);

  // Handle chama creation detection
  useEffect(() => {
    if (currentStep === 0 && allChamas && allChamas.length > 0) {
      // Find the most recent chama created by current user
      const myChama = allChamas.find(c => {
        const members = Array.isArray(c.members) ? c.members : [];
        return members.length > 0 && members[0] === address;
      });
      
      if (myChama && !createdChamaId) {
        setCreatedChamaId(myChama.id);
        setCurrentStep(1); // Move to "Join with Account 2"
        setIsCreator(true);
        addManualEvent({
          type: 'created',
          chamaId: myChama.id,
          timestamp: Date.now(),
        });
      }
    }
  }, [allChamas, currentStep, address, createdChamaId]);

  const handleStartChama = async () => {
    if (!createdChamaId || !isCreator) return;
    
    try {
      await startChama(createdChamaId);
    } catch (error) {
      console.error('Error starting chama:', error);
    }
  };

  const resetFlow = () => {
    setCurrentStep(0);
    setCreatedChamaId(null);
    setIsCreator(false);
    setMemberCount(0);
    setShowStartButton(false);
    clearEvents();
  };

  const copyInstructions = (step: TestStep) => {
    const instructions = `${step.title}\n\n${step.instruction}`;
    navigator.clipboard.writeText(instructions);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <CardTitle>Interactive Test Flow</CardTitle>
            {isPolling && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Live (5s)
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={pollNow}
              className="flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFlow}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Single-user demo with multiple browser tabs • Auto-detects progress • 8-minute cycles
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
            {createdChamaId && (
              <Badge variant="outline" className="font-mono text-xs">
                Chama #{createdChamaId.toString()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4" />
            <span>{memberCount}/3 members</span>
          </div>
        </div>

        {/* Current Chama Status */}
        {createdChamaId && (
          <Alert>
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Monitoring Chama #{createdChamaId.toString()} • {memberCount}/3 members
                  {isCreator && <Badge className="ml-2 text-xs">Creator</Badge>}
                </span>
                {showStartButton && isCreator && (
                  <Button
                    size="sm"
                    onClick={handleStartChama}
                    disabled={isStarting}
                    className="flex items-center gap-1"
                  >
                    <Play className="w-4 h-4" />
                    {isStarting ? 'Starting...' : 'Start Chama'}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Steps */}
        <div className="space-y-3">
          {testSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
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
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${
                    step.current ? 'text-blue-900 dark:text-blue-100' : 
                    step.completed ? 'text-green-900 dark:text-green-100' : 
                    'text-gray-900 dark:text-gray-100'
                  }`}>
                    {step.title}
                    {step.requiresNewTab && (
                      <ExternalLink className="w-4 h-4 inline ml-1" />
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    {step.autoDetect && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                    <Badge 
                      variant={step.current ? 'default' : 'outline'}
                      className="text-xs"
                    >
                      {index + 1}
                    </Badge>
                  </div>
                </div>
                
                <p className={`text-sm mb-2 ${
                  step.current ? 'text-blue-700 dark:text-blue-300' : 
                  step.completed ? 'text-green-700 dark:text-green-300' : 
                  'text-gray-600 dark:text-gray-400'
                }`}>
                  {step.description}
                </p>

                {/* Instructions */}
                <div className={`text-sm p-3 rounded border-l-4 ${
                  step.current 
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-500' 
                    : 'bg-gray-100 dark:bg-gray-800 border-gray-300'
                }`}>
                  <div className="flex items-start justify-between">
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {step.instruction}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInstructions(step)}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                {step.current && (
                  <div className="mt-3 flex items-center gap-2">
                    {step.id === 'create' && (
                      <Button
                        size="sm"
                        onClick={onCreateChama}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Demo Chama
                      </Button>
                    )}
                    
                    {(step.id === 'join1' || step.id === 'join2') && createdChamaId && (
                      <Button
                        size="sm"
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open New Tab
                      </Button>
                    )}
                    
                    {step.id === 'contribute' && createdChamaId && (
                      <Button
                        size="sm"
                        onClick={() => onContribute?.(createdChamaId)}
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        Contribute Now
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Demo Settings */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                Quick Demo Setup
              </h4>
              <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                <div>• <strong>Single User:</strong> Use one browser with multiple tabs</div>
                <div>• <strong>Different Accounts:</strong> Connect different wallets in each tab</div>
                <div>• <strong>Auto-Detection:</strong> Progress updates automatically every 5 seconds</div>
                <div>• <strong>Creator Control:</strong> Only creator can start chama (one-time only)</div>
                <div>• <strong>Quick Cycles:</strong> 8-minute cycles for fast demo</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        {events.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Events
            </h4>
            <div className="space-y-1 text-sm">
              {events.slice(-3).map((event, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {event.type}
                  </Badge>
                  <span>Chama #{event.chamaId.toString()}</span>
                  <span className="text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
