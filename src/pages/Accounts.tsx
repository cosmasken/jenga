
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/components/UserProfile";
import { WalletManagement } from "@/components/WalletManagement";
import { ContactsSection } from "@/components/ContactsSection";
import { OnrampOfframp } from "@/components/OnrampOfframp";
import { AdjustGoalModal } from "@/components/AdjustGoalModal";
import { useAuth } from "@/contexts/AuthContext";
import { User, Wallet, Users, Target, Trophy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Accounts = () => {
  const { user } = useAuth();
  const [showAdjustGoal, setShowAdjustGoal] = useState(false);

  const achievements = [
    { id: "streak", name: "12-Day Streak", emoji: "🔥", earned: true, date: "2024-01-15" },
    { id: "bronze", name: "Bronze Stacker", emoji: "🏆", earned: true, date: "2024-01-10" },
    { id: "lightning", name: "Lightning Fast", emoji: "⚡", earned: true, date: "2024-01-20" },
    { id: "goal", name: "Goal Master", emoji: "🎯", earned: false, date: null }
  ];

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="cyber-button p-2">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground glitch-text">ACCOUNT</h1>
                <p className="text-sm text-muted-foreground font-mono">MANAGE YOUR PROFILE</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/50 font-mono">
                {user?.balance.toLocaleString()} sats
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <User className="w-4 h-4 mr-2" />
              PROFILE
            </TabsTrigger>
            <TabsTrigger 
              value="wallets" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <Wallet className="w-4 h-4 mr-2" />
              WALLETS
            </TabsTrigger>
            <TabsTrigger 
              value="contacts" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <Users className="w-4 h-4 mr-2" />
              CONTACTS
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-black font-mono"
            >
              <Trophy className="w-4 h-4 mr-2" />
              BADGES
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              <UserProfile />
              
              <Card className="bg-card cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground font-mono">
                    <Target className="w-5 h-5 text-orange-400" />
                    Stacking Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-mono">Daily Goal</p>
                      <p className="text-2xl font-bold text-orange-400">1,000 sats</p>
                    </div>
                    <Button 
                      onClick={() => setShowAdjustGoal(true)}
                      className="cyber-button"
                    >
                      ADJUST GOAL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="wallets" className="mt-6">
            <WalletManagement />
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <div className="space-y-6">
              <ContactsSection />
              <OnrampOfframp />
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <Card className="bg-card cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground font-mono">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  Achievement Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 text-center ${
                        achievement.earned
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/50'
                          : 'bg-gray-500/10 border-gray-500/30 opacity-50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{achievement.emoji}</div>
                      <div className="font-semibold font-mono text-foreground mb-1">
                        {achievement.name}
                      </div>
                      {achievement.earned && achievement.date && (
                        <div className="text-xs text-muted-foreground font-mono">
                          Earned: {new Date(achievement.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AdjustGoalModal
        isOpen={showAdjustGoal}
        onClose={() => setShowAdjustGoal(false)}
      />
    </div>
  );
};

export default Accounts;
