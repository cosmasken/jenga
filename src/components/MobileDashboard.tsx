import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Send, 
  Plus, 
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Bitcoin
} from 'lucide-react';
import { motion } from 'framer-motion';

export const MobileDashboard = () => {
  const [balanceVisible, setBalanceVisible] = useState(true);
  
  // Mock data - replace with real data
  const userData = {
    totalSavings: 0.05234, // BTC
    activeChamasCount: 3,
    reputationScore: 85,
    weeklyTarget: 5000, // sats
    weeklyProgress: 3500 // sats
  };

  const formatBTC = (amount: number) => {
    return amount.toFixed(8);
  };

  const formatSats = (sats: number) => {
    return new Intl.NumberFormat().format(sats);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header with Balance */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Total Savings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-white hover:bg-white/20"
              >
                {balanceVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold">
                {balanceVisible ? `₿ ${formatBTC(userData.totalSavings)}` : '₿ ••••••••'}
              </div>
              <div className="text-orange-100">
                ≈ $2,345.67 USD
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{userData.activeChamasCount}</div>
            <div className="text-sm text-muted-foreground">Active Chamas</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{userData.reputationScore}</div>
            <div className="text-sm text-muted-foreground">Reputation</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">This Week's Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{formatSats(userData.weeklyProgress)} sats</span>
                <span>{formatSats(userData.weeklyTarget)} sats</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(userData.weeklyProgress / userData.weeklyTarget) * 100}%` }}
                />
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                {Math.round((userData.weeklyProgress / userData.weeklyTarget) * 100)}% of weekly target
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-16 flex-col gap-2">
            <Plus className="w-5 h-5" />
            <span className="text-xs">Create Chama</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Users className="w-5 h-5" />
            <span className="text-xs">Join Chama</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex-col gap-2">
            <ArrowUpRight className="w-5 h-5" />
            <span className="text-xs">Contribute</span>
          </Button>
          
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Send className="w-5 h-5" />
            <span className="text-xs">Send BTC</span>
          </Button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { type: 'contribution', amount: '5,000 sats', chama: 'Women Farmers', time: '2 hours ago' },
              { type: 'payout', amount: '50,000 sats', chama: 'Tech Builders', time: '1 day ago' },
              { type: 'joined', chama: 'Family Fund', time: '3 days ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <div className={`p-2 rounded-full ${
                  activity.type === 'contribution' ? 'bg-orange-100 text-orange-600' :
                  activity.type === 'payout' ? 'bg-green-100 text-green-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {activity.type === 'contribution' ? <ArrowUpRight className="w-4 h-4" /> :
                   activity.type === 'payout' ? <ArrowDownLeft className="w-4 h-4" /> :
                   <Users className="w-4 h-4" />}
                </div>
                
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {activity.type === 'contribution' && `Contributed ${activity.amount}`}
                    {activity.type === 'payout' && `Received ${activity.amount}`}
                    {activity.type === 'joined' && `Joined chama`}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.chama} • {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Navigation Spacer */}
      <div className="h-20" />
    </div>
  );
};
