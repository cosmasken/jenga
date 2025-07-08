import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  ChevronDown, 
  Coins, 
  Users, 
  Send, 
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { usePullToRefresh, useHapticFeedback, useMobile } from '@/hooks/useMobile';
import { useSmartFormDefaults } from '@/lib/smartDefaults';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefreshWrapper: React.FC<PullToRefreshWrapperProps> = ({
  onRefresh,
  children
}) => {
  const { isRefreshing, pullDistance } = usePullToRefresh(onRefresh);
  const { isMobile } = useMobile();

  if (!isMobile) return <>{children}</>;

  return (
    <div className="relative">
      {/* Pull to refresh indicator */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-200 z-10",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ 
          transform: `translateY(${Math.min(pullDistance - 60, 40)}px)`,
          height: '60px'
        }}
      >
        <div className="flex items-center space-x-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 border">
          <RefreshCw 
            className={cn(
              "w-4 h-4 text-orange-500",
              isRefreshing && "animate-spin"
            )} 
          />
          <span className="text-sm">
            {isRefreshing ? 'Refreshing...' : pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>
      
      <div style={{ transform: `translateY(${Math.min(pullDistance * 0.5, 30)}px)` }}>
        {children}
      </div>
    </div>
  );
};

// Enhanced mobile card with better touch interactions
interface MobileCardProps {
  title: string;
  subtitle?: string;
  value: string;
  change?: { value: number; positive: boolean };
  icon: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  value,
  change,
  icon,
  onClick,
  loading = false
}) => {
  const { lightTap } = useHapticFeedback();
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    lightTap();
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-150 cursor-pointer",
        isPressed ? "scale-95 bg-muted/50" : "hover:shadow-md",
        onClick && "active:scale-95"
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              {icon}
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            </div>
            <div className="text-2xl font-bold">{value}</div>
            {subtitle && (
              <div className="text-xs text-muted-foreground">{subtitle}</div>
            )}
          </div>
          {change && (
            <div className={cn(
              "flex items-center space-x-1 text-sm",
              change.positive ? "text-green-600" : "text-red-600"
            )}>
              {change.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Quick action buttons for mobile
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  icon,
  label,
  onClick,
  disabled = false,
  badge
}) => {
  const { mediumTap } = useHapticFeedback();
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    if (!disabled) {
      mediumTap();
      onClick();
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "flex-col h-20 w-full space-y-2 transition-all duration-150",
          isPressed && !disabled && "scale-95",
          disabled && "opacity-50"
        )}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onClick={handlePress}
        disabled={disabled}
      >
        {icon}
        <span className="text-xs">{label}</span>
      </Button>
      {badge && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          {badge}
        </Badge>
      )}
    </div>
  );
};

// Mobile-optimized dashboard
export const MobileDashboardEnhanced: React.FC = () => {
  const { getFormDefaults } = useSmartFormDefaults();
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Check if user has any real data
    // In a real app, this would check actual user data
    setHasData(false); // Set to false since we removed mocked data
    setIsLoading(false);
  };

  const quickActions = [
    {
      icon: <Send className="w-6 h-6" />,
      label: 'Send',
      onClick: () => console.log('Send clicked'),
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Join Chama',
      onClick: () => console.log('Join Chama clicked'),
    },
    {
      icon: <Coins className="w-6 h-6" />,
      label: 'Stack Sats',
      onClick: () => console.log('Stack clicked'),
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Insights',
      onClick: () => console.log('Insights clicked'),
    }
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!hasData) {
    return (
      <PullToRefreshWrapper onRefresh={handleRefresh}>
        <div className="space-y-6 pb-20">
          {/* Welcome Card for New Users */}
          <Card>
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center">Welcome to Jenga!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Start your Bitcoin savings journey with community lending circles
              </p>
              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <QuickAction key={index} {...action} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <div>
                  <div className="font-medium">Join or Create a Chama</div>
                  <div className="text-sm text-muted-foreground">Start saving with your community</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <div>
                  <div className="font-medium">Make Your First Contribution</div>
                  <div className="text-sm text-muted-foreground">Stack sats together</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <div>
                  <div className="font-medium">Track Your Progress</div>
                  <div className="text-sm text-muted-foreground">Watch your savings grow</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PullToRefreshWrapper>
    );
  }

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="space-y-6 pb-20"> {/* Extra padding for bottom nav */}
        {/* Stats Overview - Only show when user has data */}
        <div className="grid grid-cols-2 gap-4">
          <MobileCard
            title="Total Saved"
            value="0 sats"
            subtitle="≈ $0.00"
            icon={<Coins className="w-4 h-4 text-orange-500" />}
            loading={isLoading}
          />
          <MobileCard
            title="Active Chamas"
            value="0"
            subtitle="Get started"
            icon={<Users className="w-4 h-4 text-blue-500" />}
            loading={isLoading}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PullToRefreshWrapper>
  );
};
