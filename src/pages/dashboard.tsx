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
import { Plus, Users, Bitcoin, TrendingUp, Trophy, Wallet } from "lucide-react";

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

    useEffect(() => {
        if (isConnected && primaryWallet) {
            getGroupCount();
            // TODO: Implement getUserGroups when available in contract
        }
    }, [isConnected, primaryWallet, getGroupCount]);

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
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back, {user?.email || `${primaryWallet.address?.slice(0, 6)}...${primaryWallet.address?.slice(-4)}`}
                    </p>
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
                                    className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Group
                                </Button>
                                <Button variant="outline">
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
