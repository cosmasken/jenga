import { useState, useEffect } from "react";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRoscaToast } from "@/hooks/use-rosca-toast";
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
  const { user, primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { welcome, error: showError } = useRoscaToast();
  
  const [username, setUsername] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(profileIcons[0]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Get available user identifier (email, phone, or wallet address)
  const getUserIdentifier = () => {
    if (user?.email) return user.email;
    if (user?.phone) return user.phone;
    if (primaryWallet?.address) return primaryWallet.address;
    return null;
  };

  // Get display name for the identifier
  const getIdentifierDisplay = () => {
    if (user?.email) return { type: 'email', value: user.email };
    if (user?.phone) return { type: 'phone', value: user.phone };
    if (primaryWallet?.address) return { 
      type: 'wallet', 
      value: `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}` 
    };
    return null;
  };

  // Auto-populate username from available user data
  useEffect(() => {
    if (!username) {
      const identifier = getUserIdentifier();
      if (identifier) {
        if (user?.email) {
          // Use email prefix for social login users
          setUsername(user.email.split('@')[0]);
        } else if (user?.phone) {
          // Use phone for phone login users
          setUsername(`user_${user.phone.slice(-4)}`);
        } else if (primaryWallet?.address) {
          // Use address suffix for wallet users
          setUsername(`user_${primaryWallet.address.slice(-6)}`);
        }
      }
    }
  }, [user, primaryWallet, username]);

  const handleComplete = async () => {
    if (!username.trim() || username.trim().length < 2) {
      showError(
        "Invalid Username",
        "Please enter a username with at least 2 characters."
      );
      return;
    }

    // Check if user has any valid identifier
    const identifier = getUserIdentifier();
    if (!identifier) {
      showError(
        "Authentication Required", 
        "Please connect your wallet or sign in to complete onboarding"
      );
      return;
    }

    setIsCompleting(true);
    
    try {
      // Store onboarding completion in localStorage
      localStorage.setItem('jenga_onboarding_completed', 'true');
      localStorage.setItem('jenga_user_display_name', username.trim());
      localStorage.setItem('jenga_user_profile_icon', selectedIcon.id);
      
      // Store the identifier type and value for future reference
      const identifierDisplay = getIdentifierDisplay();
      if (identifierDisplay) {
        localStorage.setItem('jenga_user_identifier_type', identifierDisplay.type);
        localStorage.setItem('jenga_user_identifier_value', identifierDisplay.value);
      }

      // Show welcome toast with appropriate message
      const identifierDisplay2 = getIdentifierDisplay();
      if (identifierDisplay2?.type === 'wallet') {
        welcome(`Welcome to ROSCA, ${username.trim()}! Your wallet is connected and ready.`);
      } else {
        welcome(`Welcome to ROSCA, ${username.trim()}! Start your Bitcoin savings journey.`);
      }

      // Complete onboarding
      onComplete();
    } catch (error) {
      showError(
        "Setup Failed",
        "Failed to complete onboarding. Please try again."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const canComplete = username.trim().length >= 2 && getUserIdentifier() !== null;

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

          {/* Connected User Display */}
          {getUserIdentifier() && (() => {
            const identifierDisplay = getIdentifierDisplay();
            if (!identifierDisplay) return null;
            
            return (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connected as: <span className="font-medium text-gray-900 dark:text-gray-100">
                    {identifierDisplay.type === 'email' && identifierDisplay.value}
                    {identifierDisplay.type === 'phone' && identifierDisplay.value}
                    {identifierDisplay.type === 'wallet' && `Wallet ${identifierDisplay.value}`}
                  </span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {identifierDisplay.type === 'email' && '📧 Social Login'}
                  {identifierDisplay.type === 'phone' && '📱 Phone Login'}
                  {identifierDisplay.type === 'wallet' && '👛 Wallet Connection'}
                </p>
              </div>
            );
          })()}
        </div>

        {/* Complete Button */}
        <div className="pt-4">
          <Button
            onClick={handleComplete}
            disabled={!canComplete || isCompleting}
            variant="bitcoin"
            className="w-full shadow-bitcoin hover:shadow-bitcoin-strong disabled:opacity-50"
          >
            {isCompleting ? "Setting up..." : "Complete Setup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
