import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Clock, 
  Coins, 
  Search,
  RefreshCw,
  UserPlus,
  DollarSign,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  TrendingUp
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { useGetAllChamas, formatSatsFromWei } from '@/hooks/useJengaContract';
import { Address } from 'viem';

interface AllChamasBrowserProps {
  onJoinChama?: (chamaId: bigint) => void;
  onContribute?: (chamaId: bigint) => void;
}

export const AllChamasBrowser: React.FC<AllChamasBrowserProps> = ({
  onJoinChama,
  onContribute
}) => {
  const { address } = useAccount();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'recruiting' | 'active' | 'completed'>('all');

  // Get all chamas from contract
  const { data: chamas = [], isLoading, refetch } = useGetAllChamas();

  // Filter and search chamas
  const filteredChamas = chamas.filter(chama => {
    const matchesSearch = chama.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Safely get members array
    const members = Array.isArray(chama.members) ? chama.members : [];
    const memberCount = members.length;
    const maxMembers = Number(chama.maxMembers) || 0;
    const isFull = memberCount >= maxMembers;

    switch (filterStatus) {
      case 'recruiting':
        return chama.active && !isFull;
      case 'active':
        return chama.active && isFull;
      case 'completed':
        return !chama.active;
      default:
        return true;
    }
  });

  const getChamaStatus = (chama: any) => {
    // Safely get members array
    const members = Array.isArray(chama.members) ? chama.members : [];
    const memberCount = members.length;
    const maxMembers = Number(chama.maxMembers) || 0;
    const isFull = memberCount >= maxMembers;
    const hasStarted = Number(chama.currentCycle) > 0;
    const isUserMember = address && members.includes(address);

    if (!chama.active) {
      return {
        status: 'Completed',
        color: 'bg-gray-500',
        icon: CheckCircle,
        canJoin: false,
        canContribute: false,
        description: 'This chama has completed all cycles'
      };
    }

    if (!isFull) {
      return {
        status: 'Recruiting',
        color: 'bg-blue-500',
        icon: Users,
        canJoin: !isUserMember,
        canContribute: false,
        description: `${maxMembers - memberCount} more members needed`
      };
    }

    if (isFull && !hasStarted) {
      return {
        status: 'Ready to Start',
        color: 'bg-yellow-500',
        icon: PlayCircle,
        canJoin: false,
        canContribute: false,
        description: 'Full - waiting to start first cycle'
      };
    }

    return {
      status: 'Active',
      color: 'bg-green-500',
      icon: TrendingUp,
      canJoin: false,
      canContribute: isUserMember,
      description: `Cycle ${Number(chama.currentCycle)} - contributions open`
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Chamas</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Chamas</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and join savings circles
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refetch}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search chamas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'recruiting', 'active', 'completed'] as const).map(status => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{chamas.length}</div>
            <div className="text-sm text-gray-600">Total Chamas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {chamas.filter(c => {
                const members = Array.isArray(c.members) ? c.members : [];
                const memberCount = members.length;
                const maxMembers = Number(c.maxMembers) || 0;
                return c.active && memberCount < maxMembers;
              }).length}
            </div>
            <div className="text-sm text-gray-600">Recruiting</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {chamas.filter(c => {
                const members = Array.isArray(c.members) ? c.members : [];
                const memberCount = members.length;
                const maxMembers = Number(c.maxMembers) || 0;
                return c.active && memberCount >= maxMembers;
              }).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {chamas.filter(c => {
                const members = Array.isArray(c.members) ? c.members : [];
                return address && members.includes(address);
              }).length}
            </div>
            <div className="text-sm text-gray-600">Your Chamas</div>
          </CardContent>
        </Card>
      </div>

      {/* Chama List */}
      <div className="space-y-4">
        {filteredChamas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'No chamas match your search' : 'No chamas found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredChamas.map(chama => {
            const status = getChamaStatus(chama);
            const StatusIcon = status.icon;
            
            // Safely get members array
            const members = Array.isArray(chama.members) ? chama.members : [];
            const memberCount = members.length;
            const maxMembers = Number(chama.maxMembers) || 0;
            const memberProgress = maxMembers > 0 ? (memberCount / maxMembers) * 100 : 0;
            const isUserMember = address && members.includes(address);

            return (
              <Card key={chama.id.toString()} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {chama.name}
                        {isUserMember && (
                          <Badge variant="outline" className="text-xs">
                            Member
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`${status.color} text-white`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {status.description}
                  </p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Member Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <span className="font-medium">{memberCount}/{maxMembers}</span>
                    </div>
                    <Progress value={memberProgress} className="h-2" />
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        <span>Per Round</span>
                      </div>
                      <span className="font-mono">
                        {formatSatsFromWei(chama.contributionAmount).toLocaleString()} sats
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Cycle</span>
                      </div>
                      <span>
                        {(() => {
                          const duration = Number(chama.cycleDuration);
                          if (duration >= 86400) {
                            return `${Math.floor(duration / 86400)}d`;
                          } else if (duration >= 3600) {
                            return `${Math.floor(duration / 3600)}h`;
                          } else {
                            return `${Math.floor(duration / 60)}m`;
                          }
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {status.canJoin && (
                      <Button 
                        onClick={() => onJoinChama?.(chama.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Join Chama
                      </Button>
                    )}
                    
                    {status.canContribute && (
                      <Button 
                        onClick={() => onContribute?.(chama.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Contribute Now
                      </Button>
                    )}
                    
                    {!status.canJoin && !status.canContribute && (
                      <div className="flex-1 text-center py-2 text-sm text-gray-500">
                        {status.status === 'Completed' ? 'Completed' :
                         status.status === 'Ready to Start' ? 'Waiting to start' :
                         isUserMember ? 'No action needed' : 'Cannot join'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
