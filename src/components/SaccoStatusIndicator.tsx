import { useSaccoStatus, useSaccoFeatureAccess } from '@/contexts/SaccoStatusContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocation } from 'wouter';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  DollarSign,
  Wallet,
  UserPlus
} from 'lucide-react';

interface SaccoStatusIndicatorProps {
  variant?: 'badge' | 'card' | 'alert' | 'inline';
  showDetails?: boolean;
  className?: string;
}

export function SaccoStatusIndicator({ 
  variant = 'badge', 
  showDetails = false,
  className = '' 
}: SaccoStatusIndicatorProps) {
  const { 
    isLoggedIn, 
    isSaccoMember, 
    isLoading, 
    memberData, 
    treasuryData 
  } = useSaccoStatus();
  
  const {
    canViewSaccoFeatures,
    canUseSaccoFeatures,
    shouldShowJoinPrompt,
    shouldShowLoginPrompt
  } = useSaccoFeatureAccess();

  const [, navigate] = useLocation();

  if (isLoading) {
    return <Skeleton className={`h-6 w-24 ${className}`} />;
  }

  // Badge variant - simple status indicator
  if (variant === 'badge') {
    if (!isLoggedIn) {
      return (
        <Badge variant="outline" className={`border-gray-400 text-gray-600 ${className}`}>
          <Wallet size={12} className="mr-1" />
          Not Connected
        </Badge>
      );
    }

    if (isSaccoMember) {
      return (
        <Badge variant="outline" className={`border-bitcoin text-bitcoin bg-bitcoin/10 ${className}`}>
          <CheckCircle size={12} className="mr-1" />
          Sacco Member
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className={`border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950 ${className}`}>
        <Shield size={12} className="mr-1" />
        Join Sacco
      </Badge>
    );
  }

  // Alert variant - contextual message
  if (variant === 'alert') {
    if (shouldShowLoginPrompt) {
      return (
        <Alert className={`border-blue-500 bg-blue-50 dark:bg-blue-950 ${className}`}>
          <Wallet className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="flex items-center justify-between">
              <span>Connect your wallet to access Sacco DeFi features</span>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                Connect Wallet
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (shouldShowJoinPrompt) {
      return (
        <Alert className={`border-bitcoin bg-bitcoin/10 ${className}`}>
          <Shield className="h-4 w-4 text-bitcoin" />
          <AlertDescription className="text-bitcoin">
            <div className="flex items-center justify-between">
              <span>Join Sacco DeFi to start lending and borrowing with Bitcoin collateral</span>
              <Button 
                size="sm" 
                className="bg-bitcoin hover:bg-bitcoin/90 text-white"
                onClick={() => navigate('/sacco-dashboard')}
              >
                <UserPlus size={14} className="mr-1" />
                Join Sacco
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return null; // No alert needed for members
  }

  // Card variant - detailed status card
  if (variant === 'card') {
    if (!canViewSaccoFeatures) {
      return (
        <Card className={`border-gray-200 dark:border-gray-700 ${className}`}>
          <CardContent className="p-4 text-center">
            <Wallet size={32} className="mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Connect Wallet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Connect your wallet to access Sacco DeFi features
            </p>
            <Button className="bg-bitcoin hover:bg-bitcoin/90">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (!isSaccoMember) {
      return (
        <Card className={`border-bitcoin/20 bg-bitcoin/5 ${className}`}>
          <CardContent className="p-4 text-center">
            <Shield size={32} className="mx-auto mb-3 text-bitcoin" />
            <h3 className="font-semibold text-bitcoin mb-2">
              Join Sacco DeFi
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Start lending and borrowing with Bitcoin-backed collateral
            </p>
            <Button 
              className="bg-bitcoin hover:bg-bitcoin/90"
              onClick={() => navigate('/sacco-dashboard')}
            >
              <UserPlus size={16} className="mr-2" />
              Join Sacco
            </Button>
          </CardContent>
        </Card>
      );
    }

    // Member card with details
    return (
      <Card className={`border-bitcoin/20 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-bitcoin" />
              <span className="font-semibold text-bitcoin">Sacco Member</span>
            </div>
            <Badge variant="outline" className="border-bitcoin text-bitcoin">
              Active
            </Badge>
          </div>
          
          {showDetails && memberData && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp size={16} className="text-green-600 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Collateral</span>
                  </div>
                  <p className="font-bold text-green-600">
                    ₿{memberData.ethDeposited.toFixed(4)}
                  </p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign size={16} className="text-blue-600 mr-1" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">Borrowed</span>
                  </div>
                  <p className="font-bold text-blue-600">
                    ${memberData.usdcBorrowed.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-r from-bitcoin/10 to-yellow-400/10 rounded-lg border border-bitcoin/20">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Health Factor</p>
                <p className="font-bold text-bitcoin">
                  {memberData.healthFactor.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Inline variant - simple text with icon
  if (variant === 'inline') {
    if (!isLoggedIn) {
      return (
        <span className={`flex items-center gap-1 text-gray-600 dark:text-gray-400 ${className}`}>
          <Wallet size={14} />
          Not Connected
        </span>
      );
    }

    if (isSaccoMember) {
      return (
        <span className={`flex items-center gap-1 text-bitcoin ${className}`}>
          <CheckCircle size={14} />
          Sacco Member
        </span>
      );
    }

    return (
      <span className={`flex items-center gap-1 text-orange-600 ${className}`}>
        <Shield size={14} />
        Join Sacco
      </span>
    );
  }

  return null;
}

// Quick access component for treasury stats
export function SaccoTreasuryStats({ className = '' }: { className?: string }) {
  const { treasuryData, isLoading } = useSaccoStatus();

  if (isLoading) {
    return (
      <div className={`grid grid-cols-3 gap-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!treasuryData) return null;

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Treasury</p>
        <p className="font-bold text-green-600">
          ${treasuryData.balance.toLocaleString()}
        </p>
      </div>
      
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Borrowed</p>
        <p className="font-bold text-blue-600">
          ${treasuryData.totalBorrowed.toLocaleString()}
        </p>
      </div>
      
      <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Utilization</p>
        <p className="font-bold text-purple-600">
          {treasuryData.utilizationRate.toFixed(1)}%
        </p>
      </div>
    </div>
  );
}
