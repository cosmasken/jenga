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

// Mock data - replace with real data
const savingsData = [
  { month: 'Jan', amount: 0.01 },
  { month: 'Feb', amount: 0.025 },
  { month: 'Mar', amount: 0.04 },
  { month: 'Apr', amount: 0.052 },
];

const chamaBreakdown = [
  { name: 'Women Farmers', value: 40, color: '#f97316' },
  { name: 'Tech Builders', value: 35, color: '#3b82f6' },
  { name: 'Family Fund', value: 25, color: '#10b981' },
];

const insights = [
  {
    title: 'Savings Velocity',
    value: '+23%',
    description: 'Your savings rate increased this month',
    trend: 'up',
    icon: <TrendingUp className="w-4 h-4" />
  },
  {
    title: 'Goal Progress',
    value: '68%',
    description: 'On track to reach your annual goal',
    trend: 'up',
    icon: <Target className="w-4 h-4" />
  },
  {
    title: 'Consistency Score',
    value: '92%',
    description: 'Excellent contribution consistency',
    trend: 'up',
    icon: <Award className="w-4 h-4" />
  }
];

export const FinanceInsights = () => {
  const formatBTC = (amount: number) => `₿ ${amount.toFixed(6)}`;
  const formatUSD = (amount: number) => `$${(amount * 45000).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                  {insight.icon}
                </div>
                <Badge variant={insight.trend === 'up' ? 'default' : 'secondary'}>
                  {insight.value}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm">{insight.title}</h3>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

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
