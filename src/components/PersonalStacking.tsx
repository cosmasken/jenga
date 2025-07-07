import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { ZKVaultModal } from "@/components/ZKVaultModal";
import { AchievementMintModal } from "@/components/AchievementMintModal";
import { Target, Zap, Shield, Gift, Calendar, TrendingUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useStackingVault, useFormattedStackingData } from "@/hooks/useJengaContracts";

export const PersonalStacking = () => {
  const [stackAmount, setStackAmount] = useState("100");
  const [showStackingModal, setShowStackingModal] = useState(false);
  const [showZKVault, setShowZKVault] = useState(false);
  const [selectedVault, setSelectedVault] = useState<"emergency" | "vacation">("emergency");
  const [showAchievementMint, setShowAchievementMint] = useState(false);
  const { toast } = useToast();
  
  // Use the new hooks
  const { deposit, isLoading, isConnected } = useStackingVault();
  const { dailyGoalSats, totalStackedSats } = useFormattedStackingData();
  
  // Calculate current progress (simplified - in real app, track daily progress)
  const currentSats = Math.min(dailyGoalSats * 0.65, dailyGoalSats);
  const progressPercentage = dailyGoalSats > 0 ? (currentSats / dailyGoalSats) * 100 : 0;

  const handleStackSats = async (amount = 100) => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    // Convert sats to BTC
    const amountBtc = (amount / 100000000).toString();
    
    // Make deposit using the hook
    const result = await deposit(amountBtc);
    
    if (result) {
      // Show stacking success modal
      setShowStackingModal(true);
      
      const newAmount = currentSats + amount;
      if (newAmount >= dailyGoalSats) {
        setTimeout(() => {
          toast({
            title: "🎉 Daily Goal Achieved!",
            description: "You've hit your stacking target. Streak continues!",
          });
        }, 1500);
      }
    }
  };

  const handleCustomStack = async () => {
    const amount = parseInt(stackAmount);
    if (amount > 0) {
      await handleStackSats(amount);
      setStackAmount("100");
    }
  };

  const handleVaultClick = (vaultType: "emergency" | "vacation") => {
    setSelectedVault(vaultType);
    setShowZKVault(true);
  };

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
              <span className="text-orange-200">/ {dailyGoalSats.toLocaleString()} sats</span>
            </div>
            <Progress value={progressPercentage} className="bg-orange-400" />
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => handleStackSats(100)}
                disabled={isLoading}
                variant="secondary" 
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                +100 Sats
              </Button>
              <Button 
                onClick={() => handleStackSats(500)}
                disabled={isLoading}
                variant="secondary" 
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
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
                disabled={isLoading}
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-orange-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Stack"}
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
        <Card className="bg-card cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-mono">
              <Shield className="w-5 h-5 text-green-400" />
              ZK Privacy Vaults
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="p-4 bg-green-500/10 rounded-lg border border-green-500/30 cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => handleVaultClick("emergency")}
            >
              <h3 className="font-semibold text-green-400 mb-2 font-mono">Emergency Fund</h3>
              <p className="text-green-300 text-sm mb-3 font-mono">Proven savings without revealing amount</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 font-mono">
                  ZK-Proof Valid ✓
                </Badge>
              </div>
            </div>
            
            <div 
              className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30 cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => handleVaultClick("vacation")}
            >
              <h3 className="font-semibold text-blue-400 mb-2 font-mono">Vacation Fund</h3>
              <p className="text-blue-300 text-sm mb-3 font-mono">Private savings goal tracking</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/50 font-mono">
                  Goal: 75% Complete
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements & Rewards */}
        <Card className="bg-card cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground font-mono">
              <Gift className="w-5 h-5 text-purple-400" />
              Achievements & NFTs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs font-semibold font-mono">12-Day Streak</div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white text-center">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-xs font-semibold font-mono">Bronze Stacker</div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg text-white text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs font-semibold font-mono">Lightning Fast</div>
              </div>
              
              <div className="p-3 bg-gray-500/20 rounded-lg text-gray-400 text-center border-2 border-dashed border-gray-500/50">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-semibold font-mono">Goal Master</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowAchievementMint(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 cyber-button font-mono"
            >
              Mint Achievement NFT
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <Card className="bg-card cyber-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-mono">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Stacking Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">127,543</div>
              <div className="text-sm text-muted-foreground font-mono">Total Sats</div>
              <div className="text-xs text-green-400 font-mono">+12% this week</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">12</div>
              <div className="text-sm text-muted-foreground font-mono">Current Streak</div>
              <div className="text-xs text-orange-400 font-mono">Personal best!</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">89%</div>
              <div className="text-sm text-muted-foreground font-mono">Goal Hit Rate</div>
              <div className="text-xs text-blue-400 font-mono">This month</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground font-mono">3</div>
              <div className="text-sm text-muted-foreground font-mono">NFT Badges</div>
              <div className="text-xs text-purple-400 font-mono">Collected</div>
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

      <ZKVaultModal
        isOpen={showZKVault}
        onClose={() => setShowZKVault(false)}
        vaultType={selectedVault}
      />

      <AchievementMintModal
        isOpen={showAchievementMint}
        onClose={() => setShowAchievementMint(false)}
      />
    </div>
  );
};
