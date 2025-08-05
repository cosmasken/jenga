import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "@/hooks/useRosca";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, ArrowRight, ArrowLeft, Check, PartyPopper, Wallet, Users, Shield } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
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

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/");
    }
  }, [isLoggedIn, setLocation]);

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
        title: "Welcome to Jenga!",
        description: "Your onboarding is complete. Let's start saving!",
      });

      // Redirect to dashboard
      setLocation("/dashboard");
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

  const canProceedStep1 = isConnected && primaryWallet;
  const canProceedStep2 = displayName.trim().length >= 2;
  const canProceedStep3 = true; // Terms acceptance step
  const canComplete = canProceedStep1 && canProceedStep2 && canProceedStep3;

  if (!isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(27,87%,54%)] via-[hsl(27,87%,49%)] to-[hsl(27,87%,44%)] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-white">Welcome to Jenga</h1>
            <span className="text-white/80 text-sm">Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
        </motion.div>

        {/* Step Content */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Wallet Connection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <Wallet className="h-16 w-16 mx-auto mb-6 text-[hsl(27,87%,54%)]" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Wallet Connected!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Great! Your wallet is connected and ready to use. You're connected to the Citrea testnet.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Wallet Address:</span>
                      <span className="font-mono text-gray-900">
                        {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Network:</span>
                      <span className="text-gray-900">Citrea Testnet</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Contract:</span>
                      <span className="font-mono text-gray-900">
                        {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-green-600 mb-6">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Connection Verified</span>
                  </div>
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
                  className="text-center"
                >
                  <Users className="h-16 w-16 mx-auto mb-6 text-[hsl(27,87%,54%)]" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Set Up Your Profile
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Choose a display name that other members will see in your groups.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="text-left">
                      <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                        Display Name
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
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-600">Email:</span>
                          <span className="text-blue-900">{user.email}</span>
                        </div>
                      </div>
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
                  className="text-center"
                >
                  <Bitcoin className="h-16 w-16 mx-auto mb-6 text-[hsl(27,87%,54%)]" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Join a Group (Optional)
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Have an invite code? Enter it below to join an existing group, or skip to create your own.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div className="text-left">
                      <Label htmlFor="inviteCode" className="text-sm font-medium text-gray-700">
                        Invite Code
                      </Label>
                      <Input
                        id="inviteCode"
                        type="text"
                        placeholder="Enter invite code (optional)"
                        value={enteredInviteCode}
                        onChange={(e) => setEnteredInviteCode(e.target.value.toUpperCase())}
                        className="mt-1 font-mono"
                        maxLength={10}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty if you want to create your own group
                      </p>
                    </div>
                  </div>

                  {enteredInviteCode && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Ready to join group with code: {enteredInviteCode}
                        </span>
                      </div>
                    </div>
                  )}
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
                  className="text-center"
                >
                  <PartyPopper className="h-16 w-16 mx-auto mb-6 text-[hsl(27,87%,54%)]" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    You're All Set!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to the Jenga community! You're ready to start your Bitcoin savings journey.
                  </p>
                  
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-700">
                          {enteredInviteCode ? `Join group with code ${enteredInviteCode}` : "Create your first ROSCA group"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          Connect with other savers in your community
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Bitcoin className="h-5 w-5 text-[hsl(27,87%,54%)]" />
                        <span className="text-sm text-gray-700">
                          Start saving Bitcoin together
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && !canProceedStep1) ||
                    (currentStep === 2 && !canProceedStep2)
                  }
                  className="flex items-center gap-2 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
