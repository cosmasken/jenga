
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { User, Target, Globe, ArrowRight } from "lucide-react";

export const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    location: "",
    dailyGoal: "1000",
    preferredCurrency: "USD"
  });
  const { completeOnboarding } = useAuth();
  const { toast } = useToast();

  const handleComplete = () => {
    completeOnboarding(userData);
    toast({
      title: "🎉 WELCOME TO JENGA!",
      description: "Your financial sovereignty journey begins now!",
    });
  };

  const steps = [
    {
      title: "WELCOME TO THE REVOLUTION",
      subtitle: "Let's set up your Bitcoin sovereignty profile",
      icon: User,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-foreground font-mono">DISPLAY NAME</Label>
            <Input
              id="name"
              value={userData.name}
              onChange={(e) => setUserData({...userData, name: e.target.value})}
              placeholder="Enter your name..."
              className="cyber-border bg-card/50 text-foreground font-mono"
            />
          </div>
          <div>
            <Label htmlFor="location" className="text-foreground font-mono">LOCATION (OPTIONAL)</Label>
            <Input
              id="location"
              value={userData.location}
              onChange={(e) => setUserData({...userData, location: e.target.value})}
              placeholder="City, Country..."
              className="cyber-border bg-card/50 text-foreground font-mono"
            />
          </div>
        </div>
      )
    },
    {
      title: "SET YOUR STACKING GOALS",
      subtitle: "Define your Bitcoin accumulation strategy",
      icon: Target,
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="dailyGoal" className="text-foreground font-mono">DAILY STACKING GOAL (SATS)</Label>
            <Input
              id="dailyGoal"
              type="number"
              value={userData.dailyGoal}
              onChange={(e) => setUserData({...userData, dailyGoal: e.target.value})}
              placeholder="1000"
              className="cyber-border bg-card/50 text-foreground font-mono"
            />
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Start small, stack consistently. You can adjust this later.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {["500", "1000", "2500"].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setUserData({...userData, dailyGoal: amount})}
                className={`cyber-button ${userData.dailyGoal === amount ? 'bg-orange-500 text-black' : ''}`}
              >
                {amount} sats
              </Button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: "CHOOSE YOUR NETWORK",
      subtitle: "Select your preferred Bitcoin L2 network",
      icon: Globe,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border-2 border-orange-500 rounded-lg bg-orange-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-foreground font-bold">CITREA TESTNET</h3>
                  <p className="text-xs text-muted-foreground font-mono">Bitcoin's ZK Rollup - Recommended</p>
                </div>
                <div className="w-3 h-3 bg-orange-400 rounded-full neon-glow"></div>
              </div>
            </div>
            <div className="p-4 border border-border rounded-lg bg-card/20 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-mono text-muted-foreground">CITREA MAINNET</h3>
                  <p className="text-xs text-muted-foreground font-mono">Coming soon...</p>
                </div>
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];
  const IconComponent = currentStep.icon;

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <Card className="bg-card/90 backdrop-blur-sm cyber-border neon-glow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4 neon-glow">
              <IconComponent className="w-8 h-8 text-black" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground glitch-text font-mono">
              {currentStep.title}
            </CardTitle>
            <p className="text-muted-foreground font-mono text-sm">
              {currentStep.subtitle}
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index + 1 <= step ? 'bg-orange-400' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {currentStep.content}
            
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 cyber-button"
                >
                  BACK
                </Button>
              )}
              
              {step < steps.length ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && !userData.name}
                  className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black"
                >
                  CONTINUE
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black"
                >
                  START STACKING
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
