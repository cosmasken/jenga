
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, Plus, Trophy, Clock, Coins, Shield, Vote } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ChamaCircles = () => {
  const [selectedChama, setSelectedChama] = useState(null);
  const { toast } = useToast();

  const chamas = [
    {
      id: 1,
      name: "Women Farmers Circle",
      members: 8,
      totalPool: 45000,
      weeklyContribution: 5000,
      currentWeek: 3,
      maxWeeks: 8,
      nextPayout: "3 days",
      myContribution: 15000,
      status: "active",
      description: "Supporting women farmers in our community"
    },
    {
      id: 2,
      name: "Tech Builders",
      members: 12,
      totalPool: 120000,
      weeklyContribution: 10000,
      currentWeek: 6,
      maxWeeks: 12,
      nextPayout: "5 days",
      myContribution: 60000,
      status: "active",
      description: "Building the future with Bitcoin"
    },
    {
      id: 3,
      name: "Student Support",
      members: 15,
      totalPool: 30000,
      weeklyContribution: 2000,
      currentWeek: 15,
      maxWeeks: 15,
      nextPayout: "Complete",
      myContribution: 30000,
      status: "completed",
      description: "Education funding for local students"
    }
  ];

  const handleJoinChama = () => {
    toast({
      title: "🎉 Joined Chama!",
      description: "Welcome to the circle. First contribution is due in 7 days.",
    });
  };

  const handleContribute = (chamaName: string) => {
    toast({
      title: "✅ Contribution Sent!",
      description: `Your weekly contribution to ${chamaName} has been processed.`,
    });
  };

  const handleZKLottery = () => {
    toast({
      title: "🎲 ZK Lottery Starting...",
      description: "Fair winner selection in progress using zero-knowledge proofs.",
    });
    
    setTimeout(() => {
      toast({
        title: "🏆 Lottery Complete!",
        description: "Winner selected privately. Check your notifications!",
      });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Create New Chama */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Start New Chama Circle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-100 mb-4">
            Create a trustless savings circle with smart contract automation
          </p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Create Chama
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Browse Public Circles
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Chamas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5" />
          My Chama Circles
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {chamas.map((chama) => (
            <Card key={chama.id} className={`${chama.status === 'completed' ? 'border-green-200 bg-green-50' : 'border-orange-200'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{chama.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{chama.description}</p>
                  </div>
                  <Badge 
                    variant={chama.status === 'active' ? 'default' : 'secondary'}
                    className={chama.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {chama.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Members:</span>
                    <div className="font-semibold">{chama.members} people</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Weekly:</span>
                    <div className="font-semibold">{chama.weeklyContribution.toLocaleString()} sats</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Pool:</span>
                    <div className="font-semibold text-orange-600">{chama.totalPool.toLocaleString()} sats</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Next Payout:</span>
                    <div className="font-semibold">{chama.nextPayout}</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Cycle Progress</span>
                    <span>{chama.currentWeek}/{chama.maxWeeks} weeks</span>
                  </div>
                  <Progress value={(chama.currentWeek / chama.maxWeeks) * 100} />
                </div>

                <div className="flex gap-2">
                  {chama.status === 'active' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleContribute(chama.name)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Coins className="w-4 h-4 mr-1" />
                        Contribute
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleZKLottery}
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        ZK Lottery
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <Vote className="w-4 h-4 mr-1" />
                    Vote
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Public Chamas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Featured Public Chamas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Bitcoin Hodlers Club</h3>
              <p className="text-sm text-gray-600 mb-3">Long-term Bitcoin accumulation strategy</p>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>24 members</span>
                <span>50k sats/week</span>
              </div>
              <Button size="sm" className="w-full" onClick={handleJoinChama}>
                Join Circle
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Local Business Fund</h3>
              <p className="text-sm text-gray-600 mb-3">Supporting local entrepreneurs</p>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>12 members</span>
                <span>25k sats/week</span>
              </div>
              <Button size="sm" className="w-full" onClick={handleJoinChama}>
                Join Circle
              </Button>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors cursor-pointer">
              <h3 className="font-semibold mb-2">Community Garden</h3>
              <p className="text-sm text-gray-600 mb-3">Funding sustainable agriculture</p>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>18 members</span>
                <span>15k sats/week</span>
              </div>
              <Button size="sm" className="w-full" onClick={handleJoinChama}>
                Join Circle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chama Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Your Chama Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Active Chamas</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">105,000</div>
              <div className="text-sm text-gray-600">Total Contributed</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">1</div>
              <div className="text-sm text-gray-600">Payouts Received</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-gray-600">Payment Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
