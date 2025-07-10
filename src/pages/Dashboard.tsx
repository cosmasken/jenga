
import React, { useEffect, useState } from 'react';
import { Plus, Users, TrendingUp, Gift, Bitcoin, Trophy } from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { useChamaStore } from '../stores/chamaStore';
import useWallet from '../stores/useWallet';
import { ChamaCard } from '../components/chama/ChamaCard';
import { StatsCard } from '../components/dashboard/StatsCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { CreateChamaModal } from '../components/modals/CreateChamaModal';
import { JoinChamaModal } from '../components/modals/JoinChamaModal';
import { SendRedEnvelopeModal } from '../components/modals/SendRedEnvelopeModal';
import { StackBTCModal } from '../components/modals/StackBTCModal';
import { formatBTC } from '../utils/ethUtils';
import {
  MOCK_CHAMAS,
  MOCK_PROFILES,
  MOCK_SCORES,
  getMockUserProfile,
  getMockUserScore,
  getMockUserChamas,
} from '../data/mockData';

export const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createChamaOpen, setCreateChamaOpen] = useState(false);
  const [joinChamaOpen, setJoinChamaOpen] = useState(false);
  const [redEnvelopeOpen, setRedEnvelopeOpen] = useState(false);
  const [stackBTCOpen, setStackBTCOpen] = useState(false);
  const [selectedChama, setSelectedChama] = useState<any>(null);
  const { profile, score, setProfile, updateScore } = useUserStore();
  const { chamas, userChamas, setChamas } = useChamaStore();
  const { isConnected, address } = useWallet();

  // useEffect(() => {
  //   const loadDashboardData = async () => {
  //     if (!connection?.address) return;

  //     setIsLoading(true);

  //     try {
  //       // Simulate loading delay
  //       await new Promise(resolve => setTimeout(resolve, 1500));

  //       // Load user profile
  //       const userProfile = getMockUserProfile(connection.address);
  //       if (userProfile) {
  //         setProfile(userProfile);
  //       }

  //       // Load user score
  //       const userScore = getMockUserScore(connection.address);
  //       if (userScore) {
  //         updateScore(userScore);
  //       }

  //       // Load user chamas
  //       const userChamasData = getMockUserChamas(connection.address);
  //       setChamas(userChamasData);
  //     } catch (error) {
  //       console.error('Failed to load dashboard data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   loadDashboardData();
  // }, [connection?.address, setProfile, updateScore, setChamas]);

  // if (isLoading) {
  //   return (
  //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  //       <LoadingSkeleton type="dashboard" />
  //     </div>
  //   );
  // }

  // const totalBalance = parseFloat(connection?.balance || '0');
  // const totalContributions = userChamas.reduce((sum, chama) => sum + chama.totalContributions, 0);
  // const activeChamas = userChamas.filter(chama => chama.active).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {address|| 'Jengalist'}! 👋
        </h1>
        <p className="text-gray-600">
          Stack Bitcoin together with your community and grow your wealth.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Wallet Balance"
          value={`${formatBTC(10000000000000)} BTC`}
          icon={Bitcoin}
          color="orange"
          trend={{ value: "+5.2%", isPositive: true }}
        />
        <StatsCard
          title="Active Chamas"
          value={'10'}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Contributions"
          value={`${formatBTC(10000000000000)} BTC`}
          icon={TrendingUp}
          color="green"
          trend={{ value: "+12.3%", isPositive: true }}
        />
        <StatsCard
          title="Jenga Score"
          value={score?.totalPoints.toString() || '0'}
          icon={Gift}
          color="purple"
          trend={{ value: `+${score?.redEnvelopePoints || 0} this week`, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setCreateChamaOpen(true)}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Create Chama</span>
          </button>
          <button
            onClick={() => setJoinChamaOpen(true)}
            className="flex items-center justify-center space-x-2 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-600 transition-all transform hover:scale-105"
          >
            <Users className="w-5 h-5" />
            <span>Join Chama</span>
          </button>
          <button
            onClick={() => setRedEnvelopeOpen(true)}
            className="flex items-center justify-center space-x-2 bg-red-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-600 transition-all transform hover:scale-105"
          >
            <Gift className="w-5 h-5" />
            <span>Send Red Envelope</span>
          </button>
        </div>
      </div>

      {/* My Chamas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">My Chamas</h2>
          <button
            onClick={() => setStackBTCOpen(true)}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            Stack More
          </button>
        </div>

        {userChamas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chamas Yet</h3>
            <p className="text-gray-600 mb-6">
              Start your Bitcoin stacking journey by creating or joining a Chama.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCreateChamaOpen(true)}
                className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white font-semibold py-2 px-6 rounded-lg hover:from-orange-500 hover:to-yellow-600 transition-all"
              >
                Create Your First Chama
              </button>
              <button
                onClick={() => setJoinChamaOpen(true)}
                className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600 transition-all"
              >
                Join Existing Chama
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userChamas.slice(0, 3).map((chama) => (
              <ChamaCard key={chama.id} chama={chama} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateChamaModal open={createChamaOpen} onOpenChange={setCreateChamaOpen} />
      <JoinChamaModal open={joinChamaOpen} onOpenChange={setJoinChamaOpen} />
      <SendRedEnvelopeModal open={redEnvelopeOpen} onOpenChange={setRedEnvelopeOpen} />
      <StackBTCModal open={stackBTCOpen} onOpenChange={setStackBTCOpen} chama={selectedChama} />

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Contribution to Satoshi Jenga
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
            <span className="text-sm font-semibold text-green-600">+0.02 BTC</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Red Envelope received
              </p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
            <span className="text-sm font-semibold text-blue-600">+0.003 BTC</span>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Achievement unlocked: First Stack
              </p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
            <span className="text-sm font-semibold text-purple-600">+10 pts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
