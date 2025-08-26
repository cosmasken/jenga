import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Crown, 
  TrendingUp,
  Calendar,
  DollarSign,
  Target,
  BarChart3,
  Trophy,
  Timer,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import type { 
  MemberContributionHistory, 
  RoundContribution, 
  ContributionStatus 
} from '@/types/member';

interface MemberContributionHistoryProps {
  history: MemberContributionHistory | null;
  isLoading: boolean;
  tokenSymbol: string;
  formatTokenAmount: (amount: bigint) => string;
  onTransactionClick?: (txHash: string) => void;
}

export function MemberContributionHistory({
  history,
  isLoading,
  tokenSymbol,
  formatTokenAmount,
  onTransactionClick
}: MemberContributionHistoryProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);

  const getStatusConfig = (status: ContributionStatus) => {
    switch (status) {
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: CheckCircle,
          label: 'Paid',
          description: 'Contribution made on time'
        };
      case 'late':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          icon: AlertTriangle,
          label: 'Late',
          description: 'Contribution made after deadline'
        };
      case 'missed':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          icon: XCircle,
          label: 'Missed',
          description: 'No contribution made'
        };
      case 'excused':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          icon: Crown,
          label: 'Excused',
          description: 'Winner of this round'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          icon: Clock,
          label: 'Pending',
          description: 'Contribution not due yet'
        };
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 5) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), 'MMM d, yyyy HH:mm');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Contribution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Contribution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No History Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Contribution history will appear here once the ROSCA starts and rounds begin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const contributionRate = history.totalRounds > 0 
    ? (history.summary.onTimeContributions / history.totalRounds) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Contribution History
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {history.summary.onTimeContributions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">On Time</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {history.summary.lateContributions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Late</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {history.summary.missedContributions}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Missed</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTokenAmount(history.summary.totalContributed)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Contribution Rate</span>
                <span>{contributionRate.toFixed(1)}%</span>
              </div>
              <Progress value={contributionRate} className="h-3" />
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Trophy className={`h-4 w-4 ${getStreakColor(history.summary.currentStreak)}`} />
                  <span className={getStreakColor(history.summary.currentStreak)}>
                    Current Streak: {history.summary.currentStreak} rounds
                  </span>
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Best: {history.summary.longestStreak} rounds
                </div>
              </div>
            </div>

            {/* Recent Contributions */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Recent Rounds</h4>
              <div className="space-y-2">
                {history.contributions
                  .slice(-5)
                  .reverse()
                  .map(contribution => {
                    const statusConfig = getStatusConfig(contribution.status);
                    return (
                      <div
                        key={contribution.roundNumber}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <statusConfig.icon className={`h-4 w-4 ${statusConfig.color.split(' ')[1]}`} />
                            <span className="font-medium">Round {contribution.roundNumber}</span>
                          </div>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {contribution.amount > 0n ? formatTokenAmount(contribution.amount) : '-'} {tokenSymbol}
                          </div>
                          {contribution.contributionTime && (
                            <div className="text-xs text-gray-500">
                              {formatDate(contribution.contributionTime)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {/* Timeline */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Complete Timeline</h4>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="space-y-6">
                  {history.contributions.map((contribution, index) => {
                    const statusConfig = getStatusConfig(contribution.status);
                    const isSelected = selectedRound === contribution.roundNumber;
                    
                    return (
                      <div
                        key={contribution.roundNumber}
                        className={`relative flex items-start gap-4 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 dark:bg-blue-950' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        } p-3 rounded-lg`}
                        onClick={() => setSelectedRound(isSelected ? null : contribution.roundNumber)}
                      >
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center ${
                          contribution.status === 'paid' ? 'bg-green-500' :
                          contribution.status === 'late' ? 'bg-yellow-500' :
                          contribution.status === 'missed' ? 'bg-red-500' :
                          contribution.status === 'excused' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`}>
                          <statusConfig.icon className="h-5 w-5 text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium text-gray-900 dark:text-white">
                              Round {contribution.roundNumber}
                            </h5>
                            <Badge className={statusConfig.color}>
                              {statusConfig.label}
                            </Badge>
                            {contribution.isLate && contribution.daysLate && (
                              <Badge variant="outline" className="text-orange-600">
                                {contribution.daysLate} days late
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {contribution.amount > 0n ? formatTokenAmount(contribution.amount) : '0'} {tokenSymbol}
                            </div>
                            {contribution.contributionTime && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(contribution.contributionTime)}
                              </div>
                            )}
                          </div>

                          {/* Expanded details */}
                          {isSelected && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Status:</span>
                                  <span className="ml-2 text-gray-900 dark:text-white">
                                    {statusConfig.description}
                                  </span>
                                </div>
                                {contribution.transactionHash && (
                                  <div>
                                    <span className="text-gray-500">Transaction:</span>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      className="ml-2 p-0 h-auto text-blue-600 hover:text-blue-800"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onTransactionClick?.(contribution.transactionHash!);
                                      }}
                                    >
                                      View <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contribution Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contribution Pattern</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">On Time Rate</span>
                      <span className="font-medium text-green-600">
                        {((history.summary.onTimeContributions / Math.max(history.totalRounds, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Late Rate</span>
                      <span className="font-medium text-yellow-600">
                        {((history.summary.lateContributions / Math.max(history.totalRounds, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Miss Rate</span>
                      <span className="font-medium text-red-600">
                        {((history.summary.missedContributions / Math.max(history.totalRounds, 1)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Streaks & Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Longest Streak</span>
                      </div>
                      <span className="font-medium">{history.summary.longestStreak} rounds</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                      </div>
                      <span className="font-medium">{history.summary.currentStreak} rounds</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Days to Contribute</span>
                      </div>
                      <span className="font-medium">{history.summary.averageDaysToContribute.toFixed(1)} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contribution Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Round-by-Round Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-10 gap-1">
                  {history.contributions.map(contribution => {
                    const statusConfig = getStatusConfig(contribution.status);
                    return (
                      <div
                        key={contribution.roundNumber}
                        className={`h-8 rounded flex items-center justify-center text-xs font-medium ${
                          contribution.status === 'paid' ? 'bg-green-500 text-white' :
                          contribution.status === 'late' ? 'bg-yellow-500 text-white' :
                          contribution.status === 'missed' ? 'bg-red-500 text-white' :
                          contribution.status === 'excused' ? 'bg-purple-500 text-white' :
                          'bg-gray-400 text-white'
                        }`}
                        title={`Round ${contribution.roundNumber}: ${statusConfig.label}`}
                      >
                        {contribution.roundNumber}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>On Time</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Late</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span>Missed</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span>Excused</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default MemberContributionHistory;
