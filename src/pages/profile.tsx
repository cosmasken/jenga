import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarIcon } from "@/assets/avatars";
import { EmptyReputationState } from "@/assets/empty-states";
import { Bitcoin, Edit, Plus, TrendingUp, Trophy, Crown, Target, Star, Zap, Gem, Flame } from "lucide-react";

export default function Profile() {
  const { user, groups, reputationHistory } = useStore();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Profile not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please complete onboarding to view your profile.
          </p>
        </div>
      </div>
    );
  }

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
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div className="mb-8" variants={itemVariants}>
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-[hsl(27,87%,54%)] rounded-full flex items-center justify-center text-white text-3xl mr-6">
                    <AvatarIcon type={user.avatar} className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
                      {user.displayName}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      Member since {user.joinedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex text-yellow-400 mr-3">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-lg">★</span>
                        ))}
                      </div>
                      <span className="text-gray-600 dark:text-gray-400">
                        {user.reputation.toFixed(1)} reputation
                      </span>
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {user.walletAddress.slice(0, 8)}...{user.walletAddress.slice(-6)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white px-6 py-3 rounded-xl font-medium"
                  data-testid="button-edit-profile"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Reputation History */}
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Reputation History
                  </h2>
                  
                  {reputationHistory.length === 0 ? (
                    <EmptyReputationState />
                  ) : (
                    <div className="space-y-4">
                      {reputationHistory.slice(0, 5).map((event) => (
                        <motion.div
                          key={event.id}
                          className={`flex items-center p-4 rounded-xl border ${
                            event.type === 'payment' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                            event.type === 'vote' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                            event.type === 'completion' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' :
                            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          data-testid={`reputation-event-${event.id}`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-4 ${
                            event.type === 'payment' ? 'bg-green-500' :
                            event.type === 'vote' ? 'bg-blue-500' :
                            event.type === 'completion' ? 'bg-purple-500' :
                            'bg-red-500'
                          }`}>
                            {event.type === 'payment' ? <Plus className="h-5 w-5" /> :
                             event.type === 'vote' ? <Trophy className="h-5 w-5" /> :
                             event.type === 'completion' ? <Crown className="h-5 w-5" /> :
                             <TrendingUp className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${
                              event.type === 'payment' ? 'text-green-800 dark:text-green-300' :
                              event.type === 'vote' ? 'text-blue-800 dark:text-blue-300' :
                              event.type === 'completion' ? 'text-purple-800 dark:text-purple-300' :
                              'text-red-800 dark:text-red-300'
                            }`}>
                              {event.description}
                            </h3>
                            <p className={`text-sm ${
                              event.type === 'payment' ? 'text-green-600 dark:text-green-400' :
                              event.type === 'vote' ? 'text-blue-600 dark:text-blue-400' :
                              event.type === 'completion' ? 'text-purple-600 dark:text-purple-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {event.groupName && `${event.groupName} • `}
                              {event.date.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              event.points > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {event.points > 0 ? '+' : ''}{event.points}
                            </div>
                            <div className={`text-xs ${
                              event.type === 'payment' ? 'text-green-500 dark:text-green-400' :
                              event.type === 'vote' ? 'text-blue-500 dark:text-blue-400' :
                              event.type === 'completion' ? 'text-purple-500 dark:text-purple-400' :
                              'text-red-500 dark:text-red-400'
                            }`}>
                              {Math.floor((Date.now() - event.date.getTime()) / (24 * 60 * 60 * 1000))} days ago
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {reputationHistory.length > 5 && (
                        <Button 
                          variant="ghost"
                          className="w-full text-[hsl(27,87%,54%)] hover:text-[hsl(27,87%,49%)]"
                          data-testid="button-view-all-history"
                        >
                          View All History
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Activity Timeline */}
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-[hsl(27,87%,54%)] rounded-full mt-2 mr-4"></div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100">
                          Paid contribution for Bitcoin Savers Group
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">2 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-4"></div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100">
                          Voted on payment dispute
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">5 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-4"></div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-gray-100">
                          Joined Crypto Rockets Group
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">1 week ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats */}
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Your Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-[hsl(27,87%,54%)]/10 rounded-xl">
                      <div className="text-2xl font-black text-[hsl(27,87%,54%)] mb-2">
                        ₿{totalSaved.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Saved</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-500">{completedGroups}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-500">{activeGroups}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Claimable Rewards */}
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Claimable Rewards
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[hsl(27,87%,54%)]/10 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Reputation Bonus
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          High reputation reward
                        </div>
                      </div>
                      <div className="text-[hsl(27,87%,54%)] font-bold">₿0.01</div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Early Adopter
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Platform bonus
                        </div>
                      </div>
                      <div className="text-green-500 font-bold">₿0.005</div>
                    </div>
                    <Button 
                      className="w-full bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white font-medium py-3"
                      data-testid="button-claim-rewards"
                    >
                      Claim All Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Achievements */}
            <motion.div variants={itemVariants}>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Achievements
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div 
                      className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      data-testid="achievement-perfect-score"
                    >
                      <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        Perfect Score
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      data-testid="achievement-quick-payer"
                    >
                      <Zap className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        Quick Payer
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      data-testid="achievement-expert-voter"
                    >
                      <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        Expert Voter
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      data-testid="achievement-community-star"
                    >
                      <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        Community Star
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-gradient-to-r from-[hsl(27,87%,54%)]/10 to-purple-500/10 rounded-lg border border-[hsl(27,87%,54%)]/20">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-5 w-5 text-[hsl(27,87%,54%)] mr-2" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        Bitcoin ROSCA Legend
                      </span>
                    </div>
                    <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                      Complete 10 groups with perfect reputation to unlock this exclusive achievement
                    </p>
                    <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[hsl(27,87%,54%)] to-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                      3/10 groups completed
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
