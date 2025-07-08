import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGasSponsorshipInfo } from '@/hooks/useZeroDevContracts';
import { 
  Zap, 
  Gift, 
  Users, 
  BookOpen, 
  Coins,
  CheckCircle,
  Clock,
  Info,
  TrendingUp,
  Shield,
  Award,
  Target,
  DollarSign
} from 'lucide-react';
import { EmptyGasSponsorship, EmptyWalletConnection, EmptyNetworkError } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';

export const GasSponsorshipDashboard = () => {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    userLevel, 
    userStats,
    eligibleOperations, 
    policies, 
    userLevels,
    progressToNextLevel 
  } = useGasSponsorshipInfo();

  useEffect(() => {
    // Simulate loading gas sponsorship data
    const loadGasData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setError(null);
      } catch (err) {
        setError('Failed to load gas sponsorship data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadGasData();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  // Show appropriate states
  if (!isConnected) {
    return (
      <EmptyWalletConnection 
        onConnect={() => console.log('Connect wallet')}
      />
    );
  }

  if (error) {
    return <EmptyNetworkError onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Check if user has any gas sponsorship data
  const hasGasData = userStats && (userStats.totalTransactions > 0 || userStats.totalGasSponsored > 0);
  
  if (!hasGasData) {
    return <EmptyGasSponsorship onRefresh={handleRetry} />;
  }

  const currentLevelConfig = userLevels[userLevel];

  const getUserLevelInfo = () => {
    switch (userLevel) {
      case 'NEW':
        return {
          title: 'New User',
          description: 'Welcome! Enjoy sponsored gas for your first transactions',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          icon: <Gift className="w-4 h-4" />,
          budget: '$2.00'
        };
      case 'REGULAR':
        return {
          title: 'Regular User',
          description: 'Active member with ongoing benefits',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
          icon: <Users className="w-4 h-4" />,
          budget: '$1.00/month'
        };
      case 'PREMIUM':
        return {
          title: 'Premium User',
          description: 'Trusted member with enhanced benefits',
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
          icon: <Award className="w-4 h-4" />,
          budget: '$0.50/month'
        };
      case 'VIP':
        return {
          title: 'VIP User',
          description: 'Community leader with full benefits',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          icon: <Zap className="w-4 h-4" />,
          budget: '$2.00/month'
        };
      default:
        return {
          title: 'Unknown',
          description: 'Level not recognized',
          color: 'bg-gray-100 text-gray-800',
          icon: <Info className="w-4 h-4" />,
          budget: '$0.00'
        };
    }
  };

  const levelInfo = getUserLevelInfo();

  const formatSats = (sats: bigint) => {
    return new Intl.NumberFormat().format(Number(sats));
  };

  const formatBTC = (sats: bigint) => {
    return (Number(sats) / 100000000).toFixed(8);
  };

  return (
    <div className="space-y-6">
      {/* Header with User Level */}
      <Card className="border-2 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-orange-500" />
            Gas Sponsorship Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${levelInfo.color}`}>
                {levelInfo.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg">{levelInfo.title}</h3>
                <p className="text-sm text-muted-foreground">{levelInfo.description}</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={levelInfo.color} variant="secondary">
                {userLevel}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                Budget: {levelInfo.budget}
              </p>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-orange-500">{userStats.transactionCount}</div>
              <div className="text-xs text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-500">{userStats.chamasJoined}</div>
              <div className="text-xs text-muted-foreground">Chamas Joined</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-500">
                {formatSats(userStats.totalContributed)}
              </div>
              <div className="text-xs text-muted-foreground">Sats Contributed</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-purple-500">{userStats.reputationScore}</div>
              <div className="text-xs text-muted-foreground">Reputation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="eligible" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="eligible">Eligible Operations</TabsTrigger>
          <TabsTrigger value="policies">All Policies</TabsTrigger>
          <TabsTrigger value="progress">Level Progress</TabsTrigger>
          <TabsTrigger value="usage">Usage Stats</TabsTrigger>
        </TabsList>

        {/* Eligible Operations Tab */}
        <TabsContent value="eligible" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Your Sponsored Operations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eligibleOperations.length > 0 ? (
                <div className="space-y-3">
                  {eligibleOperations.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <p className="font-medium">{item.operation}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          FREE
                        </Badge>
                        {item.costEstimate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Saves ~${item.costEstimate.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No sponsored operations available at your current level. Complete more transactions to unlock benefits!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* All Policies Tab */}
        <TabsContent value="policies" className="space-y-4">
          {Object.entries(policies).map(([policyName, policy]) => (
            <Card key={policyName}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {policyName === 'ONBOARDING' && <Gift className="w-4 h-4 text-green-500" />}
                  {policyName === 'MICRO_CONTRIBUTIONS' && <Coins className="w-4 h-4 text-orange-500" />}
                  {policyName === 'LEARNING_REWARDS' && <BookOpen className="w-4 h-4 text-blue-500" />}
                  {policyName === 'COMMUNITY_ENGAGEMENT' && <Users className="w-4 h-4 text-purple-500" />}
                  {policyName === 'EMERGENCY_OPERATIONS' && <Shield className="w-4 h-4 text-red-500" />}
                  {policyName === 'PROMOTIONAL' && <Target className="w-4 h-4 text-pink-500" />}
                  {policyName.replace(/_/g, ' ')}
                  <Badge variant="outline" className="ml-auto">
                    {policy.priority || 'MEDIUM'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{policy.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">Operations:</p>
                    <div className="flex flex-wrap gap-1">
                      {policy.operations.map((op, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {op}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {policy.maxAmount && (
                      <div className="flex justify-between">
                        <span>Max Amount:</span>
                        <span className="font-mono">{formatSats(policy.maxAmount)} sats</span>
                      </div>
                    )}
                    {policy.maxGasLimit && (
                      <div className="flex justify-between">
                        <span>Gas Limit:</span>
                        <span className="font-mono">{policy.maxGasLimit.toString()}</span>
                      </div>
                    )}
                    {policy.dailyLimit && (
                      <div className="flex justify-between">
                        <span>Daily Limit:</span>
                        <span>{policy.dailyLimit} transactions</span>
                      </div>
                    )}
                    {policy.weeklyLimit && (
                      <div className="flex justify-between">
                        <span>Weekly Limit:</span>
                        <span>{policy.weeklyLimit} transactions</span>
                      </div>
                    )}
                    {policy.monthlyLimit && (
                      <div className="flex justify-between">
                        <span>Monthly Limit:</span>
                        <span>{policy.monthlyLimit} transactions</span>
                      </div>
                    )}
                    {policy.costPerTransaction && (
                      <div className="flex justify-between">
                        <span>Cost per TX:</span>
                        <span className="text-green-600">${policy.costPerTransaction.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Level Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          {progressToNextLevel ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Progress to {progressToNextLevel.nextLevel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(progressToNextLevel.requirements).map(([key, req]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span>
                        {key === 'totalContributed' 
                          ? `${formatSats(req.current)} / ${formatSats(req.required)} sats`
                          : `${req.current} / ${req.required}`
                        }
                      </span>
                    </div>
                    <Progress value={req.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {req.progress.toFixed(1)}% complete
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold mb-2">Maximum Level Reached!</h3>
                <p className="text-muted-foreground">
                  You've achieved the highest user level with full benefits.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Level Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Current Level Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentLevelConfig.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{benefit.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <span className="font-medium text-sm">Sponsorship Budget</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  ${currentLevelConfig.sponsorshipBudget.toFixed(2)} - {currentLevelConfig.description}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Stats Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {userStats.dailyTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sponsored transactions today
                </p>
                <Progress value={(userStats.dailyTransactions / 10) * 100} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {10 - userStats.dailyTransactions} remaining today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {userStats.weeklyTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sponsored transactions this week
                </p>
                <Progress value={(userStats.weeklyTransactions / 50) * 100} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {50 - userStats.weeklyTransactions} remaining this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  {userStats.monthlyTransactions}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sponsored transactions this month
                </p>
                <Progress value={(userStats.monthlyTransactions / 200) * 100} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {200 - userStats.monthlyTransactions} remaining this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Savings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Gas Savings Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-500">$2.45</div>
                  <div className="text-xs text-muted-foreground">Total Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-500">$0.35</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">$1.20</div>
                  <div className="text-xs text-muted-foreground">This Month</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">15</div>
                  <div className="text-xs text-muted-foreground">Free Transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
