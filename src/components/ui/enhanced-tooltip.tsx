import React, { useState } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  BookOpen,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';

interface EnhancedTooltipProps {
  children: React.ReactNode;
  title?: string;
  content: string | React.ReactNode;
  type?: 'info' | 'warning' | 'success' | 'help';
  side?: 'top' | 'right' | 'bottom' | 'left';
  showIcon?: boolean;
  interactive?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'outline' | 'ghost';
  }>;
  learnMoreUrl?: string;
  className?: string;
}

export function EnhancedTooltip({
  children,
  title,
  content,
  type = 'info',
  side = 'top',
  showIcon = true,
  interactive = false,
  actions = [],
  learnMoreUrl,
  className = ""
}: EnhancedTooltipProps) {
  const [open, setOpen] = useState(false);

  const getIcon = () => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'help': return <HelpCircle className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'warning': return 'border-orange-200';
      case 'success': return 'border-green-200';
      case 'help': return 'border-blue-200';
      default: return 'border-gray-200';
    }
  };

  return (
    <TooltipPrimitive.Provider delayDuration={200}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            sideOffset={8}
            className={`z-50 max-w-xs ${interactive ? 'max-w-sm' : ''}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <Card className={`shadow-lg ${getBorderColor()} ${className}`}>
                <CardContent className="p-3">
                  {/* Header */}
                  {(title || showIcon) && (
                    <div className="flex items-center gap-2 mb-2">
                      {showIcon && getIcon()}
                      {title && (
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                          {title}
                        </h4>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {content}
                  </div>

                  {/* Actions */}
                  {(actions.length > 0 || learnMoreUrl) && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      {actions.map((action, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant={action.variant || 'outline'}
                          onClick={() => {
                            action.action();
                            setOpen(false);
                          }}
                          className="text-xs h-7"
                        >
                          {action.label}
                        </Button>
                      ))}
                      
                      {learnMoreUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(learnMoreUrl, '_blank')}
                          className="text-xs h-7"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Learn More
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            <TooltipPrimitive.Arrow className="fill-white dark:fill-gray-800" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

// Contextual Help Component for complex features
interface ContextualHelpProps {
  feature: string;
  steps: Array<{
    title: string;
    description: string;
    action?: string;
  }>;
  onComplete?: () => void;
  className?: string;
}

export function ContextualHelp({ 
  feature, 
  steps, 
  onComplete,
  className = ""
}: ContextualHelpProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Card className={`border-blue-200 bg-blue-50 dark:bg-blue-950 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600" />
            <h4 className="font-semibold text-blue-900 dark:text-blue-100">
              {feature} Guide
            </h4>
            <Badge variant="secondary" className="text-xs">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>

              {/* Current Step */}
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                  {steps[currentStep]?.title}
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {steps[currentStep]?.description}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>
                
                <Button
                  size="sm"
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Smart Help Button that appears contextually
export function SmartHelpButton({ 
  helpContent, 
  className = "" 
}: { 
  helpContent: string | React.ReactNode;
  className?: string;
}) {
  return (
    <EnhancedTooltip
      content={helpContent}
      type="help"
      title="Need Help?"
      interactive={true}
      className={className}
    >
      <Button
        size="sm"
        variant="ghost"
        className="text-gray-400 hover:text-blue-600 w-6 h-6 p-0"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </EnhancedTooltip>
  );
}
