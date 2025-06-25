
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { Users, Plus, Vote, Shield, Calendar, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ChamaCircles = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [selectedChama, setSelectedChama] = useState("");
  const [newChamaName, setNewChamaName] = useState("");
  const [modalData, setModalData] = useState({ type: "success", title: "", description: "", amount: "", chamaName: "" });
  const { toast } = useToast();

  const chamas = [
    {
      id: 1,
      name: "Women Farmers Circle",
      members: 12,
      weeklyTarget: 5000,
      currentPool: 38000,
      nextPayout: "3 days",
      myContribution: 15000,
      role: "Member"
    },
    {
      id: 2,
      name: "Tech Builders Fund",
      members: 8,
      weeklyTarget: 10000,
      currentPool: 72000,
      nextPayout: "1 day",
      myContribution: 30000,
      role: "Admin"
    },
    {
      id: 3,
      name: "Family Emergency Fund",
      members: 6,
      weeklyTarget: 3000,
      currentPool: 15000,
      nextPayout: "5 days",
      myContribution: 9000,
      role: "Member"
    }
  ];

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

  const handleContribute = () => {
    if (!contributionAmount || !selectedChama) {
      toast({
        title: "Missing Information",
        description: "Please select a chama and enter contribution amount",
      });
      return;
    }

    setModalData({
      type: "contribution",
      title: "Contribution Successful!",
      description: "Your sats have been added to the chama pool",
      amount: `${contributionAmount} sats`,
      chamaName: selectedChama
    });
    setShowContributeModal(true);
    setContributionAmount("");
  };

  const handleVote = (proposalId: number, vote: 'yes' | 'no' | 'abstain') => {
    const proposal = proposals.find(p => p.id === proposalId);
    setModalData({
      type: "vote",
      title: "Vote Recorded!",
      description: `Your ${vote} vote has been recorded for: ${proposal?.title}`,
      amount: "",
      chamaName: ""
    });
    setShowVoteModal(true);
  };

  const handleCreateChama = () => {
    if (!newChamaName) {
      toast({
        title: "Missing Name",
        description: "Please enter a chama name",
      });
      return;
    }

    setModalData({
      type: "create-chama",
      title: "Chama Created Successfully!",
      description: "Your new savings circle is ready. Invite members to get started.",
      amount: "",
      chamaName: newChamaName
    });
    setShowCreateModal(true);
    setNewChamaName("");
  };

  return (
    <div className="space-y-6">
      {/* Create New Chama */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create New Chama Circle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-100 mb-4">
            Start a new savings circle with friends, family, or community members
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="Enter chama name..."
              value={newChamaName}
              onChange={(e) => setNewChamaName(e.target.value)}
              className="bg-white text-gray-900"
            />
            <Button 
              onClick={handleCreateChama}
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Create Chama
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* My Chamas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chamas.map((chama) => {
          const progressPercentage = (chama.currentPool / (chama.weeklyTarget * chama.members)) * 100;
          
          return (
            <Card key={chama.id} className="bg-white border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{chama.name}</CardTitle>
                  <Badge variant="outline" className={
                    chama.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                  }>
                    {chama.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Members</p>
                    <p className="font-semibold">{chama.members}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Next Payout</p>
                    <p className="font-semibold">{chama.nextPayout}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Pool Progress</span>
                    <span className="font-semibold">{chama.currentPool.toLocaleString()} sats</span>
                  </div>
                  <Progress value={Math.min(progressPercentage, 100)} className="bg-blue-100" />
                  <p className="text-xs text-gray-500 mt-1">
                    Target: {(chama.weeklyTarget * chama.members).toLocaleString()} sats
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setSelectedChama(chama.name);
                      // Trigger contribute flow
                      setContributionAmount("5000");
                      handleContribute();
                    }}
                  >
                    Contribute
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Governance & Voting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="w-5 h-5 text-purple-600" />
            Active Proposals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{proposal.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{proposal.amount}</p>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-700">
                  {proposal.timeLeft} left
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Yes</p>
                  <p className="text-lg font-bold text-green-600">{proposal.votes.yes}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">No</p>
                  <p className="text-lg font-bold text-red-600">{proposal.votes.no}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Abstain</p>
                  <p className="text-lg font-bold text-gray-600">{proposal.votes.abstain}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleVote(proposal.id, 'yes')}
                >
                  Vote Yes
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleVote(proposal.id, 'no')}
                >
                  Vote No
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleVote(proposal.id, 'abstain')}
                >
                  Abstain
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Chama Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            My Chama Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">54,000</div>
              <div className="text-sm text-gray-600">Total Contributed</div>
              <div className="text-xs text-green-600">This month</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">2</div>
              <div className="text-sm text-gray-600">Payouts Received</div>
              <div className="text-xs text-blue-600">Lifetime</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">96%</div>
              <div className="text-sm text-gray-600">Contribution Rate</div>
              <div className="text-xs text-green-600">Reliable member</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Active Circles</div>
              <div className="text-xs text-purple-600">Diversified</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        type={modalData.type as any}
        title={modalData.title}
        description={modalData.description}
        amount={modalData.amount}
        chamaName={modalData.chamaName}
      />

      <Modal
        isOpen={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        type="vote"
        title={modalData.title}
        description={modalData.description}
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        type="create-chama"
        title={modalData.title}
        description={modalData.description}
        chamaName={modalData.chamaName}
        onConfirm={() => {
          toast({
            title: "📋 Invite Link Copied!",
            description: "Share this link to invite members to your chama",
          });
          setShowCreateModal(false);
        }}
        confirmText="Copy Invite Link"
      />
    </div>
  );
};
