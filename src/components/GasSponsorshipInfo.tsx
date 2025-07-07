import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useGasSponsorshipInfo } from '@/hooks/useZeroDevContracts';
import { 
  Zap, 
  Gift, 
  Users, 
  BookOpen, 
  Coins,
  CheckCircle,
  Clock,
  Info
} from 'lucide-react';

export const GasSponsorshipInfo = () => {
  const { userLevel, eligibleOperations, policies } = useGasSponsorshipInfo();

  const getUserLevelInfo = () => {
    switch (userLevel) {
      case 'new':
        return {
          title: 'New User',
          description: 'Welcome! Enjoy sponsored gas for your first transactions',
          color: 'bg-green-100 text-green-800',
          icon: <Gift className="w-4 h-4" />
        };
      case 'regular':
        return {
          title: 'Regular User',
          description: 'Limited gas sponsorship for small transactions',
          color: 'bg-blue-100 text-blue-800',
          icon: <Users className="w-4 h-4" />
        };
      case 'premium':
        return {
          title: 'Premium User',
          description: 'Enhanced gas sponsorship benefits',
          color: 'bg-purple-100 text-purple-800',
          icon: <Zap className="w-4 h-4" />
        };
    }
  };

  const levelInfo = getUserLevelInfo();

  return (
    <div className="space-y-4">
      {/* User Level Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Gas Sponsorship Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {levelInfo.icon}
              <span className="font-semibold">{levelInfo.title}</span>
            </div>
            <Badge className={levelInfo.color}>
              {userLevel.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            {levelInfo.description}
          </p>

          {/* Progress to next level */}
          {userLevel === 'new' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Regular User</span>
                <span>2/5 transactions</span>
              </div>
              <Progress value={40} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Complete 3 more transactions to unlock regular benefits
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Eligible Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Sponsored Operations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {eligibleOperations.length > 0 ? (
            <div className="space-y-3">
              {eligibleOperations.map((operation, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">{operation}</span>
                  <Badge variant="secondary" className="ml-auto">
                    FREE
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No sponsored operations available at your current level.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Gas Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            Sponsorship Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Onboarding Policy */}
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-green-500" />
              <h4 className="font-semibold text-sm">New User Onboarding</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {policies.ONBOARDING.description}
            </p>
            <div className="flex gap-2">
              {policies.ONBOARDING.operations.map((op, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {op}
                </Badge>
              ))}
            </div>
          </div>

          {/* Micro Contributions Policy */}
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-orange-500" />
              <h4 className="font-semibold text-sm">Micro Contributions</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {policies.MICRO_CONTRIBUTIONS.description}
            </p>
            <div className="text-xs text-muted-foreground">
              Max amount: {policies.MICRO_CONTRIBUTIONS.maxAmount.toString()} sats
            </div>
          </div>

          {/* Learning Rewards Policy */}
          <div className="p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h4 className="font-semibold text-sm">Learning Rewards</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {policies.LEARNING_REWARDS.description}
            </p>
            <div className="flex gap-2">
              {policies.LEARNING_REWARDS.operations.map((op, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {op}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Qualify */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            How to Qualify for More Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Complete Your Profile</p>
                <p className="text-muted-foreground text-xs">
                  Set up your Jenga profile to unlock onboarding benefits
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Join or Create a Chama</p>
                <p className="text-muted-foreground text-xs">
                  Participate in community savings to build reputation
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Complete Learning Modules</p>
                <p className="text-muted-foreground text-xs">
                  Earn achievements and unlock sponsored transactions
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
