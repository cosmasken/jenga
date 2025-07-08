import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, ArrowLeft, X } from 'lucide-react'
import { SIMPLE_ONBOARDING_STEPS, SimpleOnboardingService } from '@/lib/simpleOnboarding'
import { useTranslation } from 'react-i18next'

interface SimpleOnboardingProps {
  isOpen: boolean
  walletAddress: string
  onComplete: () => void
  onSkip: () => void
}

export const SimpleOnboarding = ({ 
  isOpen, 
  walletAddress, 
  onComplete, 
  onSkip 
}: SimpleOnboardingProps) => {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  if (!isOpen) return null

  const handleComplete = async () => {
    setIsCompleting(true)
    const success = await SimpleOnboardingService.completeOnboarding(walletAddress)
    if (success) {
      onComplete()
    }
    setIsCompleting(false)
  }

  const handleSkip = async () => {
    setIsCompleting(true)
    const success = await SimpleOnboardingService.skipOnboarding(walletAddress)
    if (success) {
      onSkip()
    }
    setIsCompleting(false)
  }

  const currentStepData = SIMPLE_ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === SIMPLE_ONBOARDING_STEPS.length - 1

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute right-0 top-0"
            disabled={isCompleting}
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="text-4xl mb-2">{currentStepData.icon}</div>
          <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
          <p className="text-muted-foreground">{currentStepData.description}</p>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {SIMPLE_ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep ? 'bg-orange-500' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Jenga helps you save Bitcoin with your community through traditional chama circles, 
                but powered by smart contracts on Citrea.
              </p>
              <Badge variant="secondary" className="text-xs">
                Bitcoin-Native • Trustless • Community-First
              </Badge>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">How Chamas Work:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Everyone contributes the same amount regularly</li>
                  <li>• Members take turns receiving the full pot</li>
                  <li>• Smart contracts ensure fairness and transparency</li>
                  <li>• Build your reputation and credit history</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                You're all set! You can now:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">Stack Sats</div>
                  <div className="text-muted-foreground">Personal savings</div>
                </div>
                <div className="bg-muted/50 p-2 rounded">
                  <div className="font-medium">Join Chamas</div>
                  <div className="text-muted-foreground">Community savings</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isCompleting}
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>

            {isLastStep ? (
              <Button
                onClick={handleComplete}
                disabled={isCompleting}
                className="bg-orange-500 hover:bg-orange-600"
                size="sm"
              >
                {isCompleting ? 'Setting up...' : 'Get Started'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={isCompleting}
                size="sm"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Skip option */}
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isCompleting}
              className="text-xs text-muted-foreground"
            >
              Skip onboarding
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
