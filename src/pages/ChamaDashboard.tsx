import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useLocation } from 'wouter';
import { useDynamicContext, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { useRosca } from '@/hooks/useRosca';
import { FACTORY_ADDRESS, BITCOIN_PRICE_USD } from '@/utils/constants';
import { formatUnits, type Address } from 'viem';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
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
  TrendingUp
} from 'lucide-react';

interface ChamaInfo {
  token: Address | null;
  contribution: bigint;
  securityDeposit: bigint;
  roundDuration: number;
  memberTarget: number;
  currentRound: number;
  totalMembers: number;
  isActive: boolean;
  creator: Address;
}

interface UserRole {
  isCreator: boolean;
  isMember: boolean;
  isLoggedIn: boolean;
  canJoin: boolean;
  canContribute: boolean;
  canLeave: boolean;
}

export default function ChamaDashboard() {
  const params = useParams();
  const [, navigate] = useLocation();
  const { primaryWallet } = useDynamicContext();
  const isLoggedIn = useIsLoggedIn();

  // State
  const [chamaInfo, setChamaInfo] = useState<ChamaInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false); // Prevent multiple calls
  const loadingRef = useRef(false); // Additional protection against multiple calls
  const [userMembershipStatus, setUserMembershipStatus] = useState<{
    isMember: boolean;
    isCreator: boolean;
    hasContributed: boolean;
  }>({
    isMember: false,
    isCreator: false,
    hasContributed: false
  });
  const [roscaStatus, setRoscaStatus] = useState<{
    status: number | null;
    timeUntilStart: number | null;
    canStart: boolean;
  }>({
    status: null,
    timeUntilStart: null,
    canStart: false
  });
  const [memberReadiness, setMemberReadiness] = useState<{
    totalJoined: number;
    totalPaidDeposits: number;
    maxMembersCount: number;
    allReady: boolean;
  } | null>(null);

  // Get chama address from URL params
  const chamaAddress = (params.address || '0x0000000000000000000000000000000000000000') as Address;

  // Use the Rosca hook
  const roscaHook = useRosca(FACTORY_ADDRESS);

  // Check user membership status - memoized to prevent infinite loops
  const checkUserMembership = useCallback(async () => {
    if (!primaryWallet?.address || !chamaInfo || loadingRef.current) {
      setUserMembershipStatus({
        isMember: false,
        isCreator: false,
        hasContributed: false
      });
      return;
    }

    try {
      const userAddress = primaryWallet.address as Address;

      // Check if user is creator (first member)
      const isCreator = chamaInfo.creator.toLowerCase() === userAddress.toLowerCase();
      
      console.log('🔍 Creator check details:', {
        userAddress: userAddress.toLowerCase(),
        chamaCreator: chamaInfo.creator.toLowerCase(),
        isCreator,
        addressesMatch: userAddress.toLowerCase() === chamaInfo.creator.toLowerCase()
      });

      // Check if user is a member using the contract - add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      const isMember = await roscaHook.isMember(chamaAddress, userAddress);

      // Check if user has contributed this round (if they're a member)
      let hasContributed = false;
      if (isMember && chamaInfo.currentRound > 0) {
        try {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
          hasContributed = await roscaHook.hasContributed(chamaAddress, userAddress, chamaInfo.currentRound);
        } catch (error) {
          console.warn('Could not check contribution status:', error);
        }
      }

      setUserMembershipStatus({
        isMember,
        isCreator,
        hasContributed
      });

      console.log('👤 User membership status:', {
        userAddress,
        isCreator,
        isMember,
        hasContributed,
        chamaCreator: chamaInfo.creator
      });

    } catch (error) {
      console.error('Failed to check user membership:', error);
      setUserMembershipStatus({
        isMember: false,
        isCreator: false,
        hasContributed: false
      });
    }
  }, [primaryWallet?.address, chamaInfo?.creator, chamaInfo?.currentRound, roscaHook, chamaAddress]);


  // Calculate user role and permissions based on membership status
  const userRole: UserRole = {
    isLoggedIn,
    isCreator: userMembershipStatus.isCreator,
    isMember: userMembershipStatus.isMember,
    canJoin: isLoggedIn && 
             chamaInfo && 
             !userMembershipStatus.isMember && 
             chamaInfo.status === 0 && // Must be in RECRUITING status
             chamaInfo.totalMembers < chamaInfo.memberTarget, // Must have available spots
    canContribute: isLoggedIn && userMembershipStatus.isMember && !userMembershipStatus.hasContributed,
    canLeave: isLoggedIn && userMembershipStatus.isMember && !userMembershipStatus.isCreator
  };

  // Debug userRole calculation
  console.log('🎭 UserRole calculation:', {
    userMembershipStatus,
    userRole,
    primaryWalletAddress: primaryWallet?.address,
    chamaCreator: chamaInfo?.creator
  });

  // Check ROSCA status and update state
  const checkRoscaStatus = useCallback(async () => {
    if (!chamaAddress || loadingRef.current) return;

    try {
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay
      const roscaInfo = await roscaHook.getROSCAInfo(chamaAddress);
      if (!roscaInfo) return;

      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      const timeUntilStart = await roscaHook.getTimeUntilStart(chamaAddress);
      
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      const isReady = await roscaHook.isReadyToStart(chamaAddress);
      
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      const readiness = await roscaHook.getMemberReadiness(chamaAddress);
      
      // NEW: Any member can start when ROSCA is ready
      const canStart = userMembershipStatus.isMember && isReady;

      setRoscaStatus({
        status: roscaInfo.status,
        timeUntilStart,
        canStart
      });

      setMemberReadiness(readiness);

      console.log('📊 ROSCA Status:', {
        status: roscaInfo.status,
        statusText: ['RECRUITING', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'][roscaInfo.status],
        timeUntilStart,
        isReady,
        canStart,
        isMember: userMembershipStatus.isMember,
        readiness
      });
    } catch (error) {
      console.warn('Failed to check ROSCA status:', error);
    }
  }, [chamaAddress, roscaHook, userMembershipStatus.isMember]);

  // Load chama data - simplified to avoid infinite loops
  const loadChamaData = async () => {
    if (!chamaAddress || chamaAddress === '0x0000000000000000000000000000000000000000') {
      setError('Invalid chama address');
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous calls
    if (isDataLoading || loadingRef.current) {
      console.log('⏳ Data loading already in progress, skipping...');
      return;
    }

    setIsDataLoading(true);
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading chama data for:', chamaAddress);
      const info = await roscaHook.getChamaInfo(chamaAddress);
      setChamaInfo(info);
      console.log('✅ Chama info loaded successfully:', info);

      // After loading chama info, check user membership if logged in
      if (isLoggedIn && primaryWallet?.address) {
        await checkUserMembership();
      }
      
      // Check ROSCA status
      await checkRoscaStatus();
    } catch (err: any) {
      console.error('❌ Failed to load chama data:', err);
      setError(err.message || 'Failed to load chama data');
      toast({
        title: '❌ Error Loading Chama',
        description: err.message || 'Failed to load chama data. Please check the address and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsDataLoading(false);
      loadingRef.current = false;
    }
  };

  // Load data on mount
  // Load data on mount - only run once
  useEffect(() => {
    loadChamaData();
  }, [chamaAddress]); // Only depend on chamaAddress

  // Check user membership when chamaInfo loads or wallet changes - NO function dependencies
  useEffect(() => {
    if (chamaInfo && isLoggedIn && primaryWallet?.address) {
      checkUserMembership();
    } else {
      // Reset membership status if not logged in or no chama info
      setUserMembershipStatus({
        isMember: false,
        isCreator: false,
        hasContributed: false
      });
    }
  }, [chamaInfo, isLoggedIn, primaryWallet?.address]); // Removed checkUserMembership dependency

  // Check ROSCA status after user membership is determined - NO function dependencies
  useEffect(() => {
    if (chamaInfo && userMembershipStatus.isCreator !== undefined) {
      checkRoscaStatus();
    }
  }, [chamaInfo, userMembershipStatus.isCreator]); // Removed checkRoscaStatus dependency

  // Debug logging
  useEffect(() => {
    console.log('🔍 ChamaDashboard state:', {
      isLoading,
      error,
      chamaInfo,
      chamaAddress
    });
  }, [isLoading, error, chamaInfo, chamaAddress]);

  // Action handlers
  const handleJoin = async () => {
    if (!chamaInfo || !isLoggedIn || !primaryWallet?.address) return;

    // Validate ROSCA status before attempting to join
    if (chamaInfo.status !== 0) {
      const statusNames = ['RECRUITING', 'WAITING', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
      const currentStatus = statusNames[chamaInfo.status] || 'UNKNOWN';
      
      toast({
        title: "❌ Cannot Join ROSCA",
        description: `This ROSCA is currently ${currentStatus} and not accepting new members.`,
        variant: "destructive",
      });
      return;
    }

    // Check if ROSCA is full
    if (chamaInfo.memberCount >= chamaInfo.maxMembers) {
      toast({
        title: "❌ ROSCA Full",
        description: "This ROSCA has reached its maximum number of members.",
        variant: "destructive",
      });
      return;
    }

    // Check if user is already a member
    if (userMembershipStatus.isMember) {
      toast({
        title: "ℹ️ Already a Member",
        description: "You are already a member of this ROSCA.",
        variant: "default",
      });
      return;
    }

    setIsActionLoading(true);
    try {
      const txHash = await roscaHook.joinROSCA(chamaAddress);
      if (txHash) {
        toast({
          title: "🎉 Joined successfully!",
          description: "Welcome to the savings circle. Deposit paid!",
        });
        await loadChamaData(); // Refresh data
      }
    } catch (err: any) {
      toast({
        title: "❌ Failed to join",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStartROSCA = async () => {
    if (!chamaInfo || !isLoggedIn) return;

    setIsActionLoading(true);
    try {
      // Check if we can start (all members ready)
      const timeUntilStart = await roscaHook.getTimeUntilStart(chamaAddress);
      
      if (timeUntilStart && timeUntilStart > 0) {
        // Not all members have joined and paid deposits yet
        toast({
          title: "⏰ Not ready to start",
          description: `ROSCA cannot start yet. All members must join and pay their deposits first.`,
          variant: "destructive",
        });
        return;
      }

      if (!userMembershipStatus.isMember) {
        toast({
          title: "❌ Access denied",
          description: "Only members can start the ROSCA.",
          variant: "destructive",
        });
        return;
      }

      // Any member can start when all are ready - use startROSCA (no force needed)
      const txHash = await roscaHook.startROSCA(chamaAddress);
        
      if (txHash) {
        toast({
          title: "🚀 ROSCA Started!",
          description: "The savings circle is now active. Round 1 has begun!",
        });
        await loadChamaData(); // Refresh data
      }
    } catch (err: any) {
      toast({
        title: "❌ Failed to start ROSCA",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleContribute = async () => {
    if (!chamaInfo || !isLoggedIn) return;

    setIsActionLoading(true);
    try {
      await roscaHook.contribute(chamaAddress);
      toast({
        title: "💸 Contribution sent!",
        description: `Contribution successful`,
      });
      await loadChamaData(); // Refresh data
    } catch (err: any) {
      toast({
        title: "❌ Contribution failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!chamaInfo || !isLoggedIn) return;

    setIsActionLoading(true);
    try {
      // Note: Leave functionality is not available in the enhanced ROSCA
      // This is just a placeholder for UI consistency
      toast({
        title: "⚠️ Leave not available",
        description: "Leave functionality is not implemented in the enhanced ROSCA system",
        variant: "destructive",
      });
    } catch (err: any) {
      toast({
        title: "❌ Leave failed",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsActionLoading(false);
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
    console.log('🔄 Rendering loading state');
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
    console.log('❌ Rendering error state:', { error, chamaInfo: !!chamaInfo });
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
                <Button onClick={loadChamaData} className="bg-bitcoin hover:bg-bitcoin/90">
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
  console.log('✅ Rendering main chama dashboard with data:', chamaInfo);
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

        {/* Role-based Status Alerts */}
        {!isLoggedIn && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Connect your wallet</strong> to join this chama or view your membership status.
            </AlertDescription>
          </Alert>
        )}

        {/* Creator Badge */}
        {userRole.isCreator && (
          <Alert className="border-bitcoin bg-bitcoin/10">
            <Shield className="h-4 w-4 text-bitcoin" />
            <AlertDescription className="text-bitcoin">
              <strong>You are the creator</strong> of this chama. You can manage settings and invite members.
            </AlertDescription>
          </Alert>
        )}

        {/* Member Badge */}
        {userRole.isMember && !userRole.isCreator && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>You are a member</strong> of this chama. {userMembershipStatus.hasContributed ? 'You have contributed this round.' : 'You can contribute to the current round.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Non-member Badge - only show if user is neither creator nor member */}
        {isLoggedIn && !userRole.isMember && !userRole.isCreator && (
          <Alert className="border-orange-500 bg-orange-50 dark:bg-orange-950">
            <UserPlus className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>You are not a member</strong> of this chama. {userRole.canJoin ? 'You can join if there are available spots.' : 'This chama is full or closed to new members.'}
            </AlertDescription>
          </Alert>
        )}

        {/* ROSCA Status Alert */}
        {roscaStatus.status === 1 && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>ROSCA is waiting to start</strong> - All members have joined. 
              {memberReadiness ? (
                memberReadiness.allReady ? (
                  <span className="text-green-600 font-semibold"> All deposits paid - any member can start the ROSCA now!</span>
                ) : (
                  ` Waiting for ${memberReadiness.totalJoined - memberReadiness.totalPaidDeposits} more members to pay their deposits.`
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
                    onClick={loadChamaData}
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
              {roscaStatus.status === 1 && memberReadiness && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Deposits Paid</span>
                    <span>{memberReadiness.totalPaidDeposits}/{memberReadiness.totalJoined} members</span>
                  </div>
                  <Progress
                    value={(memberReadiness.totalPaidDeposits / memberReadiness.totalJoined) * 100}
                    className="h-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0</span>
                    <span>{memberReadiness.totalJoined} (All Ready)</span>
                  </div>
                  {memberReadiness.allReady && (
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
                {!isLoggedIn ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Connect your wallet to interact with this chama
                    </p>
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="bg-bitcoin hover:bg-bitcoin/90"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                ) : userRole.isCreator ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-bitcoin/10 rounded-lg">
                      <Shield className="w-5 h-5 text-bitcoin" />
                      <span className="text-sm font-medium text-bitcoin">You created this chama</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Start ROSCA Button - show when status is WAITING (1) and all members ready */}
                      {roscaStatus.status === 1 && roscaStatus.canStart && (
                        <Button
                          onClick={handleStartROSCA}
                          disabled={isActionLoading}
                          className="bg-green-600 hover:bg-green-700 col-span-full"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          {isActionLoading ? 'Starting...' : 'Start ROSCA'}
                        </Button>
                      )}
                      
                      {userRole.canContribute && (
                        <Button
                          onClick={handleContribute}
                          disabled={isActionLoading}
                          className="bg-bitcoin hover:bg-bitcoin/90"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          {isActionLoading ? 'Contributing...' : 'Contribute'}
                        </Button>
                      )}
                      <Button
                        onClick={shareChama}
                        variant="outline"
                        className="border-bitcoin/50 text-bitcoin hover:bg-bitcoin/10"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Members
                      </Button>
                    </div>
                  </div>
                ) : userRole.isMember ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">You are a member</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Start ROSCA Button - show for any member when ready */}
                      {roscaStatus.status === 1 && roscaStatus.canStart && (
                        <Button
                          onClick={handleStartROSCA}
                          disabled={isActionLoading}
                          className="bg-green-600 hover:bg-green-700 col-span-full"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          {isActionLoading ? 'Starting...' : 'Start ROSCA'}
                        </Button>
                      )}
                      
                      {userRole.canContribute ? (
                        <Button
                          onClick={handleContribute}
                          disabled={isActionLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          {isActionLoading ? 'Contributing...' : 'Contribute'}
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="bg-gray-400"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Already Contributed
                        </Button>
                      )}
                      {userRole.canLeave && (
                        <Button
                          onClick={handleLeave}
                          disabled={isActionLoading}
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          {isActionLoading ? 'Leaving...' : 'Leave Chama'}
                        </Button>
                      )}
                    </div>
                  </div>
                ) : userRole.canJoin ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Join this Chama
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Secure your spot in this savings circle. You'll need to deposit {formatTokenAmount(chamaInfo.securityDeposit)} {getTokenSymbol()} as security.
                      </p>
                    </div>
                    <Button
                      onClick={handleJoin}
                      disabled={isActionLoading}
                      className="w-full bg-gradient-to-r from-bitcoin to-orange-600 hover:scale-105 transition-transform font-bold"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {isActionLoading ? 'Joining...' : `Join Chama (${formatTokenAmount(chamaInfo.securityDeposit)} ${getTokenSymbol()})`}
                    </Button>
                  </div>
                ) : isLoggedIn ? (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={32} className="text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {chamaInfo.totalMembers >= chamaInfo.memberTarget ? 'Chama Full' : 'Not a Member'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chamaInfo.totalMembers >= chamaInfo.memberTarget 
                        ? 'This chama has reached its member limit. Check back later or explore other chamas.'
                        : 'You are viewing this chama as a non-member. Join to participate in the savings circle.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle size={32} className="text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Connect Wallet
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connect your wallet to see your membership status and interact with this chama.
                    </p>
                  </div>
                )}
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
