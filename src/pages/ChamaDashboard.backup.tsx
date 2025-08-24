import { useParams, useLocation } from 'wouter';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useChamaQuery } from '@/hooks/useChamaQuery';
import { BITCOIN_PRICE_USD } from '@/utils/constants';
import { formatUnits, type Address } from 'viem';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ChamaUserState } from '@/components/ChamaUserState';
import { ChamaActionButtons } from '@/components/ChamaActionButtons';
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


export default function ChamaDashboard() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { setShowAuthFlow } = useDynamicContext();

  // Get chama address from URL params
  const chamaAddress = (params.address || '0x0000000000000000000000000000000000000000') as Address;

  // Use the consolidated query hook - this replaces all the complex state management
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
    contribute,
    startROSCA,
    refreshAll,
    isJoining,
    isContributing,
    isStartingROSCA,
  } = useChamaQuery(chamaAddress);

  // Current loading state (any of the individual loading states)
  const isAnyLoading = isJoining || isContributing || isStartingROSCA;

  // Action handlers with proper error handling and optimistic updates
  const handleJoin = async () => {
    if (!availableActions.canJoin) {
      toast({
        title: "❌ Cannot Join",
        description: "You cannot join this chama at this time.",
        variant: "destructive",
      });
      return;
    }

    try {
      await join();
      toast({
        title: "🎉 Joined successfully!",
        description: "Welcome to the savings circle. Deposit paid!",
      });
    } catch (err: any) {
      toast({
        title: "❌ Failed to join",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleStartROSCA = async () => {
    if (!availableActions.canStartROSCA) {
      toast({
        title: "❌ Cannot start ROSCA",
        description: "ROSCA is not ready to start yet.",
        variant: "destructive",
      });
      return;
    }

    try {
      await startROSCA();
      toast({
        title: "🚀 ROSCA Started!",
        description: "The savings circle is now active. Round 1 has begun!",
      });
    } catch (err: any) {
      toast({
        title: "❌ Failed to start ROSCA",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleContribute = async () => {
    if (!availableActions.canContribute) {
      toast({
        title: "❌ Cannot contribute",
        description: "You cannot contribute at this time.",
        variant: "destructive",
      });
      return;
    }

    try {
      await contribute();
      toast({
        title: "💸 Contribution sent!",
        description: `Contribution successful for round ${chamaInfo?.currentRound}`,
      });
    } catch (err: any) {
      let errorMessage = err.message || "Please try again";
      
      if (err.message?.includes('Invalid ROSCA status')) {
        errorMessage = "ROSCA must be ACTIVE to accept contributions.";
      } else if (err.message?.includes('Already contributed')) {
        errorMessage = "You have already contributed to this round.";
      }
      
      toast({
        title: "❌ Contribution failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
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

  // Helper functions
  const getTokenSymbol = () => {
    if (!chamaInfo) return 'cBTC';
    return chamaInfo.token === null || chamaInfo.token === '0x0000000000000000000000000000000000000000' ? 'cBTC' : 'USDC';
  };

  const getTokenDecimals = () => {
    return getTokenSymbol() === 'cBTC' ? 18 : 6;
  };

  const formatTokenAmount = (amount: bigint) => {
    const decimals = getTokenDecimals();
    const formatted = parseFloat(formatUnits(amount, decimals));
    return formatted.toFixed(decimals === 18 ? 4 : 2);
  };

  const getUSDValue = (amount: bigint) => {
    const tokenAmount = parseFloat(formatUnits(amount, getTokenDecimals()));
    if (getTokenSymbol() === 'cBTC') {
      return tokenAmount * BITCOIN_PRICE_USD;
    }
    return tokenAmount; // USDC is already in USD
  };

  const getRoundDurationText = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days === 7) return '1 week';
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
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

  // Error state
  if (error || !chamaInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header title="Error" />
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {error || 'Chama Not Found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The requested chama could not be found or loaded.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Dashboard
                </Button>
                <Button onClick={refreshAll} className="bg-bitcoin hover:bg-bitcoin/90">
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
              </div>
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
      <Header title={chamaInfo?.roscaName || "Chama Details"} />

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

        {/* ROSCA Status Alert */}
        {chamaInfo?.status === 1 && (
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
                    {chamaInfo.roscaName || 'Chama Details'}
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
                    onClick={refreshAll}
                    disabled={isLoading}
                    className="border-bitcoin/50 text-bitcoin hover:bg-bitcoin/10"
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
                    {formatTokenAmount(chamaInfo.contribution)} {getTokenSymbol()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    ≈ ${getUSDValue(chamaInfo.contribution).toFixed(2)}
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
                    Current round
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

        {/* Additional Info Card */}
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
      </div>
    </div>
  );
}
