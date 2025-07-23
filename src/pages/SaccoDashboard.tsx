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
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SACCO Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isMember 
            ? `Welcome back! You own ${memberShares} shares and joined on ${joinDate?.toLocaleDateString()}`
            : 'Purchase shares to become a SACCO member and access all features'
          }
        </p>
      </div>

      {/* Membership Status Alert */}
      {!isConnected ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access SACCO features.
          </AlertDescription>
        </Alert>
      ) : !isMember ? (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                You need to purchase at least {minimumShares ? String(minimumShares) : '1'} shares to become a SACCO member.
                {sharePrice && ` Each share costs ${String(sharePrice)} ETH.`}
              </span>
              <Button 
                onClick={() => setIsPurchaseSharesModalOpen(true)}
                size="sm"
              >
                Buy Shares
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : !isActive ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your SACCO membership is currently inactive. Please contact an administrator.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Member Info Card */}
        {isMember && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Your Membership
              </CardTitle>
              <CardDescription>Your SACCO membership details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Shares Owned</p>
                  <p className="text-2xl font-bold text-blue-600">{memberShares}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Savings Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    {memberSavings ? String(memberSavings) : '0'} ETH
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="text-sm font-medium">{joinDate?.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-sm font-medium ${
                    isActive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Total Proposals
            </CardTitle>
            <CardDescription>Community governance proposals</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingTotalProposals ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            ) : (
              <span className="text-2xl font-bold">{totalProposals ? String(totalProposals) : '0'}</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Loan Interest
            </CardTitle>
            <CardDescription>Current loan interest rate</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLoanInterestRate ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            ) : (
              <span className="text-2xl font-bold">{loanInterestRate ? String(loanInterestRate) : '0'}%</span>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Member Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">
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
          <h2 className="text-2xl font-semibold mb-4">Community Actions</h2>
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
          <h2 className="text-2xl font-semibold mb-4">Governance Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16 flex items-center justify-center gap-3"
              variant="outline"
              disabled
            >
              <Vote className="w-5 h-5" />
              <span>Vote on Proposals</span>
            </Button>
            
            <Button 
              className="h-16 flex items-center justify-center gap-3"
              variant="outline"
              disabled
            >
              <TrendingUp className="w-5 h-5" />
              <span>Distribute Dividends</span>
            </Button>
            
            <Button 
              className="h-16 flex items-center justify-center gap-3"
              variant="outline"
              disabled
            >
              <FileText className="w-5 h-5" />
              <span>Execute Proposal</span>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Advanced governance features coming soon. Board of directors system will be implemented.
          </p>
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
