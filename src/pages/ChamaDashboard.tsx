import { useParams } from 'wouter';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useChamaStateIntegrated } from '@/hooks/useChamaStateIntegrated';
import { BITCOIN_PRICE_USD } from '@/utils/constants';
import { convertCBTCToUSD, formatCurrency } from '@/config';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Banner } from '@/components/ui/banner';
import { Countdown } from '@/components/ui/countdown';
import { MemberList } from '@/components/ui/member-list';
import { EmptyStateCard } from '@/components/ui/empty-state-card';
import { DollarSign, Users, Copy, RefreshCw, Share2 } from 'lucide-react';
import { type Address } from 'viem';

export default function ChamaDashboard() {
  const params = useParams();
  const { primaryWallet } = useDynamicContext();

  const chamaAddress = (params.address || '0xabcdef1234567890abcdef1234567890abcdef12') as Address;
  const { chamaData, uiConfig, countdown, isLoading, error, actions } = useChamaStateIntegrated(chamaAddress, primaryWallet?.address as Address | null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-bitcoin border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300">Loading chama data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyStateCard
          title="Error Loading Chama"
          description={error}
          variant="error"
          action={{
            text: "Retry",
            onClick: actions.refresh,
          }}
        />
      </div>
    );
  }

  if (!chamaData || !uiConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyStateCard
          title="Chama Not Found"
          description="The requested chama could not be found or loaded."
          variant="empty"
        />
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const shareChama = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Join ${chamaData.name || 'this chama'}`,
        text: `Join my savings circle on Citrea!`,
        url: url,
      });
    } else {
      copyToClipboard(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-bg via-dark-gray to-dark-bg">
      <Header title={chamaData.name || 'Chama Dashboard'} />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Banner */}
        <Banner variant={uiConfig.bannerVariant} className="mb-6">
          <div className="flex items-center justify-between w-full">
            <div>
              <h3 className="font-bold">{uiConfig.bannerTitle}</h3>
              <p className="text-sm opacity-90">{uiConfig.bannerMessage}</p>
            </div>
            {countdown && (
              <div className="text-right">
                <Countdown 
                  targetDate={countdown.targetDate}
                  label={countdown.label}
                  variant="compact"
                />
              </div>
            )}
          </div>
        </Banner>

        {/* Chama Info Card */}
        <div className="glassmorphism p-6 rounded-lg border border-bitcoin/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-orbitron font-bold text-white">
              {chamaData.name || 'Unnamed Chama'}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(chamaAddress)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy Address
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareChama}
                className="border-electric/50 text-electric hover:bg-electric/10"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={actions.refresh}
                className="border-bitcoin/50 text-bitcoin hover:bg-bitcoin/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-dark-gray/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-bitcoin mr-2" />
                <span className="text-sm text-gray-400">Members</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {chamaData.memberCount}/{chamaData.memberTarget}
              </div>
            </div>

            <div className="text-center p-4 bg-dark-gray/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-5 h-5 text-electric mr-2" />
                <span className="text-sm text-gray-400">Contribution</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(chamaData.contributionAmount, chamaData.tokenSymbol)}
              </div>
              <div className="text-xs text-gray-400">
                ≈ ${convertCBTCToUSD(chamaData.contributionAmount, BITCOIN_PRICE_USD).toFixed(2)}
              </div>
            </div>

            <div className="text-center p-4 bg-dark-gray/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <span className="text-sm text-gray-400">Round</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {chamaData.currentRound}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Member Progress</span>
              <span>{chamaData.memberCount}/{chamaData.memberTarget}</span>
            </div>
            <Progress 
              value={(chamaData.memberCount / chamaData.memberTarget) * 100} 
              className="h-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {uiConfig.showJoinButton && (
              <Button
                onClick={actions.join}
                disabled={actions.isLoading}
                className="flex-1 bg-gradient-to-r from-electric to-blue-600 hover:scale-105 transition-transform font-bold"
              >
                {actions.isLoading ? 'Joining...' : 'Join Chama'}
              </Button>
            )}
            
            {uiConfig.showContributeButton && (
              <Button
                onClick={actions.contribute}
                disabled={actions.isLoading}
                className="flex-1 bg-gradient-to-r from-bitcoin to-orange-600 hover:scale-105 transition-transform font-bold"
              >
                {actions.isLoading ? 'Contributing...' : 'Contribute'}
              </Button>
            )}
            
            {uiConfig.showLeaveButton && (
              <Button
                onClick={actions.leave}
                disabled={actions.isLoading}
                variant="outline"
                className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                {actions.isLoading ? 'Leaving...' : 'Leave Chama'}
              </Button>
            )}
          </div>
        </div>

        {/* Member List */}
        {chamaData.members && chamaData.members.length > 0 && (
          <div className="glassmorphism p-6 rounded-lg border border-bitcoin/30">
            <h3 className="text-lg font-orbitron font-bold text-white mb-4">Members</h3>
            <MemberList 
              members={chamaData.members}
              currentUserAddress={primaryWallet?.address as Address}
              currentRound={chamaData.currentRound}
            />
          </div>
        )}
      </div>
    </div>
  );
}
