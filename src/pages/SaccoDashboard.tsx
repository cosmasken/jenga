import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterMemberModal } from '../components/modals/RegisterMemberModal';
import { PurchaseSharesModal } from '../components/modals/PurchaseSharesModal';
import { ProposeMembershipModal } from '../components/modals/ProposeMembershipModal';
import { DepositSavingsModal } from '../components/modals/DepositSavingsModal';
import { RequestLoanModal } from '../components/modals/RequestLoanModal';
import { ProvideGuaranteeModal } from '../components/modals/ProvideGuaranteeModal';
import { CreateProposalModal } from '../components/modals/CreateProposalModal';
import { useSacco } from '../hooks/useSacco';
import { Loader2, UserPlus, Wallet, CreditCard, FileText, Vote, TrendingUp, Share, Shield } from 'lucide-react';

export default function SaccoDashboard() {
  const { t } = useTranslation();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPurchaseSharesModalOpen, setIsPurchaseSharesModalOpen] = useState(false);
  const [isProposeMembershipModalOpen, setIsProposeMembershipModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isProvideGuaranteeModalOpen, setIsProvideGuaranteeModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const { useTotalProposals, useNextLoanId, useLoanInterestRate, useOwner } = useSacco();

  const { data: totalProposals, isLoading: isLoadingTotalProposals } = useTotalProposals();
  const { data: nextLoanId, isLoading: isLoadingNextLoanId } = useNextLoanId();
  const { data: loanInterestRate, isLoading: isLoadingLoanInterestRate } = useLoanInterestRate();
  const { data: owner, isLoading: isLoadingOwner } = useOwner();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('sacco.dashboard.title')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('sacco.dashboard.totalProposals')}</CardTitle>
            <CardDescription>{t('sacco.dashboard.totalProposalsDescription')}</CardDescription>
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
            <CardTitle>{t('sacco.dashboard.nextLoanId')}</CardTitle>
            <CardDescription>{t('sacco.dashboard.nextLoanIdDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingNextLoanId ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            ) : (
              <span className="text-2xl font-bold">{nextLoanId ? String(nextLoanId) : '0'}</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sacco.dashboard.loanInterestRate')}</CardTitle>
            <CardDescription>{t('sacco.dashboard.loanInterestRateDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingLoanInterestRate ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            ) : (
              <span className="text-2xl font-bold">{loanInterestRate ? String(loanInterestRate) : '0'}%</span>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('sacco.dashboard.owner')}</CardTitle>
            <CardDescription>{t('sacco.dashboard.ownerDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOwner ? (
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            ) : (
              <span className="text-sm font-mono break-all">{owner ? String(owner) : 'N/A'}</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Member Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Member Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={() => setIsPurchaseSharesModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
          >
            <Share className="w-6 h-6" />
            <span>Purchase Shares</span>
          </Button>
          
          <Button 
            onClick={() => setIsProposeMembershipModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <UserPlus className="w-6 h-6" />
            <span>Propose Member</span>
          </Button>
          
          <Button 
            onClick={() => setIsDepositModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Wallet className="w-6 h-6" />
            <span>Deposit Savings</span>
          </Button>
          
          <Button 
            onClick={() => setIsLoanModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <CreditCard className="w-6 h-6" />
            <span>Request Loan</span>
          </Button>
        </div>
      </div>

      {/* Loan & Guarantee Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Loan & Guarantee Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            onClick={() => setIsProvideGuaranteeModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <Shield className="w-6 h-6" />
            <span>Provide Guarantee</span>
          </Button>
          
          <Button 
            onClick={() => setIsProposalModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <FileText className="w-6 h-6" />
            <span>Create Proposal</span>
          </Button>
          
          <Button 
            onClick={() => setIsRegisterModalOpen(true)} 
            className="btn-primary h-20 flex flex-col items-center justify-center gap-2"
            variant="outline"
          >
            <UserPlus className="w-6 h-6" />
            <span>Legacy Register</span>
          </Button>
        </div>
      </div>

      {/* Governance Actions Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('sacco.dashboard.governance')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="btn-secondary h-16 flex items-center justify-center gap-3"
            variant="outline"
            disabled
          >
            <Vote className="w-5 h-5" />
            <span>{t('sacco.actions.vote')}</span>
          </Button>
          
          <Button 
            className="btn-secondary h-16 flex items-center justify-center gap-3"
            variant="outline"
            disabled
          >
            <TrendingUp className="w-5 h-5" />
            <span>{t('sacco.actions.distributeDividends')}</span>
          </Button>
          
          <Button 
            className="btn-secondary h-16 flex items-center justify-center gap-3"
            variant="outline"
            disabled
          >
            <FileText className="w-5 h-5" />
            <span>{t('sacco.actions.executeProposal')}</span>
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {t('sacco.dashboard.governanceNote')}
        </p>
      </div>

      {/* Modals */}
      <RegisterMemberModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
      />
      
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
