import { useParams, useLocation } from 'wouter';
import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useComprehensiveChamaData } from '@/hooks/useChamaData';
import { useEnhancedMemberList, useMemberStatistics, useMemberContributionHistory } from '@/hooks/useEnhancedMemberData';
import { BITCOIN_PRICE_USD } from '@/utils/constants';
import { formatUnits, type Address } from 'viem';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ErrorBoundary, QueryErrorFallback } from '@/components/ErrorBoundary';
import { ChamaUserState } from '@/components/ChamaUserState';
import { ChamaActionButtons } from '@/components/ChamaActionButtons';
import { MemberList } from '@/components/MemberList';
import { MemberStatusIndicator } from '@/components/MemberStatusIndicator';
import { MemberContributionHistory } from '@/components/MemberContributionHistory';
import RoundProgress, { InlineRoundStatus } from '@/components/RoundProgress';
import CountdownTimer from '@/components/CountdownTimer';
import { useTimeRemaining, useROSCATimerNotifications } from '@/hooks/useTimeRemaining';
import { UserGuidance, ContextualHelp, SmartNotification } from '@/components/UserGuidance';
import type { EnhancedMemberInfo } from '@/types/member';
import {
  Users,
  DollarSign,
  Copy,
  Share2,
  RefreshCw,
  UserPlus,
  Coins,
  Clock,
  Shield,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ArrowLeft,
  Calendar,
  Target,
  TrendingUp,
  Wallet
} from 'lucide-react';


