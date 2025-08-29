import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { offchainChamaService } from '@/services/offchainChamaService';
import { useChamaActions } from '@/hooks/useChamaActions';
import { toast } from '@/hooks/use-toast';
import { testSupabaseConnection } from '@/lib/supabase';
import { RefreshCw, TestTube, Plus, Users, DollarSign } from 'lucide-react';

interface ReactivityTestProps {
  userAddress: string;
}

export function ReactivityTest({ userAddress }: ReactivityTestProps) {
  const [testChamaId, setTestChamaId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Use chama actions for the test chama
  const { createChama, isCreatingChama } = useChamaActions(testChamaId);

  const handleTestConnection = async () => {
    setIsConnecting(true);
    try {
      const isConnected = await testSupabaseConnection();
      setConnectionStatus(isConnected);
      if (isConnected) {
        toast({
          title: '✅ Supabase Connected',
          description: 'Database connection is working properly',
        });
      } else {
        toast({
          title: '❌ Connection Failed',
          description: 'Could not connect to Supabase',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setConnectionStatus(false);
      toast({
        title: '❌ Connection Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateTestChama = async () => {
    setIsCreating(true);
    try {
      const chamaData = {
        name: `Test Chama ${Date.now()}`,
        description: 'A test chama for reactive UI testing',
        contribution_amount: '0.01',
        security_deposit: '0.005',
        member_target: 5,
        round_duration_hours: 168, // 1 week
        is_private: false,
      };

      const chama = await offchainChamaService.createChama(userAddress, chamaData);
      setTestChamaId(chama.id);
      
      toast({
        title: '✅ Test Chama Created',
        description: `Chama "${chama.name}" created with ID: ${chama.id.slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Failed to create test chama:', error);
      toast({
        title: '❌ Failed to Create Test Chama',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSimulateJoin = async () => {
    if (!testChamaId) return;
    
    try {
      // Generate a realistic-looking fake address for testing
      const fakeAddress = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
      await offchainChamaService.addMember(testChamaId, fakeAddress, 'direct_join');
      
      toast({
        title: '✅ Simulated Member Join',
        description: `Member ${fakeAddress.slice(0, 8)}...${fakeAddress.slice(-4)} joined`,
      });
    } catch (error) {
      toast({
        title: '❌ Failed to Simulate Join',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSimulateContribution = async () => {
    if (!testChamaId) return;
    
    try {
      // First check if there's an active round, if not create one
      let currentRound = await offchainChamaService.getCurrentRound(testChamaId);
      
      if (!currentRound) {
        // Create a round for testing
        currentRound = await offchainChamaService.createRound(testChamaId, 1);
        toast({
          title: '📅 Round Created',
          description: `Round ${currentRound.round_number} created for testing`,
        });
      }

      await offchainChamaService.recordContribution(testChamaId, currentRound.id, userAddress, '0.01');
      
      toast({
        title: '✅ Simulated Contribution',
        description: 'Contribution recorded off-chain',
      });
    } catch (error) {
      toast({
        title: '❌ Failed to Simulate Contribution',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async () => {
    if (!testChamaId) return;
    
    try {
      // Cycle through different statuses for testing
      const statuses = ['recruiting', 'waiting', 'active'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      await offchainChamaService.updateChamaStatus(testChamaId, randomStatus as any);
      
      toast({
        title: '🔄 Status Updated',
        description: `Chama status changed to: ${randomStatus}`,
      });
    } catch (error) {
      toast({
        title: '❌ Failed to Update Status',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Reactivity Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Test */}
          <div className="space-y-2">
            <Label>Database Connection</Label>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleTestConnection}
                disabled={isConnecting}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
                {isConnecting ? 'Testing...' : 'Test Connection'}
              </Button>
              {connectionStatus !== null && (
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  connectionStatus 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {connectionStatus ? '✅ Connected' : '❌ Failed'}
                </div>
              )}
            </div>
          </div>

          {/* Create Test Chama */}
          <div className="space-y-2">
            <Label>Create Test Chama</Label>
            <Button 
              onClick={handleCreateTestChama} 
              disabled={isCreating || isCreatingChama}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              {(isCreating || isCreatingChama) ? 'Creating...' : 'Create Test Chama'}
            </Button>
          </div>

          {/* Test Chama Actions */}
          {testChamaId && (
            <>
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Label className="text-sm font-medium">Test Chama Created</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {testChamaId}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Open <code>/chama/{testChamaId}/hybrid</code> in another tab to see real-time updates
                </p>
                <Button
                  onClick={() => window.open(`/chama/${testChamaId}/hybrid`, '_blank')}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Open in New Tab
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  onClick={handleSimulateJoin} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Simulate Member Join
                </Button>
                
                <Button 
                  onClick={handleSimulateContribution} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Simulate Contribution
                </Button>

                <Button 
                  onClick={handleUpdateStatus} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Status
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Testing Instructions:
                </h4>
                <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                  <li>Open the test chama in a new tab using the button above</li>
                  <li>Come back to this tab and simulate actions</li>
                  <li>Watch the other tab update in real-time</li>
                  <li>All changes should appear instantly without page refresh</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Test Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Test Scenarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">1. Real-time Member Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Simulate member joins and see member count update instantly across tabs
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">2. Status Changes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Change chama status and see badges update immediately
              </p>
            </div>
            
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">3. Contribution Tracking</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Record contributions and see progress update in real-time
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
