import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Coins, 
  Send, 
  Search, 
  Wifi, 
  AlertCircle,
  Plus,
  TrendingUp,
  Bell,
  BookOpen,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className
}) => {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          {icon || <AlertCircle className="w-8 h-8 text-muted-foreground" />}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button 
              onClick={action.onClick}
              variant={action.variant || 'default'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick}
              variant="outline"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Specialized empty states for different sections
export const EmptyChamas: React.FC<{
  onCreateChama: () => void;
  onRefresh?: () => void;
  isSearching?: boolean;
  searchTerm?: string;
}> = ({ onCreateChama, onRefresh, isSearching, searchTerm }) => {
  if (isSearching && searchTerm) {
    return (
      <EmptyState
        icon={<Search className="w-8 h-8 text-muted-foreground" />}
        title="No chamas found"
        description={`No chamas match "${searchTerm}". Try adjusting your search or create a new chama.`}
        action={{
          label: "Create New Chama",
          onClick: onCreateChama
        }}
        secondaryAction={onRefresh ? {
          label: "Clear Search",
          onClick: () => {
            onRefresh();
          }
        } : undefined}
      />
    );
  }

  return (
    <EmptyState
      icon={<Users className="w-8 h-8 text-orange-500" />}
      title="No chamas yet"
      description="Start your Bitcoin savings journey by creating or joining a chama. Build wealth together with your community."
      action={{
        label: "Create Your First Chama",
        onClick: onCreateChama
      }}
      secondaryAction={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh
      } : undefined}
    />
  );
};

export const EmptyTransactions: React.FC<{
  onSendMoney?: () => void;
  onRefresh?: () => void;
}> = ({ onSendMoney, onRefresh }) => {
  return (
    <EmptyState
      icon={<Send className="w-8 h-8 text-blue-500" />}
      title="No transactions yet"
      description="Your transaction history will appear here once you start sending or receiving Bitcoin."
      action={onSendMoney ? {
        label: "Send Bitcoin",
        onClick: onSendMoney
      } : undefined}
      secondaryAction={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh
      } : undefined}
    />
  );
};

export const EmptyStacking: React.FC<{
  onStartStacking: () => void;
}> = ({ onStartStacking }) => {
  return (
    <EmptyState
      icon={<Coins className="w-8 h-8 text-orange-500" />}
      title="Start stacking sats"
      description="Begin your personal Bitcoin savings journey. Set goals, automate contributions, and watch your sats grow."
      action={{
        label: "Start Stacking",
        onClick: onStartStacking
      }}
    />
  );
};

export const EmptyNotifications: React.FC<{
  onRefresh?: () => void;
}> = ({ onRefresh }) => {
  return (
    <EmptyState
      icon={<Bell className="w-8 h-8 text-muted-foreground" />}
      title="No notifications"
      description="You're all caught up! Notifications about your chamas, transactions, and achievements will appear here."
      secondaryAction={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh
      } : undefined}
    />
  );
};

export const EmptyInsights: React.FC<{
  onJoinChama?: () => void;
}> = ({ onJoinChama }) => {
  return (
    <EmptyState
      icon={<TrendingUp className="w-8 h-8 text-green-500" />}
      title="No insights available"
      description="Start participating in chamas or stacking sats to see your financial insights and progress analytics."
      action={onJoinChama ? {
        label: "Join a Chama",
        onClick: onJoinChama
      } : undefined}
    />
  );
};

export const EmptyEducation: React.FC<{
  onRefresh?: () => void;
}> = ({ onRefresh }) => {
  return (
    <EmptyState
      icon={<BookOpen className="w-8 h-8 text-purple-500" />}
      title="Educational content loading"
      description="We're preparing educational resources about Bitcoin, chamas, and financial literacy for you."
      secondaryAction={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh
      } : undefined}
    />
  );
};

export const EmptyGasSponsorship: React.FC<{
  onRefresh?: () => void;
}> = ({ onRefresh }) => {
  return (
    <EmptyState
      icon={<Zap className="w-8 h-8 text-yellow-500" />}
      title="No gas sponsorship data"
      description="Gas sponsorship information will appear here once you start making transactions on Citrea."
      secondaryAction={onRefresh ? {
        label: "Refresh",
        onClick: onRefresh
      } : undefined}
    />
  );
};

export const EmptyWalletConnection: React.FC<{
  onConnect: () => void;
}> = ({ onConnect }) => {
  return (
    <EmptyState
      icon={<Shield className="w-8 h-8 text-red-500" />}
      title="Wallet not connected"
      description="Connect your wallet to access Jenga's Bitcoin-native community lending features."
      action={{
        label: "Connect Wallet",
        onClick: onConnect
      }}
    />
  );
};

export const EmptyNetworkError: React.FC<{
  onRetry: () => void;
}> = ({ onRetry }) => {
  return (
    <EmptyState
      icon={<Wifi className="w-8 h-8 text-red-500" />}
      title="Connection error"
      description="Unable to load data. Please check your internet connection and try again."
      action={{
        label: "Try Again",
        onClick: onRetry,
        variant: "outline"
      }}
    />
  );
};

export const EmptyLoading: React.FC<{
  title?: string;
  description?: string;
}> = ({ 
  title = "Loading...", 
  description = "Please wait while we fetch your data." 
}) => {
  return (
    <EmptyState
      icon={<RefreshCw className="w-8 h-8 text-muted-foreground animate-spin" />}
      title={title}
      description={description}
    />
  );
};
