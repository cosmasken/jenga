import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PurchaseSharesModal } from '../components/modals/PurchaseSharesModal';
import { ProposeMembershipModal } from '../components/modals/ProposeMembershipModal';
import { DepositSavingsModal } from '../components/modals/DepositSavingsModal';
import { RequestLoanModal } from '../components/modals/RequestLoanModal';
import { ProvideGuaranteeModal } from '../components/modals/ProvideGuaranteeModal';
import { CreateProposalModal } from '../components/modals/CreateProposalModal';
import { BoardManagement } from '../components/dashboard/BoardManagement';
import { useSacco } from '../hooks/useSacco';
import { useAccount } from 'wagmi';
import { Loader2, UserPlus, Wallet, CreditCard, FileText, Vote, TrendingUp, Share, Shield, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SaccoDashboard() {
  const { t } = useTranslation();
  const { address, isConnected } = useAccount();
  const [isPurchaseSharesModalOpen, setIsPurchaseSharesModalOpen] = useState(false);
  const [isProposeMembershipModalOpen, setIsProposeMembershipModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isProvideGuaranteeModalOpen, setIsProvideGuaranteeModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const { 
    useTotalProposals, 
    useNextLoanId, 
    useLoanInterestRate, 
    useOwner,
    useGetMemberInfo,
    useMinimumShares,
    useSharePrice,
    useSavings
  } = useSacco();

  const { data: totalProposals, isLoading: isLoadingTotalProposals } = useTotalProposals();
  const { data: nextLoanId, isLoading: isLoadingNextLoanId } = useNextLoanId();
  const { data: loanInterestRate, isLoading: isLoadingLoanInterestRate } = useLoanInterestRate();
  const { data: owner, isLoading: isLoadingOwner } = useOwner();
  const { data: memberInfo } = useGetMemberInfo(address!);
  const { data: minimumShares } = useMinimumShares();
  const { data: sharePrice } = useSharePrice();
  const { data: memberSavings } = useSavings(address!);

  // Check membership status
  const isMember = memberInfo && memberInfo[0] > 0; // memberInfo[0] is shares
  const memberShares = memberInfo ? String(memberInfo[0]) : '0';
  const isActive = memberInfo ? memberInfo[3] : false; // memberInfo[3] is isActive
  const joinDate = memberInfo ? new Date(Number(memberInfo[2]) * 1000) : null; // memberInfo[2] is joinDate

  return (
    <div className="container mx-auto p-4 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">SACCO Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isMember 
            ? `Welcome back! You own ${memberShares} shares and joined on ${joinDate?.toLocaleDateString()}`
            : 'Purchase shares to become a SACCO member and access all features'
          }
        </p>
      </div>

      {/* Membership Status Alert */}
      {!isConnected ? (
        <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            Please connect your wallet to access SACCO features.
          </AlertDescription>
        </Alert>
      ) : !isMember ? (
        <Alert className="mb-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            <div className="flex items-center justify-between">
              <span>
                You need to purchase at least {minimumShares ? String(minimumShares) : '1'} shares to become a SACCO member.
                {sharePrice && ` Each share costs ${String(sharePrice)} BTC.`}
              </span>
              <Button 
                onClick={() => setIsPurchaseSharesModalOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Buy Shares
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !isActive ? (
        <Alert variant="destructive" className="mb-6 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            Your SACCO membership is currently inactive. Please contact an administrator.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Member Info Card */}
        {isMember && (
          <Card className="md:col-span-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <UserPlus className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Your Membership
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Your SACCO membership details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Shares Owned</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{memberShares}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Savings Balance</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {memberSavings ? String(memberSavings) : '0'} BTC
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{joinDate?.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Vote className="h-5 w-5 text-purple-500 dark:text-purple-400" />
              Total Proposals
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Community governance proposals</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTotalProposals ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500 dark:text-orange-400" />
            ) : (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalProposals ? String(totalProposals) : '0'}</span>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <CreditCard className="h-5 w-5 text-green-500 dark:text-green-400" />
              Loan Interest
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Current loan interest rate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLoanInterestRate ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500 dark:text-orange-400" />
            ) : (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{loanInterestRate ? String(loanInterestRate) : '0'}%</span>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Member Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
          {isMember ? 'Member Actions' : 'Get Started'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => setIsPurchaseSharesModalOpen(true)} 
            className="h-20 flex flex-col items-center justify-center gap-2"
            disabled={!isConnected || isMember}
            variant={!isMember ? 'default' : 'outline'}
          >
            <Share className="w-6 h-6" />
            <span>{isMember ? `${memberShares} Shares Owned` : 'Purchase Shares'}</span>
          </Button>
          
          <Button 
            onClick={() => setIsProposeMembershipModalOpen(true)} 
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
            disabled={!isConnected || !isMember || !isActive}
          >
            <UserPlus className="w-6 h-6" />
            <span>Propose Member</span>
          </Button>
          
          <Button 
            onClick={() => setIsDepositModalOpen(true)} 
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
            disabled={!isConnected || !isMember || !isActive}
          >
            <Wallet className="w-6 h-6" />
            <span>Deposit Savings</span>
          </Button>
          
          <Button 
            onClick={() => setIsLoanModalOpen(true)} 
            className="h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
            disabled={!isConnected || !isMember || !isActive}
          >
            <CreditCard className="w-6 h-6" />
            <span>Request Loan</span>
          </Button>
        </div>
      </div>

      {/* Community Actions */}
      {isMember && isActive && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Community Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => setIsProvideGuaranteeModalOpen(true)} 
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <Shield className="w-6 h-6" />
              <span>Provide Guarantee</span>
            </Button>
            
            <Button 
              onClick={() => setIsProposalModalOpen(true)} 
              className="h-20 flex flex-col items-center justify-center gap-2"
              variant="outline"
            >
              <FileText className="w-6 h-6" />
              <span>Create Proposal</span>
            </Button>
          </div>
        </div>
      )}

      {/* Governance Actions Section */}
      {isMember && isActive && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Governance Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          </div>
          
          {/* Board Management Section */}
          <BoardManagement />
        </div>
      )}

      {/* Modals */}
      
      <PurchaseSharesModal
        open={isPurchaseSharesModalOpen}
        onOpenChange={setIsPurchaseSharesModalOpen}
      />
      
      <ProposeMembershipModal
        open={isProposeMembershipModalOpen}
        onOpenChange={setIsProposeMembershipModalOpen}
      />
      
      <DepositSavingsModal
        open={isDepositModalOpen}
        onOpenChange={setIsDepositModalOpen}
      />
      
      <RequestLoanModal
        open={isLoanModalOpen}
        onOpenChange={setIsLoanModalOpen}
      />
      
      <ProvideGuaranteeModal
        open={isProvideGuaranteeModalOpen}
        onOpenChange={setIsProvideGuaranteeModalOpen}
      />
      
      <CreateProposalModal
        open={isProposalModalOpen}
        onOpenChange={setIsProposalModalOpen}
      />
    </div>
  );
};
