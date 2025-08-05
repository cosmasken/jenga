import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
// import { useStore } from "@/lib/store";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { AvatarIcon } from "../assets/avatars";
import { EmptyGroupsState } from "../assets/empty-states";
import { Plus, Users, Bitcoin, TrendingUp, Trophy } from "lucide-react";

export default function Dashboard() {
    const [, setLocation] = useLocation();
    const {
        user,
        groups,
        initializeData,
        selectGroup,
        setShowTransactionModal,
        setShowInviteModal,
        createNewGroup
    } = useStore();

    useEffect(() => {
        initializeData();
    }, [initializeData]);

    const handleGroupClick = (groupId: string) => {
        selectGroup(groupId);
        setLocation(`/group/${groupId}`);
    };

    const handlePayContribution = (e: React.MouseEvent, groupId: string) => {
        e.stopPropagation();
        selectGroup(groupId);
        setShowTransactionModal(true);
    };

    const handleInviteClick = (e: React.MouseEvent, groupId: string) => {
        e.stopPropagation();
        selectGroup(groupId);
        setShowInviteModal(true);
    };

    const handleCreateGroup = () => {
        createNewGroup("New Bitcoin Group", 0.05);
    };

    // Calculate user stats
    const totalSaved = groups.reduce((sum, group) => {
        return sum + (group.weeklyContribution * group.currentRound);
    }, 0);

    const activeGroups = groups.filter(g => g.status === 'active').length;
    const completedGroups = groups.filter(g => g.status === 'completed').length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="container mx-auto px-4">
                {/* Header */}
                <motion.div className="mb-8" variants={itemVariants}>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                                My Groups
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your ROSCA savings groups
                            </p>
                        </div>
                        <Button
                            onClick={handleCreateGroup}
                            className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white px-6 py-3 rounded-xl font-medium"
                            data-testid="button-create-group"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Group
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Total Saved
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                ₿{totalSaved.toFixed(3)}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-[hsl(27,87%,54%)]/10 rounded-full">
                                            <Bitcoin className="h-6 w-6 text-[hsl(27,87%,54%)]" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Active Groups
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                {activeGroups}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                                            <Users className="h-6 w-6 text-green-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <Card className="border border-gray-200 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                                Reputation
                                            </p>
                                            <div className="flex items-center">
                                                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-2">
                                                    {user?.reputation.toFixed(1) || "5.0"}
                                                </span>
                                                <div className="flex text-yellow-400 text-sm">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                                            <Trophy className="h-6 w-6 text-yellow-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Groups Grid */}
                {groups.length === 0 ? (
                    <motion.div variants={itemVariants}>
                        <EmptyGroupsState />
                    </motion.div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        variants={containerVariants}
                    >
                        {groups.map((group) => (
                            <motion.div
                                key={group.id}
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Card
                                    className="cursor-pointer border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                                    onClick={() => handleGroupClick(group.id)}
                                    data-testid={`card-group-${group.id}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-[hsl(27,87%,54%)]/10 rounded-full mr-3">
                                                    <Users className="h-5 w-5 text-[hsl(27,87%,54%)]" />
                                                </div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                    {group.name}
                                                </h3>
                                            </div>
                                            <Badge
                                                variant={
                                                    group.status === 'active' ? 'default' :
                                                        group.status === 'pending' ? 'secondary' :
                                                            'outline'
                                                }
                                                className={
                                                    group.status === 'active' ? 'bg-green-500 text-white' :
                                                        group.status === 'pending' ? 'bg-yellow-500 text-white' :
                                                            'bg-purple-500 text-white'
                                                }
                                            >
                                                {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Pool Size</span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    ₿{group.poolSize.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">Members</span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {group.members.length}/{group.maxMembers}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {group.status === 'pending' ? 'Starting In' :
                                                        group.status === 'completed' ? 'Completed' : 'Next Payout'}
                                                </span>
                                                <span className={`font-semibold ${group.status === 'active' ? 'text-[hsl(27,87%,54%)]' :
                                                    group.status === 'pending' ? 'text-blue-500' :
                                                        'text-green-500'
                                                    }`}>
                                                    {group.status === 'completed' ? 'Done' : '3 days'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {group.status === 'pending' ? 'Member Progress' : 'Round Progress'}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {group.status === 'pending' ?
                                                        `${group.members.length}/${group.maxMembers}` :
                                                        `${group.currentRound}/${group.totalRounds}`
                                                    }
                                                </span>
                                            </div>
                                            <Progress
                                                value={
                                                    group.status === 'pending' ?
                                                        (group.members.length / group.maxMembers) * 100 :
                                                        (group.currentRound / group.totalRounds) * 100
                                                }
                                                className="h-2"
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            {group.status === 'active' ? (
                                                <Button
                                                    onClick={(e) => handlePayContribution(e, group.id)}
                                                    className="flex-1 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white text-sm py-2"
                                                    data-testid={`button-pay-contribution-${group.id}`}
                                                >
                                                    Pay Contribution
                                                </Button>
                                            ) : group.status === 'pending' ? (
                                                <Button
                                                    onClick={(e) => handleInviteClick(e, group.id)}
                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2"
                                                    data-testid={`button-invite-members-${group.id}`}
                                                >
                                                    Invite Members
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 text-sm py-2"
                                                    data-testid={`button-view-summary-${group.id}`}
                                                >
                                                    View Summary
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
