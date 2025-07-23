import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RegisterMemberModal } from '../components/modals/RegisterMemberModal';
import { useSacco } from '../hooks/useSacco';
import { Loader2 } from 'lucide-react';

export default function SaccoDashboard() {
  const { t } = useTranslation();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">{t('sacco.dashboard.actions')}</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setIsRegisterModalOpen(true)} className="btn-primary">
            {t('sacco.actions.registerMember')}
          </Button>
          {/* Add more buttons for other SACCO actions here */}
        </div>
      </div>

      <RegisterMemberModal
        open={isRegisterModalOpen}
        onOpenChange={setIsRegisterModalOpen}
      />
    </div>
  );
};
