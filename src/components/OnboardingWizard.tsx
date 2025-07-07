import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Wallet, 
  User, 
  BookOpen, 
  Coins, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Play,
  Target,
  Shield,
  Zap
} from 'lucide-react';
import { OnboardingService, ONBOARDING_STEPS, type UserProfile } from '@/lib/onboarding';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

interface OnboardingWizardProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onComplete,
  onClose
}) => {
  const { address } = useAccount();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    contributionAmount: '',
    frequency: 'monthly' as 'weekly' | 'monthly',
    riskTolerance: 'medium' as 'low' | 'medium' | 'high',
    interests: [] as string[]
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (address && isOpen) {
      loadUserProfile();
    }
  }, [address, isOpen]);

  const loadUserProfile = async () => {
    if (!address) return;
    
    const profile = await OnboardingService.getUserProfile(address);
    if (profile) {
      setUserProfile(profile);
      // Set current step based on completed steps
      const nextStep = OnboardingService.getNextOnboardingStep(profile.tutorial_steps_completed);
      if (nextStep) {
        const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === nextStep.id);
        setCurrentStepIndex(stepIndex);
      }
    } else {
      // Create new profile
      const newProfile = await OnboardingService.createUserProfile(address);
      setUserProfile(newProfile);
    }
  };

  const completeCurrentStep = async (metadata?: any) => {
    if (!address || !userProfile) return;

    setIsLoading(true);
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    const success = await OnboardingService.completeOnboardingStep(
      address, 
      currentStep.id, 
      metadata
    );

    if (success) {
      toast.success(`${currentStep.title} completed!`);
      
      // Update local state
      const updatedSteps = [...userProfile.tutorial_steps_completed, currentStep.id];
      setUserProfile({
        ...userProfile,
        tutorial_steps_completed: updatedSteps,
        onboarding_completed: updatedSteps.length >= ONBOARDING_STEPS.filter(s => s.required).length
      });

      // Move to next step or complete
      if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        onComplete();
      }
    } else {
      toast.error('Failed to complete step. Please try again.');
    }
    setIsLoading(false);
  };

  const renderStepContent = () => {
    const currentStep = ONBOARDING_STEPS[currentStepIndex];
    
    switch (currentStep.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Jenga!</h2>
              <p className="text-muted-foreground">
                Join the future of community finance with Bitcoin-native lending circles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <Shield className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h3 className="font-semibold">Trustless</h3>
                <p className="text-sm text-muted-foreground">Smart contracts handle everything</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Coins className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h3 className="font-semibold">Bitcoin Native</h3>
                <p className="text-sm text-muted-foreground">Built on Citrea L2</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <Users className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h3 className="font-semibold">Community</h3>
                <p className="text-sm text-muted-foreground">Save and grow together</p>
              </div>
            </div>
          </div>
        );

      case 'wallet_setup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Wallet className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Wallet Setup</h2>
              <p className="text-muted-foreground">
                Your wallet is connected! Let's make sure you're on the right network.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Wallet Connected</span>
                </div>
                <Badge variant="secondary">{address?.slice(0, 6)}...{address?.slice(-4)}</Badge>
              </div>
              <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                <h3 className="font-semibold mb-2">Network: Citrea Testnet</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure you're connected to Citrea testnet for the best experience.
                </p>
              </div>
            </div>
          </div>
        );

      case 'profile_creation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Create Your Profile</h2>
              <p className="text-muted-foreground">
                Tell us a bit about yourself to personalize your experience
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  placeholder="How should we call you?"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>
        );

      case 'chama_education':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Understanding Chamas</h2>
              <p className="text-muted-foreground">
                Learn how rotating savings and credit associations work
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">🔄 How it works</h3>
                <p className="text-sm text-muted-foreground">
                  Members contribute regularly to a shared pool. Each cycle, one member receives the full amount.
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">🤝 Community Trust</h3>
                <p className="text-sm text-muted-foreground">
                  Smart contracts eliminate the need for a trusted treasurer - everything is automated and transparent.
                </p>
              </div>
              <div className="p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">📈 Build Credit</h3>
                <p className="text-sm text-muted-foreground">
                  Your participation builds on-chain reputation for future financial opportunities.
                </p>
              </div>
            </div>
          </div>
        );

      case 'first_contribution':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Set Your Preferences</h2>
              <p className="text-muted-foreground">
                Help us recommend the right chamas for you
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Preferred Contribution Amount (sats)</Label>
                <Input
                  type="number"
                  value={formData.contributionAmount}
                  onChange={(e) => setFormData({...formData, contributionAmount: e.target.value})}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label>Contribution Frequency</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={formData.frequency === 'weekly' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, frequency: 'weekly'})}
                  >
                    Weekly
                  </Button>
                  <Button
                    variant={formData.frequency === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, frequency: 'monthly'})}
                  >
                    Monthly
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Step not found</div>;
    }
  };

  if (!isOpen) return null;

  const progress = userProfile ? 
    OnboardingService.getOnboardingProgress(userProfile.tutorial_steps_completed) : 
    { completed: 0, total: ONBOARDING_STEPS.filter(s => s.required).length, percentage: 0 };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Getting Started</CardTitle>
            <Badge variant="outline">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </Badge>
          </div>
          <Progress value={progress.percentage} className="w-full" />
        </CardHeader>
        <CardContent className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (currentStepIndex > 0) {
                  setCurrentStepIndex(currentStepIndex - 1);
                } else {
                  onClose();
                }
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStepIndex > 0 ? 'Previous' : 'Close'}
            </Button>
            
            <Button
              onClick={() => completeCurrentStep(formData)}
              disabled={isLoading}
            >
              {isLoading ? (
                'Processing...'
              ) : currentStepIndex === ONBOARDING_STEPS.length - 1 ? (
                'Complete Setup'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