function ChamaDashboardContent() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { setShowAuthFlow } = useDynamicContext();
  const [selectedMember, setSelectedMember] = useState<EnhancedMemberInfo | null>(null);

  // Get chama address from URL params
  const chamaAddress = (params.address || '0x0000000000000000000000000000000000000000') as Address;

  // Use the new production-ready hook - replaces complex state management and localStorage
  const {
    chamaInfo,
    roscaStatus,
    userMembership,
    isLoading,
    error,
    accessLevel,
    availableActions,
    userState,
    join,
    payDeposit,
    contribute,
    startROSCA,
    refetch,
    isJoining,
    isPayingDeposit,
    isContributing,
    isStartingROSCA,
  } = useComprehensiveChamaData(chamaAddress);

  // Get timing information for this ROSCA
  const { status: roscaTimingStatus, timeData, isLoading: timingLoading } = useTimeRemaining(chamaAddress);

  // Set up timer notifications
  useROSCATimerNotifications(
    chamaAddress,
    (minutesRemaining) => {
      toast({
        title: "⏰ Round Deadline Warning",
        description: `Only ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} left to contribute!`,
        variant: "destructive",
      });
    },
    () => {
      toast({
        title: "🔄 Round Completed",
        description: "The current round has ended. Check if a new round has started.",
      });
      refetch(); // Refresh data when round completes
    },
    () => {
      toast({
        title: "🚀 ROSCA Ready to Start",
        description: "All members are ready! Any member can now start the ROSCA.",
        variant: "default",
      });
      refetch(); // Refresh data when ready to start
    }
  );

  // Current loading state (any of the individual loading states)
  const isAnyLoading = isJoining || isPayingDeposit || isContributing || isStartingROSCA;

  // Action handlers - now with built-in optimistic updates and error handling
  const handleJoin = () => {
    if (!availableActions.canJoin) {
      toast({
        title: "❌ Cannot Join",
        description: "You cannot join this chama at this time.",
        variant: "destructive",
      });
      return;
    }
    // join() now handles all error states and optimistic updates
    join();
  };

  const handlePayDeposit = () => {
    if (!availableActions.canPayDeposit) {
      toast({
        title: "❌ Cannot pay deposit",
        description: "You cannot pay your deposit at this time.",
        variant: "destructive",
      });
      return;
    }
    // payDeposit() now handles all error states and optimistic updates
    payDeposit();
  };

  const handleStartROSCA = () => {
    if (!availableActions.canStartROSCA) {
      toast({
        title: "❌ Cannot start ROSCA",
        description: "ROSCA is not ready to start yet.",
        variant: "destructive",
      });
      return;
    }
    // startROSCA() now handles all error states
    startROSCA();
  };

  const handleContribute = () => {
    console.log('💆 Contribute button clicked!');
    console.log('📊 Debug data:', {
      availableActions,
      userState,
      chamaInfo: {
        status: chamaInfo?.status,
        currentRound: chamaInfo?.currentRound
      },
      isContributing,
      isAnyLoading
    });

    if (!availableActions.canContribute) {
      console.log('❌ Cannot contribute - conditions not met');
      toast({
        title: "❌ Cannot contribute",
        description: "You cannot contribute at this time.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Calling contribute() function...');
    // contribute() now handles all error states and optimistic updates
    contribute();
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "📋 Copied!",
      description: "Address copied to clipboard",
    });
  };

  const shareChama = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Join this Chama',
        text: 'Join my savings circle on Citrea!',
        url: url,
      });
    } else {
      copyToClipboard(url);
    }
  };

  // Helper functions - Only support native cBTC token
  const getTokenSymbol = () => {
    return 'cBTC'; // Only native token supported
  };

  const getTokenDecimals = () => {
    return 18; // cBTC has 18 decimals
  };

  const formatTokenAmount = (amount: bigint | undefined | null) => {
    if (amount === undefined || amount === null) return '0.0000';
    try {
      const decimals = getTokenDecimals();
      const formatted = parseFloat(formatUnits(amount, decimals));
      return formatted.toFixed(4); // Always show 4 decimals for cBTC
    } catch (error) {
      console.error('Error formatting token amount:', error, { amount });
      return '0.0000';
    }
  };

  const getUSDValue = (amount: bigint | undefined | null) => {
    if (amount === undefined || amount === null) return 0;
    try {
      const tokenAmount = parseFloat(formatUnits(amount, getTokenDecimals()));
      return tokenAmount * BITCOIN_PRICE_USD; // Always convert cBTC to USD
    } catch (error) {
      console.error('Error calculating USD value:', error, { amount });
      return 0;
    }
  };

  const getRoundDurationText = (seconds: number | undefined | null) => {
    // Handle invalid input
    if (seconds === undefined || seconds === null || isNaN(seconds) || seconds <= 0) {
      return 'Duration not set';
    }
    
    // Ensure seconds is a valid number
    const validSeconds = Number(seconds);
    if (!isFinite(validSeconds) || validSeconds <= 0) {
      return 'Invalid duration';
    }
    
    const days = Math.floor(validSeconds / (24 * 60 * 60));
    const hours = Math.floor((validSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((validSeconds % (60 * 60)) / 60);
    
    // Handle different time ranges
    if (days === 0) {
      if (hours === 0) {
        return minutes <= 1 ? '1 minute' : `${minutes} minutes`;
      }
      return hours === 1 ? '1 hour' : `${hours} hours`;
    }
    
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      return weeks === 1 ? '1 week' : `${weeks} weeks`;
    }
    
    const months = Math.floor(days / 30);
    return months === 1 ? '1 month' : `${months} months`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header title="Loading..." />
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-2 border-bitcoin border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading chama data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - now handled by TanStack Query error handling
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header title="Error" />
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          <QueryErrorFallback error={error instanceof Error ? error : new Error('Unknown error')} refetch={refetch} />
        </div>
      </div>
    );
  }

  // Data not loaded yet
  if (!chamaInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header title="Chama Not Found" />
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Chama Not Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The requested chama could not be found or loaded.
              </p>
              <Button onClick={refetch} className="bg-bitcoin hover:bg-bitcoin/90">
                <RefreshCw size={16} className="mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main render
  // Removed excessive logging to prevent performance issues

  // If user is not logged in, show limited view with connect wallet prompt
  if (!userState.isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header title="Connect Wallet" />
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>

          <ChamaUserState
            chamaInfo={chamaInfo}
            userMembershipStatus={{
              isMember: userState.isMember,
              isCreator: userState.isCreator,
              hasContributed: userState.hasContributed
            }}
            onConnect={() => setShowAuthFlow(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header title={chamaInfo?.name || "Chama Details"} />

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Back Button */}
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>

        {/* User Guidance */}
        <UserGuidance
          userLevel={userState.isCreator ? 'intermediate' : userState.isMember ? 'beginner' : 'new'}
          currentContext="chama-detail"
          chamaStatus={chamaInfo?.status}
          isCreator={userState.isCreator}
          isMember={userState.isMember}
          hasContributed={userState.hasContributed}
        />

        {/* User State Alerts */}
        <ChamaUserState
          chamaInfo={chamaInfo}
          userMembershipStatus={{
            isMember: userState.isMember,
            isCreator: userState.isCreator,
            hasContributed: userState.hasContributed
          }}
          onConnect={() => setShowAuthFlow(true)}
        />

        {/* Debug Alert - temporary for troubleshooting */}
        {/* <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-1">
              <div><strong>DEBUG ROSCA STATUS:</strong></div>
              <div>• Contract Status: {chamaInfo.status} ({chamaInfo.status === 0 ? 'RECRUITING' : chamaInfo.status === 1 ? 'WAITING' : chamaInfo.status === 2 ? 'ACTIVE' : 'COMPLETED'})</div>
              <div>• Members: {chamaInfo.totalMembers}/{chamaInfo.memberTarget} {chamaInfo.totalMembers === chamaInfo.memberTarget ? '✅ FULL' : '❌ NOT FULL'}</div>
              <div>• User Access: {accessLevel}</div>
              <div>• Can Contribute: {availableActions.canContribute ? '✅ YES' : '❌ NO'}</div>
              <div>• Can Start ROSCA: {availableActions.canStartROSCA ? '✅ YES' : '❌ NO'}</div>
              <div>• Current Round: {chamaInfo.currentRound}</div>
              <div>• User is Member: {userState.isMember ? '✅ YES' : '❌ NO'}</div>
              <div>• User is Creator: {userState.isCreator ? '✅ YES' : '❌ NO'}</div>
              {roscaStatus?.memberReadiness && (
                <div>
                  • Deposits Paid: {roscaStatus.memberReadiness.totalPaidDeposits}/{roscaStatus.memberReadiness.totalJoined} members {roscaStatus.memberReadiness.allReady ? '✅ ALL READY' : '❌ WAITING FOR DEPOSITS'}
                  {roscaStatus.memberReadiness.memberDetails && (
                    <div className="ml-4 mt-1 space-y-1 text-xs">
                      {roscaStatus.memberReadiness.memberDetails.map((member, i) => (
                        <div key={i}>
                          - {member.address.slice(0, 8)}...{member.address.slice(-4)}: {member.hasDeposit ? '✅ PAID' : '❌ NOT PAID'} ({member.isReady ? 'READY' : 'NOT READY'})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert> */}

        {/* ROSCA Status Alert - now with proper error boundaries */}
        {chamaInfo?.status === 1 && (
          <ErrorBoundary level="component">
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>ROSCA is waiting to start</strong> - All members have joined.
                {roscaStatus?.memberReadiness ? (
                  roscaStatus.memberReadiness.allReady ? (
                    <span className="text-green-600 font-semibold"> All deposits paid - any member can start the ROSCA now!</span>
                  ) : (
                    ` Waiting for more members to pay their deposits.`
                  )
                ) : (
                  ' Checking deposit status...'
                )}
              </AlertDescription>
            </Alert>
          </ErrorBoundary>
        )}

        {/* Main Chama Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-bitcoin/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                    {chamaInfo.name || 'Chama Details'}
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {chamaAddress.slice(0, 6)}...{chamaAddress.slice(-4)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(chamaAddress)}
                    className="border-gray-300 dark:border-gray-600"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareChama}
                    className="border-bitcoin/50 text-bitcoin hover:bg-bitcoin/10"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refetch}
                    disabled={isLoading}
                    className="border-bitcoin/50 text-bitcoin hover:bg-bitcoin/10"
                    title="Refresh data from blockchain"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Key Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-bitcoin/10 to-yellow-400/10 rounded-lg border border-bitcoin/20">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-bitcoin mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Members</span>
                  </div>
                  <div className="text-2xl font-bold text-bitcoin">
                    {chamaInfo.totalMembers}/{chamaInfo.memberTarget}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {chamaInfo.memberTarget - chamaInfo.totalMembers} spots left
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contribution</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatTokenAmount(chamaInfo.contributionAmount)} {getTokenSymbol()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ ${getUSDValue(chamaInfo.contributionAmount).toFixed(2)}
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Security Deposit</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatTokenAmount(chamaInfo.securityDeposit)} {getTokenSymbol()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ ${getUSDValue(chamaInfo.securityDeposit).toFixed(2)}
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Round</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {chamaInfo.currentRound}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Status: {chamaInfo.status} (Current round)
                  </div>
                </div>
              </div>
              {/* Member Progress */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Member Progress</span>
                  <span>{chamaInfo.totalMembers}/{chamaInfo.memberTarget} members</span>
                </div>
                <Progress
                  value={(chamaInfo.totalMembers / chamaInfo.memberTarget) * 100}
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0</span>
                  <span>{chamaInfo.memberTarget} (Full)</span>
                </div>
              </div>

              {/* Deposit Readiness Progress - only show when in WAITING status */}
              {chamaInfo?.status === 1 && roscaStatus?.memberReadiness && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Deposits Paid</span>
                    <span>{roscaStatus.memberReadiness.totalPaidDeposits}/{roscaStatus.memberReadiness.totalJoined} members</span>
                  </div>
                  <Progress
                    value={(roscaStatus.memberReadiness.totalPaidDeposits / roscaStatus.memberReadiness.totalJoined) * 100}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>{roscaStatus.memberReadiness.totalJoined} (All Ready)</span>
                  </div>
                  {roscaStatus.memberReadiness.allReady && (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      All members ready - ROSCA can start!
                    </div>
                  )}
                </div>
              )}

              {/* Round Timer and Progress Section */}
              {!timingLoading && roscaTimingStatus !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <RoundProgress
                    status={roscaTimingStatus}
                    currentRound={chamaInfo.currentRound}
                    totalRounds={chamaInfo.memberTarget}
                    timeUntilRoundEnd={timeData.timeUntilRoundEnd}
                    roundProgress={timeData.roundProgress}
                    roundStartTime={timeData.roundStartTime}
                    roundDeadline={timeData.roundDeadline}
                    roundDuration={chamaInfo.roundDuration}
                    timeUntilStart={timeData.timeUntilStart}
                    isExpired={timeData.isExpired}
                    detailed={true}
                    className="mb-4"
                  />
                </motion.div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Round Duration</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getRoundDurationText(chamaInfo.roundDuration)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chamaInfo.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Available Actions</h3>
                  <ContextualHelp context={!userState.hasContributed && userState.isMember ? 'contributing' : 'joining'} />
                </div>
                <ChamaActionButtons
                  accessLevel={accessLevel}
                  chamaInfo={chamaInfo}
                  userMembershipStatus={{
                    isMember: userState.isMember,
                    isCreator: userState.isCreator,
                    hasContributed: userState.hasContributed
                  }}
                  roscaStatus={{
                    status: chamaInfo?.status || null,
                    canStart: availableActions.canStartROSCA
                  }}
                  isActionLoading={isAnyLoading}
                  onJoin={handleJoin}
                  onPayDeposit={handlePayDeposit}
                  onContribute={handleContribute}
                  onStartROSCA={handleStartROSCA}
                  onShare={shareChama}
                  getTokenSymbol={getTokenSymbol}
                  formatTokenAmount={formatTokenAmount}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Member Tracking */}
        {userState.isLoggedIn && (userState.isMember || userState.isCreator) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Tabs defaultValue="members" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="details">Member Details</TabsTrigger>
                <TabsTrigger value="history">Contribution History</TabsTrigger>
              </TabsList>

              <TabsContent value="members">
                <ErrorBoundary level="component">
                  <EnhancedMemberListWrapper
                    chamaAddress={chamaAddress}
                    tokenSymbol={getTokenSymbol()}
                    formatTokenAmount={formatTokenAmount}
                    onMemberClick={setSelectedMember}
                  />
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="details">
                <ErrorBoundary level="component">
                  {selectedMember ? (
                    <MemberStatusIndicator
                      member={selectedMember}
                      tokenSymbol={getTokenSymbol()}
                      formatTokenAmount={formatTokenAmount}
                      compact={false}
                      showPerformance={true}
                    />
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Select a Member
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Click on a member from the Members tab to view their detailed information.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </ErrorBoundary>
              </TabsContent>

              <TabsContent value="history">
                <ErrorBoundary level="component">
                  <MemberContributionHistoryWrapper
                    chamaAddress={chamaAddress}
                    memberAddress={selectedMember?.address}
                    tokenSymbol={getTokenSymbol()}
                    formatTokenAmount={formatTokenAmount}
                  />
                </ErrorBoundary>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}

        {/* How it Works Card - Show for non-members */}
        {(!userState.isLoggedIn || (!userState.isMember && !userState.isCreator)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  How it Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-bitcoin/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <UserPlus size={24} className="text-bitcoin" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">1. Join</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pay security deposit to secure your spot
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Coins size={24} className="text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">2. Contribute</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Make regular contributions each round
                    </p>
                  </div>
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp size={24} className="text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">3. Receive</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get the full pot when it's your turn
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helper wrapper components
function EnhancedMemberListWrapper({
  chamaAddress,
  tokenSymbol,
  formatTokenAmount,
  onMemberClick
}: {
  chamaAddress: Address;
  tokenSymbol: string;
  formatTokenAmount: (amount: bigint) => string;
  onMemberClick: (member: EnhancedMemberInfo) => void;
}) {
  const { data: memberList, isLoading } = useEnhancedMemberList(chamaAddress);

  return (
    <MemberList
      memberList={memberList}
      isLoading={isLoading}
      tokenSymbol={tokenSymbol}
      formatTokenAmount={formatTokenAmount}
      onMemberClick={onMemberClick}
      showReadinessIndicator={true}
    />
  );
}

function MemberContributionHistoryWrapper({
  chamaAddress,
  memberAddress,
  tokenSymbol,
  formatTokenAmount
}: {
  chamaAddress: Address;
  memberAddress?: Address;
  tokenSymbol: string;
  formatTokenAmount: (amount: bigint) => string;
}) {
  const { data: history, isLoading } = memberAddress
    ? useMemberContributionHistory(chamaAddress, memberAddress)
    : { data: null, isLoading: false };

  const handleTransactionClick = (txHash: string) => {
    // Open transaction in block explorer
    const explorerUrl = `https://explorer.citrea.xyz/tx/${txHash}`;
    window.open(explorerUrl, '_blank');
  };

  if (!memberAddress) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select a Member
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Click on a member from the Members tab to view their contribution history.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <MemberContributionHistory
      history={history}
      isLoading={isLoading}
      tokenSymbol={tokenSymbol}
      formatTokenAmount={formatTokenAmount}
      onTransactionClick={handleTransactionClick}
    />
  );
}

// Export with Error Boundary wrapper for production
export default function ChamaDashboard() {
  return (
    <ErrorBoundary level="page">
      <ChamaDashboardContent />
    </ErrorBoundary>
  );
}
