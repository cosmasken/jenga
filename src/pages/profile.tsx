import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { useRosca } from "@/hooks/useRosca";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bitcoin, Edit, TrendingUp, Trophy, Crown, Target, Star, Zap, Gem, Flame, Wallet, Copy, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { primaryWallet, user } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    isConnected, 
    groupCount, 
    getGroupCount, 
    formatContribution 
  } = useRosca();

  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [reputationHistory, setReputationHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/");
    }
  }, [isLoggedIn, setLocation]);

  useEffect(() => {
    if (isConnected && primaryWallet) {
      getGroupCount();
      // TODO: Implement getUserGroups and getReputationHistory when available
    }
  }, [isConnected, primaryWallet, getGroupCount]);

  const copyAddress = () => {
    if (primaryWallet?.address) {
      navigator.clipboard.writeText(primaryWallet.address);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  if (!isConnected || !primaryWallet) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please connect your wallet to view your profile.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Go to Landing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate user stats from real data
  const totalSaved = userGroups.reduce((sum, group) => {
    return sum + (group.weeklyContribution * group.currentRound);
  }, 0);

  const activeGroups = userGroups.filter(g => g.status === 'active').length;
  const completedGroups = userGroups.filter(g => g.status === 'completed').length;

  // Mock reputation score - TODO: Implement real reputation system
  const reputationScore = 4.8;

  const getReputationBadge = (score: number) => {
    if (score >= 4.8) return { icon: Crown, label: "Diamond", color: "text-blue-500" };
    if (score >= 4.5) return { icon: Gem, label: "Platinum", color: "text-purple-500" };
    if (score >= 4.0) return { icon: Trophy, label: "Gold", color: "text-yellow-500" };
    if (score >= 3.5) return { icon: Star, label: "Silver", color: "text-gray-500" };
    return { icon: Target, label: "Bronze", color: "text-orange-500" };
  };

  const reputationBadge = getReputationBadge(reputationScore);
  const ReputationIcon = reputationBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-[hsl(27,87%,54%)] text-white">
                    {user?.email?.[0]?.toUpperCase() || primaryWallet.address?.[2]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {user?.email || "Anonymous User"}
                    </h1>
                    <Badge className={`${reputationBadge.color} bg-opacity-10`}>
                      <ReputationIcon className="h-3 w-3 mr-1" />
                      {reputationBadge.label}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                    <span className="font-mono text-sm">
                      {primaryWallet.address?.slice(0, 6)}...{primaryWallet.address?.slice(-4)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{reputationScore.toFixed(1)} Reputation</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bitcoin className="h-4 w-4 text-[hsl(27,87%,54%)]" />
                      <span>₿ {totalSaved.toFixed(4)} Saved</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-[hsl(27,87%,54%)]" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {userGroups.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Groups</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activeGroups}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Groups</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedGroups}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Recent Activity
              </h2>
              
              {reputationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No activity yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Join a group or create one to start building your reputation.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reputationHistory.map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0">
                        {event.type === 'contribution' && <Bitcoin className="h-5 w-5 text-[hsl(27,87%,54%)]" />}
                        {event.type === 'payout' && <TrendingUp className="h-5 w-5 text-green-500" />}
                        {event.type === 'reputation' && <Star className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {event.description}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {event.groupName} • {event.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          event.points > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {event.points > 0 ? '+' : ''}{event.points} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Groups Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Your Groups
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLocation("/dashboard")}
                >
                  View All
                </Button>
              </div>
              
              {userGroups.length === 0 ? (
                <div className="text-center py-8">
                  <Bitcoin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No groups yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Join your first ROSCA group to start saving together.
                  </p>
                  <Button 
                    onClick={() => setLocation("/dashboard")}
                    className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)]"
                  >
                    Explore Groups
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userGroups.slice(0, 4).map((group, index) => (
                    <Card 
                      key={group.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setLocation(`/group/${group.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {group.name}
                          </h3>
                          <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
                            {group.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex justify-between">
                            <span>Contribution:</span>
                            <span>₿ {formatContribution(group.contribution)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Progress:</span>
                            <span>{group.currentRound}/{group.totalRounds}</span>
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
      </div>
    </div>
  );
}
