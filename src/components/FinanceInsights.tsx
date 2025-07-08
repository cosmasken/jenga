import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Calendar,
  PieChart,
  BarChart3,
  Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { EmptyInsights, EmptyWalletConnection } from '@/components/ui/empty-state';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';

// Remove mocked data - use real data from contracts/API
const savingsData: Array<{ month: string; amount: number }> = [];
const chamaBreakdown: Array<{ name: string; value: number; color: string }> = [];

export const FinanceInsights = () => {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Simulate loading real data
    const loadInsights = async () => {
      setIsLoading(true);
      try {
        // In a real app, fetch from your contracts/API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if user has any financial data
        const hasFinancialActivity = savingsData.length > 0 || chamaBreakdown.length > 0;
        setHasData(hasFinancialActivity);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isConnected) {
      loadInsights();
    } else {
      setIsLoading(false);
    }
  }, [isConnected]);

  const formatBTC = (amount: number) => `₿ ${amount.toFixed(6)}`;
  const formatUSD = (amount: number) => `$${(amount * 45000).toFixed(2)}`;

  // Show appropriate states
  if (!isConnected) {
    return (
      <EmptyWalletConnection 
        onConnect={() => console.log('Connect wallet')}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!hasData) {
    return (
      <EmptyInsights 
        onJoinChama={() => console.log('Navigate to chamas')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* This would render actual insights when data is available */}
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Insights Coming Soon</h3>
          <p className="text-muted-foreground">
            Your financial insights will appear here once you have more activity data.
          </p>
        </CardContent>
      </Card>

      {/* Savings Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Savings Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savingsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₿${value}`} />
                <Tooltip
                  formatter={(value: number) => [formatBTC(value), 'Savings']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Saved</p>
              <p className="font-semibold">{formatBTC(0.052)}</p>
              <p className="text-xs text-muted-foreground">{formatUSD(0.052)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Average</p>
              <p className="font-semibold">{formatBTC(0.013)}</p>
              <p className="text-xs text-muted-foreground">{formatUSD(0.013)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chama Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Chama Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chamaBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chamaBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4">
              {chamaBreakdown.map((chama, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: chama.color }}
                    />
                    <span>{chama.name}</span>
                  </div>
                  <span className="font-semibold">{chama.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals & Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goals & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Annual Savings Goal</span>
                <span>₿0.1 (68%)</span>
              </div>
              <Progress value={68} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                ₿0.032 remaining • On track for December
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Emergency Fund</span>
                <span>₿0.05 (100%)</span>
              </div>
              <Progress value={100} className="h-2" />
              <p className="text-xs text-green-600 mt-1">
                ✓ Goal achieved! Well done.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Investment Fund</span>
                <span>₿0.2 (26%)</span>
              </div>
              <Progress value={26} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                ₿0.148 remaining • 18 months to go
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Personalized Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              title: 'Increase Weekly Contributions',
              description: 'Consider increasing your weekly target by 1,000 sats to reach your annual goal faster',
              impact: 'Reach goal 2 months earlier',
              priority: 'high'
            },
            {
              title: 'Join a Larger Chama',
              description: 'Larger chamas provide bigger payouts but require more commitment',
              impact: 'Potential 40% larger returns',
              priority: 'medium'
            },
            {
              title: 'Set Up Auto-Contributions',
              description: 'Automate your contributions to improve consistency score',
              impact: 'Never miss a payment',
              priority: 'low'
            }
          ].map((rec, index) => (
            <div key={index} className="p-3 rounded-lg border bg-muted/30">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-sm">{rec.title}</h4>
                <Badge
                  variant={rec.priority === 'high' ? 'destructive' :
                    rec.priority === 'medium' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {rec.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{rec.description}</p>
              <p className="text-xs text-green-600">💡 {rec.impact}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
