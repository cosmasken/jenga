/**
 * Browse Chamas Page
 * Allows users to discover and join existing ROSCA groups
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import {
  Search,
  Filter,
  Users,
  Bitcoin,
  Clock,
  TrendingUp,
  Star,
  ArrowLeft,
  Eye,
  UserPlus,
  Calendar,
  Target,
  Shield,
  ChevronDown,
  RefreshCw,
  SortAsc,
  SortDesc,
  Tag,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { useRosca } from '@/hooks/useRosca';
import { useSupabase } from '@/hooks/useSupabase';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { WalletDropdown } from '@/components/WalletDropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { JoinChamaModal } from '@/components/JoinChamaModal';
import { useIsLoggedIn } from "@dynamic-labs/sdk-react-core";


// Mock data for demonstration - in real app, this would come from the contract
interface ChamaGroup {
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  roundLength: number; // in days
  maxMembers: number;
  currentMembers: number;
  creator: string;
  createdAt: Date;
  nextRoundDate: Date;
  status: 'open' | 'active' | 'full' | 'completed';
  totalSaved: number;
  currentRound: number;
  tags: string[];
  isVerified: boolean;
  trustScore: number; // 1-5 stars
}

// Mock data - replace with actual contract data


type SortOption = 'newest' | 'oldest' | 'contribution-high' | 'contribution-low' | 'members' | 'trust-score';

export default function BrowseChamas() {
  const isConnected = useIsLoggedIn();
  const [, setLocation] = useLocation();
  const { primaryWallet } = useDynamicContext();
  const { balance, getBalance, joinGroup, isGroupMember, isGroupCreator, getGroupCount, getGroupInfo } = useRosca();
  const {
    logActivity,
    isLoading: isSupabaseLoading
  } = useSupabase();
  const toast = useRoscaToast();
  const { handleError } = useErrorHandler();

  // State
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [contributionRange, setContributionRange] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [membershipStatus, setMembershipStatus] = useState<Record<string, { isMember: boolean; isCreator: boolean }>>({});

  // Load groups from Supabase
  useEffect(() => {
    loadGroups();
  }, [selectedStatus, selectedCategory, selectedTags, sortBy]);

  // Check membership status when wallet connects/disconnects
  useEffect(() => {
    if (groups.length > 0) {
      checkMembershipStatus(groups);
    }
  }, [isConnected, primaryWallet?.address]);

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true);
      setIsLoading(true);

      // Get total group count from blockchain
      const totalGroups = await getGroupCount();
      console.log('📊 Total groups on blockchain:', totalGroups);

      if (totalGroups === 0) {
        setGroups([]);
        return;
      }

      // Load groups by iterating through group IDs
      const fetchedGroups = [];
      const maxGroupsToLoad = Math.min(totalGroups, 50); // Limit to 50 for performance

      for (let i = 0; i < maxGroupsToLoad; i++) {
        try {
          const groupInfo = await getGroupInfo(i);
          if (groupInfo) {
            // Convert blockchain data to UI format
            const contributionInCBTC = parseFloat(groupInfo.contribution?.toString() || '0') / 1e18;
            const roundLengthInDays = Math.floor((groupInfo.roundLength || 86400) / 86400);
            
            // Determine status based on group state
            let status: 'open' | 'active' | 'full' | 'completed' = 'completed';
            if (groupInfo.isActive) {
              if (groupInfo.memberCount >= groupInfo.maxMembers) {
                status = 'full';
              } else if (groupInfo.memberCount > 1) {
                status = 'active';
              } else {
                status = 'open';
              }
            }

            fetchedGroups.push({
              id: i.toString(), // Convert to string for consistency
              name: groupInfo.name || `Group ${i}`,
              description: `ROSCA Group #${i} - ${groupInfo.maxMembers} members contributing ${contributionInCBTC.toFixed(4)} cBTC every ${roundLengthInDays} days`,
              contributionAmount: contributionInCBTC,
              roundLength: roundLengthInDays,
              maxMembers: groupInfo.maxMembers || 0,
              currentMembers: groupInfo.memberCount || 0,
              creator: groupInfo.creator || '',
              createdAt: new Date(),
              nextRoundDate: new Date((groupInfo.nextDue || 0) * 1000),
              status,
              totalSaved: parseFloat(groupInfo.totalPaidOut?.toString() || '0') / 1e18,
              currentRound: groupInfo.currentRound || 0,
              tags: ['rosca', 'savings'],
              isVerified: true,
              trustScore: 4.5,
              // Include original blockchain data
              blockchainData: groupInfo
            });
          }
        } catch (error) {
          console.warn(`⚠️ Could not load group ${i}:`, error);
        }
      }

      console.log('✅ Loaded groups from blockchain:', fetchedGroups.length);
      setGroups(fetchedGroups);

      // Check membership status for all groups if user is connected
      if (isConnected && primaryWallet?.address) {
        await checkMembershipStatus(fetchedGroups);
      }
    } catch (error) {
      console.error('❌ Failed to load groups:', error);
      handleError(error, { context: 'loading groups' });
      toast.error('Failed to Load Groups', 'Please try refreshing the page.');
    } finally {
      setIsLoadingGroups(false);
      setIsLoading(false);
    }
  };

  // Check membership status for all groups
  const checkMembershipStatus = async (groupsToCheck: any[]) => {
    if (!isConnected || !primaryWallet?.address) {
      setMembershipStatus({});
      return;
    }

    try {
      console.log('🔍 Checking membership status for', groupsToCheck.length, 'groups');
      const statusPromises = groupsToCheck.map(async (group) => {
        try {
          // Convert string ID back to number for blockchain calls
          const groupId = parseInt(group.id);
          if (isNaN(groupId)) {
            throw new Error(`Invalid group ID: ${group.id}`);
          }

          const [isMember, isCreator] = await Promise.all([
            isGroupMember(groupId),
            isGroupCreator(groupId)
          ]);

          return {
            groupId: group.id, // Keep as string for consistency with state
            isMember,
            isCreator,
            contractInfo: group
          };
        } catch (error) {
          console.error(`Failed to check membership for group ${group.id}:`, error);
          return {
            groupId: group.id,
            isMember: false,
            isCreator: false
          };
        }
      });

      const results = await Promise.all(statusPromises);

      const statusMap: Record<string, { isMember: boolean; isCreator: boolean }> = {};
      results.forEach(result => {
        statusMap[result.groupId] = {
          isMember: result.isMember,
          isCreator: result.isCreator
        };
      });

      console.log('✅ Membership status checked:', statusMap);
      setMembershipStatus(statusMap);
    } catch (error) {
      console.error('❌ Failed to check membership status:', error);
    }
  };

// Handle joining a group - open modal instead of direct join
const handleJoinGroup = async (groupId: string, groupName: string) => {
  if (!primaryWallet?.address) {
    toast.error('Wallet Required', 'Please connect your wallet to join a group.');
    return;
  }

  // Open join modal with the selected group
  setSelectedGroupId(parseInt(groupId));
  setShowJoinModal(true);
};

// Handle successful join from modal
const handleJoinSuccess = async () => {
  // Refresh groups to update member count
  await loadGroups();
};

// Real-time updates removed - using blockchain data only
// Groups are loaded fresh from blockchain on each page load

// Filter and sort groups
const filteredAndSortedGroups = useMemo(() => {
  let filtered = groups;

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(group =>
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query) ||
      group.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  }

  // Sort groups
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'contribution-high':
        return b.contributionAmount - a.contributionAmount;
      case 'contribution-low':
        return a.contributionAmount - b.contributionAmount;
      case 'members':
        return b.currentMembers - a.currentMembers;
      case 'trust-score':
        return b.trustScore - a.trustScore;
      default:
        return 0;
    }
  });

  return filtered;
}, [groups, searchQuery, sortBy]);


// Get all unique tags
const allTags = useMemo(() => {
  const tags = new Set<string>();
  groups.forEach(group => group.tags?.forEach((tag: string) => tags.add(tag)));
  return Array.from(tags).sort();
}, [groups]);

const handleViewDetails = (chamaId: string) => {
  setLocation(`/chama/${chamaId}`);
};

const handleManageGroup = (chamaId: string) => {
  // Navigate to group management page or open management modal
  setLocation(`/group/${chamaId}`);
};

const getStatusColor = (status: ChamaGroup['status']) => {
  switch (status) {
    case 'open':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'full':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'completed':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const canJoinChama = (chama: ChamaGroup) => {
  if (!isConnected) return false;

  const status = membershipStatus[chama.id];

  // Can't join if already a member
  if (status?.isMember) return false;

  return chama.status === 'open' &&
    chama.currentMembers < chama.maxMembers &&
    parseFloat(balance) >= chama.contributionAmount;
};

const getButtonConfig = (chama: ChamaGroup) => {
  if (!isConnected) {
    return { text: 'Connect Wallet', action: 'connect', disabled: false };
  }

  const status = membershipStatus[chama.id];

  if (status?.isCreator) {
    return { text: 'Manage', action: 'manage', disabled: false };
  }

  if (status?.isMember) {
    return { text: 'View Details', action: 'view', disabled: false };
  }

  if (chama.status === 'full') {
    return { text: 'Full', action: 'none', disabled: true };
  }

  if (parseFloat(balance) < chama.contributionAmount) {
    return { text: 'Insufficient Balance', action: 'none', disabled: true };
  }

  if (chama.status !== 'open') {
    return { text: 'Closed', action: 'none', disabled: true };
  }

  return { text: 'Join', action: 'join', disabled: false };
};

return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {/* Header */}
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Browse Chamas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Discover and join ROSCA groups
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={loadGroups}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <WalletDropdown />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chamas by name, description, or tags..."
            value={searchQuery}
            onChange={(e: unknown) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={contributionRange} onValueChange={setContributionRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Contribution Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Amounts</SelectItem>
              <SelectItem value="low">Low (&lt; 0.01 cBTC)</SelectItem>
              <SelectItem value="medium">Medium (0.01 - 0.05 cBTC)</SelectItem>
              <SelectItem value="high">High (&gt; 0.05 cBTC)</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: unknown) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="contribution-high">Highest Contribution</SelectItem>
              <SelectItem value="contribution-low">Lowest Contribution</SelectItem>
              <SelectItem value="members">Most Spots Available</SelectItem>
              <SelectItem value="trust-score">Highest Trust Score</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {allTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTags([...selectedTags, tag]);
                    } else {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    }
                  }}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}
              {selectedTags.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedTags([])}>
                    Clear All
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredAndSortedGroups.length} chama{filteredAndSortedGroups.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Chamas Grid */}
      <AnimatePresence>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAndSortedGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No chamas found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {groups.length === 0 
                ? "No groups exist on the blockchain yet. Be the first to create one!"
                : "Try adjusting your search or filters"}
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setSelectedTags([]);
              setContributionRange('all');
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedGroups.map((chama, index) => (
              <motion.div
                key={chama.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ChamaCard
                  chama={chama}
                  onJoin={() => handleJoinGroup(chama.id, chama.name)}
                  onViewDetails={() => handleViewDetails(chama.id)}
                  onManage={() => handleManageGroup(chama.id)}
                  buttonConfig={getButtonConfig(chama)}
                  getStatusColor={getStatusColor}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>

    {/* Join Chama Modal */}
    <JoinChamaModal
      open={showJoinModal}
      onOpenChange={(open) => {
        setShowJoinModal(open);
        if (!open) {
          setSelectedGroupId(null);
        }
      }}
      groupId={selectedGroupId ? selectedGroupId.toString() : ''}
      onGroupJoined={handleJoinSuccess}
    />
  </div>
);
}

// Chama Card Component
interface ChamaCardProps {
  chama: ChamaGroup;
  onJoin: () => void;
  onViewDetails: () => void;
  onManage: () => void;
  buttonConfig: { text: string; action: string; disabled: boolean };
  getStatusColor: (status: ChamaGroup['status']) => string;
}

function ChamaCard({ chama, onJoin, onViewDetails, onManage, buttonConfig, getStatusColor }: ChamaCardProps) {
  const handlePrimaryAction = () => {
    switch (buttonConfig.action) {
      case 'join':
        onJoin();
        break;
      case 'manage':
        onManage();
        break;
      case 'view':
        onViewDetails();
        break;
      case 'connect':
        // This could trigger wallet connection modal
        break;
      default:
        // No action for disabled states
        break;
    }
  };
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-bitcoin">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{chama.name}</CardTitle>
              {chama.isVerified && (
                <Shield className="h-4 w-4 text-green-500"
                // title="Verified"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(chama.status)}>
                {chama.status}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {chama.trustScore}
                </span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {chama.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4 text-bitcoin" />
            <div>
              <div className="font-medium">{chama.contributionAmount} cBTC</div>
              <div className="text-xs text-gray-500">per round</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">{chama.roundLength} days</div>
              <div className="text-xs text-gray-500">round length</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">
                {chama.currentMembers}/{chama.maxMembers}
              </div>
              <div className="text-xs text-gray-500">members</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <div>
              <div className="font-medium">Round {chama.currentRound}</div>
              <div className="text-xs text-gray-500">current</div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {chama.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {chama.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{chama.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant={buttonConfig.action === 'manage' ? 'default' : 'bitcoin'}
            size="sm"
            onClick={handlePrimaryAction}
            disabled={buttonConfig.disabled}
            className="flex-1"
          >
            {buttonConfig.action === 'join' && <UserPlus className="h-3 w-3 mr-1" />}
            {buttonConfig.action === 'manage' && <Users className="h-3 w-3 mr-1" />}
            {buttonConfig.text}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
