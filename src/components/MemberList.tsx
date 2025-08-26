import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MemberStatusIndicator } from './MemberStatusIndicator';
import { 
  Users, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import type { 
  EnhancedMemberList, 
  EnhancedMemberInfo, 
  MembershipStatus,
  MemberDisplayConfig 
} from '@/types/member';

interface MemberListProps {
  memberList: EnhancedMemberList | null;
  isLoading: boolean;
  tokenSymbol: string;
  formatTokenAmount: (amount: bigint) => string;
  onMemberClick?: (member: EnhancedMemberInfo) => void;
  showReadinessIndicator?: boolean;
}

export function MemberList({
  memberList,
  isLoading,
  tokenSymbol,
  formatTokenAmount,
  onMemberClick,
  showReadinessIndicator = true
}: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayConfig, setDisplayConfig] = useState<MemberDisplayConfig>({
    showDeposits: true,
    showContributionHistory: true,
    showPerformanceMetrics: true,
    showActivity: false,
    groupByStatus: false,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  const filteredAndSortedMembers = useMemo(() => {
    if (!memberList?.members) return [];

    let filtered = memberList.members;

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(member => 
        member.displayName?.toLowerCase().includes(searchLower) ||
        member.address.toLowerCase().includes(searchLower)
      );
    }

    // Sort members
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (displayConfig.sortBy) {
        case 'name':
          const nameA = a.displayName || a.address;
          const nameB = b.displayName || b.address;
          compareValue = nameA.localeCompare(nameB);
          break;
        case 'joinTime':
          compareValue = a.joinTime - b.joinTime;
          break;
        case 'reliability':
          compareValue = a.reliabilityScore - b.reliabilityScore;
          break;
        case 'contributions':
          compareValue = Number(a.totalContributions - b.totalContributions);
          break;
        default:
          compareValue = 0;
      }
      
      return displayConfig.sortOrder === 'desc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [memberList?.members, searchTerm, displayConfig.sortBy, displayConfig.sortOrder]);

  const groupedMembers = useMemo(() => {
    if (!displayConfig.groupByStatus) {
      return { 'All Members': filteredAndSortedMembers };
    }

    const groups: Record<string, EnhancedMemberInfo[]> = {};
    
    filteredAndSortedMembers.forEach(member => {
      const status = member.membershipStatus;
      const groupName = getStatusGroupName(status);
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(member);
    });

    return groups;
  }, [filteredAndSortedMembers, displayConfig.groupByStatus]);

  const getStatusGroupName = (status: MembershipStatus): string => {
    switch (status) {
      case 'pending_deposit': return 'Pending Deposits';
      case 'deposit_paid': return 'Ready to Start';
      case 'active':
      case 'contributed': return 'Active Members';
      case 'late': return 'Late Contributors';
      case 'defaulted': return 'Defaulted Members';
      case 'winner': return 'Round Winners';
      case 'completed': return 'Completed Members';
      case 'inactive': return 'Inactive Members';
      default: return 'Other';
    }
  };

  const getStatusTabCount = (status: string): number => {
    if (!memberList?.members) return 0;
    
    switch (status) {
      case 'ready':
        return memberList.readiness.filter(r => r.isReady).length;
      case 'pending':
        return memberList.readiness.filter(r => !r.isReady).length;
      case 'active':
        return memberList.members.filter(m => m.isActive).length;
      case 'risk':
        return memberList.members.filter(m => m.reliabilityScore < 60).length;
      default:
        return memberList.members.length;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!memberList || memberList.members.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Members Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This chama doesn't have any members yet. Share the invitation link to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Member List ({memberList.members.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayConfig(prev => ({ ...prev, showPerformanceMetrics: !prev.showPerformanceMetrics }))}
            >
              {displayConfig.showPerformanceMetrics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              Performance
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {memberList.summary.activeMembers}/{memberList.summary.totalMembers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Members</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {memberList.summary.membersReady}/{memberList.summary.totalMembers}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Ready to Start</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {memberList.summary.averageReliabilityScore.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Reliability</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatTokenAmount(memberList.summary.totalContributions)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Contributed</div>
          </div>
        </div>

        {/* Readiness Indicator */}
        {showReadinessIndicator && memberList.summary.membersReady < memberList.summary.totalMembers && (
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{memberList.summary.totalMembers - memberList.summary.membersReady} members</strong> still need to pay their security deposits before the ROSCA can start.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>

      <CardContent>
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select
            value={displayConfig.sortBy}
            onValueChange={(value) => setDisplayConfig(prev => ({ ...prev, sortBy: value as any }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="joinTime">Join Time</SelectItem>
              <SelectItem value="reliability">Reliability</SelectItem>
              <SelectItem value="contributions">Contributions</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDisplayConfig(prev => ({ 
              ...prev, 
              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
            }))}
          >
            {displayConfig.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          {/* Group Toggle */}
          <Button
            variant={displayConfig.groupByStatus ? "default" : "outline"}
            size="sm"
            onClick={() => setDisplayConfig(prev => ({ ...prev, groupByStatus: !prev.groupByStatus }))}
          >
            <Filter className="h-4 w-4 mr-2" />
            Group by Status
          </Button>
        </div>

        {/* Member List Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">
              All ({getStatusTabCount('all')})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready ({getStatusTabCount('ready')})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({getStatusTabCount('pending')})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({getStatusTabCount('active')})
            </TabsTrigger>
            <TabsTrigger value="risk">
              Risk ({getStatusTabCount('risk')})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {Object.entries(groupedMembers).map(([groupName, members]) => (
              <div key={groupName}>
                {displayConfig.groupByStatus && (
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{groupName}</h3>
                    <Badge variant="outline">{members.length}</Badge>
                  </div>
                )}
                <div className="space-y-2">
                  {members.map(member => (
                    <MemberStatusIndicator
                      key={member.address}
                      member={member}
                      tokenSymbol={tokenSymbol}
                      formatTokenAmount={formatTokenAmount}
                      compact={true}
                      showPerformance={displayConfig.showPerformanceMetrics}
                      onClick={onMemberClick ? () => onMemberClick(member) : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="ready" className="space-y-2">
            {memberList.readiness
              .filter(r => r.isReady)
              .map(readiness => {
                const member = memberList.members.find(m => m.address === readiness.address);
                return member ? (
                  <MemberStatusIndicator
                    key={member.address}
                    member={member}
                    tokenSymbol={tokenSymbol}
                    formatTokenAmount={formatTokenAmount}
                    compact={true}
                    showPerformance={displayConfig.showPerformanceMetrics}
                    onClick={onMemberClick ? () => onMemberClick(member) : undefined}
                  />
                ) : null;
              })
            }
          </TabsContent>

          <TabsContent value="pending" className="space-y-2">
            {memberList.readiness
              .filter(r => !r.isReady)
              .map(readiness => {
                const member = memberList.members.find(m => m.address === readiness.address);
                return member ? (
                  <MemberStatusIndicator
                    key={member.address}
                    member={member}
                    tokenSymbol={tokenSymbol}
                    formatTokenAmount={formatTokenAmount}
                    compact={true}
                    showPerformance={displayConfig.showPerformanceMetrics}
                    onClick={onMemberClick ? () => onMemberClick(member) : undefined}
                  />
                ) : null;
              })
            }
          </TabsContent>

          <TabsContent value="active" className="space-y-2">
            {memberList.members
              .filter(m => m.isActive)
              .map(member => (
                <MemberStatusIndicator
                  key={member.address}
                  member={member}
                  tokenSymbol={tokenSymbol}
                  formatTokenAmount={formatTokenAmount}
                  compact={true}
                  showPerformance={displayConfig.showPerformanceMetrics}
                  onClick={onMemberClick ? () => onMemberClick(member) : undefined}
                />
              ))
            }
          </TabsContent>

          <TabsContent value="risk" className="space-y-2">
            {memberList.members
              .filter(m => m.reliabilityScore < 60)
              .map(member => (
                <MemberStatusIndicator
                  key={member.address}
                  member={member}
                  tokenSymbol={tokenSymbol}
                  formatTokenAmount={formatTokenAmount}
                  compact={true}
                  showPerformance={true}
                  onClick={onMemberClick ? () => onMemberClick(member) : undefined}
                />
              ))
            }
          </TabsContent>
        </Tabs>

        {/* Empty States */}
        {filteredAndSortedMembers.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Members Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No members match your search criteria. Try adjusting your search term.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MemberList;
