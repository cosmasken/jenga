// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '@/components/Header';
import InviteModal from '@/components/modals/InviteModal';
import DepositModal from '@/components/modals/DepositModal';
import BorrowModal from '@/components/modals/BorrowModal';
import RepayModal from '@/components/modals/RepayModal';
import WithdrawModal from '@/components/modals/WithdrawModal';
import { toast } from '@/hooks/use-toast';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useSaccoStatus, useSaccoFeatureAccess } from '@/contexts/SaccoStatusContext';
import { SaccoStatusIndicator, SaccoTreasuryStats } from '@/components/SaccoStatusIndicator';
import { BITCOIN_PRICE_USD } from '@/utils/constants';
import {
  Users,
  Plus,
  Bitcoin,
  TrendingUp,
  Trophy,
  User,
  Bell,
  BellOff,
  Zap,
  Calendar,
  Target,
  Search,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Wallet,
  Gift,
  UserPlus,
  AlertCircle,
  ArrowRight,
  PiggyBank,
  Coins,
  Shield,
  Clock,
  Share2
} from 'lucide-react';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const isLoggedIn = useIsLoggedIn();
  const { primaryWallet } = useDynamicContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'sacco' | 'chama'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedChama, setSelectedChama] = useState<any>(null);

  // Sacco modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Use the dashboard data hook
  const {
    userChamas,
    dashboardStats,
    isLoading: chamaLoading,
    error: chamaError,
    lastRefresh,
    refresh,
    isConnected
  } = useDashboardData();

  // Use the global Sacco status context
  const {
    isLoggedIn: saccoLoggedIn,
    isSaccoMember,
    memberData,
    treasuryData,
    isLoading: saccoLoading,
    error: saccoError,
    refreshStatus: refreshSaccoData,
    joinSacco
  } = useSaccoStatus();

  const {
    canViewSaccoFeatures,
    canUseSaccoFeatures,
    shouldShowJoinPrompt
  } = useSaccoFeatureAccess();

  // Combine loading states
  const isLoading = chamaLoading || saccoLoading;
  const error = chamaError || saccoError;

  // Calculate derived Sacco values from context data
  const saccoData = {
    totalCollateral: memberData?.ethDeposited || 0,
    borrowedAmount: memberData?.usdcBorrowed || 0,
    availableCredit: memberData?.availableCredit || 0,
    healthFactor: memberData?.healthFactor || 999,
    interestRate: memberData?.interestRate || 0,
    isMember: isSaccoMember
  };

  // Enhanced refresh function that refreshes both Chama and Sacco data
  const refreshAllData = async () => {
    await Promise.all([
      refresh(),
      refreshSaccoData()
    ]);
  };

  // Helper function to calculate next round time
  const getNextRoundText = (chama: any) => {
    if (!chama.roundDuration) return "Round timing unknown";

    // Calculate days remaining (simplified - in real app would use actual timestamps)
    const daysInRound = Math.ceil(chama.roundDuration / (24 * 60 * 60));
    const estimatedDaysRemaining = Math.max(1, daysInRound - (Date.now() % (daysInRound * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));

    if (estimatedDaysRemaining < 1) {
      return "Round ending soon";
    } else if (estimatedDaysRemaining === 1) {
      return "Next round in 1 day";
    } else {
      return `Next round in ${Math.ceil(estimatedDaysRemaining)} days`;
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      console.log('User not logged in, redirecting to home');
      navigate('/');
    }
  }, [isLoggedIn, navigate]);

  const getUserDisplayName = () => {
    if (primaryWallet?.address) {
      return `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`;
    }
    return 'User';
  };

  const handleGoToSaccoDashboard = () => {
    console.log('Navigating to Sacco Dashboard');
    navigate('/sacco-dashboard');
  };

  const handleCreateChama = () => {
    console.log('Navigating to create chama page');
    navigate('/create');
  };

  const handleJoinChama = () => {
    console.log('Navigating to join chama page');
    navigate('/join');
  };

  const handleInviteToChama = (chama: any) => {
    setSelectedChama(chama);
    setShowInviteModal(true);
  };

  if (!isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  // Calculate total portfolio value
  const totalPortfolioValue = (saccoData.totalCollateral * BITCOIN_PRICE_USD) + dashboardStats.totalSaved;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title="Dashboard" />

      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
        {/* Welcome Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {getUserDisplayName().split('...')[0]}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's an overview of your Bitcoin finance portfolio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={refreshAllData}
                disabled={isLoading}
                className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5 transition-all duration-200"
                title={lastRefresh ? `Last refresh: ${lastRefresh.toLocaleTimeString()}` : 'Refresh data'}
              >
                <RefreshCw className={`h-5 w-5 text-bitcoin ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5 transition-all duration-200"
              >
                <Bell className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Overview Stats */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-bitcoin/10 to-yellow-400/10 border-bitcoin/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-bitcoin">
                    ${totalPortfolioValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Portfolio</p>
                </div>
                <div className="w-12 h-12 bg-bitcoin/10 rounded-full flex items-center justify-center">
                  <Wallet className="text-bitcoin" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    ₿{saccoData.totalCollateral}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sacco Collateral</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Shield className="text-blue-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats.userChamas}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Chamas</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users className="text-green-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {saccoData.healthFactor.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Health Factor</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Error loading data:</strong> {error}
                  </div>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={refreshAllData}>
                    <RefreshCw size={14} className="mr-1" />
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Health Factor Alert */}
        {saccoData.healthFactor < 1.5 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Low Health Factor Warning:</strong> Your collateral ratio is below safe levels.
                  </div>
                  <Button size="sm" variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                    Add Collateral
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-bitcoin/10 to-yellow-400/10 rounded-2xl p-6 mb-8 border border-bitcoin/20"
        >
          <h3 className="text-lg font-bold text-bitcoin mb-4 flex items-center gap-2">
            <Zap size={20} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Button
              onClick={handleGoToSaccoDashboard}
              className="bg-bitcoin hover:bg-bitcoin/90 text-white font-medium h-auto p-4 flex-col gap-2"
            >
              <Shield size={20} />
              <span>Sacco DeFi</span>
              <span className="text-xs opacity-80">Lend & Borrow</span>
            </Button>

            <Button
              onClick={handleCreateChama}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-medium h-auto p-4 flex-col gap-2"
            >
              <Plus size={20} />
              <span>Create Chama</span>
              <span className="text-xs opacity-80">Start Saving</span>
            </Button>

            <Button
              onClick={handleJoinChama}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 font-medium h-auto p-4 flex-col gap-2"
            >
              <UserPlus size={20} />
              <span>Join Chama</span>
              <span className="text-xs opacity-80">Find Groups</span>
            </Button>

            <Button
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950 font-medium h-auto p-4 flex-col gap-2"
            >
              <Gift size={20} />
              <span>Rewards</span>
              <span className="text-xs opacity-80">Claim Benefits</span>
            </Button>
          </div>
        </motion.div>

        {/* Platform Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'sacco', label: 'Sacco DeFi', icon: Shield },
            { id: 'chama', label: 'Chama Circles', icon: Users }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === id
                ? 'bg-white dark:bg-gray-700 text-bitcoin shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sacco Overview */}
              <Card className="border-bitcoin/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="text-bitcoin" size={20} />
                      Sacco DeFi
                    </h3>
                    <Button variant="ghost" size="sm" onClick={handleGoToSaccoDashboard}>
                      View Details <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Borrowed</span>
                      <span className="font-semibold">${saccoData.borrowedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Available Credit</span>
                      <span className="font-semibold text-green-600">${saccoData.availableCredit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                      <span className="font-semibold">{saccoData.interestRate}% APR</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chama Overview */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="text-blue-600" size={20} />
                      Chama Circles
                    </h3>
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight size={16} className="ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Saved</span>
                      <span className="font-semibold">${dashboardStats.totalSaved.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Active Groups</span>
                      <span className="font-semibold text-blue-600">{dashboardStats.userChamas}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Average Round</span>
                      <span className="font-semibold">{dashboardStats.averageRound.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'sacco' && (
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Lending Position</h3>
                  {!saccoData.isMember ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} className="text-bitcoin" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Join Sacco DeFi
                      </h4>
                      <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
                        Start lending and borrowing with Bitcoin-backed collateral
                      </p>
                      <Button onClick={handleGoToSaccoDashboard} className="bg-bitcoin hover:bg-bitcoin/90">
                        <Shield size={16} className="mr-2" />
                        Join Sacco
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Collateral Deposited</span>
                          <span className="font-semibold">₿{saccoData.totalCollateral.toFixed(4)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-bitcoin h-2 rounded-full"
                            style={{
                              width: `${Math.min((saccoData.totalCollateral / 5) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>₿0</span>
                          <span>₿5 (recommended)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">${saccoData.availableCredit.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Available to Borrow</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                          <p className="text-2xl font-bold text-red-600">${saccoData.borrowedAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Currently Borrowed</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">{saccoData.healthFactor.toFixed(2)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Health Factor</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{saccoData.interestRate.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  {!saccoData.isMember ? (
                    <div className="space-y-3">
                      <Button
                        onClick={handleGoToSaccoDashboard}
                        className="w-full bg-bitcoin hover:bg-bitcoin/90"
                      >
                        <Shield size={16} className="mr-2" />
                        Join Sacco DeFi
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Access lending and borrowing features
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowDepositModal(true)}
                        className="w-full bg-bitcoin hover:bg-bitcoin/90"
                        disabled={isLoading}
                      >
                        <Coins size={16} className="mr-2" />
                        Deposit Collateral
                      </Button>
                      <Button
                        onClick={() => setShowBorrowModal(true)}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || saccoData.availableCredit <= 0}
                      >
                        <DollarSign size={16} className="mr-2" />
                        Borrow USDC
                      </Button>
                      <Button
                        onClick={() => setShowRepayModal(true)}
                        variant="outline"
                        className="w-full"
                        disabled={isLoading || saccoData.borrowedAmount <= 0}
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Repay Loan
                      </Button>
                      {saccoData.totalCollateral > 0 && (
                        <Button
                          onClick={() => setShowWithdrawModal(true)}
                          variant="outline"
                          className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                          disabled={isLoading || saccoData.borrowedAmount > 0}
                        >
                          <ArrowRight size={16} className="mr-2" />
                          Withdraw Collateral
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'chama' && (
            <div className="space-y-6">
              {userChamas.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="w-20 h-20 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PiggyBank size={40} className="text-bitcoin" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      No chamas yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
                      Start your Bitcoin savings journey by creating or joining a chama
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={handleCreateChama} className="bg-bitcoin hover:bg-bitcoin/90">
                        <Plus size={16} className="mr-2" />
                        Create Chama
                      </Button>
                      <Button onClick={handleJoinChama} variant="outline">
                        <UserPlus size={16} className="mr-2" />
                        Join Chama
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userChamas.map((chama, index) => (
                    <motion.div
                      key={chama.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <Card className="hover:shadow-md transition-all hover:border-bitcoin/30 cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold mb-1">{chama.name}</h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {chama.tokenSymbol} • {chama.totalMembers} members
                              </p>
                            </div>
                            <Badge variant="outline" className="border-bitcoin text-bitcoin">
                              Round {chama.currentRound}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Contribution</p>
                              <p className="text-lg font-bold text-bitcoin">
                                {chama.contributionAmount} {chama.tokenSymbol}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Security Deposit</p>
                              <p className="text-lg font-bold text-green-600">
                                {chama.securityDepositAmount} {chama.tokenSymbol}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock size={16} />
                              <span>{getNextRoundText(chama)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInviteToChama(chama)}
                                className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5"
                              >
                                <Share2 size={14} className="mr-1" />
                                Invite
                              </Button>
                              <Button
                                size="sm"
                                className="bg-bitcoin hover:bg-bitcoin/90"
                                onClick={() => navigate(`/chama/${chama.address}`)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        chamaAddress={selectedChama?.address}
        chamaName={selectedChama?.name}
      />

      {/* Sacco Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={refreshAllData}
      />

      <BorrowModal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        onSuccess={refreshAllData}
      />

      <RepayModal
        isOpen={showRepayModal}
        onClose={() => setShowRepayModal(false)}
        onSuccess={refreshAllData}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={refreshAllData}
      />
    </div>
  );
}
