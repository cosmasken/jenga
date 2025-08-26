import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { 
  ArrowRight, 
  CheckCircle, 
  Circle,
  Clock,
  Users,
  Shield,
  Coins,
  Target,
  AlertTriangle,
  Info,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Play,
  HelpCircle,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserGuidanceProps {
  userLevel: 'new' | 'beginner' | 'intermediate' | 'experienced';
  currentContext: 'landing' | 'dashboard' | 'chama-detail' | 'create' | 'join';
  chamaStatus?: number; // ROSCA status
  isCreator?: boolean;
  isMember?: boolean;
  hasContributed?: boolean;
  nextAction?: string;
}

export function UserGuidance({
  userLevel,
  currentContext,
  chamaStatus,
  isCreator = false,
  isMember = false,
  hasContributed = false,
  nextAction
}: UserGuidanceProps) {
  const [showFullGuide, setShowFullGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const isLoggedIn = useIsLoggedIn();

  const getContextualGuidance = () => {
    switch (currentContext) {
      case 'landing':
        return {
          title: 'Welcome to Bitcoin Savings Circles',
          description: 'Join community-driven savings or use Bitcoin for DeFi lending',
          steps: [
            { text: 'Connect your wallet', action: 'Connect', completed: isLoggedIn },
            { text: 'Explore the platform', action: 'Browse', completed: false },
            { text: 'Join or create a chama', action: 'Start', completed: false }
          ],
          urgency: 'low',
          nextActionText: isLoggedIn ? 'Go to Dashboard' : 'Connect Wallet'
        };

      case 'dashboard':
        const hasChamas = isMember || isCreator;
        return {
          title: hasChamas ? 'Your Bitcoin Finance Hub' : 'Get Started with Bitcoin Finance',
          description: hasChamas 
            ? 'Monitor your savings circles and DeFi positions' 
            : 'Create your first chama or explore DeFi lending options',
          steps: [
            { text: 'Wallet connected', action: 'Connected', completed: isLoggedIn },
            { text: 'Join or create a chama', action: 'Create/Join', completed: hasChamas },
            { text: 'Make regular contributions', action: 'Contribute', completed: hasContributed },
            { text: 'Explore Sacco DeFi', action: 'Explore', completed: false }
          ],
          urgency: hasChamas ? 'low' : 'medium',
          nextActionText: hasChamas ? 'View Your Chamas' : 'Create First Chama'
        };

      case 'chama-detail':
        const statusTexts = {
          0: 'recruiting members',
          1: 'waiting to start',
          2: 'active and running',
          3: 'completed',
          4: 'cancelled'
        };
        
        return {
          title: `Chama is ${statusTexts[chamaStatus as keyof typeof statusTexts] || 'loading'}`,
          description: getStatusDescription(chamaStatus, isCreator, isMember, hasContributed),
          steps: getStatusSteps(chamaStatus, isCreator, isMember, hasContributed),
          urgency: getStatusUrgency(chamaStatus, hasContributed),
          nextActionText: nextAction || getDefaultNextAction(chamaStatus, isCreator, isMember, hasContributed)
        };

      case 'create':
        return {
          title: 'Creating Your Savings Circle',
          description: 'Set up parameters for your community savings group',
          steps: [
            { text: 'Choose contribution amount', action: 'Set Amount', completed: false },
            { text: 'Set member target', action: 'Set Members', completed: false },
            { text: 'Set round duration', action: 'Set Duration', completed: false },
            { text: 'Deploy chama contract', action: 'Deploy', completed: false }
          ],
          urgency: 'medium',
          nextActionText: 'Complete Setup'
        };

      case 'join':
        return {
          title: 'Joining a Savings Circle',
          description: 'Connect with an existing chama community',
          steps: [
            { text: 'Find suitable chama', action: 'Search', completed: false },
            { text: 'Review terms', action: 'Review', completed: false },
            { text: 'Pay security deposit', action: 'Pay', completed: false },
            { text: 'Start contributing', action: 'Contribute', completed: false }
          ],
          urgency: 'medium',
          nextActionText: 'Find Chama'
        };

      default:
        return null;
    }
  };

  const guidance = getContextualGuidance();
  if (!guidance) return null;

  const completedSteps = guidance.steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / guidance.steps.length) * 100;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-950';
      case 'medium': return 'border-orange-200 bg-orange-50 dark:bg-orange-950';
      case 'low': return 'border-green-200 bg-green-50 dark:bg-green-950';
      default: return 'border-blue-200 bg-blue-50 dark:bg-blue-950';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-orange-600" />;
      case 'low': return <CheckCircle className="w-5 h-5 text-green-600" />;
      default: return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`mb-6 ${getUrgencyColor(guidance.urgency)}`}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3 flex-1">
              {getUrgencyIcon(guidance.urgency)}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {guidance.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {guidance.description}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullGuide(!showFullGuide)}
              className="ml-2"
            >
              {showFullGuide ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{completedSteps}/{guidance.steps.length} completed</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Quick Action */}
          {guidance.urgency !== 'low' && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Next: {guidance.nextActionText}
              </span>
              <Button size="sm" className="ml-2">
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* Detailed Steps */}
          <AnimatePresence>
            {showFullGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="space-y-2">
                  {guidance.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50">
                      {step.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm flex-1 ${step.completed ? 'text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                        {step.text}
                      </span>
                      {!step.completed && (
                        <Badge variant="outline" className="text-xs">
                          {step.action}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function for chama status description
function getStatusDescription(status?: number, isCreator?: boolean, isMember?: boolean, hasContributed?: boolean) {
  switch (status) {
    case 0: return 'Waiting for more members to join before starting';
    case 1: return isCreator ? 'All members joined! You can start the ROSCA now' : 'Ready to start - waiting for creator or any member to begin';
    case 2: 
      if (hasContributed) return 'You have contributed this round. Wait for others to contribute.';
      if (isMember) return 'Contribute to the current round before the deadline';
      return 'Round is active - members are making contributions';
    case 3: return 'All rounds completed successfully. Check your earnings!';
    case 4: return 'This chama was cancelled. Any deposits will be refunded.';
    default: return 'Loading chama information...';
  }
}

// Helper function for status-specific steps
function getStatusSteps(status?: number, isCreator?: boolean, isMember?: boolean, hasContributed?: boolean) {
  const baseSteps = [
    { text: 'Chama created', action: 'Created', completed: true },
    { text: 'Members joined', action: 'Join', completed: status !== undefined && status >= 1 },
    { text: 'ROSCA started', action: 'Start', completed: status !== undefined && status >= 2 },
    { text: 'Rounds completed', action: 'Complete', completed: status === 3 }
  ];

  if (status === 2 && isMember) {
    return [
      ...baseSteps,
      { text: 'Your contribution', action: 'Contribute', completed: hasContributed }
    ];
  }

  return baseSteps;
}

// Helper function for status urgency
function getStatusUrgency(status?: number, hasContributed?: boolean): string {
  if (status === 2 && !hasContributed) return 'high';
  if (status === 1) return 'medium';
  return 'low';
}

// Helper function for default next action
function getDefaultNextAction(status?: number, isCreator?: boolean, isMember?: boolean, hasContributed?: boolean): string {
  switch (status) {
    case 0: return isCreator ? 'Invite Members' : 'Share Chama';
    case 1: return 'Start ROSCA';
    case 2: return hasContributed ? 'Wait for Round' : 'Contribute Now';
    case 3: return 'View Results';
    case 4: return 'Create New Chama';
    default: return 'Learn More';
  }
}

// Tutorial component for new users
export function InteractiveTutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const tutorialSteps = [
    {
      title: 'Welcome to Bitcoin Chamas!',
      description: 'Chamas are rotating savings groups where members pool money together.',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      action: 'Start Tutorial'
    },
    {
      title: 'How It Works',
      description: 'Every round, members contribute. One member receives the full pot.',
      icon: <Coins className="w-8 h-8 text-green-600" />,
      action: 'Continue'
    },
    {
      title: 'Your Turn',
      description: 'Eventually, it will be your turn to receive the payout!',
      icon: <Target className="w-8 h-8 text-orange-600" />,
      action: 'Continue'
    },
    {
      title: 'Getting Started',
      description: 'Join an existing chama or create your own with friends.',
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      action: 'Get Started'
    }
  ];

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsVisible(false);
      onComplete();
    }
  };

  if (!isVisible) return null;

  const current = tutorialSteps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-fit">
            {current.icon}
          </div>
          <CardTitle>{current.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {current.description}
          </p>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <Button onClick={nextStep} className="w-full bg-bitcoin hover:bg-bitcoin/90">
            {current.action}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Context-aware help component
export function ContextualHelp({ context }: { context: string }) {
  const [showHelp, setShowHelp] = useState(false);

  const getHelpContent = () => {
    switch (context) {
      case 'contributing':
        return {
          title: 'Making a Contribution',
          content: 'When it\'s time to contribute, make sure you have enough cBTC in your wallet. The contribution goes to the member whose turn it is to receive the payout.',
          tips: [
            'Check your wallet balance before contributing',
            'Contribute before the deadline to avoid penalties',
            'Your turn to receive will come in future rounds'
          ]
        };
      
      case 'joining':
        return {
          title: 'Joining a Chama',
          content: 'When you join a chama, you\'ll need to pay a security deposit. This ensures commitment from all members.',
          tips: [
            'Security deposit is usually 2x the contribution amount',
            'You\'ll get your deposit back when you receive your payout',
            'Read the chama terms carefully before joining'
          ]
        };

      default:
        return null;
    }
  };

  const helpContent = getHelpContent();
  if (!helpContent) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowHelp(!showHelp)}
        className="text-gray-500 hover:text-gray-700"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 z-10"
          >
            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  {helpContent.title}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  {helpContent.content}
                </p>
                <div className="space-y-1">
                  {helpContent.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400">
                      <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Smart notification for important actions
export function SmartNotification({ 
  type, 
  message, 
  actionText, 
  onAction 
}: { 
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  actionText?: string;
  onAction?: () => void;
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'warning': return 'border-orange-200 bg-orange-50 text-orange-800 dark:bg-orange-950 dark:text-orange-200';
      case 'success': return 'border-green-200 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200';
      case 'error': return 'border-red-200 bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200';
      default: return 'border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Alert className={getTypeStyles()}>
        {getIcon()}
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          <div className="flex items-center gap-2 ml-4">
            {actionText && onAction && (
              <Button size="sm" variant="ghost" onClick={onAction} className="h-6 px-2 text-xs">
                {actionText}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </motion.div>
  );
}
