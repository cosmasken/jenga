/**
 * Chama Detail Page
 * Detailed view of a specific ROSCA group with join functionality
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useRoute } from 'wouter';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { 
  ArrowLeft, 
  Users, 
  Bitcoin, 
  Clock, 
  Calendar,
  TrendingUp,
  Shield,
  Star,
  UserPlus,
  ExternalLink,
  Copy,
  Share2,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useRosca } from '@/hooks/useRosca';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { WalletDropdown } from '@/components/WalletDropdown';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatDistanceToNow } from 'date-fns';

// Mock data - in real app, fetch from contract
interface ChamaDetail {
  id: string;
  name: string;
  description: string;
  contributionAmount: number;
  roundLength: number;
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
  trustScore: number;
  members: {
    address: string;
    joinedAt: Date;
    contributionsMade: number;
    isActive: boolean;
    nickname?: string;
  }[];
  rounds: {
    roundNumber: number;
    recipient: string;
    amount: number;
    completedAt?: Date;
    status: 'pending' | 'active' | 'completed';
  }[];
  rules: string[];
}

const mockChamaDetail: ChamaDetail = {
  id: '1',
  name: 'Bitcoin Builders',
  description: 'A group for Bitcoin enthusiasts building wealth together through disciplined savings. We focus on long-term wealth building with a supportive community of like-minded individuals who understand the value of Bitcoin and decentralized finance.',
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
  trustScore: 4.8,
  members: [
    {
      address: '0x1234...5678',
      joinedAt: new Date('2024-01-15'),
      contributionsMade: 2,
      isActive: true,
      nickname: 'Creator'
    },
    {
      address: '0x2345...6789',
      joinedAt: new Date('2024-01-16'),
      contributionsMade: 2,
      isActive: true,
      nickname: 'BitcoinMaxi'
    },
    {
      address: '0x3456...7890',
      joinedAt: new Date('2024-01-17'),
      contributionsMade: 2,
      isActive: true
    },
    {
      address: '0x4567...8901',
      joinedAt: new Date('2024-01-18'),
      contributionsMade: 2,
      isActive: true
    },
    {
      address: '0x5678...9012',
      joinedAt: new Date('2024-01-19'),
      contributionsMade: 1,
      isActive: true
    },
    {
      address: '0x6789...0123',
      joinedAt: new Date('2024-01-20'),
      contributionsMade: 1,
      isActive: true
    }
  ],
  rounds: [
    {
      roundNumber: 1,
      recipient: '0x1234...5678',
      amount: 0.06,
      completedAt: new Date('2024-01-30'),
      status: 'completed'
    },
    {
      roundNumber: 2,
      recipient: '0x2345...6789',
      amount: 0.06,
      status: 'active'
    },
    {
      roundNumber: 3,
      recipient: '0x3456...7890',
      amount: 0.06,
      status: 'pending'
    }
  ],
  rules: [
    'Monthly contributions of 0.01 cBTC are required',
    'Missed contributions result in penalties',
    'Members must complete all rounds to receive full benefits',
    'Respectful communication is mandatory',
    'No early withdrawal without group consensus'
  ]
};

export default function ChamaDetail() {
  const [, setLocation] = useLocation();
  const [match] = useRoute('/chama/:id');
  const { primaryWallet, isConnected } = useDynamicContext();
  const { balance, getGroupInfo, joinGroup, isGroupMember, isGroupCreator } = useRosca();
  const toast = useRoscaToast();
  const { handleError } = useErrorHandler();

  const [chama, setChama] = useState<ChamaDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const chamaId = match?.id;

  // Load chama details
  useEffect(() => {
    const loadChamaDetail = async () => {
      if (!chamaId) return;
      
      setIsLoading(true);
      try {
        // Try to get real contract data first
        const groupId = parseInt(chamaId);
        if (!isNaN(groupId)) {
          const contractData = await getGroupInfo(groupId);
          
          if (contractData) {
            // Convert contract data to ChamaDetail format
            const chamaData: ChamaDetail = {
              id: chamaId,
              name: `ROSCA Group #${contractData.id}`,
              description: `A Bitcoin savings circle with ${contractData.maxMembers} members contributing ${contractData.contribution} cBTC every ${contractData.roundLength} seconds.`,
              contributionAmount: parseFloat(contractData.contribution.toString()) / 1e18, // Convert from wei
              roundLength: Math.floor(contractData.roundLength / 86400), // Convert seconds to days
              maxMembers: contractData.maxMembers,
              currentMembers: Number(contractData.memberCount),
              creator: contractData.creator,
              createdAt: new Date(), // We don't have creation date from contract
              nextRoundDate: new Date(contractData.nextDue * 1000),
              status: contractData.isActive ? 
                (Number(contractData.memberCount) >= contractData.maxMembers ? 'full' : 'open') : 
                'completed',
              totalSaved: parseFloat(contractData.totalPaidOut.toString()) / 1e18,
              currentRound: contractData.currentRound,
              tags: ['bitcoin', 'savings'],
              isVerified: true,
              trustScore: 4.5,
              members: contractData.members?.map((address, index) => ({
                address,
                joinedAt: new Date(),
                contributionsMade: contractData.currentRound - 1,
                isActive: true,
                nickname: address === contractData.creator ? 'Creator' : undefined
              })) || [],
              rounds: [],
              rules: [
                `Monthly contributions of ${parseFloat(contractData.contribution.toString()) / 1e18} cBTC are required`,
                'Missed contributions result in penalties',
                'Members must complete all rounds to receive full benefits',
                'Respectful communication is mandatory',
                'No early withdrawal without group consensus'
              ]
            };
            
            setChama(chamaData);
            
            // Check membership status if user is connected
            if (isConnected && primaryWallet?.address) {
              const [memberStatus, creatorStatus] = await Promise.all([
                isGroupMember(groupId),
                isGroupCreator(groupId)
              ]);
              
              setIsMember(memberStatus);
              setIsCreator(creatorStatus);
              
              console.log('🔍 Membership status:', { 
                isMember: memberStatus, 
                isCreator: creatorStatus,
                userAddress: primaryWallet.address,
                groupCreator: contractData.creator
              });
            }
          } else {
            // Fallback to mock data if contract data not available
            setChama(mockChamaDetail);
          }
        } else {
          // Invalid group ID, use mock data
          setChama(mockChamaDetail);
        }
      } catch (error) {
        console.error('❌ Error loading chama details:', error);
        handleError(error, { context: 'loading chama details' });
        // Fallback to mock data on error
        setChama(mockChamaDetail);
      } finally {
        setIsLoading(false);
      }
    };

    loadChamaDetail();
  }, [chamaId, handleError, getGroupInfo, isConnected, primaryWallet?.address, isGroupMember, isGroupCreator]);

  const handleJoinChama = async () => {
    if (!chama || !chamaId) return;
    
    setIsJoining(true);
    try {
      const groupId = parseInt(chamaId);
      if (isNaN(groupId)) {
        throw new Error('Invalid group ID');
      }

      // Call the real contract join function
      const txHash = await joinGroup(groupId);
      
      if (txHash) {
        toast.success('Joined Chama!', `You've successfully joined ${chama.name}.`);
        
        // Update local state
        setIsMember(true);
        setChama(prev => prev ? {
          ...prev,
          currentMembers: prev.currentMembers + 1,
          members: [...prev.members, {
            address: primaryWallet?.address || '',
            joinedAt: new Date(),
            contributionsMade: 0,
            isActive: true
          }]
        } : null);
      }
    } catch (error) {
      console.error('❌ Error joining chama:', error);
      handleError(error, { context: 'joining chama' });
    } finally {
      setIsJoining(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link Copied!', 'Chama link copied to clipboard');
    } catch (error) {
      // Fallback for older browsers
      toast.success('Share Link', url);
    }
  };

  const canJoinChama = () => {
    if (!chama || !isConnected) return false;
    
    // Can't join if already a member
    if (isMember) return false;
    
    return chama.status === 'open' && 
           chama.currentMembers < chama.maxMembers &&
           parseFloat(balance) >= chama.contributionAmount;
  };

  const getJoinButtonConfig = () => {
    if (!isConnected) {
      return { text: 'Connect Wallet', disabled: true, variant: 'outline' as const };
    }
    
    if (isCreator) {
      return { text: 'Manage Group', disabled: false, variant: 'default' as const };
    }
    
    if (isMember) {
      return { text: 'Already Joined', disabled: true, variant: 'outline' as const };
    }
    
    if (!chama) {
      return { text: 'Loading...', disabled: true, variant: 'outline' as const };
    }
    
    if (chama.status === 'full') {
      return { text: 'Group Full', disabled: true, variant: 'outline' as const };
    }
    
    if (parseFloat(balance) < chama.contributionAmount) {
      return { text: 'Insufficient Balance', disabled: true, variant: 'outline' as const };
    }
    
    if (chama.status !== 'open') {
      return { text: 'Group Closed', disabled: true, variant: 'outline' as const };
    }
    
    return { text: 'Join Chama', disabled: false, variant: 'bitcoin' as const };
  };

  const getStatusColor = (status: ChamaDetail['status']) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bitcoin"></div>
      </div>
    );
  }

  if (!chama) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Chama Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The chama you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => setLocation('/browse')}>
            Browse Other Chamas
          </Button>
        </div>
      </div>
    );
  }

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
                onClick={() => setLocation('/browse')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {chama.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chama Details
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              <WalletDropdown />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-2xl">{chama.name}</CardTitle>
                      {chama.isVerified && (
                        <Shield className="h-5 w-5 text-green-500" title="Verified" />
                      )}
                      <Badge className={getStatusColor(chama.status)}>
                        {chama.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{chama.trustScore} Trust Score</span>
                      </div>
                      <div>Created {formatDistanceToNow(chama.createdAt, { addSuffix: true })}</div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {chama.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {chama.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Bitcoin className="h-8 w-8 text-bitcoin mx-auto mb-2" />
                  <div className="text-2xl font-bold">{chama.contributionAmount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">cBTC per round</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{chama.roundLength}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">days per round</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{chama.currentMembers}/{chama.maxMembers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">members</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{chama.totalSaved}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">cBTC saved</div>
                </CardContent>
              </Card>
            </div>

            {/* Members */}
            <Card>
              <CardHeader>
                <CardTitle>Members ({chama.currentMembers}/{chama.maxMembers})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chama.members.map((member, index) => (
                    <div key={member.address} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.nickname ? member.nickname[0].toUpperCase() : `M${index + 1}`}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.nickname || `Member ${index + 1}`}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {member.address}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {member.contributionsMade} contributions
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Joined {formatDistanceToNow(member.joinedAt, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: chama.maxMembers - chama.currentMembers }).map((_, index) => (
                    <div key={`empty-${index}`} className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      <Avatar>
                        <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                          <UserPlus className="h-4 w-4 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-gray-500 dark:text-gray-400">
                        Open slot - Join now!
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card>
              <CardHeader>
                <CardTitle>Group Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {chama.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <Card className="border-bitcoin/20">
              <CardHeader>
                <CardTitle className="text-bitcoin">
                  {isCreator ? 'Manage Group' : isMember ? 'Group Member' : 'Join This Chama'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isConnected ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Connect your wallet to join this chama
                    </p>
                  </div>
                ) : isCreator ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      You are the creator of this chama
                    </p>
                    <Button
                      onClick={() => setLocation(`/group/${chamaId}`)}
                      className="w-full"
                      variant="default"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage Group
                    </Button>
                  </div>
                ) : isMember ? (
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      You are already a member of this chama
                    </p>
                  </div>
                ) : canJoinChama() ? (
                  <>
                    <div className="text-center py-2">
                      <div className="text-2xl font-bold text-bitcoin mb-1">
                        {chama.contributionAmount} cBTC
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Required contribution
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleJoinChama}
                      disabled={isJoining}
                      className="w-full"
                      variant="bitcoin"
                    >
                      {isJoining ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Joining...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Join Chama
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <Info className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {chama.status === 'full' ? 'This chama is full' :
                       parseFloat(balance) < chama.contributionAmount ? 'Insufficient balance' :
                       'Unable to join at this time'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Current Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Members</span>
                    <span>{chama.currentMembers}/{chama.maxMembers}</span>
                  </div>
                  <Progress value={(chama.currentMembers / chama.maxMembers) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current Round</span>
                    <span>{chama.currentRound}</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Next round: {formatDistanceToNow(chama.nextRoundDate, { addSuffix: true })}
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <div className="text-lg font-bold text-bitcoin">
                    {chama.totalSaved} cBTC
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total saved so far
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle>Created By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>C</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">Creator</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {chama.creator}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
