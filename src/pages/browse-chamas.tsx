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
import { JoinGroupModal } from '@/components/JoinGroupModal';

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
const mockChamas: ChamaGroup[] = [
  {
    id: '1',
    name: 'Bitcoin Builders',
    description: 'A group for Bitcoin enthusiasts building wealth together through disciplined savings.',
    contributionAmount: 0.01,
    roundLength: 30,
    maxMembers: 8,
    currentMembers: 6,
    creator: '0x1234...5678',
    createdAt: new Date('2024-01-15'),
    nextRoundDate: new Date('2024-02-15'),
    status: 'open',
    totalSaved: 0.48,
    currentRound: 2,
    tags: ['bitcoin', 'savings', 'tech'],
    isVerified: true,
    trustScore: 4.8
  },
  {
    id: '2',
    name: 'Citrea Savers',
    description: 'Conservative savers focusing on steady growth and reliable payouts.',
    contributionAmount: 0.005,
    roundLength: 14,
    maxMembers: 6,
    currentMembers: 6,
    creator: '0x2345...6789',
    createdAt: new Date('2024-01-10'),
    nextRoundDate: new Date('2024-02-10'),
    status: 'full',
    totalSaved: 0.18,
    currentRound: 3,
    tags: ['conservative', 'steady', 'reliable'],
    isVerified: true,
    trustScore: 4.9
  },
  {
    id: '3',
    name: 'High Rollers',
    description: 'For serious savers ready to commit to larger amounts and faster cycles.',
    contributionAmount: 0.1,
    roundLength: 7,
    maxMembers: 4,
    currentMembers: 2,
    creator: '0x3456...7890',
    createdAt: new Date('2024-01-20'),
    nextRoundDate: new Date('2024-02-01'),
    status: 'open',
    totalSaved: 0.8,
    currentRound: 1,
    tags: ['high-stakes', 'fast', 'aggressive'],
    isVerified: false,
    trustScore: 4.2
  },
  {
    id: '4',
    name: 'Beginner Friendly',
    description: 'Perfect for newcomers to ROSCA. Small amounts, longer cycles, supportive community.',
    contributionAmount: 0.001,
    roundLength: 45,
    maxMembers: 10,
    currentMembers: 4,
    creator: '0x4567...8901',
    createdAt: new Date('2024-01-25'),
    nextRoundDate: new Date('2024-03-10'),
    status: 'open',
    totalSaved: 0.018,
    currentRound: 1,
    tags: ['beginner', 'friendly', 'learning'],
    isVerified: true,
    trustScore: 4.6
  },
  {
    id: '5',
    name: 'Monthly Savers',
    description: 'Traditional monthly savings cycle for consistent long-term wealth building.',
    contributionAmount: 0.02,
    roundLength: 30,
    maxMembers: 12,
    currentMembers: 8,
    creator: '0x5678...9012',
    createdAt: new Date('2024-01-05'),
    nextRoundDate: new Date('2024-02-05'),
    status: 'active',
    totalSaved: 0.96,
    currentRound: 4,
    tags: ['monthly', 'traditional', 'stable'],
    isVerified: true,
    trustScore: 4.7
  }
];

type SortOption = 'newest' | 'oldest' | 'contribution-high' | 'contribution-low' | 'members' | 'trust-score';

