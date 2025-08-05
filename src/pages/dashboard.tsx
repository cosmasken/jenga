import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "@/hooks/useRosca";
import { CreateChamaModal } from "@/components/CreateChamaModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRoscaToast } from "@/hooks/use-rosca-toast";
import { useEventListener } from "@/hooks/use-event-listener";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationCenter } from "@/components/NotificationCenter";
import { WalletDropdown } from "@/components/WalletDropdown";
import { ThemeToggle } from "@/components/theme-toggle";
import { Plus, Users, Bitcoin, TrendingUp, Trophy, Wallet, Bell, BellOff } from "lucide-react";

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const { primaryWallet, user } = useDynamicContext();
    const isLoggedIn = useIsLoggedIn();
    const { 
        isConnected, 
        groupCount, 
        getGroupCount, 
        isLoading, 
        error,
        formatContribution 
    } = useRosca();

    const [userGroups, setUserGroups] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const { contributionReminder, memberJoined, success } = useRoscaToast();

    // Event monitoring and notifications
    const eventListener = useEventListener({ 
        enabled: isConnected && !!primaryWallet?.address,
        showToasts: true 
    });
    const notifications = useNotifications();

    // Get user display name from stored onboarding data or fallback to identifiers
    const getUserDisplayName = () => {
        const storedName = localStorage.getItem('jenga_user_display_name');
        if (storedName) return storedName;
        
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
        const hasSeenWelcome = localStorage.getItem('jenga_dashboard_welcome_shown');
        const userName = localStorage.getItem('jenga_user_display_name');
        
        if (!hasSeenWelcome && userName && isLoggedIn) {
            setTimeout(() => {
                success(`Welcome to your Dashboard, ${userName}! 🏠`, "Start by creating your first savings group or joining an existing one");
                localStorage.setItem('jenga_dashboard_welcome_shown', 'true');
            }, 1000);
        }
    }, [isLoggedIn, success]);

    // Redirect to landing if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            setLocation("/");
        }
    }, [isLoggedIn, setLocation]);

    const handleCreateGroup = () => {
        setShowCreateModal(true);
    };

    const handleGroupClick = (groupId: string) => {
        setLocation(`/group/${groupId}`);
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
                    className="mb-8 flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Dashboard
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Welcome back, {getUserDisplayName()}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={notifications.toggleCenter}
                                className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5 dark:border-bitcoin/30 dark:hover:border-bitcoin/50 dark:hover:bg-bitcoin/10 transition-all duration-200"
                            >
                                {notifications.unreadCount > 0 ? (
                                    <Bell className="h-[1.2rem] w-[1.2rem] text-bitcoin" />
                                ) : (
                                    <BellOff className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
                                )}
                            </Button>
                            {notifications.unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-bitcoin text-bitcoin-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                                    {notifications.unreadCount > 9 ? '9+' : notifications.unreadCount}
                                </span>
                            )}
                        </div>

                        {/* Event Monitoring Status */}
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${eventListener.isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <span className="text-xs text-muted-foreground">
                                {eventListener.isMonitoring ? 'Live' : 'Offline'}
                            </span>
                        </div>

                        {/* Wallet Dropdown */}
                        <WalletDropdown />

                        <ThemeToggle />
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
                            
                            {userGroups.length === 0 ? (
                                <div className="text-center py-12">
                                    <Bitcoin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                        No groups yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Create your first ROSCA group or join an existing one to get started.
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {userGroups.map((group, index) => (
                                        <Card 
                                            key={group.id} 
                                            className="cursor-pointer hover:shadow-lg transition-shadow"
                                            onClick={() => handleGroupClick(group.id)}
                                        >
                                            <CardContent className="p-4">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    {group.name}
                                                </h3>
                                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                                    <div className="flex justify-between">
                                                        <span>Contribution:</span>
                                                        <span>₿ {formatContribution(group.contribution)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Round:</span>
                                                        <span>{group.currentRound}/{group.totalRounds}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Status:</span>
                                                        <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                                                            {group.status}
                                                        </Badge>
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
            />

            {/* Notification Center */}
            <NotificationCenter 
                isOpen={notifications.isOpen}
                onClose={notifications.closeCenter}
            />
        </div>
    );
}

//     const handleGroupClick = (groupId: string) => {
//         setLocation(`/group/${groupId}`);
//     };

//     if (!isConnected || !primaryWallet) {
//         return (
//             <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
//                 <Card className="w-full max-w-md">
//                     <CardContent className="pt-6 text-center">
//                         <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
//                         <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
//                         <p className="text-gray-600 dark:text-gray-400 mb-4">
//                             Please connect your wallet to access the dashboard.
//                         </p>
//                         <Button onClick={() => setLocation("/")} className="w-full">
//                             Go to Landing
//                         </Button>
//                     </CardContent>
//                 </Card>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* Header */}
//                 <motion.div
//                     className="mb-8"
//                     initial={{ opacity: 0, y: -20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5 }}
//                 >
//                     <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
//                         Dashboard
//                     </h1>
//                     <p className="text-gray-600 dark:text-gray-400">
//                         Welcome back, {user?.email || `${primaryWallet.address?.slice(0, 6)}...${primaryWallet.address?.slice(-4)}`}
//                     </p>
//                 </motion.div>

//                 {/* Stats Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.1 }}
//                     >
//                         <Card>
//                             <CardContent className="p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                                             Total Groups
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                                             {isLoading ? "..." : groupCount}
//                                         </p>
//                                     </div>
//                                     <Users className="h-8 w-8 text-[hsl(27,87%,54%)]" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </motion.div>

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.2 }}
//                     >
//                         <Card>
//                             <CardContent className="p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                                             Your Groups
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                                             {userGroups.length}
//                                         </p>
//                                     </div>
//                                     <Bitcoin className="h-8 w-8 text-[hsl(27,87%,54%)]" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </motion.div>

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.3 }}
//                     >
//                         <Card>
//                             <CardContent className="p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                                             Total Saved
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                                             ₿ 0.00
//                                         </p>
//                                     </div>
//                                     <TrendingUp className="h-8 w-8 text-[hsl(27,87%,54%)]" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </motion.div>

//                     <motion.div
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.5, delay: 0.4 }}
//                     >
//                         <Card>
//                             <CardContent className="p-6">
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
//                                             Reputation
//                                         </p>
//                                         <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
//                                             5.0
//                                         </p>
//                                     </div>
//                                     <Trophy className="h-8 w-8 text-[hsl(27,87%,54%)]" />
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </motion.div>
//                 </div>

