import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useSacco } from "@/hooks/useSacco";
import { useUserStore } from "../stores/userStore";
import { CONTRACT_ADDRESSES } from "../config";
import OnboardingModal from "../components/modals/OnboardingModal";
import WelcomeModal from "../components/modals/WelcomeModal";
import RepayModal from "../components/modals/RepayModal";
import WithdrawModal from "../components/modals/WithdrawModal";
import DepositModal from "../components/modals/DepositModal";
import BorrowModal from "../components/modals/BorrowModal";
import FundTreasuryModal from "../components/modals/FundTreasuryModal";
import DashboardTour from "../components/guides/DashboardTour";
import {
  ArrowUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  WalletIcon,
  InformationCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { TrendingUp } from "lucide-react";

import {
  useDynamicContext,
  DynamicContextProvider,
  UserProfile,
  useIsLoggedIn,
} from '@dynamic-labs/sdk-react-core';

export default function SaccoDashboard() {
  const {
    isConnected,
    memberData,
    refreshData,
    isLoading,
    treasuryBalance,
    currentInterestRate,
    totalOwedUSDC,
    maxBorrowableUSDC,
    publicClient
  } = useSacco(CONTRACT_ADDRESSES.MICRO_SACCO);
  const {
    hasSeenDashboardTour,
    hasCompletedOnboarding,
    dismissedWarnings,
    dismissWarning,
  } = useUserStore();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showDashboardTour, setShowDashboardTour] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeModalDismissed, setWelcomeModalDismissed] = useState(false);

  const { user, handleLogOut, setShowAuthFlow, primaryWallet } =
    useDynamicContext();

  const isLoggedIn = useIsLoggedIn();

  const [balance, setBalance] = useState<string | null>(null);

  // Get membership status and data from useSacco hook
  const isMember = memberData?.isMember || false;
  const ethDeposited = memberData ? (Number(memberData.ethDeposited) / 1e18).toFixed(4) : '0.0000';
  const usdcBorrowed = memberData ? (Number(memberData.usdcBorrowed) / 1e6).toFixed(2) : '0.00';

  useEffect(() => {
    primaryWallet?.getBalance().then((balance) => {
      if (balance) {
        setBalance(balance.toString());
      }
    });
  }, [primaryWallet]);

  // Show welcome modal for non-members when they first connect (only if they haven't completed onboarding and haven't dismissed it)
  useEffect(() => {
    if (isConnected && memberData && !isMember && !hasCompletedOnboarding && !welcomeModalDismissed && !activeModal) {
      // Add a small delay to ensure the dashboard has loaded
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, memberData, isMember, hasCompletedOnboarding, welcomeModalDismissed, activeModal]);

  // Fetch treasury stats when component mounts or relevant data changes
  // useEffect(() => {
  //   if (publicClient && treasuryBalance !== undefined) {
  //     fetchTreasuryStats();
  //   }
  // }, [publicClient, treasuryBalance]);

  // Auto-refresh treasury stats with RPC-friendly interval
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (publicClient) {
  //       fetchTreasuryStats();
  //     }
  //   }, 120000); // 2 minutes to avoid rate limiting

  //   return () => clearInterval(interval);
  // }, [publicClient]);

  // Show dashboard tour for new members
  // useEffect(() => {
  //   if (isConnected && isMember && !hasSeenDashboardTour) {
  //     const timer = setTimeout(() => {
  //       setShowDashboardTour(true);
  //     }, 1000);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isConnected, isMember, hasSeenDashboardTour]);

  // Handle joining Sacco from welcome modal - show onboarding modal
  const handleJoinSacco = () => {
    setShowWelcomeModal(false);
    setWelcomeModalDismissed(true);
    setActiveModal("onboarding");
  };

  // Handle register button click from alert
  const handleRegisterClick = () => {
    setShowWelcomeModal(true);
  };

  // Handle welcome modal close (Maybe Later button or X button)
  const handleWelcomeModalClose = () => {
    setShowWelcomeModal(false);
    setWelcomeModalDismissed(true);
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Show skeleton loading while wallet is connecting
  if (!isConnected) {
    return (
      <section className="py-12 px-4 bg-neutral-900/50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Top Bar Skeleton */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:border-neutral-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="w-9 h-9 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Skeleton className="h-8 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex space-x-2">
                      <Skeleton className="flex-1 h-10 rounded" />
                      <Skeleton className="flex-1 h-10 rounded" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Dashboard Sections Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction History Skeleton */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-6 w-40" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent className="lg:max-h-96 max-h-48 h-48 lg:h-96">
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics Panel Skeleton */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-12" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg"
                    >
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                  <div className="p-3 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-8" />
                    </div>
                    <Skeleton className="h-3 w-20 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const [transactions, setTransactions] = useState([]);
  const [treasuryStats, setTreasuryStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalBorrowed: 0,
    utilizationRate: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const intervalRef = useRef(null);

  // Function to fetch real treasury stats with rate limiting protection
  const fetchTreasuryStats = async () => {
    if (!publicClient) return;

    setIsLoadingStats(true);
    try {
      const fromBlock = 14059459n;

      const getLogsInChunks = async (event: any) => {
        const latestBlock = await publicClient.getBlockNumber();
        const chunks = [];
        for (let fromBlockChunk = fromBlock; fromBlockChunk <= latestBlock; fromBlockChunk += 1000n) {
          const toBlock = fromBlockChunk + 999n > latestBlock ? latestBlock : fromBlockChunk + 999n;
          chunks.push(publicClient.getLogs({ address: CONTRACT_ADDRESSES.MICRO_SACCO, event, fromBlock: fromBlockChunk, toBlock }));
        }
        return (await Promise.all(chunks)).flat();
      }

      // Get contract events to calculate stats
      const [joinedEvents, borrowEvents, repayEvents] = await Promise.all([
        // Get all Joined events to count total members
        getLogsInChunks({
          type: 'event',
          name: 'Joined',
          inputs: [
            { name: 'member', type: 'address', indexed: true },
            { name: 'ethFee', type: 'uint256' }
          ]
        }),
        // Get all BorrowUSDC events
        getLogsInChunks({
          type: 'event',
          name: 'BorrowUSDC',
          inputs: [
            { name: 'member', type: 'address', indexed: true },
            { name: 'usdcAmount', type: 'uint256' }
          ]
        }),
        // Get all RepayUSDC events
        getLogsInChunks({
          type: 'event',
          name: 'RepayUSDC',
          inputs: [
            { name: 'member', type: 'address', indexed: true },
            { name: 'usdcAmount', type: 'uint256' }
          ]
        })
      ]);

      // Calculate total unique members
      const uniqueMembers = new Set(joinedEvents.map(event => event.args.member));
      const totalMembers = uniqueMembers.size;

      // Calculate borrowing stats
      const borrowsByMember = new Map();
      const repaysByMember = new Map();

      // Sum borrows by member
      borrowEvents.forEach(event => {
        const member = event.args.member;
        const amount = Number(event.args.usdcAmount) / 1e6; // Convert from 6 decimals
        borrowsByMember.set(member, (borrowsByMember.get(member) || 0) + amount);
      });

      // Sum repays by member
      repayEvents.forEach(event => {
        const member = event.args.member;
        const amount = Number(event.args.usdcAmount) / 1e6; // Convert from 6 decimals
        repaysByMember.set(member, (repaysByMember.get(member) || 0) + amount);
      });

      // Calculate active loans (members with outstanding debt)
      let activeLoans = 0;
      let totalBorrowed = 0;

      borrowsByMember.forEach((borrowed, member) => {
        const repaid = repaysByMember.get(member) || 0;
        const outstanding = borrowed - repaid;

        if (outstanding > 0.01) { // Consider loans > $0.01 as active
          activeLoans++;
        }
        totalBorrowed += outstanding;
      });

      // Calculate utilization rate
      const treasuryBalanceUSDC = treasuryBalance ? Number(treasuryBalance) / 1e6 : 0;
      const totalLiquidity = treasuryBalanceUSDC + totalBorrowed;
      const utilizationRate = totalLiquidity > 0 ? (totalBorrowed / totalLiquidity) * 100 : 0;

      setTreasuryStats({
        totalMembers,
        activeLoans,
        totalBorrowed,
        utilizationRate
      });

    } catch (error) {
      console.error('Error fetching treasury stats:', error);

      // Handle rate limiting gracefully
      if (error?.message?.includes('rate limit') || error?.message?.includes('429')) {
        console.warn('RPC rate limit hit, will retry on next interval');
      }

      // Keep existing stats on error to avoid UI flickering
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    // Clear interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const transactionTypes = [
    { type: "deposit", amount: "+1.5 cBTC", icon: ArrowUpIcon, color: "text-green-400" },
    { type: "borrow", amount: "500 USDC", icon: BanknotesIcon, color: "text-purple-400" },
    { type: "join", amount: "0.01 cBTC", icon: CheckCircleIcon, color: "text-bitcoin" },
    { type: "repay", amount: "-250 USDC", icon: BanknotesIcon, color: "text-blue-400" },
    { type: "withdraw", amount: "-0.5 cBTC", icon: ArrowUpIcon, color: "text-red-400" },
  ];

  const statusOptions = [
    { name: "Confirmed", color: "text-green-400" },
    { name: "Pending", color: "text-yellow-400" },
    { name: "Rejected", color: "text-red-400" },
  ];

  const populateTransactions = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setTransactions([]); // Clear existing transactions

    let count = 0;
    intervalRef.current = setInterval(() => {
      if (count < 10) {
        const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
        const newTransaction = {
          id: Date.now() + count, // More unique key
          type: type.type,
          amount: type.amount,
          time: `a few seconds ago`,
          status: status.name,
          statusColor: status.color,
          Icon: type.icon,
          iconColor: type.color,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        count++;
      } else {
        clearInterval(intervalRef.current);
      }
    }, 1000); // Add a new transaction every second
  };

  return (
    <section className="py-12 px-4 bg-neutral-900/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Message for New Members */}
        {isMember && !dismissedWarnings.includes("welcome-member") && (
          <Alert className="mb-6 bg-bitcoin/10 border-bitcoin/30">
            <InformationCircleIcon className="h-4 w-4 text-bitcoin" />
            <AlertDescription className="text-bitcoin">
              <div className="flex justify-between items-center">
                <span>
                  Welcome to Sacco! Your membership is now active. Start
                  depositing cBTC to begin borrowing.
                </span>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => dismissWarning("welcome-member")}
                  className="text-bitcoin p-0 h-auto"
                >
                  ✕
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Welcome Message - Different content based on membership status */}
        {!dismissedWarnings.includes("welcome-member") && (
          <Alert className={`mb-6 ${isMember ? 'bg-bitcoin/10 border-bitcoin/30' : 'bg-blue-900/20 border-blue-700/50'}`}>
            <InformationCircleIcon className={`h-4 w-4 ${isMember ? 'text-bitcoin' : 'text-blue-400'}`} />
            <AlertDescription className={isMember ? 'text-bitcoin' : 'text-blue-400'}>
              <div className="flex justify-between items-center">

                <div className="flex items-center gap-2">
                  {!isMember && (
                    <Button
                      onClick={handleRegisterClick}
                      className="bg-bitcoin text-black hover:bg-bitcoin/90 text-sm"
                      data-testid="button-register-sacco"
                    >
                      Register
                    </Button>
                  )}
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => dismissWarning("welcome-member")}
                    className={`${isMember ? 'text-bitcoin' : 'text-blue-400'} p-0 h-auto`}
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Top Bar */}
        <Card className="mb-8" id="wallet-info">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-bitcoin rounded-full flex items-center justify-center text-black font-semibold">
                  <WalletIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-400">Connected Wallet</p>
                  <p className="font-medium" data-testid="text-wallet-address">
                    {[primaryWallet?.address]}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge className="bg-green-900/30 border-green-700 dark:text-green-400 text-green-900 ___">
                  <div className="w-2 h-2 dark:bg-green-400 bg-green-900 rounded-full mr-2"></div>
                  Citrea
                </Badge>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="text-blue-400 border-blue-400/50 hover:bg-blue-400/10"
                  data-testid="button-refresh-data"
                >
                  <svg
                    className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </Button>

                {hasSeenDashboardTour && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDashboardTour(true)}
                    className="text-bitcoin border-bitcoin/50 hover:bg-bitcoin/10"
                  >
                    <BookOpenIcon className="w-4 h-4 mr-1" />
                    Tour
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Collateral Card */}
          <Card
            className="hover:border-neutral-700 transition-colors"
            id="collateral-card"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Collateral
              </CardTitle>
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <ArrowUpIcon className="w-5 h-5 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p
                    className="text-2xl font-bold"
                    data-testid="text-eth-balance"
                  >
                    {ethDeposited} cBTC
                  </p>
                  <p className="text-neutral-400 text-sm">
                    ≈ ${(parseFloat(ethDeposited) * 2400).toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setActiveModal("deposit")}
                    disabled={!isMember}
                    className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90 disabled:opacity-50"
                    data-testid="button-deposit"
                  >
                    Deposit
                  </Button>
                  <Button
                    onClick={() => setActiveModal("withdraw")}
                    disabled={!isMember}
                    variant="outline"
                    className="flex-1 disabled:opacity-50"
                    data-testid="button-withdraw"
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Card */}
          <Card
            className="hover:border-neutral-700 transition-colors"
            id="loan-card"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Active Loan
              </CardTitle>
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <BanknotesIcon className="w-5 h-5 text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p
                    className="text-2xl font-bold"
                    data-testid="text-usdc-borrowed"
                  >
                    {usdcBorrowed} USDC
                  </p>
                  <p className="text-neutral-400 text-sm">
                    Interest Rate: 5.2% APR
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setActiveModal("borrow")}
                    disabled={!isMember}
                    className="flex-1 bg-bitcoin text-black hover:bg-bitcoin/90 disabled:opacity-50"
                    data-testid="button-borrow"
                  >
                    Borrow More
                  </Button>
                  <Button
                    onClick={() => setActiveModal("repay")}
                    disabled={!isMember}
                    variant="outline"
                    className="flex-1 disabled:opacity-50"
                    data-testid="button-repay"
                  >
                    Repay
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Governance Card */}
          <Card
            className="hover:border-neutral-700 transition-colors"
            id="governance-card"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">
                Governance
              </CardTitle>
              <div className="p-2 bg-bitcoin/20 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-bitcoin" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p
                    className="text-2xl font-bold"
                    data-testid="text-voting-power"
                  >
                    {isMember ? Math.floor(parseFloat(ethDeposited) * 625) : 0} GOV
                  </p>
                  <p className="text-neutral-400 text-sm">
                    {isMember ? "2 active proposals" : "Join to participate"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  disabled={!isMember}
                  className="w-full bg-gradient-to-r from-bitcoin/20 to-bitcoin/10 border-bitcoin/30 text-bitcoin hover:from-bitcoin/30 hover:to-bitcoin/20 disabled:opacity-50"
                  data-testid="button-view-proposals"
                >
                  View Proposals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treasury Section - Members Only */}
        {isMember && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Treasury Overview</h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setActiveModal("fund-treasury")}
                  className="bg-green-600 text-white hover:bg-green-700"
                  data-testid="button-fund-treasury"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Fund Treasury
                </Button>
                <Badge className="bg-bitcoin/20 border-bitcoin/30 text-bitcoin">
                  Members Only
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* USDC Treasury */}
              <Card className="hover:border-neutral-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">USDC Treasury</CardTitle>
                  <div className="p-2 bg-green-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-treasury-usdc">
                        {treasuryBalance ? (Number(treasuryBalance) / 1e6).toLocaleString() : '0'} USDC
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Available for lending
                      </p>
                    </div>
                    <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-400 text-sm">Utilization Rate</span>
                        <span className="text-green-400 font-semibold">{treasuryStats.utilizationRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Governance Tokens */}
              <Card className="hover:border-neutral-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">Governance Tokens</CardTitle>
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold" data-testid="text-treasury-gov">
                        {isMember ? Math.floor(parseFloat(ethDeposited) * 625).toLocaleString() : '0'} GOV
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Total governance tokens
                      </p>
                    </div>
                    <div className="p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-purple-400 text-sm">Your Voting Power</span>
                        <span className="text-purple-400 font-semibold">
                          {Math.floor(parseFloat(ethDeposited) * 625).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Treasury Stats */}
              <Card className="hover:border-neutral-700 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">Treasury Stats</CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchTreasuryStats}
                      disabled={isLoadingStats}
                      className="p-1 hover:bg-neutral-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Refresh stats"
                    >
                      <svg
                        className={`w-4 h-4 text-neutral-400 hover:text-white ${isLoadingStats ? 'animate-spin' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                      <span className="text-neutral-400 text-sm">Interest Rate</span>
                      <span className="font-semibold text-green-400">
                        {currentInterestRate ? (Number(currentInterestRate) / 100).toFixed(1) : '5.2'}% APR
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                      <span className="text-neutral-400 text-sm">Total Members</span>
                      <span className="font-semibold text-bitcoin">
                        {treasuryStats.totalMembers}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                      <span className="text-neutral-400 text-sm">Active Loans</span>
                      <span className="font-semibold text-blue-400">
                        {treasuryStats.activeLoans}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                      <span className="text-neutral-400 text-sm">Utilization Rate</span>
                      <span className="font-semibold text-purple-400">
                        {treasuryStats.utilizationRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Additional Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction History */}
          <Card id="transaction-history">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="link" className="text-bitcoin p-0" onClick={populateTransactions}>
                  Populate
                </Button>
                <Button variant="link" className="text-bitcoin p-0">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="lg:max-h-96 max-h-48 h-48 lg:h-96 overflow-y-auto">
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center text-neutral-400 py-8">
                    <p>No recent transactions.</p>
                    <p className="text-sm">Click "Populate" to generate transactions.</p>
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg"
                      data-testid={`transaction-${tx.type}-${tx.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-green-900/30 rounded-full flex items-center justify-center`}>
                          <tx.Icon className={`w-4 h-4 ${tx.iconColor}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {tx.type === "join"
                              ? "Join Sacco"
                              : `${tx.type} ${tx.type === "deposit" || tx.type === "withdraw" ? "cBTC" : "USDC"}`}
                          </p>
                          <p className="text-xs text-neutral-400">{tx.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tx.amount}</p>
                        <p className={`text-xs ${tx.statusColor} capitalize`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analytics Panel */}
          <Card id="analytics-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Platform Analytics</CardTitle>
              <Button variant="link" className="text-bitcoin p-0">
                Details
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                  <span className="dark:text-neutral-400 text-black">Utilization Rate</span>
                  <span
                    className="font-semibold text-bitcoin"
                    data-testid="text-utilization-rate"
                  >
                    {treasuryStats.utilizationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                  <span className="dark:text-neutral-400 text-black">
                    Current Interest Rate
                  </span>
                  <span
                    className="font-semibold text-green-400"
                    data-testid="text-interest-rate"
                  >
                    5.2% APR
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                  <span className="dark:dark:text-neutral-400 text-black">
                    Your Collateral Ratio
                  </span>
                  <span
                    className="font-semibold text-blue-400"
                    data-testid="text-collateral-ratio"
                  >
                    300%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg">
                  <span className="dark:text-neutral-400 text-black">Treasury Balance</span>
                  <span
                    className="font-semibold"
                    data-testid="text-treasury-balance"
                  >
                    2.4M USDC
                  </span>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="dark:text-green-400 text-green-900 text-sm font-medium">
                      Health Factor
                    </span>
                    <span
                      className="dark:text-green-400 text-green-900 font-bold"
                      data-testid="text-health-factor"
                    >
                      2.1
                    </span>
                  </div>
                  <p className="text-xs dark:text-green-400/70  text-green-900/70 mt-1">
                    Safe position
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleWelcomeModalClose}
        onJoinSacco={handleJoinSacco}
      />
      <OnboardingModal
        isOpen={activeModal === "onboarding"}
        onClose={() => setActiveModal(null)}
      />
      <DepositModal
        isOpen={activeModal === "deposit"}
        onClose={() => setActiveModal(null)}
        contractAddress={CONTRACT_ADDRESSES.MICRO_SACCO}
      />
      <WithdrawModal
        isOpen={activeModal === "withdraw"}
        onClose={() => setActiveModal(null)}
        contractAddress={CONTRACT_ADDRESSES.MICRO_SACCO}
      />
      <BorrowModal
        isOpen={activeModal === "borrow"}
        onClose={() => setActiveModal(null)}
        contractAddress={CONTRACT_ADDRESSES.MICRO_SACCO}
        memberData={memberData}
      />
      <RepayModal
        isOpen={activeModal === "repay"}
        onClose={() => setActiveModal(null)}
        contractAddress={CONTRACT_ADDRESSES.MICRO_SACCO}
      />
      <FundTreasuryModal
        isOpen={activeModal === "fund-treasury"}
        onClose={() => setActiveModal(null)}
      />

      {/* Dashboard Tour */}
      <DashboardTour
        isOpen={showDashboardTour}
        onClose={() => setShowDashboardTour(false)}
      />
    </section>
  );
}
