import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Vote, Shield, TrendingUp, UserPlus, Loader2 } from "lucide-react";
import { ChamaCreationForm } from "@/components/ChamaCreationForm";
import { ContributionForm } from "@/components/ContributionForm";
import { VotingForm } from "@/components/VotingForm";
import { JoinChamaForm } from "@/components/JoinChamaForm";
import { useSaccoFactory } from "@/hooks/useJengaContracts";

export const ChamaCircles = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState(false);
  const [showVotingForm, setShowVotingForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);

  // Use the Sacco Factory hook to get real pool data
  const { pools, isLoading, refreshPools } = useSaccoFactory();

  // Transform pools data for display
  const chamas = pools.map((pool, index) => ({
    id: pool.id || index,
    name: `Savings Circle #${pool.id || index}`,
    members: pool.members?.length || 0,
    weeklyTarget: parseFloat(pool.contributionAmount) * 100000000, // Convert to sats
    currentPool: parseFloat(pool.contributionAmount) * (pool.members?.length || 0) * 100000000,
    nextPayout: `${Math.max(0, pool.cycleDuration - Math.floor((Date.now() / 1000) - pool.lastPayout))} seconds`,
    myContribution: 0, // Would need to track user's contributions
    role: "Member",
    state: pool.state === 0 ? "Active" : "Completed",
    currentCycle: pool.currentCycle,
    totalCycles: pool.totalCycles,
    creator: pool.creator
  }));

  // Fallback mock data if no pools loaded yet
  const mockChamas = [
    {
      id: 1,
      name: "Women Farmers Circle",
      members: 12,
      weeklyTarget: 5000,
      currentPool: 38000,
      nextPayout: "3 days",
      myContribution: 15000,
      role: "Member",
      state: "Active"
    },
    {
      id: 2,
      name: "Tech Builders Fund",
      members: 8,
      weeklyTarget: 10000,
      currentPool: 72000,
      nextPayout: "1 day",
      myContribution: 30000,
      role: "Admin",
      state: "Active"
    },
    {
      id: 3,
      name: "Family Emergency Fund",
      members: 6,
      weeklyTarget: 3000,
      currentPool: 15000,
      nextPayout: "5 days",
      myContribution: 9000,
      role: "Member",
      state: "Active"
    }
  ];

  // Use real data if available, otherwise fallback to mock data
  const displayChamas = chamas.length > 0 ? chamas : mockChamas;

  const proposals = [
    {
      id: 1,
      title: "Emergency payout for Maria's medical expenses",
      amount: "50,000 sats",
      votes: { yes: 8, no: 1, abstain: 1 },
      timeLeft: "2 days",
      status: "active"
    },
    {
      id: 2,
      title: "Increase weekly contribution to 7,000 sats",
      amount: "Weekly target change",
      votes: { yes: 5, no: 3, abstain: 2 },
      timeLeft: "5 days",
      status: "active"
    }
  ];

  const handleVote = (proposalId: number) => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (proposal) {
      setSelectedProposal({
        ...proposal,
        description: proposalId === 1 ? "Emergency medical expenses for Maria who needs immediate surgery" : "Increase weekly contribution target to accelerate savings goals"
      });
      setShowVotingForm(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 cyber-border neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-mono">
              <Plus className="w-5 h-5" />
              Create New Chama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-100 mb-4 font-mono text-sm">
              Start a savings circle with friends or community
            </p>
            <Button
              onClick={() => setShowCreateForm(true)}
              variant="secondary"
              className="w-full bg-white text-blue-600 hover:bg-blue-50 font-mono cyber-button"
            >
              Create Chama
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-600 to-teal-600 text-white border-0 cyber-border neon-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white font-mono">
              <UserPlus className="w-5 h-5" />
              Join Existing Chama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-100 mb-4 font-mono text-sm">
              Join a chama using an invite code
            </p>
            <Button
              onClick={() => setShowJoinForm(true)}
              variant="secondary"
              className="w-full bg-white text-green-600 hover:bg-green-50 font-mono cyber-button"
            >
              Join Chama
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Contribute */}
      <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0 cyber-border neon-glow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-white font-semibold">Quick Contribute</h3>
              <p className="text-white/80 text-sm font-mono">Add sats to your active chamas</p>
            </div>
            <Button
              onClick={() => setShowContributeForm(true)}
              variant="secondary"
              className="bg-white text-orange-600 hover:bg-orange-50 font-mono cyber-button"
            >
              Contribute Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Chamas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="ml-2 text-muted-foreground">Loading chamas...</span>
          </div>
        ) : displayChamas.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No chamas found. Create your first one!</p>
          </div>
        ) : (
          displayChamas.map((chama) => {
            const progressPercentage = (chama.currentPool / (chama.weeklyTarget * chama.members)) * 100;

            return (
              <Card key={chama.id} className="bg-card cyber-border neon-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-foreground font-mono">{chama.name}</CardTitle>
                    <Badge variant="outline" className={
                      chama.role === "Admin" ? "bg-purple-500/20 text-purple-400 border-purple-500/50" : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                    }>
                      {chama.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground font-mono">Members</p>
                      <p className="font-semibold text-foreground font-mono">{chama.members}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-mono">Next Payout</p>
                      <p className="font-semibold text-foreground font-mono">{chama.nextPayout}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground font-mono">Pool Progress</span>
                      <span className="font-semibold text-orange-400 font-mono">{chama.currentPool.toLocaleString()} sats</span>
                    </div>
                    <Progress value={Math.min(progressPercentage, 100)} className="bg-blue-500/20" />
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      Target: {(chama.weeklyTarget * chama.members).toLocaleString()} sats
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 cyber-button font-mono"
                      onClick={() => setShowContributeForm(true)}
                    >
                      Contribute
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 cyber-button font-mono">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          }))
        }
      </div>

      {/* Governance & Voting */}
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <Vote className="w-5 h-5 text-purple-400" />
            Active Proposals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground font-mono">{proposal.title}</h4>
                  <p className="text-sm text-muted-foreground font-mono mt-1">{proposal.amount}</p>
                </div>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 font-mono">
                  {proposal.timeLeft} left
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-mono">Yes</p>
                  <p className="text-lg font-bold text-green-400 font-mono">{proposal.votes.yes}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-mono">No</p>
                  <p className="text-lg font-bold text-red-400 font-mono">{proposal.votes.no}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground font-mono">Abstain</p>
                  <p className="text-lg font-bold text-muted-foreground font-mono">{proposal.votes.abstain}</p>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 cyber-button font-mono"
                onClick={() => handleVote(proposal.id)}
              >
                Cast Vote
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chama Analytics */}
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            My Chama Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">54,000</div>
              <div className="text-sm text-muted-foreground font-mono">Total Contributed</div>
              <div className="text-xs text-green-400 font-mono">This month</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">2</div>
              <div className="text-sm text-muted-foreground font-mono">Payouts Received</div>
              <div className="text-xs text-blue-400 font-mono">Lifetime</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">96%</div>
              <div className="text-sm text-muted-foreground font-mono">Contribution Rate</div>
              <div className="text-xs text-green-400 font-mono">Reliable member</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">3</div>
              <div className="text-sm text-muted-foreground font-mono">Active Circles</div>
              <div className="text-xs text-purple-400 font-mono">Diversified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Form Modals */}
      <ChamaCreationForm
        isOpen={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          refreshPools(); // Refresh pools after creating
        }}
      />
      <ContributionForm
        isOpen={showContributeForm}
        onClose={() => {
          setShowContributeForm(false);
          refreshPools(); // Refresh pools after contributing
        }}
      />
      <VotingForm
        isOpen={showVotingForm}
        onClose={() => setShowVotingForm(false)}
        proposal={selectedProposal}
      />
      <JoinChamaForm
        isOpen={showJoinForm}
        onClose={() => {
          setShowJoinForm(false);
          refreshPools(); // Refresh pools after joining
        }}
      />
    </div>
  );
};
