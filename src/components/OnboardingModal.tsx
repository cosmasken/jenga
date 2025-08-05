import { useState, useEffect } from "react";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Check, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

// Profile icon options
const profileIcons = [
  { id: 'user', icon: User, color: 'bg-blue-500' },
  { id: 'sparkles', icon: Sparkles, color: 'bg-purple-500' },
  { id: 'check', icon: Check, color: 'bg-green-500' },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(profileIcons[0]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Auto-populate username from user data
  useEffect(() => {
    if (user?.email && !username) {
      setUsername(user.email.split('@')[0]);
    }
  }, [user, username]);

  const handleComplete = async () => {
    if (!username.trim() || username.trim().length < 2) {
      toast({
        title: "Invalid Username",
        description: "Please enter a username with at least 2 characters.",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);
    
    try {
      // Store onboarding completion in localStorage
      localStorage.setItem('jenga_onboarding_completed', 'true');
      localStorage.setItem('jenga_user_display_name', username.trim());
      localStorage.setItem('jenga_user_profile_icon', selectedIcon.id);

      toast({
        title: "Welcome to Jenga! 🎉",
        description: "Your profile is set up. Let's start saving!",
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

  const canComplete = username.trim().length >= 2;

  if (!isLoggedIn || !open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center">
            Choose your profile icon and enter your username to get started
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Profile Icon Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Choose Profile Icon</Label>
            <div className="flex justify-center gap-4">
              {profileIcons.map((iconOption) => {
                const IconComponent = iconOption.icon;
                const isSelected = selectedIcon.id === iconOption.id;
                
                return (
                  <button
                    key={iconOption.id}
                    onClick={() => setSelectedIcon(iconOption)}
                    className={`
                      p-4 rounded-full transition-all duration-200
                      ${iconOption.color} 
                      ${isSelected 
                        ? 'ring-4 ring-[hsl(27,87%,54%)] ring-offset-2 scale-110' 
                        : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }
                    `}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username *
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={30}
              className="text-center"
            />
            <p className="text-xs text-gray-500 text-center">
              This name will be visible to other group members
            </p>
          </div>

          {/* Connected Email Display */}
          {user?.email && (
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-600">
                Connected as: <span className="font-medium">{user.email}</span>
              </p>
            </div>
          )}
        </div>

        {/* Complete Button */}
        <div className="pt-4">
          <Button
            onClick={handleComplete}
            disabled={!canComplete || isCompleting}
            className="w-full bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] disabled:opacity-50"
          >
            {isCompleting ? "Setting up..." : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
