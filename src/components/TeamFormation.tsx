import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  UserPlus, 
  Share2, 
  Copy, 
  CheckCircle, 
  Clock,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Zap,
  QrCode
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGetAllChamas } from '@/hooks/useJengaContract';
import { SmartContributeButton } from './SmartContributeButton';

interface TeamFormationProps {
  onCreateChama?: () => void;
  onJoinChama?: (chamaId: bigint) => void;
  onContribute?: (chamaId: bigint) => void;
}

export const TeamFormation: React.FC<TeamFormationProps> = ({
  onCreateChama,
  onJoinChama,
  onContribute
}) => {
  const { address } = useAccount();
  const [shareableLink, setShareableLink] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedChamaId, setSelectedChamaId] = useState<bigint | null>(null);

  // Get all chamas to show team formation opportunities
  const { data: allChamas = [], isLoading } = useGetAllChamas();

  // Categorize chamas for team formation
  const categorizeChamas = () => {
    const myChamas = [];
    const joinableChamas = [];
    const activeChamas = [];

    for (const chama of allChamas) {
      const members = Array.isArray(chama.members) ? chama.members : [];
      const memberCount = members.length;
      const maxMembers = Number(chama.maxMembers) || 0;
      const isUserMember = address && members.includes(address);
      const isFull = memberCount >= maxMembers;
      const hasStarted = Number(chama.currentCycle) > 0;

      if (isUserMember) {
        if (hasStarted) {
          activeChamas.push(chama);
        } else {
          myChamas.push(chama);
        }
      } else if (!isFull && chama.active) {
        joinableChamas.push(chama);
      }
    }

    return { myChamas, joinableChamas, activeChamas };
  };

  const { myChamas, joinableChamas, activeChamas } = categorizeChamas();

  const generateShareableLink = (chamaId: bigint) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}?join=${chamaId.toString()}`;
    setShareableLink(link);
    setSelectedChamaId(chamaId);
    setShowInviteModal(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-blue-500" />
          Team Savings Circles
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Form teams, contribute together, and take turns receiving payouts
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-dashed border-2 border-blue-300 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={onCreateChama}>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Start New Team</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a savings circle and invite your friends
            </p>
            <Button className="w-full">
              Create Chama
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed border-2 border-green-300 hover:border-green-500 transition-colors">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Join Existing Team</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Browse and join teams that need members
            </p>
            <Badge variant="outline" className="text-xs">
              {joinableChamas.length} teams recruiting
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Active Chamas - Where user needs to contribute */}
      {activeChamas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Your Active Chamas
            <Badge className="bg-yellow-100 text-yellow-800">{activeChamas.length}</Badge>
          </h3>
          
          <div className="grid gap-4">
            {activeChamas.map(chama => {
              const members = Array.isArray(chama.members) ? chama.members : [];
              const currentCycle = Number(chama.currentCycle);
              
              return (
                <Card key={chama.id.toString()} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{chama.name}</CardTitle>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Cycle {currentCycle}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <SmartContributeButton
                      chamaId={chama.id}
                      onContribute={() => onContribute?.(chama.id)}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* My Chamas - Recruiting phase */}
      {myChamas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            My Teams (Recruiting)
            <Badge variant="outline">{myChamas.length}</Badge>
          </h3>
          
          <div className="grid gap-4">
            {myChamas.map(chama => {
              const members = Array.isArray(chama.members) ? chama.members : [];
              const memberCount = members.length;
              const maxMembers = Number(chama.maxMembers) || 0;
              const progress = (memberCount / maxMembers) * 100;
              const isCreator = members[0] === address;
              
              return (
                <Card key={chama.id.toString()}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {chama.name}
                        {isCreator && <Badge variant="outline" className="text-xs">Creator</Badge>}
                      </CardTitle>
                      <Badge variant="outline">
                        {memberCount}/{maxMembers} members
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Member Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Team Formation</span>
                        <span>{memberCount}/{maxMembers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Invite Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateShareableLink(chama.id)}
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Invite Members
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`Join my savings circle: ${window.location.origin}?join=${chama.id}`)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Member List */}
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Current Members:</div>
                      {members.map((member, index) => (
                        <div key={member} className="flex items-center gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>{member === address ? 'You' : `Member ${index + 1}`}</span>
                          <span className="text-gray-500 font-mono text-xs">
                            {member.slice(0, 6)}...{member.slice(-4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Joinable Chamas */}
      {joinableChamas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-500" />
            Teams Looking for Members
            <Badge variant="outline">{joinableChamas.length}</Badge>
          </h3>
          
          <div className="grid gap-4">
            {joinableChamas.map(chama => {
              const members = Array.isArray(chama.members) ? chama.members : [];
              const memberCount = members.length;
              const maxMembers = Number(chama.maxMembers) || 0;
              const contributionAmount = Number(chama.contributionAmount) / 1e10; // Convert from wei to sats
              const cycleDuration = Number(chama.cycleDuration);
              
              const formatDuration = (seconds: number) => {
                if (seconds >= 86400) return `${Math.floor(seconds / 86400)} days`;
                if (seconds >= 3600) return `${Math.floor(seconds / 3600)} hours`;
                return `${Math.floor(seconds / 60)} minutes`;
              };
              
              return (
                <Card key={chama.id.toString()} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{chama.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">
                        {maxMembers - memberCount} spots left
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Chama Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span>{contributionAmount.toLocaleString()} sats/round</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{formatDuration(cycleDuration)} cycles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{memberCount}/{maxMembers} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{formatTimeAgo(chama.lastCycleTimestamp)}</span>
                      </div>
                    </div>

                    {/* Join Button */}
                    <Button
                      onClick={() => onJoinChama?.(chama.id)}
                      className="w-full"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Join Team ({contributionAmount.toLocaleString()} sats collateral)
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {myChamas.length === 0 && joinableChamas.length === 0 && activeChamas.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by creating your first savings circle or joining an existing one
            </p>
            <Button onClick={onCreateChama}>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Invite Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Shareable Link:</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(shareableLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Alert>
                <QrCode className="h-4 w-4" />
                <AlertDescription>
                  Share this link with friends to invite them to your savings circle. 
                  They'll need to connect their wallet and deposit collateral to join.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    copyToClipboard(shareableLink);
                    setShowInviteModal(false);
                  }}
                  className="flex-1"
                >
                  Copy & Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
