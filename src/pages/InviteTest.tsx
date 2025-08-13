// src/pages/InviteTest.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InviteCodeGenerator } from '@/utils/inviteCodeGenerator';
import { InviteStorageService } from '@/services/inviteStorage';
import { useInviteHandler } from '@/hooks/useInviteHandler';
import { type Address } from 'viem';

export default function InviteTest() {
  const [testAddress] = useState<Address>('0x1234567890123456789012345678901234567890');
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [testUrl, setTestUrl] = useState<string>('');
  const inviteHandler = useInviteHandler();

  const generatePlatformInvite = () => {
    const inviteCode = InviteCodeGenerator.createInviteCode(testAddress, 'platform');
    InviteStorageService.saveInviteCode(inviteCode);
    setGeneratedCode(inviteCode.code);
    
    const url = InviteCodeGenerator.generateShareableUrl(inviteCode.code);
    setTestUrl(url);
  };

  const generateChamaInvite = () => {
    const chamaAddress = '0x9876543210987654321098765432109876543210' as Address;
    const inviteCode = InviteCodeGenerator.createInviteCode(testAddress, 'chama', chamaAddress);
    InviteStorageService.saveInviteCode(inviteCode);
    setGeneratedCode(inviteCode.code);
    
    const url = InviteCodeGenerator.generateShareableUrl(inviteCode.code, window.location.origin, chamaAddress);
    setTestUrl(url);
  };

  const testInviteCode = (code: string) => {
    const isValid = InviteCodeGenerator.isValidCodeFormat(code);
    const type = InviteCodeGenerator.getInviteType(code);
    const stored = InviteStorageService.getInviteCode(code);
    
    alert(`Code: ${code}\nValid: ${isValid}\nType: ${type}\nStored: ${stored ? 'Yes' : 'No'}`);
  };

  const clearStorage = () => {
    InviteStorageService.clearAllInviteCodes();
    alert('Storage cleared!');
  };

  const getStats = () => {
    const stats = InviteStorageService.getInviteStats(testAddress);
    alert(`Stats:\nTotal: ${stats.totalInvites}\nActive: ${stats.activeInvites}\nUses: ${stats.totalUses}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invite System Test Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* URL Parameters Status */}
            {inviteHandler.hasInviteCode && (
              <Alert>
                <AlertDescription>
                  <strong>Invite Detected!</strong><br/>
                  Code: {inviteHandler.inviteCode}<br/>
                  Type: {inviteHandler.inviteType}<br/>
                  Chama: {inviteHandler.chamaAddress || 'N/A'}<br/>
                  Processing: {inviteHandler.isProcessing ? 'Yes' : 'No'}
                </AlertDescription>
              </Alert>
            )}

            {/* Generate Invites */}
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={generatePlatformInvite}>
                Generate Platform Invite
              </Button>
              <Button onClick={generateChamaInvite}>
                Generate Chama Invite
              </Button>
            </div>

            {/* Generated Code Display */}
            {generatedCode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Generated Code:</label>
                <Input value={generatedCode} readOnly />
                <Button 
                  size="sm" 
                  onClick={() => testInviteCode(generatedCode)}
                >
                  Test This Code
                </Button>
              </div>
            )}

            {/* Test URL */}
            {testUrl && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Test URL:</label>
                <Input value={testUrl} readOnly />
                <Button 
                  size="sm" 
                  onClick={() => window.open(testUrl, '_blank')}
                >
                  Open Test URL
                </Button>
              </div>
            )}

            {/* Manual Code Test */}
            <div className="space-y-2">
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
            </div>

            {/* Utility Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={getStats}>
                Get Stats
              </Button>
              <Button variant="destructive" onClick={clearStorage}>
                Clear Storage
              </Button>
            </div>

            {/* Test Examples */}
            <div className="bg-gray-100 p-4 rounded">
              <h4 className="font-medium mb-2">Test Examples:</h4>
              <div className="text-sm space-y-1">
                <p>Platform: <code>SACCO_123ABC_1234567890_DEF456</code></p>
                <p>Chama: <code>CHAMA_123ABC_9876_1234567890_DEF456</code></p>
                <p>Test URLs:</p>
                <p>• <code>?invite=SACCO_123ABC_1234567890_DEF456</code></p>
                <p>• <code>?invite=CHAMA_123ABC_9876_1234567890_DEF456&chama=0x9876...</code></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
