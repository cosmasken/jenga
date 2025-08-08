import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "@/hooks/useRosca";
import { useSupabase } from "@/hooks/useSupabase";
import { CreateChamaModal } from "@/components/CreateChamaModal";
import { NotificationSidebar } from "@/components/NotificationSidebar";
import { EditProfile } from "@/components/EditProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRoscaToast } from "@/hooks/use-rosca-toast";
import { useEventListener } from "@/hooks/use-event-listener";
import { useNotifications } from "@/hooks/use-notifications";
import { WalletDropdown } from "@/components/WalletDropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Users, Bitcoin, TrendingUp, Trophy, Wallet, Bell, BellOff, Award, Target, User, Settings } from "lucide-react";

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const { primaryWallet, user } = useDynamicContext();
    const isLoggedIn = useIsLoggedIn();
    const { 
        isConnected, 
        groupCount, 
        getGroupCount, 
        getGroupInfo,
        isGroupCreator,
        isLoading, 
        error,
        formatContribution 
    } = useRosca();
    const {
        getUser,
        getUserAchievements,
        getNotifications,
        subscribeToNotifications,
        logActivity,
        isLoading: isSupabaseLoading
    } = useSupabase();

    const [userProfile, setUserProfile] = useState<any>(null);
    const [userAchievements, setUserAchievements] = useState<any[]>([]);
    const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showNotificationSidebar, setShowNotificationSidebar] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [dashboardStats, setDashboardStats] = useState({
        totalContributions: 0,
        totalSaved: 0,
        activeGroups: 0,
        completedCycles: 0,
        trustScore: 4.0
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [userGroups, setUserGroups] = useState<any[]>([]);
    const [isLoadingGroups, setIsLoadingGroups] = useState(false);
    const [hasShownWelcome, setHasShownWelcome] = useState(false);
    
    const { contributionReminder, memberJoined, success } = useRoscaToast();

    // Event monitoring and notifications
    const eventListener = useEventListener({ 
        enabled: isConnected && !!primaryWallet?.address,
        showToasts: true 
    });
    const notifications = useNotifications();

    // Load user data from Supabase and refresh when needed
    useEffect(() => {
        if (isConnected && primaryWallet?.address) {
            loadUserData();
            loadUserGroups();
            setupRealtimeSubscriptions();
        }
    }, [isConnected, primaryWallet?.address, refreshTrigger]);

    const loadUserData = async () => {
        if (!primaryWallet?.address) return;

        try {
            console.log('🔄 Loading user dashboard data...');

            // Load user profile (onboarding data only)
            const profile = await getUser(primaryWallet.address);
            setUserProfile(profile);
            console.log('✅ User profile loaded:', profile);

            // Load user achievements (only for onboarded users)
            const currentUser = await getUser(primaryWallet.address);
            if (currentUser?.onboarding_completed) {
                const achievements = await getUserAchievements(primaryWallet.address);
                setUserAchievements(achievements);
                console.log('✅ User achievements loaded:', achievements.length);
            } else {
                console.log('🔍 User not onboarded yet, skipping achievements query');
                setUserAchievements([]);
            }

            // Load recent notifications
            const notifications = await getNotifications(primaryWallet.address, { 
                limit: 5,
                is_read: false 
            });
            setRecentNotifications(notifications);
            console.log('✅ Recent notifications loaded:', notifications.length);

            // Calculate dashboard stats
            const stats = {
                totalContributions: profile?.total_contributions || 0,
                totalSaved: profile?.total_contributions || 0, // Simplified for now
                activeGroups: 0, // TODO: Get from blockchain
                completedCycles: profile?.successful_rounds || 0,
                trustScore: profile?.trust_score || 4.0
            };
            setDashboardStats(stats);
            console.log('✅ Dashboard stats calculated:', stats);

            // Log dashboard visit
            await logActivity(
                'dashboard_visited',
                'user',
                profile?.id,
                'Visited dashboard',
                { timestamp: new Date().toISOString() }
            );

        } catch (error) {
            console.error('❌ Failed to load user data:', error);
        }
    };

    const setupRealtimeSubscriptions = () => {
        if (!primaryWallet?.address) return;

        // Subscribe to notifications
        const unsubscribeNotifications = subscribeToNotifications(
            primaryWallet.address,
            (payload) => {
                console.log('🔔 New notification received:', payload.new);
                setRecentNotifications(prev => [payload.new, ...prev.slice(0, 4)]);
                
                // Show toast for important notifications
                if (payload.new.type === 'achievement') {
                    success('Achievement Unlocked!', payload.new.message);
                } else if (payload.new.type === 'group') {
                    memberJoined(payload.new.message);
                }
            }
        );

        return () => {
            unsubscribeNotifications();
        };
    };

    // Load user's created groups
    const loadUserGroups = async () => {
        if (!primaryWallet?.address || !isConnected) return;

        try {
            setIsLoadingGroups(true);
            console.log('🔄 Loading user groups...');

            // Get total group count first
            const totalGroups = await getGroupCount();
            console.log('📊 Total groups on blockchain:', totalGroups);

            if (totalGroups === 0) {
                setUserGroups([]);
                return;
            }

            // Check all groups to find which ones the user created
            const createdGroups = [];
            const maxGroupsToCheck = Math.min(totalGroups, 50); // Limit for performance

            for (let i = 0; i < maxGroupsToCheck; i++) {
                try {
                    // Check if user is creator of this group
                    const isCreator = await isGroupCreator(i);
                    if (isCreator) {
                        // Get full group info
                        const groupInfo = await getGroupInfo(i);
                        if (groupInfo) {
                            createdGroups.push({
                                ...groupInfo,
                                id: i,
                                name: groupInfo.name || `Group ${i}`,
                                description: `ROSCA Group #${i}`,
                                contributionAmount: parseFloat(groupInfo.contribution?.toString() || '0') / 1e18,
                                roundLengthDays: Math.floor(groupInfo.roundLength / 86400),
                            });
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Could not check group ${i}:`, error);
                }
            }

            console.log('✅ User created groups loaded:', createdGroups.length);
            setUserGroups(createdGroups);

        } catch (error) {
            console.error('❌ Failed to load user groups:', error);
            setUserGroups([]);
        } finally {
            setIsLoadingGroups(false);
        }
    };

    // Get user display name from Supabase profile or fallback
    const getUserDisplayName = () => {
        if (userProfile?.display_name) return userProfile.display_name;
        
        if (user?.email) return user.email;
        if (user?.phone) return user.phone;
        if (primaryWallet?.address) return `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`;
        return 'User';
    };

    useEffect(() => {
        if (isConnected && primaryWallet) {
            getGroupCount();
            // TODO: Implement getUserGroups when available in contract
        }
    }, [isConnected, primaryWallet, getGroupCount]);

    // Show welcome message for first-time visitors
    useEffect(() => {
        // Only show welcome message for users who have completed onboarding
        // and haven't seen the dashboard welcome yet, and we haven't shown it in this session
        if (userProfile?.onboarding_completed && 
            userProfile?.display_name && 
            !userProfile?.dashboard_welcome_shown && 
            !hasShownWelcome && 
            isLoggedIn) {
            
            // Set flag immediately to prevent multiple toasts
            setHasShownWelcome(true);
            
            setTimeout(() => {
                success(`Welcome to your Dashboard, ${userProfile.display_name}! 🏠`, "Start by creating your first savings group or joining an existing one");
                // TODO: Mark dashboard_welcome_shown in the database if needed
            }, 1000);
        }
    }, [isLoggedIn, userProfile?.onboarding_completed, userProfile?.display_name, userProfile?.dashboard_welcome_shown, hasShownWelcome, success]);

    // Redirect to landing if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            setLocation("/");
        }
    }, [isLoggedIn, setLocation]);

    const handleCreateGroup = () => {
        setShowCreateModal(true);
    };

    const handleGroupClick = (groupId: number) => {
        setLocation(`/group/${groupId}`);
    };

    // Handle group creation success - refresh user groups
    const handleGroupCreated = () => {
        console.log('🎉 Group created successfully, refreshing data...');
        setRefreshTrigger(prev => prev + 1);
        getGroupCount(); // Also refresh the group count immediately
    };

    if (!isConnected || !primaryWallet) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Please connect your wallet to access the dashboard.
                        </p>
                        <Button onClick={() => setLocation("/")} className="w-full">
                            Go to Landing
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-6 md:mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                Dashboard
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                                Welcome back, {getUserDisplayName()}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Profile Button */}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowEditProfile(true)}
                                className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5 dark:border-bitcoin/30 dark:hover:border-bitcoin/50 dark:hover:bg-bitcoin/10 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                            >
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                            </Button>

                            {/* Notification Bell */}
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setShowNotificationSidebar(true)}
                                    className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5 dark:border-bitcoin/30 dark:hover:border-bitcoin/50 dark:hover:bg-bitcoin/10 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10"
                                >
                                    {recentNotifications.filter(n => !n.is_read).length > 0 ? (
                                        <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-bitcoin" />
                                    ) : (
                                        <BellOff className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                                    )}
                                </Button>
                                {recentNotifications.filter(n => !n.is_read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-bitcoin text-bitcoin-foreground text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium text-[10px] sm:text-xs">
                                        {recentNotifications.filter(n => !n.is_read).length > 9 ? '9+' : recentNotifications.filter(n => !n.is_read).length}
                                    </span>
                                )}
                            </div>

                            {/* Event Monitoring Status - hidden on mobile */}
                            <div className="hidden sm:flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${eventListener.isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <span className="text-xs text-muted-foreground">
                                    {eventListener.isMonitoring ? 'Live' : 'Offline'}
                                </span>
                            </div>

                            {/* Wallet Dropdown - compact on mobile */}
                            <div className="block">
                                <WalletDropdown />
                            </div>

                            {/* Theme Toggle - hidden on mobile (moved to wallet dropdown) */}
                            <div className="hidden sm:block">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Groups
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {isLoading ? "..." : groupCount}
                                        </p>
                                    </div>
                                    <Users className="h-8 w-8 text-[hsl(27,87%,54%)]" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Your Groups
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            {userGroups.length}
                                        </p>
                                    </div>
                                    <Bitcoin className="h-8 w-8 text-[hsl(27,87%,54%)]" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Saved
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            ₿ 0.00
                                        </p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-[hsl(27,87%,54%)]" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Reputation
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                            5.0
                                        </p>
                                    </div>
                                    <Trophy className="h-8 w-8 text-[hsl(27,87%,54%)]" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Event Monitoring Status */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${eventListener.isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                            Real-time Monitoring
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {eventListener.isMonitoring 
                                                ? `Live • Block ${eventListener.lastProcessedBlock.toString()}`
                                                : 'Offline • Connect wallet to enable'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-bitcoin">
                                            {notifications.unreadCount}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Unread
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                            {notifications.notifications.length}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Total
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                                Quick Actions
                            </h2>
                            <div className="flex flex-wrap gap-4">
                                <Button 
                                    onClick={handleCreateGroup}
                                    variant="bitcoin"
                                    className="shadow-bitcoin hover:shadow-bitcoin-strong"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Group
                                </Button>
                                <Button 
                                    variant="bitcoin-outline"
                                    onClick={() => setLocation('/browse')}
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Browse Groups
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Your Groups */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                        Your Groups
                                    </h2>
                                    <Badge variant="secondary">{userGroups.length}</Badge>
                            </div>
                            
                            {isLoadingGroups ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin mx-auto mb-4"></div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Loading your groups...
                                    </p>
                                </div>
                            ) : userGroups.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bitcoin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No groups created yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Create your first ROSCA group to start saving with others.
                                    </p>
                                    <Button 
                                        onClick={handleCreateGroup}
                                        className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Your First Group
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userGroups.map((group) => (
                                        <Card key={group.id} className="border-l-4 border-l-bitcoin hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleGroupClick(group.id)}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                            {group.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                            {group.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {Number(group.memberCount)}/{group.maxMembers} members
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Bitcoin className="h-3 w-3" />
                                                                {group.contributionAmount.toFixed(4)} cBTC/round
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Target className="h-3 w-3" />
                                                                Round {group.currentRound}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={group.isActive ? "default" : "secondary"}>
                                                            {group.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                        <Badge variant="outline">Creator</Badge>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Error Display */}
                {error && (
                    <motion.div
                        className="mt-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                            <CardContent className="p-4">
                                <p className="text-red-600 dark:text-red-400">
                                    Error: {error.message}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>

            {/* Create Chama Modal */}
            <CreateChamaModal 
                open={showCreateModal} 
                onOpenChange={setShowCreateModal}
                onGroupCreated={handleGroupCreated}
            />

            {/* Notification Sidebar */}
            <NotificationSidebar 
                isOpen={showNotificationSidebar}
                onClose={() => setShowNotificationSidebar(false)}
            />

            {/* Edit Profile Modal */}
            <EditProfile 
                isOpen={showEditProfile}
                onClose={() => setShowEditProfile(false)}
            />
        </div>
    );
}
