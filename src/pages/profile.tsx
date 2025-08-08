import React, { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useSimpleSupabase } from '@/hooks/useSimpleSupabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Trophy, 
  Activity, 
  MapPin, 
  Globe, 
  Mail, 
  Phone,
  Wallet,
  Save,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

// Timezone options (simplified)
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

export default function ProfilePage() {
  const { primaryWallet, user } = useDynamicContext();
  const { 
    user: userProfile, 
    loading, 
    saveUser, 
    achievements, 
    notifications,
    unreadNotificationCount 
  } = useSimpleSupabase();

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: userProfile?.display_name || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    timezone: userProfile?.timezone || 'UTC',
    email: userProfile?.email || user?.email || '',
    phone: userProfile?.phone || '',
    notification_preferences: userProfile?.notification_preferences || {
      email: true,
      push: true,
      sms: false
    },
    privacy_settings: userProfile?.privacy_settings || {
      profile_public: true,
      stats_public: true
    }
  });

  // Update form when user profile loads
  React.useEffect(() => {
    if (userProfile && !isEditing) {
      setFormData({
        display_name: userProfile.display_name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        timezone: userProfile.timezone || 'UTC',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        notification_preferences: userProfile.notification_preferences || {
          email: true,
          push: true,
          sms: false
        },
        privacy_settings: userProfile.privacy_settings || {
          profile_public: true,
          stats_public: true
        }
      });
    }
  }, [userProfile, user, isEditing]);

  const handleSave = async () => {
    if (!formData.display_name.trim()) {
      toast.error('Display name is required');
      return;
    }

    const success = await saveUser({
      display_name: formData.display_name.trim(),
      bio: formData.bio.trim() || undefined,
      location: formData.location.trim() || undefined,
      timezone: formData.timezone,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      notification_preferences: formData.notification_preferences,
      privacy_settings: formData.privacy_settings
    });

    if (success) {
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (userProfile) {
      setFormData({
        display_name: userProfile.display_name || '',
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        timezone: userProfile.timezone || 'UTC',
        email: userProfile.email || user?.email || '',
        phone: userProfile.phone || '',
        notification_preferences: userProfile.notification_preferences || {
          email: true,
          push: true,
          sms: false
        },
        privacy_settings: userProfile.privacy_settings || {
          profile_public: true,
          stats_public: true
        }
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'uncommon': return 'bg-green-100 text-green-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bitcoin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!primaryWallet?.address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
              <p className="text-gray-500">Please connect your wallet to view your profile.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-gray-500">Manage your account settings and preferences</p>
        </div>
        <div className="flex items-center gap-4">
          {unreadNotificationCount > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {unreadNotificationCount} unread notifications
            </Badge>
          )}
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={handleCancel} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile?.avatar_url} alt={formData.display_name} />
                  <AvatarFallback className="text-lg">
                    {formData.display_name.slice(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{formData.display_name || 'Anonymous User'}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" />
                    {`${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`}
                  </CardDescription>
                  {userProfile?.onboarding_completed && (
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      <User className="h-3 w-3 mr-1" />
                      Verified User
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  {isEditing ? (
                    <Input
                      id="display_name"
                      value={formData.display_name}
                      onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1">{formData.display_name || 'Not set'}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      {formData.email ? (
                        <>
                          <Mail className="h-4 w-4" />
                          {formData.email}
                        </>
                      ) : (
                        'Not set'
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      {formData.phone ? (
                        <>
                          <Phone className="h-4 w-4" />
                          {formData.phone}
                        </>
                      ) : (
                        'Not set'
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  {isEditing ? (
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Enter your location"
                    />
                  ) : (
                    <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                      {formData.location ? (
                        <>
                          <MapPin className="h-4 w-4" />
                          {formData.location}
                        </>
                      ) : (
                        'Not set'
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                {isEditing ? (
                  <Select 
                    value={formData.timezone} 
                    onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {timezones.find(tz => tz.value === formData.timezone)?.label || formData.timezone}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-gray-600 mt-1">{formData.bio || 'No bio added yet'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Achievements */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Trust Score</span>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{userProfile?.trust_score?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Contributions</span>
                <span className="font-medium">{userProfile?.total_contributions || 0} cBTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Successful Rounds</span>
                <span className="font-medium">{userProfile?.successful_rounds || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Groups Created</span>
                <span className="font-medium">{userProfile?.groups_created || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Groups Joined</span>
                <span className="font-medium">{userProfile?.groups_joined || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements ({achievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.slice(0, 5).map((userAchievement) => (
                    <div key={userAchievement.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: userAchievement.achievement?.badge_color || '#6B7280' }}
                        >
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{userAchievement.achievement?.name}</p>
                          <Badge className={getRarityColor(userAchievement.achievement?.rarity || 'common')}>
                            {userAchievement.achievement?.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{userAchievement.achievement?.description}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(userAchievement.earned_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {achievements.length > 5 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{achievements.length - 5} more achievements
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Trophy className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No achievements yet</p>
                  <p className="text-xs text-gray-400">Complete actions to earn achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since</span>
                <span>{userProfile?.created_at ? formatDate(userProfile.created_at) : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Active</span>
                <span>{userProfile?.last_active_at ? formatDate(userProfile.last_active_at) : 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Language</span>
                <span>{userProfile?.preferred_language || 'English'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
