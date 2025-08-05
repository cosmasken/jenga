import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarIcon, avatarIcons } from "@/assets/avatars";
import { Bitcoin, ArrowRight, ArrowLeft, Check, PartyPopper } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { setUser, completeOnboarding, inviteCode, setInviteCode, joinGroupWithInvite } = useStore();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [enteredInviteCode, setEnteredInviteCode] = useState("");
  
  useEffect(() => {
    if (inviteCode) {
      setEnteredInviteCode(inviteCode);
    }
  }, [inviteCode]);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const validateInviteCode = () => {
    // Mock validation
    toast({
      title: "Invite code validated!",
      description: "Successfully joined the group.",
      className: "bg-green-500 text-white border-green-600",
    });
    
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const createNewRosca = () => {
    toast({
      title: "New ROSCA created!",
      description: "Your group is ready for members to join.",
      className: "bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,49%)]",
    });
    
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const completeSetup = () => {
    if (!selectedAvatar || !displayName.trim()) {
      toast({
        title: "Please complete your profile",
        description: "Select an avatar and enter your display name.",
        variant: "destructive",
      });
      return;
    }

    // Create user profile
    setUser({
      id: Date.now().toString(),
      displayName: displayName.trim(),
      avatar: selectedAvatar,
      reputation: 5.0,
      walletAddress: "bc1q" + Math.random().toString(36).substr(2, 39),
      joinedAt: new Date(),
    });

    // Join group if invite code was provided
    if (enteredInviteCode) {
      joinGroupWithInvite(enteredInviteCode);
      setInviteCode(null);
    }

    completeOnboarding();
    
    toast({
      title: `Welcome aboard, ${displayName}!`,
      description: "You're all set up and ready to start saving with Bitcoin ROSCA.",
      className: "bg-green-500 text-white border-green-600",
    });
    
    setTimeout(() => {
      setLocation("/dashboard");
    }, 2000);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Bar */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-[hsl(27,87%,54%)]">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-[hsl(27,87%,54%)] h-2 rounded-full"
              initial={{ width: "25%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={1}>
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center"
              >
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div className="inline-block p-6 bg-[hsl(27,87%,54%)]/10 rounded-full mb-6">
                    <Bitcoin className="h-12 w-12 text-[hsl(27,87%,54%)]" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
                    Welcome to Bitcoin ROSCA!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    Let's set up your account and get you started with decentralized savings groups. This will only take a minute.
                  </p>
                </motion.div>
                <Button 
                  onClick={nextStep}
                  className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  data-testid="button-get-started"
                >
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6 text-center">
                  Choose Your Avatar
                </h2>
                
                {/* Avatar Selection */}
                <div className="grid grid-cols-4 gap-4 mb-8">
                  {Object.keys(avatarIcons).map((avatar) => (
                    <motion.div
                      key={avatar}
                      className={`cursor-pointer p-4 border-2 rounded-xl transition-all duration-200 ${
                        selectedAvatar === avatar
                          ? "border-[hsl(27,87%,54%)] bg-[hsl(27,87%,54%)]/10"
                          : "border-gray-200 dark:border-gray-600 hover:border-[hsl(27,87%,54%)]"
                      }`}
                      onClick={() => handleAvatarSelect(avatar)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid={`avatar-${avatar}`}
                    >
                      <div className="flex justify-center">
                        <AvatarIcon type={avatar} className="w-8 h-8" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Display Name Input */}
                <div className="mb-8">
                  <Label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Enter your display name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full"
                    data-testid="input-display-name"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    data-testid="button-back-step2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    disabled={!selectedAvatar || !displayName.trim()}
                    className="flex-1 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
                    data-testid="button-continue-step2"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8"
              >
                <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6 text-center">
                  Join or Create
                </h2>
                
                <div className="space-y-6">
                  {/* Invite Code Input */}
                  <div className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                      <Bitcoin className="inline mr-2 h-5 w-5 text-[hsl(27,87%,54%)]" />
                      Have an invite code?
                    </h3>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="Enter invite code"
                        value={enteredInviteCode}
                        onChange={(e) => setEnteredInviteCode(e.target.value)}
                        className="flex-1"
                        data-testid="input-invite-code"
                      />
                      <Button
                        onClick={validateInviteCode}
                        disabled={!enteredInviteCode.trim()}
                        className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
                        data-testid="button-validate-invite"
                      >
                        Validate
                      </Button>
                    </div>
                  </div>

                  {/* OR Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                        OR
                      </span>
                    </div>
                  </div>

                  {/* Create New ROSCA */}
                  <div className="p-6 bg-[hsl(27,87%,54%)]/10 rounded-xl border border-[hsl(27,87%,54%)]/20">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">
                      <Bitcoin className="inline mr-2 h-5 w-5 text-[hsl(27,87%,54%)]" />
                      Create new ROSCA
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Start a new savings group and invite friends to join.
                    </p>
                    <Button
                      onClick={createNewRosca}
                      className="w-full bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white font-bold"
                      data-testid="button-create-rosca"
                    >
                      Create New Group
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                    data-testid="button-back-step3"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
                    data-testid="button-continue-step3"
                  >
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center"
              >
                <motion.div 
                  className="mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {/* Confetti effect */}
                  <motion.div
                    className="inline-block p-6 bg-green-100 dark:bg-green-900/20 rounded-full mb-6"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity,
                      repeatDelay: 2
                    }}
                  >
                    <Check className="h-12 w-12 text-green-500" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-4">
                    Welcome aboard!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    You're all set up, {displayName}! Ready to start saving with Bitcoin ROSCA groups.
                  </p>
                </motion.div>
                <Button 
                  onClick={completeSetup}
                  className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  data-testid="button-go-to-dashboard"
                >
                  Go to Dashboard <PartyPopper className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
