// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
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
import { useHybridChamas } from '@/hooks/useHybridChamas';
import { HybridChamaCard } from '@/components/HybridChamaCard';
import { blockchainService } from '@/services/blockchainService';
import { useRosca } from '@/hooks/useRosca';
import { useSaccoStatus, useSaccoFeatureAccess } from '@/contexts/SaccoStatusContext';
import { SaccoStatusIndicator, SaccoTreasuryStats } from '@/components/SaccoStatusIndicator';
import { BITCOIN_PRICE_USD, FACTORY_ADDRESS } from '@/utils/constants';
import { type Address, formatUnits } from 'viem';
import CountdownTimer from '@/components/CountdownTimer';
import { useTimeRemaining, getTimerDisplayText, getTimerTheme } from '@/hooks/useTimeRemaining';
import { UserGuidance, InteractiveTutorial, SmartNotification } from '@/components/UserGuidance';
import { ROSCAStatus } from '@/hooks/useRosca';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSmartNotification, setShowSmartNotification] = useState(true);

  // Sacco modal states
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showRepayModal, setShowRepayModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const roscaHook = useRosca(FACTORY_ADDRESS);

  // Initialize blockchain service
  React.useEffect(() => {
    blockchainService.setRoscaHook(roscaHook);
  }, [roscaHook]);

  // Use hybrid chama data hooks (off-chain + on-chain)
  const {
    data: userChamas = [],
    isLoading: chamaLoading,
    error: chamaError,
  } = useHybridChamas(primaryWallet?.address as string);

  // Helper functions for calculating portfolio values
  const formatCBTCAmount = (amount: bigint | undefined | null) => {
    if (amount === undefined || amount === null) return 0;
    try {
      return parseFloat(formatUnits(amount, 18)); // cBTC has 18 decimals
    } catch (error) {
      console.error('Error formatting cBTC amount:', error, { amount });
      return 0;
    }
  };

  const getCBTCUSDValue = (amount: bigint | undefined | null) => {
    const cbtcAmount = formatCBTCAmount(amount);
    return cbtcAmount * BITCOIN_PRICE_USD;
  };

  // Dashboard stats with hybrid chama data
  const dashboardStats = {
    totalSavedCBTC: userChamas.reduce((sum, chama) => sum + parseFloat(chama.contribution_amount || '0'), 0),
    totalSavedUSD: userChamas.reduce((sum, chama) => sum + parseFloat(chama.contribution_amount || '0') * BITCOIN_PRICE_USD, 0),
    userChamas: userChamas.length,
    averageRound: userChamas.length > 0 ? Math.round(userChamas.reduce((sum, chama) => sum + (chama.current_round || 1), 0) / userChamas.length) : 0
  };

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
      refreshSaccoData()
    ]);
  };

  const lastRefresh = new Date(); // Placeholder for now

  // Component for showing timer for each chama card
  const ChamaTimer = React.memo(({ chama }: { chama: any }) => {
    const { status, timeData, isLoading } = useTimeRemaining(chama.address as Address);
    
    if (isLoading) {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={16} className="animate-spin" />
          <span>Loading timer...</span>
        </div>
      );
    }

    const timerInfo = getTimerDisplayText(status, timeData);
    
    if (timerInfo.type === 'static') {
      return (
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock size={16} />
          <span>{timerInfo.label}</span>
        </div>
      );
    }

    const theme = timerInfo.value ? getTimerTheme(timerInfo.value) : 'default';

    return (
      <div className="flex items-center space-x-2">
        <CountdownTimer
          targetTime={timerInfo.value || 0}
          isTimestamp={false}
          format="compact"
          theme={theme}
          label={timerInfo.label}
          showIcon={true}
          className="text-sm"
        />
      </div>
    );
  }, (prevProps, nextProps) => {
    // Only re-render if chama address changes
    return prevProps.chama.address === nextProps.chama.address;
  });

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

  const handleSearch = async () => {
    if (!searchTerm.trim() || !isLoggedIn) return;

    setIsSearching(true);
    try {
      const results = await blockchainService.searchROSCAsByName(searchTerm.trim());
      if (results && results.addresses.length > 0) {
        // Convert search results to display format
        const formattedResults = results.addresses.map((address, index) => ({
          address,
          name: results.names[index],
          id: results.ids[index]
        }));
        setSearchResults(formattedResults);
        toast({
          title: "🔍 Search Results",
          description: `Found ${formattedResults.length} ROSCAs matching "${searchTerm}"`,
        });
      } else {
        setSearchResults([]);
        toast({
          title: "🔍 No Results",
          description: `No ROSCAs found matching "${searchTerm}"`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "❌ Search Failed",
        description: "Could not search ROSCAs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  // Calculate total portfolio value in cBTC
  const totalPortfolioValueCBTC = dashboardStats.totalSavedCBTC + saccoData.totalCollateral;
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title="Dashboard" />

      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20">
        {/* User Guidance */}
        <UserGuidance
          userLevel={userChamas.length === 0 ? 'new' : userChamas.length < 3 ? 'beginner' : 'intermediate'}
          currentContext="dashboard"
          isMember={userChamas.some(chama => chama.totalMembers > 0)}
          isCreator={userChamas.length > 0}
          hasContributed={false} // Would need to check this properly
        />

        {/* Smart Notifications */}
        {showSmartNotification && userChamas.length === 0 && (
          <SmartNotification
            type="info"
            message="Welcome! Start your Bitcoin savings journey by creating your first chama or joining an existing one."
            actionText="Get Started"
            onAction={() => {
              setShowTutorial(true);
              setShowSmartNotification(false);
            }}
          />
        )}

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
                    {totalPortfolioValueCBTC.toFixed(6)} cBTC
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
                    {saccoData.totalCollateral.toFixed(6)} cBTC
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
                    <strong>Error loading data:</strong> {error?.message || String(error) || 'Unknown error occurred'}
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
                      <span className="font-semibold">{dashboardStats.totalSavedCBTC.toFixed(6)} cBTC</span>
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
                          <span className="font-semibold">{saccoData.totalCollateral.toFixed(6)} cBTC</span>
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
              {/* Search Section */}
              <Card className="border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Search className="text-blue-600" size={20} />
                    Find ROSCAs by Name
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search for chamas by name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={!isLoggedIn}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={!searchTerm.trim() || isSearching || !isLoggedIn}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSearching ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Search size={16} />
                      )}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Search Results:</h4>
                      {searchResults.map((result) => (
                        <div key={result.address} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {result.address.slice(0, 6)}...{result.address.slice(-4)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => navigate(`/chama/${result.address}`)}
                            className="bg-bitcoin hover:bg-bitcoin/90"
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

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
                    <HybridChamaCard key={chama.id} chama={chama} index={index} />
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

      {/* Interactive Tutorial */}
      {showTutorial && (
        <InteractiveTutorial
          onComplete={() => {
            setShowTutorial(false);
            // Navigate to create chama page after tutorial
            navigate('/create');
          }}
        />
      )}
    </div>
  );
}
