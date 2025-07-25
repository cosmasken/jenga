import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Vote, Crown, Clock, CheckCircle } from 'lucide-react';
import { 
  useSacco, 
  useSubmitCommitteeBid, 
  useVoteOnCommitteeBid,
  useRemoveBoardMember,
  useBoardMemberAddedEvent,
  useCommitteeBidSubmittedEvent,
  useCommitteeBidAcceptedEvent 
} from '@/hooks/useSacco';
import { BoardMember, CommitteeBid, Member } from '@/contracts/sacco-contract';

export function BoardManagement() {
  const { address } = useAccount();
  const { 
    useGetBoardMembers, 
    useGetCommitteeBids, 
    useIsBoardMember,
    useGetActiveBoardMembersCount,
    useGetActiveBidsCount,
    useMembers 
  } = useSacco();

  // Contract read hooks
  const { data: boardMembers = [], isLoading: loadingBoard } = useGetBoardMembers() as { data: BoardMember[]; isLoading: boolean };
  const { data: committeeBids = [], isLoading: loadingBids } = useGetCommitteeBids() as { data: CommitteeBid[]; isLoading: boolean };
  const { data: isBoardMember } = useIsBoardMember(address || '0x');
  const { data: activeBoardCount } = useGetActiveBoardMembersCount();
  const { data: activeBidsCount } = useGetActiveBidsCount();
  const { data: memberInfo } = useMembers(address || '0x') as { data: Member | undefined };

  // Write hooks
  const { submitCommitteeBid, isPending: submittingBid } = useSubmitCommitteeBid();
  const { voteOnCommitteeBid, isPending: voting } = useVoteOnCommitteeBid();
  const { removeBoardMember, isPending: removing } = useRemoveBoardMember();

  // Local state
  const [bidProposal, setBidProposal] = useState('');
  const [bidAmount, setBidAmount] = useState('0.01');
  const [voteAmounts, setVoteAmounts] = useState<{ [key: number]: string }>({});

  // Event listeners
  useBoardMemberAddedEvent((event) => {
    console.log('New board member added:', event);
  });

  useCommitteeBidSubmittedEvent((event) => {
    console.log('New committee bid submitted:', event);
  });

  useCommitteeBidAcceptedEvent((event) => {
    console.log('Committee bid accepted:', event);
  });

  const handleSubmitBid = () => {
    if (!bidProposal.trim() || !bidAmount) return;
    submitCommitteeBid(bidProposal, bidAmount);
    setBidProposal('');
    setBidAmount('0.01');
  };

  const handleVoteOnBid = (bidId: number) => {
    const votes = voteAmounts[bidId];
    if (!votes || Number(votes) <= 0) return;
    voteOnCommitteeBid(BigInt(bidId), BigInt(votes));
    setVoteAmounts(prev => ({ ...prev, [bidId]: '' }));
  };

  const handleRemoveMember = (memberAddress: string) => {
    if (confirm('Are you sure you want to remove this board member?')) {
      removeBoardMember(memberAddress as `0x${string}`);
    }
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const activeBoardMembers = boardMembers.filter(member => member.isActive);
  const activeBids = committeeBids.filter(bid => bid.isActive);

  return (
    <div className="space-y-6">
      {/* Board Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Board of Directors
          </CardTitle>
          <CardDescription>
            Current board members and governance overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {activeBoardCount?.toString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Active Board Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {activeBidsCount?.toString() || '0'}
              </div>
              <div className="text-sm text-gray-600">Active Bids</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">3</div>
              <div className="text-sm text-gray-600">Maximum Board Size</div>
            </div>
          </div>

          {loadingBoard ? (
            <div className="text-center py-4">Loading board members...</div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-semibold">Current Board Members</h4>
              {activeBoardMembers.length === 0 ? (
                <Alert>
                  <AlertDescription>No active board members found.</AlertDescription>
                </Alert>
              ) : (
                activeBoardMembers.map((member: BoardMember, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <div>
                        <div className="font-mono text-sm">
                          {member.memberAddress.slice(0, 6)}...{member.memberAddress.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Appointed: {formatDate(member.appointedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {member.votes.toString()} votes
                      </Badge>
                      {address !== member.memberAddress && isBoardMember && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveMember(member.memberAddress)}
                          disabled={removing}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Committee Bid */}
      {!isBoardMember && memberInfo?.isActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Submit Committee Bid
            </CardTitle>
            <CardDescription>
              Submit a bid to join the board of directors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proposal">Proposal Statement</Label>
              <Textarea
                id="proposal"
                placeholder="Describe your vision and qualifications for joining the board..."
                value={bidProposal}
                onChange={(e) => setBidProposal(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bidAmount">Bid Amount (BTC)</Label>
              <Input
                id="bidAmount"
                type="number"
                step="0.001"
                min="0.01"
                placeholder="0.01"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                Minimum bid amount: 0.01 BTC
              </div>
            </div>
            <Button
              onClick={handleSubmitBid}
              disabled={submittingBid || !bidProposal.trim() || !bidAmount}
              className="w-full"
            >
              {submittingBid ? 'Submitting...' : 'Submit Committee Bid'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Committee Bids */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Committee Bids
          </CardTitle>
          <CardDescription>
            Vote on committee bids to elect new board members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBids ? (
            <div className="text-center py-4">Loading committee bids...</div>
          ) : activeBids.length === 0 ? (
            <Alert>
              <AlertDescription>No active committee bids at the moment.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {activeBids.map((bid: CommitteeBid, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="font-mono text-sm">
                          {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                        </div>
                        <Badge variant="outline">
                          {formatEther(bid.bidAmount)} BTC
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{bid.proposal}</p>
                      <div className="text-xs text-gray-500">
                        Submitted: {formatDate(bid.submissionDate)} • 
                        Current votes: {bid.votes.toString()}
                      </div>
                    </div>
                  </div>
                  
                  {memberInfo?.isActive && address !== bid.bidder && (
                    <>
                      <Separator className="my-3" />
                      <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Votes to cast"
                        min="1"
                        max={memberInfo.shares?.toString() || '0'}
                        value={voteAmounts[index] || ''}
                        onChange={(e) => setVoteAmounts(prev => ({ 
                          ...prev, 
                          [index]: e.target.value 
                        }))}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleVoteOnBid(index)}
                        disabled={voting || !voteAmounts[index]}
                      >
                        {voting ? 'Voting...' : 'Vote'}
                      </Button>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        You can vote with up to {memberInfo.shares?.toString() || '0'} shares
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Board Status Alert */}
      {isBoardMember && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You are currently a board member. You can vote on committee bids and participate in governance decisions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
