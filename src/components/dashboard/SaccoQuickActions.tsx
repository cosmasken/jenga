import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Share, 
  UserPlus, 
  Wallet, 
  CreditCard, 
  Shield, 
  FileText, 
  Vote,
  TrendingUp,
  ArrowRight,
  Building2
} from 'lucide-react';
import { useSacco } from '../../hooks/useSacco';
import { useAccount } from 'wagmi';
import { PurchaseSharesModal } from '../modals/PurchaseSharesModal';
import { ProposeMembershipModal } from '../modals/ProposeMembershipModal';
import { DepositSavingsModal } from '../modals/DepositSavingsModal';
import { RequestLoanModal } from '../modals/RequestLoanModal';
import { ProvideGuaranteeModal } from '../modals/ProvideGuaranteeModal';
import { CreateProposalModal } from '../modals/CreateProposalModal';

export const SaccoQuickActions: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [isPurchaseSharesModalOpen, setIsPurchaseSharesModalOpen] = useState(false);
  const [isProposeMembershipModalOpen, setIsProposeMembershipModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isProvideGuaranteeModalOpen, setIsProvideGuaranteeModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  const { 
    useGetMemberInfo,
    useMinimumShares,
    useSharePrice,
    useTotalProposals, 
    useNextLoanId,
    useSavings,
    useIsBoardMember,
    useGetActiveBoardMembersCount,
    useGetActiveBidsCount 
  } = useSacco();

  const { data: memberInfo } = useGetMemberInfo(address!);
  const { data: minimumShares } = useMinimumShares();
  const { data: sharePrice } = useSharePrice();
  const { data: totalProposals } = useTotalProposals();
  const { data: nextLoanId } = useNextLoanId();
  const { data: memberSavings } = useSavings(address!);
  const { data: isBoardMember } = useIsBoardMember(address || '0x');
  const { data: activeBoardCount } = useGetActiveBoardMembersCount();
  const { data: activeBidsCount } = useGetActiveBidsCount();

  // Check if user is a member based on shares owned
  const isMember = memberInfo && memberInfo[0] > 0; // memberInfo[0] is shares
  const memberShares = memberInfo ? String(memberInfo[0]) : '0';
  const isActive = memberInfo ? memberInfo[3] : false; // memberInfo[3] is isActive

  type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

  const quickActions = [
    {
      id: 'purchase-shares',
      title: 'Purchase Shares',
      description: 'Buy SACCO shares to become a member',
      icon: Share,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
      action: () => setIsPurchaseSharesModalOpen(true),
      disabled: !isConnected || isMember,
      badge: !isMember ? `${minimumShares ? String(minimumShares) : '1'} shares min` : `${memberShares} shares`,
      badgeVariant: (!isMember ? 'default' : 'secondary') as BadgeVariant,
    },
    {
      id: 'deposit-savings',
      title: 'Deposit Savings',
      description: 'Add funds to your SACCO savings account',
      icon: Wallet,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      action: () => setIsDepositModalOpen(true),
      disabled: !isConnected || !isMember || !isActive,
      badge: memberSavings ? `${String(memberSavings)} BTC` : 'No savings',
      badgeVariant: 'outline' as BadgeVariant,
    },
    {
      id: 'request-loan',
      title: 'Request Loan',
      description: 'Apply for a loan from the SACCO',
      icon: CreditCard,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      action: () => setIsLoanModalOpen(true),
      disabled: !isConnected || !isMember || !isActive,
      badge: `Loan #${nextLoanId ? String(nextLoanId) : '1'}`,
      badgeVariant: 'outline' as BadgeVariant,
    },
    {
      id: 'propose-member',
      title: 'Propose Member',
      description: 'Nominate someone for SACCO membership',
      icon: UserPlus,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      action: () => setIsProposeMembershipModalOpen(true),
      disabled: !isConnected || !isMember || !isActive,
      badge: 'Democratic',
      badgeVariant: 'outline' as BadgeVariant,
    },
    {
      id: 'provide-guarantee',
      title: 'Provide Guarantee',
      description: 'Help a member by guaranteeing their loan',
      icon: Shield,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      action: () => setIsProvideGuaranteeModalOpen(true),
      disabled: !isConnected || !isMember || !isActive,
      badge: 'Community',
      badgeVariant: 'outline' as BadgeVariant,
    },
    {
      id: 'create-proposal',
      title: 'Create Proposal',
      description: 'Submit a governance proposal to vote on',
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
      action: () => setIsProposalModalOpen(true),
      disabled: !isConnected || !isMember || !isActive,
      badge: `${totalProposals ? String(totalProposals) : '0'} total`,
      badgeVariant: 'outline' as BadgeVariant,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            <CardTitle>SACCO Quick Actions</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = '/sacco'}
            className="text-orange-500 hover:text-orange-600"
          >
            View Full Dashboard
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <CardDescription>
          {isMember 
            ? (
                <div className="space-y-1">
                  <div>You own {memberShares} shares. {isBoardMember ? '🏛️ Board Member' : 'Member'}</div>
                  <div className="text-xs text-gray-500">
                    Board: {String(activeBoardCount || 0)}/3 members • Active Bids: {String(activeBidsCount || 0)}
                  </div>
                </div>
              )
            : `Purchase at least ${minimumShares ? String(minimumShares) : '1'} shares to join the SACCO and access all features.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Connect your wallet to access SACCO features
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <div
                key={action.id}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                  action.disabled
                    ? 'border-gray-200 dark:border-gray-700 opacity-60'
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 cursor-pointer hover:shadow-md'
                }`}
                onClick={action.disabled ? undefined : action.action}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <Badge variant={action.badgeVariant} className="text-xs">
                    {action.badge}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {action.description}
                </p>
                {action.disabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 rounded-lg">
                    <span className="text-xs text-gray-500 font-medium">
                      {!isConnected ? 'Connect wallet' : !isMember ? 'Buy shares first' : !isActive ? 'Account inactive' : 'Not available'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

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
    </Card>
  );
};
