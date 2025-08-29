import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { 
  Search,
  Users,
  Clock,
  Coins,
  Shield,
  Filter,
  ChevronDown,
  MapPin,
  Star,
  UserPlus,
  Eye,
  TrendingUp,
  Calendar,
  Check,
  AlertCircle
} from 'lucide-react'
import { type Address } from 'viem'
import { offchainChamaService, type OffchainChama } from '@/services/offchainChamaService'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

interface ChamaDiscoveryProps {
  onJoinChama?: (chamaId: string) => void
}

export function ChamaDiscovery({ onJoinChama }: ChamaDiscoveryProps) {
  const { primaryWallet } = useDynamicContext()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    minContribution: '',
    maxContribution: '',
    status: 'all' as 'all' | 'draft' | 'recruiting' | 'waiting',
    memberTarget: 'all' as 'all' | 'small' | 'medium' | 'large'
  })
  const [showFilters, setShowFilters] = useState(false)

  // Get public chamas with user context
  const { data: allChamas, isLoading, refetch } = useQuery({
    queryKey: ['public-chamas-with-context', primaryWallet?.address],
    queryFn: async () => {
      const publicChamas = await offchainChamaService.getPublicChamasWithContext(primaryWallet?.address)
      // Add mock rating data for demo purposes
      return publicChamas.map(chama => ({
        ...chama,
        rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10 // 3.5-5.0 rating
      }))
    }
  })

  const filteredChamas = React.useMemo(() => {
    if (!allChamas) return []
    
    let filtered = allChamas.filter(chama => {
      // Search filter
      if (searchQuery && !chama.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !chama.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Contribution range filter
      if (filters.minContribution) {
        if (parseFloat(chama.contribution_amount) < parseFloat(filters.minContribution)) {
          return false
        }
      }
      if (filters.maxContribution) {
        if (parseFloat(chama.contribution_amount) > parseFloat(filters.maxContribution)) {
          return false
        }
      }
      
      // Status filter
      if (filters.status !== 'all' && chama.status !== filters.status) {
        return false
      }
      
      // Member target filter
      if (filters.memberTarget !== 'all') {
        const target = chama.member_target
        if (filters.memberTarget === 'small' && target > 5) return false
        if (filters.memberTarget === 'medium' && (target <= 5 || target > 15)) return false
        if (filters.memberTarget === 'large' && target <= 15) return false
      }
      
      return true
    })
    
    return filtered
  }, [allChamas, searchQuery, filters])

  const clearFilters = () => {
    setFilters({
      minContribution: '',
      maxContribution: '',
      status: 'all',
      memberTarget: 'all'
    })
    setSearchQuery('')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading public chamas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Discover Chamas</h2>
        <p className="text-muted-foreground">
          Find and join public savings circles in your community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search chamas by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Min Contribution (cBTC)</Label>
                  <Input
                    type="number"
                    placeholder="0.001"
                    value={filters.minContribution}
                    onChange={(e) => setFilters({...filters, minContribution: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Max Contribution (cBTC)</Label>
                  <Input
                    type="number"
                    placeholder="1.0"
                    value={filters.maxContribution}
                    onChange={(e) => setFilters({...filters, maxContribution: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value as any})}
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="recruiting">Recruiting</option>
                    <option value="waiting">Ready to Start</option>
                  </select>
                </div>
                <div>
                  <Label>Group Size</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={filters.memberTarget}
                    onChange={(e) => setFilters({...filters, memberTarget: e.target.value as any})}
                  >
                    <option value="all">Any Size</option>
                    <option value="small">Small (2-5)</option>
                    <option value="medium">Medium (6-15)</option>
                    <option value="large">Large (15+)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {filteredChamas.length} chamas found
          </h3>
          <div className="text-sm text-muted-foreground">
            Showing public chamas accepting members
          </div>
        </div>

        {filteredChamas.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chamas found</h3>
              <p className="text-muted-foreground text-center mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChamas.map((chama) => (
              <ChamaDiscoveryCard 
                key={chama.id} 
                chama={chama} 
                onJoin={onJoinChama}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface ChamaDiscoveryCardProps {
  chama: OffchainChama & { 
    memberCount: number;
    isCreator?: boolean;
    isMember?: boolean;
    rating?: number;
  }
  onJoin?: (chamaId: string) => void
}

function ChamaDiscoveryCard({ chama, onJoin }: ChamaDiscoveryCardProps) {
  const { primaryWallet } = useDynamicContext()
  const queryClient = useQueryClient()

  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!primaryWallet?.address) throw new Error('Wallet not connected')
      return offchainChamaService.addMember(chama.id, primaryWallet.address, 'direct_join')
    },
    onSuccess: () => {
      toast({
        title: "✅ Successfully joined!",
        description: `You've joined "${chama.name}". Check your dashboard to see the details.`
      })
      queryClient.invalidateQueries({ queryKey: ['user-chamas'] })
      queryClient.invalidateQueries({ queryKey: ['public-chamas-with-context'] })
      onJoin?.(chama.id)
    },
    onError: (error) => {
      toast({
        title: "❌ Failed to join",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      })
    }
  })

  const handleJoin = () => {
    if (!primaryWallet?.address) {
      toast({
        title: "⚠️ Wallet required",
        description: "Please connect your wallet to join this chama",
        variant: "destructive"
      })
      return
    }
    joinMutation.mutate()
  }

  const handleManage = () => {
    // Navigate to chama management/dashboard
    window.location.href = `/chama/${chama.id}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary'
      case 'recruiting': return 'default'
      case 'waiting': return 'destructive'
      default: return 'secondary'
    }
  }

  const currentMembers = chama.memberCount
  const spotsLeft = chama.member_target - currentMembers
  const estimatedAPY = Math.round((12 / chama.member_target) * 100)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{chama.name}</CardTitle>
            <Badge variant={getStatusColor(chama.status)}>
              {chama.status.toUpperCase()}
            </Badge>
          </div>
          {chama.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{chama.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {chama.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {chama.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-green-600" />
            <div>
              <p className="font-medium">{chama.contribution_amount} cBTC</p>
              <p className="text-muted-foreground">Contribution</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div>
              <p className="font-medium">~{estimatedAPY}% APY</p>
              <p className="text-muted-foreground">Estimated</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <p className="font-medium">{currentMembers}/{chama.member_target}</p>
              <p className="text-muted-foreground">Members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="font-medium">{chama.round_duration_hours / 24}d</p>
              <p className="text-muted-foreground">Round</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Security Deposit</span>
            <span className="font-medium">{chama.security_deposit} cBTC</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Spots Remaining</span>
            <span className={`font-medium ${spotsLeft <= 2 ? 'text-orange-600' : 'text-green-600'}`}>
              {spotsLeft} left
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{chama.name}</DialogTitle>
              </DialogHeader>
              <ChamaDetailView chama={chama} />
            </DialogContent>
          </Dialog>

          {/* Context-aware action button */}
          {chama.isCreator ? (
            <Button onClick={handleManage} className="flex-1">
              <Shield className="h-4 w-4 mr-2" />
              Manage
            </Button>
          ) : chama.isMember ? (
            <Button onClick={handleManage} variant="outline" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Already Member
            </Button>
          ) : (
            <Button 
              onClick={handleJoin}
              disabled={joinMutation.isPending || spotsLeft === 0 || chama.status !== 'recruiting'}
              className="flex-1"
            >
              {joinMutation.isPending ? (
                "Joining..."
              ) : spotsLeft === 0 ? (
                "Full"
              ) : chama.status !== 'recruiting' ? (
                "Not Recruiting"
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Now
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ChamaDetailViewProps {
  chama: OffchainChama & { currentMembers?: number; rating?: number }
}

function ChamaDetailView({ chama }: ChamaDetailViewProps) {
  const currentMembers = chama.currentMembers || Math.floor(Math.random() * chama.member_target)
  const estimatedAPY = Math.round((12 / chama.member_target) * 100)
  const totalContributions = parseFloat(chama.contribution_amount) * chama.member_target
  const totalRounds = chama.member_target

  return (
    <div className="space-y-6">
      {/* Description */}
      {chama.description && (
        <div>
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-muted-foreground">{chama.description}</p>
        </div>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium">Financial Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Contribution Amount</span>
              <span className="font-medium">{chama.contribution_amount} cBTC</span>
            </div>
            <div className="flex justify-between">
              <span>Security Deposit</span>
              <span className="font-medium">{chama.security_deposit} cBTC</span>
            </div>
            <div className="flex justify-between">
              <span>Total Pool Size</span>
              <span className="font-medium">{totalContributions.toFixed(3)} cBTC</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated APY</span>
              <span className="font-medium text-green-600">~{estimatedAPY}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Group Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Current Members</span>
              <span className="font-medium">{currentMembers}/{chama.member_target}</span>
            </div>
            <div className="flex justify-between">
              <span>Round Duration</span>
              <span className="font-medium">{chama.round_duration_hours / 24} days</span>
            </div>
            <div className="flex justify-between">
              <span>Total Rounds</span>
              <span className="font-medium">{totalRounds}</span>
            </div>
            <div className="flex justify-between">
              <span>Created</span>
              <span className="font-medium">{new Date(chama.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div>
        <h4 className="font-medium mb-3">How This Chama Works</h4>
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">1</div>
            <div>
              <p className="font-medium text-foreground">Join & Pay Security Deposit</p>
              <p>Pay {chama.security_deposit} cBTC security deposit to secure your spot</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">2</div>
            <div>
              <p className="font-medium text-foreground">Regular Contributions</p>
              <p>Contribute {chama.contribution_amount} cBTC every {chama.round_duration_hours / 24} days</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium mt-0.5">3</div>
            <div>
              <p className="font-medium text-foreground">Receive Payout</p>
              <p>Get {totalContributions.toFixed(3)} cBTC when it's your turn in the rotation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800">Important</p>
          <p className="text-yellow-700">Make sure you can commit to regular contributions before joining. Missing payments may result in penalties.</p>
        </div>
      </div>
    </div>
  )
}

// Mock data for demonstration
const mockPublicChamas: (OffchainChama & { currentMembers: number; rating: number })[] = [
  {
    id: "1",
    name: "Daily Savers Circle",
    description: "Perfect for beginners! Small daily contributions with weekly payouts.",
    creator_address: "0x1234567890123456789012345678901234567890",
    contribution_amount: "0.001",
    security_deposit: "0.002",
    member_target: 7,
    round_duration_hours: 24,
    status: "recruiting",
    chain_status: 0,
    current_round: 0,
    created_at: new Date().toISOString(),
    is_private: false,
    invitation_code: "DAILY123",
    auto_start: true,
    allow_late_join: false,
    late_fee_percentage: 0,
    currentMembers: 4,
    rating: 4.8
  },
  {
    id: "2", 
    name: "Professional Network ROSCA",
    description: "Higher contribution amount for working professionals. Monthly payouts.",
    creator_address: "0x2234567890123456789012345678901234567890",
    contribution_amount: "0.05",
    security_deposit: "0.1",
    member_target: 12,
    round_duration_hours: 720, // 30 days
    status: "recruiting",
    chain_status: 0,
    current_round: 0,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_private: false,
    invitation_code: "PROF456",
    auto_start: false,
    allow_late_join: false,
    late_fee_percentage: 5,
    currentMembers: 8,
    rating: 4.6
  },
  {
    id: "3",
    name: "Student Budget Circle",
    description: "Low contribution amounts perfect for students and young professionals.",
    creator_address: "0x3234567890123456789012345678901234567890", 
    contribution_amount: "0.0005",
    security_deposit: "0.001",
    member_target: 5,
    round_duration_hours: 168, // 7 days
    status: "waiting",
    chain_status: 0,
    current_round: 0,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    is_private: false,
    invitation_code: "STUDENT789",
    auto_start: true,
    allow_late_join: true,
    late_fee_percentage: 2,
    currentMembers: 5,
    rating: 4.9
  }
]
