
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { Target, Zap, Shield, Gift, Calendar, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const PersonalStacking = () => {
  const [dailyGoal, setDailyGoal] = useState(1000);
  const [currentSats, setCurrentSats] = useState(650);
  const [showStackingModal, setShowStackingModal] = useState(false);
  const [stackAmount, setStackAmount] = useState("100");
  const { toast } = useToast();

  const handleStackSats = (amount = 100) => {
    const newAmount = currentSats + amount;
    setCurrentSats(newAmount);
    
    // Show stacking success modal
    setShowStackingModal(true);
    
    if (newAmount >= dailyGoal) {
      setTimeout(() => {
        toast({
          title: "🎉 Daily Goal Achieved!",
          description: "You've hit your stacking target. Streak continues!",
        });
      }, 1500);
    }
  };

  const handleCustomStack = () => {
    const amount = parseInt(stackAmount);
    if (amount > 0) {
      handleStackSats(amount);
      setStackAmount("100");
    }
  };

  const progressPercentage = Math.min((currentSats / dailyGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Daily Goal Card */}
      <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Today's Stacking Goal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{currentSats.toLocaleString()}</span>
              <span className="text-orange-200">/ {dailyGoal.toLocaleString()} sats</span>
            </div>
            <Progress value={progressPercentage} className="bg-orange-400" />
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleStackSats(100)}
                variant="secondary" 
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                +100 Sats
              </Button>
              <Button 
                onClick={() => handleStackSats(500)}
                variant="secondary" 
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                <Zap className="w-4 h-4 mr-2" />
                +500 Sats
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Custom amount"
                value={stackAmount}
                onChange={(e) => setStackAmount(e.target.value)}
                className="bg-white text-gray-900"
              />
              <Button 
                onClick={handleCustomStack}
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                Stack
              </Button>
            </div>
            <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-orange-600">
              Adjust Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ZK Vaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              ZK Privacy Vaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Emergency Fund</h3>
              <p className="text-green-600 text-sm mb-3">Proven savings without revealing amount</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  ZK-Proof Valid ✓
                </Badge>
                <Button size="sm" variant="outline">
                  Generate Proof
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Vacation Fund</h3>
              <p className="text-blue-600 text-sm mb-3">Private savings goal tracking</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  Goal: 75% Complete
                </Badge>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-600" />
              Achievements & NFTs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs font-semibold">12-Day Streak</div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-xs font-semibold">Bronze Stacker</div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs font-semibold">Lightning Fast</div>
              </div>
              
              <div className="p-3 bg-gray-200 rounded-lg text-gray-600 text-center border-2 border-dashed">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-semibold">Goal Master</div>
              </div>
            </div>
            
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              Mint Achievement NFT
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Stacking Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">127,543</div>
              <div className="text-sm text-gray-600">Total Sats</div>
              <div className="text-xs text-green-600">+12% this week</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-xs text-orange-600">Personal best!</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">89%</div>
              <div className="text-sm text-gray-600">Goal Hit Rate</div>
              <div className="text-xs text-blue-600">This month</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">NFT Badges</div>
              <div className="text-xs text-purple-600">Collected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stacking Success Modal */}
      <Modal
        isOpen={showStackingModal}
        onClose={() => setShowStackingModal(false)}
        type="stacking"
        title="Sats Stacked Successfully! ⚡"
        description="Your Bitcoin has been added to your stack via Citrea L2"
        amount={`${stackAmount} sats`}
      />
    </div>
  );
};
