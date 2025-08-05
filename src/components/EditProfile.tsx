/**
 * EditProfile Component
 * Comprehensive profile editing with Supabase integration
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useSupabase } from '@/hooks/useSupabase';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  MapPin, 
  Globe, 
  Bell, 
  Shield, 
  Save, 
  X,
  Camera,
  Award,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface EditProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export function EditProfile({ isOpen, onClose }: EditProfileProps) {
  const { primaryWallet, user } = useDynamicContext();
  const { getUser, upsertUser, isLoading } = useSupabase();
  const { success, error: showError } = useRoscaToast();

  // Form state
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    timezone: 'UTC',
    preferred_language: 'en',
    notification_preferences: {
      email: true,
      push: true,
      sms: false
    },
    privacy_settings: {
      profile_public: true,
      stats_public: true
    }
  });

  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen && primaryWallet?.address) {
      loadUserProfile();
    }
  }, [isOpen, primaryWallet?.address]);

  const loadUserProfile = async () => {
    if (!primaryWallet?.address) return;

    try {
      setIsLoadingProfile(true);
      const profile = await getUser(primaryWallet.address);
      
      if (profile) {
        setUserProfile(profile);
        setFormData({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          location: profile.location || '',
          timezone: profile.timezone || 'UTC',
          preferred_language: profile.preferred_language || 'en',
          notification_preferences: profile.notification_preferences || {
            email: true,
            push: true,
            sms: false
          },
          privacy_settings: profile.privacy_settings || {
            profile_public: true,
            stats_public: true
          }
        });
      } else {
        // New user, use defaults
        setFormData({
          display_name: user?.email || `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`,
          bio: '',
          location: '',
          timezone: 'UTC',
          preferred_language: 'en',
          notification_preferences: {
            email: true,
            push: true,
            sms: false
          },
          privacy_settings: {
            profile_public: true,
            stats_public: true
          }
        });
      }
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      showError('Failed to Load Profile', 'Could not load your profile data.');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!primaryWallet?.address) return;

    try {
      setIsSaving(true);
      
      const updatedProfile = await upsertUser(formData);
      
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        setHasChanges(false);
        success('Profile Updated!', 'Your profile has been saved successfully.');
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Failed to save profile:', error);
      showError('Save Failed', 'Could not save your profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasChanges(false);
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-8 lg:inset-16 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <User className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Edit Profile
            </h2>
            {hasChanges && (
              <Badge variant="secondary" className="ml-2">
                Unsaved Changes
              </Badge>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoadingProfile ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin"></div>
              <p className="ml-3 text-gray-600 dark:text-gray-400">Loading profile...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-8">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Display Name *</Label>
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => handleInputChange('display_name', e.target.value)}
                      placeholder="Enter your display name"
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      placeholder="Tell others about yourself..."
                      maxLength={200}
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {formData.bio.length}/200 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., New York, USA"
                        maxLength={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Timezone
                      </Label>
                      <Select 
                        value={formData.timezone} 
                        onValueChange={(value) => handleInputChange('timezone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
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
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Group updates, payment reminders</p>
                    </div>
                    <Switch
                      checked={formData.notification_preferences.email}
                      onCheckedChange={(checked) => 
                        handleNestedChange('notification_preferences', 'email', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-gray-500">Real-time app notifications</p>
                    </div>
                    <Switch
                      checked={formData.notification_preferences.push}
                      onCheckedChange={(checked) => 
                        handleNestedChange('notification_preferences', 'push', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Notifications</p>
                      <p className="text-sm text-gray-500">Important alerts only</p>
                    </div>
                    <Switch
                      checked={formData.notification_preferences.sms}
                      onCheckedChange={(checked) => 
                        handleNestedChange('notification_preferences', 'sms', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Public Profile</p>
                        <p className="text-sm text-gray-500">Allow others to view your profile</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.privacy_settings.profile_public}
                      onCheckedChange={(checked) => 
                        handleNestedChange('privacy_settings', 'profile_public', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <div>
                        <p className="font-medium">Show Statistics</p>
                        <p className="text-sm text-gray-500">Display your contribution stats</p>
                      </div>
                    </div>
                    <Switch
                      checked={formData.privacy_settings.stats_public}
                      onCheckedChange={(checked) => 
                        handleNestedChange('privacy_settings', 'stats_public', checked)
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              {userProfile && (
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Wallet Address:</span>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {primaryWallet?.address}
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Trust Score:</span>
                      <Badge variant="secondary">
                        {userProfile.trust_score?.toFixed(1) || '4.0'} / 5.0
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Member Since:</span>
                      <span className="text-sm">
                        {new Date(userProfile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isLoadingProfile}
            className="min-w-[100px]"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </>
  );
}
