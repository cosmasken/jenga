
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PersonalStacking } from "@/components/PersonalStacking";
import { ChamaCircles } from "@/components/ChamaCircles";
import { P2PSending } from "@/components/P2PSending";
import { Coins, Users, Send, Zap, TrendingUp, Trophy } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("stacking");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Jenga</h1>
                <p className="text-sm text-gray-600">Stack, Circle, Send</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                <Zap className="w-3 h-3 mr-1" />
                Testnet
              </Badge>
              <Button variant="outline" size="sm">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Stacked</p>
                  <p className="text-2xl font-bold">127,543 sats</p>
                  <p className="text-orange-200 text-xs">~$51.23</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">12 days</p>
                  <p className="text-green-600 text-xs">🔥 On fire!</p>
                </div>
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Active Chamas</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                  <p className="text-blue-600 text-xs">Contributing weekly</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-orange-200">
            <TabsTrigger 
              value="stacking" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Coins className="w-4 h-4 mr-2" />
              Personal Stacking
            </TabsTrigger>
            <TabsTrigger 
              value="chamas" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Chama Circles
            </TabsTrigger>
            <TabsTrigger 
              value="sending" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              P2P Sending
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stacking" className="mt-6">
            <PersonalStacking />
          </TabsContent>

          <TabsContent value="chamas" className="mt-6">
            <ChamaCircles />
          </TabsContent>

          <TabsContent value="sending" className="mt-6">
            <P2PSending />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-100 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Powered by Citrea - Bitcoin's ZK Rollup</p>
            <p className="text-sm">Building the future of Bitcoin finance, one sat at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