export default function BrowseChamas() {
  const [, setLocation] = useLocation();
  const { primaryWallet, isConnected } = useDynamicContext();
  const { balance, getBalance } = useRosca();
  const {
    getGroups,
    joinGroup,
    subscribeToGroup,
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

  // Load groups from Supabase
  useEffect(() => {
    loadGroups();
  }, [selectedStatus, selectedCategory, selectedTags, sortBy]);

  const loadGroups = async () => {
    try {
      setIsLoadingGroups(true);

      const filters: any = {
        limit: 50,
        offset: 0
      };

      // Apply status filter
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      // Apply category filter
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      // Apply tags filter
      if (selectedTags.length > 0) {
        filters.tags = selectedTags;
      }

      console.log('🔄 Loading groups with filters:', filters);
      const fetchedGroups = await getGroups(filters);

      console.log('✅ Loaded groups:', fetchedGroups.length);
      setGroups(fetchedGroups);
    } catch (error) {
      console.error('❌ Failed to load groups:', error);
      handleError(error, { context: 'loading groups' });
      toast.error('Failed to Load Groups', 'Please try refreshing the page.');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // Handle joining a group - open modal instead of direct join
  const handleJoinGroup = async (groupId: string, groupName: string) => {
    if (!isConnected || !primaryWallet?.address) {
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

  // Real-time updates for groups
  useEffect(() => {
    const unsubscribeFunctions: (() => void)[] = [];

    groups.forEach(group => {
      const unsubscribe = subscribeToGroup(group.id, (payload) => {
        console.log('🔄 Real-time group update:', payload);
        setGroups(prevGroups =>
          prevGroups.map(g =>
            g.id === group.id ? { ...g, ...payload.new } : g
          )
        );
      });
      unsubscribeFunctions.push(unsubscribe);
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [groups.map(g => g.id).join(',')]);

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
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'contribution-high':
          return b.contribution_amount - a.contribution_amount;
        case 'contribution-low':
          return a.contribution_amount - b.contribution_amount;
        case 'members':
          return b.current_members - a.current_members;
        default:
          return 0;
      }
    });

    return filtered;
  }, [groups, searchQuery, sortBy]);


  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    chamas.forEach(chama => chama.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [chamas]);

  // Filter and sort chamas
  const filteredAndSortedChamas = useMemo(() => {
    let filtered = chamas.filter(chama => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!chama.name.toLowerCase().includes(query) &&
          !chama.description.toLowerCase().includes(query) &&
          !chama.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && chama.status !== selectedStatus) {
        return false;
      }

      // Contribution range filter
      if (contributionRange !== 'all') {
        const amount = chama.contributionAmount;
        switch (contributionRange) {
          case 'low':
            if (amount >= 0.01) return false;
            break;
          case 'medium':
            if (amount < 0.01 || amount >= 0.05) return false;
            break;
          case 'high':
            if (amount < 0.05) return false;
            break;
        }
      }

      // Tags filter
      if (selectedTags.length > 0) {
        if (!selectedTags.some(tag => chama.tags.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'oldest':
          return a.createdAt.getTime() - b.createdAt.getTime();
        case 'contribution-high':
          return b.contributionAmount - a.contributionAmount;
        case 'contribution-low':
          return a.contributionAmount - b.contributionAmount;
        case 'members':
          return (b.maxMembers - b.currentMembers) - (a.maxMembers - a.currentMembers);
        case 'trust-score':
          return b.trustScore - a.trustScore;
        default:
          return 0;
      }
    });

    return filtered;
  }, [chamas, searchQuery, selectedStatus, selectedTags, contributionRange, sortBy]);

  // Load chamas data
  const loadChamas = async () => {
    setIsLoading(true);
    try {
      // In real implementation, fetch from contract
      // const chamasData = await getPublicChamas();
      // setChamas(chamasData);

      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      handleError(error, { context: 'loading chamas' });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadChamas();
  }, []);

  const handleJoinChama = async (chamaId: string) => {
    try {
      // In real implementation, call contract join function
      toast.success('Joined Chama!', `You've successfully joined the chama.`);
    } catch (error) {
      handleError(error, { context: 'joining chama' });
    }
  };

  const handleViewDetails = (chamaId: string) => {
    setLocation(`/chama/${chamaId}`);
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
    return chama.status === 'open' &&
      chama.currentMembers < chama.maxMembers &&
      parseFloat(balance) >= chama.contributionAmount;
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
                onClick={loadChamas}
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
              {filteredAndSortedChamas.length} chama{filteredAndSortedChamas.length !== 1 ? 's' : ''} found
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
          ) : filteredAndSortedChamas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No chamas found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search or filters
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
              {filteredAndSortedChamas.map((chama, index) => (
                <motion.div
                  key={chama.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ChamaCard
                    chama={chama}
                    onJoin={() => handleJoinChama(chama.id)}
                    onViewDetails={() => handleViewDetails(chama.id)}
                    canJoin={canJoinChama(chama)}
                    getStatusColor={getStatusColor}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Join Group Modal */}
      <JoinGroupModal
        isOpen={showJoinModal}
        onClose={() => {
          setShowJoinModal(false);
          setSelectedGroupId(null);
        }}
        groupId={selectedGroupId}
      />
    </div>
  );
}

// Chama Card Component
interface ChamaCardProps {
  chama: ChamaGroup;
  onJoin: () => void;
  onViewDetails: () => void;
  canJoin: boolean;
  getStatusColor: (status: ChamaGroup['status']) => string;
}

function ChamaCard({ chama, onJoin, onViewDetails, canJoin, getStatusColor }: ChamaCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-bitcoin">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{chama.name}</CardTitle>
              {chama.isVerified && (
                <Shield className="h-4 w-4 text-green-500" title="Verified" />
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
            variant="bitcoin"
            size="sm"
            onClick={onJoin}
            disabled={!canJoin}
            className="flex-1"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            {chama.status === 'full' ? 'Full' : 'Join'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
