import React, { useEffect, useState } from 'react';
import { Plus, Users, TrendingUp, Gift, Bitcoin, Trophy, Bell, AlertCircle } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { formatEther, Address } from 'viem';
import { useGetUserChamas, useGetUserScore } from '../hooks/useJengaContract';
import { useAutomatedCycles } from '../hooks/useAutomatedCycles';
import { citreaTestnet } from '../wagmi';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LoadingState, DashboardSkeleton, useLoadingState } from '../components/ui/LoadingStates';
import { CreateChamaModal } from '../components/modals/CreateChamaModal';
import { JoinChamaModal } from '../components/modals/JoinChamaModal';
import { SendRedEnvelopeModal } from '../components/modals/SendRedEnvelopeModal';
import { StackBTCModal } from '../components/modals/StackBTCModal';
import { TeamFormation } from '../components/TeamFormation';
import { InteractiveTestFlow } from '../components/InteractiveTestFlow';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';

export const Dashboard: React.FC = () => {
  const [createChamaOpen, setCreateChamaOpen] = useState(false);
  const [joinChamaOpen, setJoinChamaOpen] = useState(false);
  const [redEnvelopeOpen, setRedEnvelopeOpen] = useState(false);
  const [stackBTCOpen, setStackBTCOpen] = useState(false);
  const [selectedChamaId, setSelectedChamaId] = useState<bigint | null>(null);
  const [showTestFlow, setShowTestFlow] = useState(false);

  const { address, isConnected, isConnecting } = useAccount();
  const { t } = useTranslation();
  
  // Automated cycle management
  const { 
    notifications = [], 
    urgentActions = [], 
    summaryStats = { activeChamas: 0, pendingContributions: 0, completedCycles: 0, totalNotifications: 0 }, 
    clearNotifications = () => {} 
  } = useAutomatedCycles();
  
  // Get user balance with loading and error states
  const { 
    data: balance, 
    isLoading: balanceLoading, 
    error: balanceError 
  } = useBalance({
    address,
    chainId: citreaTestnet.id,
  });

  // Get user chamas from contract with loading and error states
  const { 
    data: userChamas, 
    isLoading: chamasLoading, 
    error: chamasError 
  } = useGetUserChamas(address || '0x0' as Address);
  
  // Get user score from contract with loading and error states
  const { 
    data: userScore, 
    isLoading: scoreLoading, 
    error: scoreError 
  } = useGetUserScore(address || '0x0' as Address);

  // Overall loading and error states
  const isLoading = isConnecting || balanceLoading || chamasLoading || scoreLoading;
  const hasError = balanceError || chamasError || scoreError;

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return parseFloat(formatEther(balance)).toFixed(4);
  };

  // Show loading skeleton while data is loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Show error state if there are errors
  if (hasError) {
    return (
      <div className="space-y-4">
        <LoadingState
          type="data"
          state="error"
          message="Failed to load dashboard data"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const stats = [
    {
      title: t('dashboard.totalBalance'),
      value: `${formatBalance(balance?.value)} ${t('currency.cbtc')}`,
      icon: Bitcoin,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Active Chamas',
      value: summaryStats.activeChamas.toString(),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Pending Contributions',
      value: summaryStats.pendingContributions.toString(),
      icon: TrendingUp,
      color: summaryStats.pendingContributions > 0 ? 'text-red-500' : 'text-green-500',
      bgColor: summaryStats.pendingContributions > 0 ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950',
    },
    {
      title: t('dashboard.jengaScore'),
      value: userScore?.toString() || '0',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setCreateChamaOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('chama.create')}
          </button>
          <button
            onClick={() => setJoinChamaOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            {t('chama.join')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="responsive-grid mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="stats-card mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground mb-4">{t('dashboard.quickActions')}</h2>
        <div className="responsive-grid">
          <button
            onClick={() => setCreateChamaOpen(true)}
            className="quick-action quick-action-orange group"
          >
            <div className="quick-action-icon quick-action-icon-orange">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-foreground">{t('chama.create')}</p>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('chama.startNewGroup')}</p>
            </div>
          </button>

          <button
            onClick={() => setJoinChamaOpen(true)}
            className="quick-action quick-action-blue group"
          >
            <div className="quick-action-icon quick-action-icon-blue">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-foreground">{t('chama.join')}</p>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('chama.findExistingGroups')}</p>
            </div>
          </button>

          <button
            onClick={() => setRedEnvelopeOpen(true)}
            className="quick-action quick-action-red group"
          >
            <div className="quick-action-icon quick-action-icon-red">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-foreground">{t('actions.redEnvelope')}</p>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('actions.sendGifts')}</p>
            </div>
          </button>

          <button
            onClick={() => setStackBTCOpen(true)}
            className="quick-action quick-action-yellow group"
          >
            <div className="quick-action-icon quick-action-icon-yellow">
              <Bitcoin className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-foreground">{t('actions.stackBTC')}</p>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('actions.autoInvest')}</p>
            </div>
          </button>
        </div>
      </div>

      {/* Urgent Actions Alert */}
      {urgentActions.length > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Action Required:</strong> You have {urgentActions.length} pending contribution{urgentActions.length > 1 ? 's' : ''}
              </div>
              <Badge variant="destructive">
                {urgentActions.filter(a => a.urgent).length} urgent
              </Badge>
            </div>
            <div className="mt-2 space-y-1">
              {urgentActions.slice(0, 3).map(action => (
                <div key={action.chamaId.toString()} className="text-sm">
                  • <strong>{action.chamaName}</strong> - 
                  {action.timeLeft > 3600 
                    ? ` ${Math.floor(action.timeLeft / 3600)}h ${Math.floor((action.timeLeft % 3600) / 60)}m left`
                    : ` ${Math.floor(action.timeLeft / 60)}m left`
                  }
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 h-6 text-xs"
                    onClick={() => {
                      setSelectedChamaId(action.chamaId);
                      setStackBTCOpen(true);
                    }}
                  >
                    Contribute Now
                  </Button>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Alert>
          <Bell className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span><strong>Recent Activity:</strong> {notifications.length} new notification{notifications.length > 1 ? 's' : ''}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearNotifications}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Toggle between Team Formation and Test Flow */}
      <div className="flex justify-center gap-4 mb-6">
        <Button
          variant={!showTestFlow ? 'default' : 'outline'}
          onClick={() => setShowTestFlow(false)}
        >
          Team Formation
        </Button>
        <Button
          variant={showTestFlow ? 'default' : 'outline'}
          onClick={() => setShowTestFlow(true)}
        >
          Test Flow (Demo)
        </Button>
      </div>

      {/* Main Content */}
      {showTestFlow ? (
        <InteractiveTestFlow
          onCreateChama={() => setCreateChamaOpen(true)}
          onJoinChama={(chamaId) => {
            setSelectedChamaId(chamaId);
            setJoinChamaOpen(true);
          }}
          onContribute={(chamaId) => {
            setSelectedChamaId(chamaId);
            setStackBTCOpen(true);
          }}
        />
      ) : (
        <TeamFormation
          onCreateChama={() => setCreateChamaOpen(true)}
          onJoinChama={(chamaId) => {
            setSelectedChamaId(chamaId);
            setJoinChamaOpen(true);
          }}
          onContribute={(chamaId) => {
            setSelectedChamaId(chamaId);
            setStackBTCOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <CreateChamaModal 
        open={createChamaOpen} 
        onOpenChange={setCreateChamaOpen} 
      />
      <JoinChamaModal 
        open={joinChamaOpen} 
        onOpenChange={(open) => {
          setJoinChamaOpen(open);
          if (!open) setSelectedChamaId(null);
        }}
        chamaId={selectedChamaId}
      />
      <SendRedEnvelopeModal 
        open={redEnvelopeOpen} 
        onOpenChange={setRedEnvelopeOpen} 
      />
      <StackBTCModal 
        open={stackBTCOpen} 
        onOpenChange={(open) => {
          setStackBTCOpen(open);
          if (!open) setSelectedChamaId(null);
        }}
        chamaId={selectedChamaId}
      />
    </div>
  );
};
