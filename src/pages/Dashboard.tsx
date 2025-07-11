import React, { useEffect, useState } from 'react';
import { Plus, Users, TrendingUp, Gift, Bitcoin, Trophy } from 'lucide-react';
import { useAccount, useBalance } from 'wagmi';
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
      title: 'Total Balance',
      value: `${formatBalance(balance?.value)} cBTC`,
      icon: Bitcoin,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Active Chamas',
      value: userChamas?.length?.toString() || '0',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Jenga Score',
      value: userScore?.toString() || '0',
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Monthly Growth',
      value: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's your Jenga overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => setCreateChamaOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-4 py-2 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Create Chama
          </button>
          <button
            onClick={() => setJoinChamaOpen(true)}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-4 h-4" />
            Join Chama
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setCreateChamaOpen(true)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg hover:from-orange-100 hover:to-yellow-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Create Chama</p>
              <p className="text-sm text-gray-600">Start a new group</p>
            </div>
          </button>

          <button
            onClick={() => setJoinChamaOpen(true)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Join Chama</p>
              <p className="text-sm text-gray-600">Find existing groups</p>
            </div>
          </button>

          <button
            onClick={() => setRedEnvelopeOpen(true)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg hover:from-red-100 hover:to-pink-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Red Envelope</p>
              <p className="text-sm text-gray-600">Send gifts</p>
            </div>
          </button>

          <button
            onClick={() => setStackBTCOpen(true)}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bitcoin className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Stack BTC</p>
              <p className="text-sm text-gray-600">Auto-invest</p>
            </div>
          </button>
        </div>
      </div>

      {/* My Chamas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">My Chamas</h2>
          <span className="text-sm text-gray-500">
            {userChamas?.length || 0} active groups
          </span>
        </div>

        {!userChamas || userChamas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Chamas Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first chama or join an existing one to get started.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setCreateChamaOpen(true)}
                className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white px-6 py-2 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all"
              >
                Create Chama
              </button>
              <button
                onClick={() => setJoinChamaOpen(true)}
                className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Join Chama
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* This would be populated with actual chama data from the contract */}
            <div className="text-center py-8 text-gray-500">
              Chama data will be displayed here once contract integration is complete
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
