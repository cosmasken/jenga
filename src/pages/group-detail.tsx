import { useParams } from "wouter";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AvatarIcon } from "@/assets/avatars";
import { ArrowLeft, Users, Share2, History, AlertTriangle, Check, Clock, Bitcoin } from "lucide-react";

export default function GroupDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { 
    groups, 
    user,
    selectGroup, 
    setShowTransactionModal, 
    setShowInviteModal 
  } = useStore();

  const group = groups.find(g => g.id === id);

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Group not found
          </h2>
          <Button onClick={() => setLocation('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handlePayContribution = () => {
    selectGroup(group.id);
    setShowTransactionModal(true);
  };

  const handleInvite = () => {
    selectGroup(group.id);
    setShowInviteModal(true);
  };

  const handleReportIssue = () => {
    setLocation('/disputes');
  };

  const currentUserMember = group.members.find(m => m.id === user?.id);
  const paidMembers = group.members.filter(m => m.hasPaid).length;

  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="flex items-center text-[hsl(27,87%,54%)] hover:text-[hsl(27,87%,49%)] mb-4"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center">
                <Users className="text-[hsl(27,87%,54%)] mr-3 h-8 w-8" />
                {group.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Round {group.currentRound} of {group.totalRounds} • Next payout in 3 days
              </p>
            </div>
            <Button 
              onClick={handleInvite}
              className="bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white px-6 py-3 rounded-xl font-medium"
              data-testid="button-invite-members"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Round Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Round Timeline
                  </h2>
                  <div className="space-y-4">
                    {/* Completed Round */}
                    <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                        <Check className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-green-800 dark:text-green-300">
                            Round {group.currentRound - 1} - Alice received ₿{group.weeklyContribution * group.members.length}
                          </h3>
                          <span className="text-sm text-green-600 dark:text-green-400">
                            Completed
                          </span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Current Round */}
                    <div className="flex items-center p-4 bg-[hsl(27,87%,54%)]/10 rounded-xl border border-[hsl(27,87%,54%)]/20">
                      <motion.div 
                        className="w-10 h-10 bg-[hsl(27,87%,54%)] rounded-full flex items-center justify-center text-white font-bold mr-4"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {group.currentRound}
                      </motion.div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                            Round {group.currentRound} - Your turn!
                          </h3>
                          <span className="text-sm text-orange-600 dark:text-orange-400">
                            3 days left
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-orange-600 dark:text-orange-400">
                              Contributions: {paidMembers}/{group.members.length}
                            </span>
                            <span className="text-orange-600 dark:text-orange-400">
                              ₿{(paidMembers * group.weeklyContribution).toFixed(3)}/₿{(group.members.length * group.weeklyContribution).toFixed(3)}
                            </span>
                          </div>
                          <Progress 
                            value={(paidMembers / group.members.length) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Future Round */}
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold mr-4">
                        {group.currentRound + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                          Round {group.currentRound + 1} - Bob's turn
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Starts {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pool Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Pool Information
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 bg-[hsl(27,87%,54%)]/10 rounded-xl">
                      <div className="text-2xl font-black text-[hsl(27,87%,54%)] mb-2">
                        ₿{group.poolSize.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Pool Size
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="text-2xl font-black text-green-500 mb-2">
                        ₿{group.weeklyContribution.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Weekly Contribution
                      </div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="text-2xl font-black text-blue-500 mb-2">
                        {group.totalRounds}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Rounds
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="text-2xl font-black text-purple-500 mb-2">
                        Weekly
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Payout Frequency
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={handlePayContribution}
                      className="w-full bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white font-bold py-3"
                      data-testid="button-pay-contribution"
                    >
                      <Bitcoin className="mr-2 h-4 w-4" />
                      Pay Contribution
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      data-testid="button-view-history"
                    >
                      <History className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleReportIssue}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      data-testid="button-report-issue"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Report Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Members List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Members ({group.members.length}/{group.maxMembers})
                  </h3>
                  <div className="space-y-3">
                    {group.members.slice(0, 5).map((member, index) => (
                      <div 
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-[hsl(27,87%,54%)] rounded-full flex items-center justify-center mr-3">
                            <AvatarIcon type={member.avatar} className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {member.id === user?.id ? 'You' : member.displayName}
                            </div>
                            <div className="flex text-yellow-400 text-xs">
                              {[...Array(Math.floor(member.reputation))].map((_, i) => (
                                <span key={i}>★</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={member.hasPaid ? "default" : "destructive"}
                          className={`text-xs ${
                            member.hasPaid 
                              ? "bg-green-500 text-white" 
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {member.hasPaid ? "Paid" : "Pending"}
                        </Badge>
                      </div>
                    ))}
                    
                    {group.members.length > 5 && (
                      <Button 
                        variant="ghost"
                        className="w-full text-[hsl(27,87%,54%)] hover:text-[hsl(27,87%,49%)]"
                      >
                        View All Members
                      </Button>
                    )}
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
