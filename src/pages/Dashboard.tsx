import React, { useEffect, useState } from 'react';
import { Plus, Users, TrendingUp, Gift, Bitcoin, Trophy } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { formatEther } from 'viem';
import { useGetUserChamas, useGetUserScore } from '../hooks/useJengaContract';
import { citreaTestnet } from '../wagmi';
import { ChamaCard } from '../components/chama/ChamaCard';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CreateChamaModal } from '../components/modals/CreateChamaModal';
import { JoinChamaModal } from '../components/modals/JoinChamaModal';
import { SendRedEnvelopeModal } from '../components/modals/SendRedEnvelopeModal';
import { StackBTCModal } from '../components/modals/StackBTCModal';

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createChamaOpen, setCreateChamaOpen] = useState(false);
  const [joinChamaOpen, setJoinChamaOpen] = useState(false);
  const [redEnvelopeOpen, setRedEnvelopeOpen] = useState(false);
  const [stackBTCOpen, setStackBTCOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { t } = useTranslation();
  
  // Get user balance
  const { data: balance } = useBalance({
    address,
    chainId: citreaTestnet.id,
  });

  // Get user chamas from contract
  const { data: userChamas, isLoading: chamasLoading } = useGetUserChamas(address!);
  
  // Get user score from contract
  const { data: userScore, isLoading: scoreLoading } = useGetUserScore(address!);

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const formatBalance = (balance: bigint | undefined) => {
    if (!balance) return '0.00';
    return parseFloat(formatEther(balance)).toFixed(4);
  };

  const stats = [
    {
      title: t('dashboard.totalBalance'),
      value: `${formatBalance(balance?.value)} ${t('currency.cbtc')}`,
      icon: Bitcoin,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: t('dashboard.activeChamas'),
      value: userChamas?.length?.toString() || '0',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: t('dashboard.jengaScore'),
      value: userScore?.toString() || '0',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: t('dashboard.monthlyGrowth'),
      value: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  if (isLoading || chamasLoading || scoreLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

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

      {/* My Chamas */}
      <div className="stats-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">{t('dashboard.myChamas')}</h2>
          <span className="text-sm text-gray-500 dark:text-muted-foreground">
            {t('dashboard.activeGroups', { count: userChamas?.length || 0 })}
          </span>
        </div>

        {!userChamas || userChamas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">{t('dashboard.noChamas')}</h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-6">
              {t('dashboard.noChamasDesc')}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCreateChamaOpen(true)}
                className="btn-primary"
              >
                {t('chama.create')}
              </button>
              <button
                onClick={() => setJoinChamaOpen(true)}
                className="btn-secondary"
              >
                {t('chama.join')}
              </button>
            </div>
          </div>
        ) : (
          <div className="responsive-grid">
            {/* This would be populated with actual chama data from the contract */}
            <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
              {t('dashboard.chamaDataPlaceholder')}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateChamaModal open={createChamaOpen} onOpenChange={setCreateChamaOpen} />
      <JoinChamaModal open={joinChamaOpen} onOpenChange={setJoinChamaOpen} />
      <SendRedEnvelopeModal open={redEnvelopeOpen} onOpenChange={setRedEnvelopeOpen} />
      <StackBTCModal open={stackBTCOpen} onOpenChange={setStackBTCOpen} />
    </div>
  );
};
