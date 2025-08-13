// src/pages/InviteTest.tsx
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InviteCodeGenerator, type InviteCode } from '@/utils/inviteCodeGenerator';
import { InviteStorageService } from '@/services/inviteStorage';
import { useInviteHandler } from '@/hooks/useInviteHandler';
import { type Address } from 'viem';
import {
  Users,
  MousePointer,
  TrendingUp,
  Calendar,
  Target,
  Gift,
  Eye,
  UserCheck,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface InviteAnalytics {
  code: string;
  clicks: number;
  conversions: number;
  lastClicked: Date | null;
  invitedUsers: string[];
  conversionRate: number;
  createdAt: Date;
  status: 'active' | 'expired' | 'exhausted';
  clickHistory?: any[];
  usageHistory?: any[];
}

export default function InviteTest() {
  const [testAddress] = useState<Address>('0x1234567890123456789012345678901234567890');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [testUrl, setTestUrl] = useState<string>('');
  const [allInvites, setAllInvites] = useState<InviteCode[]>([]);
  const [analytics, setAnalytics] = useState<InviteAnalytics[]>([]);
  const [activeTab, setActiveTab] = useState<'generate' | 'analytics' | 'users'>('generate');
  const inviteHandler = useInviteHandler();

  useEffect(() => {
    loadInviteData();
  }, []);

  const loadInviteData = () => {
    const invites = InviteStorageService.getUserInviteCodes(testAddress);
    setAllInvites(invites);

    // Generate real analytics for each invite
    const analyticsData = invites.map(invite => {
      const realAnalytics = InviteStorageService.getRealAnalytics(invite.code);
      return {
        code: invite.code,
        clicks: realAnalytics.totalClicks,
        conversions: realAnalytics.totalConversions,
        lastClicked: realAnalytics.lastClicked,
        invitedUsers: realAnalytics.uniqueUsers,
        conversionRate: realAnalytics.conversionRate,
        createdAt: invite.createdAt,
        status: invite.isActive ? 'active' : (new Date() > invite.expiresAt ? 'expired' : 'exhausted') as 'active' | 'expired' | 'exhausted',
        clickHistory: realAnalytics.clickHistory,
        usageHistory: realAnalytics.usageHistory
      };
    });

    setAnalytics(analyticsData);
  };

  const generatePlatformInvite = () => {
    const inviteCode = InviteCodeGenerator.createInviteCode(testAddress, 'platform');
    InviteStorageService.saveInviteCode(inviteCode);
    setGeneratedCode(inviteCode.code);

    const url = InviteCodeGenerator.generateShareableUrl(inviteCode.code);
    setTestUrl(url);
    loadInviteData();
  };

  const generateChamaInvite = () => {
    const chamaAddress = '0x9876543210987654321098765432109876543210' as Address;
    const inviteCode = InviteCodeGenerator.createInviteCode(testAddress, 'chama', chamaAddress);
    InviteStorageService.saveInviteCode(inviteCode);
    setGeneratedCode(inviteCode.code);

    const url = InviteCodeGenerator.generateShareableUrl(inviteCode.code, window.location.origin, chamaAddress);
    setTestUrl(url);
    loadInviteData();
  };

  const testInviteCode = (code: string) => {
    const isValid = InviteCodeGenerator.isValidCodeFormat(code);
    const type = InviteCodeGenerator.getInviteType(code);
    const stored = InviteStorageService.getInviteCode(code);
    const analytics = InviteStorageService.getRealAnalytics(code);

    alert(`Code: ${code}\nValid: ${isValid}\nType: ${type}\nStored: ${stored ? 'Yes' : 'No'}\nClicks: ${analytics.totalClicks}\nConversions: ${analytics.totalConversions}`);
  };

  // const getOverallStats = () => {
  //   const stats = InviteStorageService.getInviteStats(testAddress);
  //   return {
  //     totalInvites: stats.totalInvites,
  //     activeInvites: stats.activeInvites,
  //     totalUses: stats.totalUses,
  //     totalClicks: stats.totalClicks,
  //     totalConversions: stats.totalConversions,
  //     avgConversionRate: stats.avgConversionRate.toString()
  //   };
  // };

  const getAllClickHistory = () => {
    return analytics.flatMap(a => a.clickHistory || [])
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Show last 10 clicks
  };

  const getAllInvitedUsers = () => {
    const allUsers = analytics.flatMap(a => a.usageHistory || [])
      .filter(usage => usage.type === 'conversion')
      .map(usage => ({
        address: usage.userAddress,
        joinedAt: usage.timestamp,
        type: 'platform', // Could be enhanced to detect type
        bonus: '0.001 cBTC'
      }));

    return allUsers;
  };

  const clearStorage = () => {
    InviteStorageService.clearAllInviteCodes();
    setAllInvites([]);
    setAnalytics([]);
    alert('Storage cleared!');
  };

  const getOverallStats = () => {
    const stats = InviteStorageService.getInviteStats(testAddress);
    const totalClicks = analytics.reduce((sum, a) => sum + a.clicks, 0);
    const avgConversionRate = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.conversionRate, 0) / analytics.length
      : 0;

    return {
      ...stats,
      totalClicks,
      avgConversionRate: avgConversionRate.toFixed(1)
    };
  };

  const overallStats = getOverallStats();

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Invite System Analytics Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>

            {/* URL Parameters Status */}
            {inviteHandler.hasInviteCode && (
              <Alert className="mb-4">
                <Gift className="h-4 w-4" />
                <AlertDescription>
                  <strong>Invite Detected!</strong><br />
                  Code: {inviteHandler.inviteCode}<br />
                  Type: {inviteHandler.inviteType}<br />
                  Chama: {inviteHandler.chamaAddress || 'N/A'}<br />
                  Processing: {inviteHandler.isProcessing ? 'Yes' : 'No'}
                </AlertDescription>
              </Alert>
            )}

            {/* Overall Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{overallStats.totalInvites}</div>
                  <div className="text-sm text-gray-600">Total Invites</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{overallStats.totalClicks}</div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{overallStats.totalUses}</div>
                  <div className="text-sm text-gray-600">Conversions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{overallStats.avgConversionRate}%</div>
                  <div className="text-sm text-gray-600">Avg Conv. Rate</div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="generate">Generate & Test</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="users">Invited Users</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-4">
                {/* Generate Invites */}
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={generatePlatformInvite} className="h-12">
                    <Users className="w-4 h-4 mr-2" />
                    Generate Platform Invite
                  </Button>
                  <Button onClick={generateChamaInvite} className="h-12">
                    <Target className="w-4 h-4 mr-2" />
                    Generate Chama Invite
                  </Button>
                </div>

                {/* Generated Code Display */}
                {generatedCode && (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <label className="text-sm font-medium">Generated Code:</label>
                        <Input value={generatedCode} readOnly />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Test URL:</label>
                        <Input value={testUrl} readOnly />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => testInviteCode(generatedCode)}>
                          Test Code
                        </Button>
                        <Button size="sm" onClick={() => window.open(testUrl, '_blank')}>
                          Open URL
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(testUrl)}>
                          Copy URL
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Manual Code Test */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <label className="text-sm font-medium">Test Manual Code:</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter invite code to test"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            testInviteCode((e.target as HTMLInputElement).value);
                          }
                        }}
                      />
                      <Button onClick={() => {
                        const input = document.querySelector('input[placeholder="Enter invite code to test"]') as HTMLInputElement;
                        if (input?.value) testInviteCode(input.value);
                      }}>
                        Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Utility Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadInviteData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Data
                  </Button>
                  <Button variant="destructive" onClick={clearStorage}>
                    Clear All Data
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="space-y-4">
                  {analytics.length === 0 ? (
                    <Card>
                      <CardContent className="p-8 text-center text-gray-500">
                        No invite codes generated yet. Go to "Generate & Test" tab to create some.
                      </CardContent>
                    </Card>
                  ) : (
                    analytics.map((analytic, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                                {analytic.code.slice(-8)}
                              </code>
                              <Badge variant={analytic.status === 'active' ? 'default' : 'secondary'}>
                                {analytic.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              Created: {analytic.createdAt.toLocaleDateString()}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-blue-500" />
                              <span>{analytic.clicks} clicks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-4 h-4 text-green-500" />
                              <span>{analytic.conversions} conversions</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-purple-500" />
                              <span>{analytic.conversionRate.toFixed(1)}% rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>
                                {analytic.lastClicked
                                  ? analytic.lastClicked.toLocaleDateString()
                                  : 'No clicks'
                                }
                              </span>
                            </div>
                          </div>

                          {analytic.invitedUsers.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-sm text-gray-600 mb-2">Invited Users:</div>
                              <div className="flex flex-wrap gap-1">
                                {analytic.invitedUsers.map((user, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {user}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Invited Users ({getAllInvitedUsers().length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getAllInvitedUsers().length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No users have joined via your invite codes yet.
                        <br />
                        <span className="text-sm">Share your invite links to start tracking conversions!</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getAllInvitedUsers().map((user, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-mono text-sm">{user.address}</div>
                                <div className="text-xs text-gray-500">
                                  Joined {user.joinedAt.toLocaleDateString()} • {user.type}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="secondary" className="text-xs">
                                {user.bonus}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Click Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Clicks ({getAllClickHistory().length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getAllClickHistory().length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No clicks recorded yet.
                        <br />
                        <span className="text-sm">Open your invite links in new tabs to see click tracking!</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {getAllClickHistory().map((click, index) => (
                          <div key={index} className="flex items-center justify-between p-2 text-sm border-b last:border-b-0">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${click.converted ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                              <span className="font-mono text-xs">{click.sessionId.slice(0, 8)}</span>
                              <span className="text-gray-500">{click.userAgent.split(' ')[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{click.timestamp.toLocaleString()}</span>
                              {click.converted && (
                                <Badge variant="default" className="text-xs">Converted</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Test Examples */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Test Examples:</h4>
                <div className="text-sm space-y-1 font-mono bg-gray-100 p-3 rounded text-black" >
                  <p>Platform: <code>SACCO_123ABC_1234567890_DEF456</code></p>
                  <p>Chama: <code>CHAMA_123ABC_9876_1234567890_DEF456</code></p>
                  <p className="mt-2">Test URLs:</p>
                  <p>• <code>?invite=SACCO_123ABC_1234567890_DEF456</code></p>
                  <p>• <code>?invite=CHAMA_123ABC_9876_1234567890_DEF456&chama=0x9876...</code></p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
