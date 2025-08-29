import { useParams } from 'wouter';
import { useHybridChamaData } from '@/hooks/useHybridChamaData';
import { useChamaActions } from '@/hooks/useChamaActions';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  DollarSign, 
  Clock, 
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { useLocation } from 'wouter';

export function HybridChamaDashboard() {
  const params = useParams();
  const chamaId = params.address as string; // Using address param to match existing route
  const [, navigate] = useLocation();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const userAddress = primaryWallet?.address;

  const {
    chama,
    members,
    userMembership,
    currentRound,
    isLoading,
    error,
    accessLevel,
    availableActions,
    userState,
    refresh,
  } = useHybridChamaData(chamaId);

  const {
    join,
    contribute,
    updateStatus,
    isJoining,
    isContributing,
  } = useChamaActions(chamaId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !chama) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </Button>
        <Card className="text-center py-8">
          <CardContent>
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Chama</h3>
            <p className="text-gray-600 mb-4">
              {error?.message || 'Chama not found'}
            </p>
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleJoin = () => {
    if (!userAddress) {
      setShowAuthFlow(true);
      return;
    }
    join(userAddress);
  };

  const handleContribute = () => {
    if (!userAddress) return;
    contribute({
      userAddress,
      amount: chama.contribution_amount,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', className: 'bg-gray-500' },
      recruiting: { label: 'Recruiting', className: 'bg-blue-500' },
      waiting: { label: 'Waiting to Start', className: 'bg-yellow-500' },
      active: { label: 'Active', className: 'bg-green-500' },
      completed: { label: 'Completed', className: 'bg-purple-500' },
      cancelled: { label: 'Cancelled', className: 'bg-red-500' },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={`${config.className} text-white`}>{config.label}</Badge>;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{chama.name}</h1>
          <p className="text-gray-400">{chama.description || 'No description provided'}</p>
          <p className="text-sm text-gray-500 mt-1">
            Created by: {formatAddress(chama.creator_address)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(chama.status)}
          <Button
            onClick={refresh}
            variant="outline"
            size="sm"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 dark:text-green-300">
              Real-time updates active • Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Members</p>
                <p className="text-2xl font-bold text-blue-600">{members.length}/{chama.member_target}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Contribution</p>
                <p className="text-2xl font-bold text-green-600">{chama.contribution_amount} cBTC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Security Deposit</p>
                <p className="text-2xl font-bold text-purple-600">{chama.security_deposit} cBTC</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Round Duration</p>
                <p className="text-2xl font-bold text-orange-600">{chama.round_duration_hours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Members</span>
              <span>{members.length} / {chama.member_target}</span>
            </div>
            <Progress value={(members.length / chama.member_target) * 100} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{chama.member_target} (Full)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Available Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Guest - Connect Wallet */}
            {!userState.isLoggedIn && (
              <Button 
                onClick={() => setShowAuthFlow(true)}
                className="w-full bg-bitcoin hover:bg-bitcoin/90"
              >
                Connect Wallet to Participate
              </Button>
            )}

            {/* Join Action */}
            {availableActions.canJoin && (
              <Button 
                onClick={handleJoin} 
                disabled={isJoining}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isJoining ? 'Joining...' : `Join Chama (${chama.security_deposit} cBTC deposit)`}
              </Button>
            )}

            {/* Contribute Action */}
            {availableActions.canContribute && (
              <Button 
                onClick={handleContribute}
                disabled={isContributing}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isContributing ? 'Contributing...' : `Make Contribution (${chama.contribution_amount} cBTC)`}
              </Button>
            )}

            {/* User Status Display */}
            {userMembership && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Member Status: {userMembership.status}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deposit Status: {userMembership.deposit_status}
                    </p>
                    {userMembership.rounds_contributed > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Contributions: {userMembership.rounds_contributed} rounds
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Current Round Info */}
            {currentRound && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Round {currentRound.round_number} Active
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Contributions: {currentRound.received_contributions} / {currentRound.expected_contributions}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Total Pot: {currentRound.total_pot} cBTC
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No members yet</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      member.status === 'active' ? 'bg-green-500' : 
                      member.status === 'pending' ? 'bg-yellow-500' : 
                      'bg-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {formatAddress(member.user_address)}
                        {member.user_address === chama.creator_address && (
                          <span className="ml-2 text-xs bg-bitcoin text-black px-2 py-1 rounded">Creator</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Joined: {new Date(member.joined_at || member.invited_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">{member.status}</Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {member.deposit_status === 'paid' ? '✅ Deposit Paid' : '⏳ Deposit Pending'}
                    </p>
                    {member.rounds_contributed > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {member.rounds_contributed} contributions
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Information (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info (Development Only)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto max-h-64">
              {JSON.stringify({
                chamaId,
                accessLevel,
                availableActions,
                userState,
                membershipStatus: userMembership?.status,
                depositStatus: userMembership?.deposit_status,
                chamaStatus: chama.status,
                membersCount: members.length,
                currentRound: currentRound ? {
                  id: currentRound.id,
                  number: currentRound.round_number,
                  status: currentRound.status,
                } : null,
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