//                 {/* Quick Actions */}
//                 <motion.div
//                     className="mb-8"
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.5 }}
//                 >
//                     <Card>
//                         <CardContent className="p-6">
//                             <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
//                                 Quick Actions
//                             </h2>
//                             <div className="flex flex-wrap gap-4">
//                                 <Button 
//                                     onClick={handleCreateGroup}
//                                     className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
//                                 >
//                                     <Plus className="h-4 w-4 mr-2" />
//                                     Create Group
//                                 </Button>
//                                 <Button variant="outline">
//                                     <Users className="h-4 w-4 mr-2" />
//                                     Browse Groups
//                                 </Button>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </motion.div>

//                 {/* Your Groups */}
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: 0.6 }}
//                 >
//                     <Card>
//                         <CardContent className="p-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                                     Your Groups
//                                 </h2>
//                                 <Badge variant="secondary">{userGroups.length}</Badge>
//                             </div>
                            
//                             {userGroups.length === 0 ? (
//                                 <div className="text-center py-12">
//                                     <Bitcoin className="h-16 w-16 mx-auto mb-4 text-gray-400" />
//                                     <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
//                                         No groups yet
//                                     </h3>
//                                     <p className="text-gray-600 dark:text-gray-400 mb-6">
//                                         Create your first ROSCA group or join an existing one to get started.
//                                     </p>
//                                     <Button 
//                                         onClick={handleCreateGroup}
//                                         className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
//                                     >
//                                         <Plus className="h-4 w-4 mr-2" />
//                                         Create Your First Group
//                                     </Button>
//                                 </div>
//                             ) : (
//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                     {userGroups.map((group, index) => (
//                                         <Card 
//                                             key={group.id} 
//                                             className="cursor-pointer hover:shadow-lg transition-shadow"
//                                             onClick={() => handleGroupClick(group.id)}
//                                         >
//                                             <CardContent className="p-4">
//                                                 <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
//                                                     {group.name}
//                                                 </h3>
//                                                 <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
//                                                     <div className="flex justify-between">
//                                                         <span>Contribution:</span>
//                                                         <span>₿ {formatContribution(group.contribution)}</span>
//                                                     </div>
//                                                     <div className="flex justify-between">
//                                                         <span>Round:</span>
//                                                         <span>{group.currentRound}/{group.totalRounds}</span>
//                                                     </div>
//                                                     <div className="flex justify-between">
//                                                         <span>Status:</span>
//                                                         <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
//                                                             {group.status}
//                                                         </Badge>
//                                                     </div>
//                                                 </div>
//                                             </CardContent>
//                                         </Card>
//                                     ))}
//                                 </div>
//                             )}
//                         </CardContent>
//                     </Card>
//                 </motion.div>

//                 {/* Error Display */}
//                 {error && (
//                     <motion.div
//                         className="mt-4"
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                     >
//                         <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
//                             <CardContent className="p-4">
//                                 <p className="text-red-600 dark:text-red-400">
//                                     Error: {error.message}
//                                 </p>
//                             </CardContent>
//                         </Card>
//                     </motion.div>
//                 )}
//             </div>
//         </div>
//     );
// }
