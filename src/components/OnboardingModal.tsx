import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "@/hooks/useRosca";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Bitcoin, ArrowRight, ArrowLeft, Check, PartyPopper, Wallet, Users, Shield, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { primaryWallet, user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { isConnected, contractAddress } = useRosca();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [enteredInviteCode, setEnteredInviteCode] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  
  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  // Auto-populate display name from user data
  useEffect(() => {
    if (user?.email && !displayName) {
      setDisplayName(user.email.split('@')[0]);
    }
  }, [user, displayName]);

  // Check for invite code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
      setEnteredInviteCode(inviteCode);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      // Store onboarding completion in localStorage
      localStorage.setItem('jenga_onboarding_completed', 'true');
      localStorage.setItem('jenga_user_display_name', displayName);
      
      if (enteredInviteCode) {
        localStorage.setItem('jenga_invite_code', enteredInviteCode);
      }

      toast({
        title: "Welcome to Jenga! 🎉",
        description: "Your onboarding is complete. Let's start saving!",
      });

      // Complete onboarding
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  // Proper validation logic
  const canProceedStep1 = isLoggedIn && primaryWallet; // Step 1: wallet must be connected
  const canProceedStep2 = displayName.trim().length >= 2; // Step 2: name must be at least 2 chars
  const canProceedStep3 = true; // Step 3: invite code is optional
  const canComplete = isLoggedIn && primaryWallet && canProceedStep2;

  if (!isLoggedIn || !open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(27,87%,54%)] via-[hsl(27,87%,49%)] to-[hsl(27,87%,44%)] opacity-5 rounded-lg"></div>
          
          {/* Header */}
          <DialogHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[hsl(27,87%,54%)] rounded-full">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome to Jenga</h2>
                  <p className="text-sm text-gray-600">Let's get you set up in just a few steps</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Wallet Connection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Wallet Connected! ✅
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Perfect! Your wallet is connected and ready to use. You're connected to the Citrea testnet.
                    </p>
                  </div>
                  
                  <Card className="bg-gray-50 border-0 max-w-md mx-auto">
                    <CardContent className="p-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Wallet Address:</span>
                          <span className="font-mono text-gray-900">
                            {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Network:</span>
                          <span className="text-gray-900 font-medium">Citrea Testnet</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Status:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600 font-medium">Connected</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Profile Setup */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="py-8"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                      <Users className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Create Your Profile
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Choose a display name that other members will see in your groups.
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <div>
                      <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                        Display Name *
                      </Label>
                      <Input
                        id="displayName"
                        type="text"
                        placeholder="Enter your display name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="mt-1"
                        maxLength={50}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This name will be visible to other group members
                      </p>
                    </div>

                    {user?.email && (
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blue-600 font-medium">Connected Email:</span>
                            <span className="text-blue-900">{user.email}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Invite Code (Optional) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="py-8"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-4">
                      <Bitcoin className="h-10 w-10 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Join a Group (Optional)
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Have an invite code? Enter it below to join an existing group, or skip to create your own later.
                    </p>
                  </div>
                  
                  <div className="max-w-md mx-auto space-y-4">
                    <div>
                      <Label htmlFor="inviteCode" className="text-sm font-medium text-gray-700">
                        Invite Code (Optional)
                      </Label>
                      <Input
                        id="inviteCode"
                        type="text"
                        placeholder="Enter invite code"
                        value={enteredInviteCode}
                        onChange={(e) => setEnteredInviteCode(e.target.value.toUpperCase())}
                        className="mt-1 font-mono text-center text-lg tracking-wider"
                        maxLength={10}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        Leave empty if you want to create your own group
                      </p>
                    </div>

                    {enteredInviteCode && (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <Check className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              Ready to join group: {enteredInviteCode}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 4: Completion */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-8"
                >
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                      <PartyPopper className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      You're All Set! 🎉
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Welcome to the Jenga community! You're ready to start your Bitcoin savings journey.
                    </p>
                  </div>
                  
                  <Card className="bg-gradient-to-r from-[hsl(27,87%,54%)]/10 to-[hsl(27,87%,44%)]/10 border-[hsl(27,87%,54%)]/20 max-w-md mx-auto">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">What's Next?</h4>
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {enteredInviteCode ? `Join group with code ${enteredInviteCode}` : "Create your first ROSCA group"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Connect with other savers in your community
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Bitcoin className="h-5 w-5 text-[hsl(27,87%,54%)] flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            Start saving Bitcoin together
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              {/* Debug Info - Remove in production */}
              <div className="text-xs text-gray-500 mb-4 text-center">
                Step {currentStep}/{totalSteps} | 
                Logged: {isLoggedIn ? '✓' : '✗'} | 
                Wallet: {primaryWallet ? '✓' : '✗'} | 
                Name: {displayName.length}chars
                <br />
                <button 
                  onClick={() => setCurrentStep(Math.min(currentStep + 1, totalSteps))}
                  className="text-blue-500 underline text-xs mt-1"
                >
                  [Debug: Force Next]
                </button>
              </div>
              
              <div className={`flex items-center gap-3 ${currentStep === 1 ? 'justify-center' : 'justify-between'}`}>
                {/* Only show Previous button if not on step 1 */}
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2) ||
                    (currentStep === 3 && !canProceedStep3)
                  }
                  className="flex items-center gap-2 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canComplete || isCompleting}
                  className="flex items-center gap-2 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                >
                  {isCompleting ? "Completing..." : "Complete Setup"}
                  <Check className="h-4 w-4" />
                </Button>
              )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
