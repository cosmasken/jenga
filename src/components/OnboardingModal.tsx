import { useState, useEffect } from "react";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRoscaToast } from "@/hooks/use-rosca-toast";
import { useSupabase } from "@/hooks/useSupabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Check, Sparkles, MapPin, Globe, Bell } from "lucide-react";

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

// Timezone options (simplified list)
const timezones = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const { user, primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const { welcome, error: showError } = useRoscaToast();
  const { upsertUser, awardAchievement, createNotification, isLoading: isSupabaseLoading } = useSupabase();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [selectedIcon, setSelectedIcon] = useState(profileIcons[0]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: true,
    push: true,
    sms: false
  });
  const [privacySettings, setPrivacySettings] = useState({
    profile_public: true,
    stats_public: true
  });
  const [isCompleting, setIsCompleting] = useState(false);

  const totalSteps = 3;

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
      // Create user profile in Supabase
      const userData = {
        display_name: username.trim(),
        bio: bio.trim() || undefined,
        location: location.trim() || undefined,
        timezone: timezone,
        preferred_language: 'en',
        notification_preferences: notificationPreferences,
        privacy_settings: privacySettings,
        // Store selected icon in metadata for now
        // In a full implementation, you might want to add an avatar_icon field to the users table
      };

      console.log('🔄 Creating user profile in Supabase:', userData);
      const createdUser = await upsertUser(userData);

      if (createdUser) {
        console.log('✅ User profile created:', createdUser);

        // Award onboarding achievement
        try {
          // First, we need to get the achievement ID for "Bitcoin Pioneer" or create a "Profile Complete" achievement
          await awardAchievement('profile-complete', createdUser.id, {
            progress: { onboarding_completed: true }
          });
          console.log('✅ Onboarding achievement awarded');
        } catch (achievementError) {
          console.warn('⚠️ Could not award achievement:', achievementError);
          // Don't fail onboarding if achievement fails
        }

        // Create welcome notification
        try {
          await createNotification({
            user_wallet_address: primaryWallet?.address || '',
            title: 'Welcome to Jenga ROSCA! 🎉',
            message: `Welcome ${username.trim()}! Your profile has been created. Start exploring ROSCA groups and begin your Bitcoin savings journey.`,
            type: 'success',
            category: 'onboarding',
            data: {
              onboarding_completed: true,
              user_id: createdUser.id
            }
          });
          console.log('✅ Welcome notification created');
        } catch (notificationError) {
          console.warn('⚠️ Could not create welcome notification:', notificationError);
          // Don't fail onboarding if notification fails
        }

        // Store onboarding completion in localStorage (for backward compatibility)
        localStorage.setItem('jenga_onboarding_completed', 'true');
        localStorage.setItem('jenga_user_display_name', username.trim());
        localStorage.setItem('jenga_user_profile_icon', selectedIcon.id);
        localStorage.setItem('jenga_user_supabase_id', createdUser.id);
        
        // Store the identifier type and value for future reference
        const identifierDisplay = getIdentifierDisplay();
        if (identifierDisplay) {
          localStorage.setItem('jenga_user_identifier_type', identifierDisplay.type);
          localStorage.setItem('jenga_user_identifier_value', identifierDisplay.value);
        }

        // Show welcome toast with appropriate message
        const identifierDisplay2 = getIdentifierDisplay();
        if (identifierDisplay2?.type === 'wallet') {
          welcome(`Welcome to ROSCA, ${username.trim()}! Your profile has been created and your wallet is connected.`);
        } else {
          welcome(`Welcome to ROSCA, ${username.trim()}! Your profile has been created. Start your Bitcoin savings journey.`);
        }

        // Complete onboarding
        onComplete();
      } else {
        throw new Error('Failed to create user profile');
      }
    } catch (error) {
      console.error('❌ Onboarding failed:', error);
      showError(
        "Setup Failed",
        "Failed to complete onboarding. Please try again."
      );
    } finally {
      setIsCompleting(false);
    }
  };

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

  const canProceedFromStep1 = username.trim().length >= 2;
  const canComplete = currentStep === totalSteps && canProceedFromStep1;

  if (!isLoggedIn || !open) {
    return null;
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Let's start with your basic profile information
        </p>
      </div>

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
          Display Name *
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="Enter your display name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={30}
          className="text-center"
        />
        <p className="text-xs text-gray-500 text-center">
          This name will be visible to other group members
        </p>
      </div>

      {/* Bio Input */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">
          Bio (Optional)
        </Label>
        <Textarea
          id="bio"
          placeholder="Tell others about yourself..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={200}
          rows={3}
        />
        <p className="text-xs text-gray-500 text-right">
          {bio.length}/200 characters
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
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Location & Preferences</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Help us personalize your experience
        </p>
      </div>

      {/* Location Input */}
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location (Optional)
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="e.g., New York, USA"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={100}
        />
        <p className="text-xs text-gray-500">
          This helps us show relevant groups and times
        </p>
      </div>

      {/* Timezone Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Timezone
        </Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger>
            <SelectValue placeholder="Select your timezone" />
          </SelectTrigger>
          <SelectContent>
            {timezones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Notifications & Privacy</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure how you want to stay updated
        </p>
      </div>

      {/* Notification Preferences */}
      <div className="space-y-4">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notification Preferences
        </Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Email Notifications</p>
              <p className="text-xs text-gray-500">Group updates, payment reminders</p>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.email}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                email: e.target.checked
              }))}
              className="h-4 w-4 text-bitcoin focus:ring-bitcoin border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Push Notifications</p>
              <p className="text-xs text-gray-500">Real-time app notifications</p>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.push}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                push: e.target.checked
              }))}
              className="h-4 w-4 text-bitcoin focus:ring-bitcoin border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">SMS Notifications</p>
              <p className="text-xs text-gray-500">Important alerts only</p>
            </div>
            <input
              type="checkbox"
              checked={notificationPreferences.sms}
              onChange={(e) => setNotificationPreferences(prev => ({
                ...prev,
                sms: e.target.checked
              }))}
              className="h-4 w-4 text-bitcoin focus:ring-bitcoin border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Privacy Settings</Label>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public Profile</p>
              <p className="text-xs text-gray-500">Allow others to view your profile</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.profile_public}
              onChange={(e) => setPrivacySettings(prev => ({
                ...prev,
                profile_public: e.target.checked
              }))}
              className="h-4 w-4 text-bitcoin focus:ring-bitcoin border-gray-300 rounded"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Statistics</p>
              <p className="text-xs text-gray-500">Display your contribution stats</p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.stats_public}
              onChange={(e) => setPrivacySettings(prev => ({
                ...prev,
                stats_public: e.target.checked
              }))}
              className="h-4 w-4 text-bitcoin focus:ring-bitcoin border-gray-300 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Complete Your Profile</DialogTitle>
          <DialogDescription className="text-center">
            Step {currentStep} of {totalSteps}: Set up your ROSCA profile
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-bitcoin h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        <div className="py-4">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {currentStep > 1 && (
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex-1"
              disabled={isCompleting || isSupabaseLoading}
            >
              Previous
            </Button>
          )}
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceedFromStep1}
              variant="bitcoin"
              className={`${currentStep === 1 ? 'w-full' : 'flex-1'} shadow-bitcoin hover:shadow-bitcoin-strong`}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!canComplete || isCompleting || isSupabaseLoading}
              variant="bitcoin"
              className="flex-1 shadow-bitcoin hover:shadow-bitcoin-strong disabled:opacity-50"
            >
              {isCompleting || isSupabaseLoading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
