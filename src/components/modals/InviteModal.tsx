import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import { InviteCodeGenerator, type InviteCode } from '@/utils/inviteCodeGenerator';
import { InviteStorageService } from '@/services/inviteStorage';
import { type Address } from 'viem';
import {
  Share2,
  Copy,
  QrCode,
  Users,
  ExternalLink,
  Twitter,
  MessageCircle,
  Mail,
  X,
  Gift,
  Sparkles,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamaAddress: Address;
  chamaName?: string;
  shareableLink?: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  chamaAddress,
  chamaName,
  shareableLink: providedLink
}: InviteModalProps) {
  const { primaryWallet } = useDynamicContext();
  const [shareableLink, setShareableLink] = useState('');
  const [inviteCode, setInviteCode] = useState<InviteCode | null>(null);
  const [activeTab, setActiveTab] = useState<'share' | 'qr' | 'stats'>('share');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [userStats, setUserStats] = useState({
    totalInvites: 0,
    activeInvites: 0,
    totalUses: 0,
    totalClicks: 0,
    totalConversions: 0,
    avgConversionRate: 0
  });

  // Generate or load existing invite code
  useEffect(() => {
    if (!primaryWallet?.address || !isOpen || !chamaAddress) return;

    const userAddress = primaryWallet.address as Address;
    
    // Load user stats
    const stats = InviteStorageService.getInviteStats(userAddress);
    setUserStats(stats);

    // Generate new invite code or use existing one
    generateInviteCode(userAddress);
  }, [primaryWallet?.address, isOpen, chamaAddress]);

  const generateInviteCode = async (userAddress: Address) => {
    setIsGeneratingCode(true);
    
    try {
      // Check if we have an existing active code for this chama
      const existingCodes = InviteStorageService.getUserInviteCodes(userAddress);
      const existingCode = existingCodes.find(code => 
        code.type === 'chama' &&
        code.chamaAddress?.toLowerCase() === chamaAddress.toLowerCase() &&
        code.isActive
      );

      let codeToUse: InviteCode;

      if (existingCode) {
        codeToUse = existingCode;
      } else {
        // Create new invite code
        codeToUse = InviteCodeGenerator.createInviteCode(userAddress, chamaAddress, chamaName);
        
        // Save to storage
        InviteStorageService.saveInviteCode(codeToUse);
      }

      setInviteCode(codeToUse);

      // Generate shareable link
      const link = InviteCodeGenerator.generateShareableUrl(codeToUse.code, chamaAddress, window.location.origin);
      setShareableLink(link);

    } catch (error) {
      console.error('Failed to generate invite code:', error);
      toast({
        title: '❌ Failed to generate invite code',
        description: 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const refreshInviteCode = () => {
    if (!primaryWallet?.address || !chamaAddress) return;
    generateInviteCode(primaryWallet.address as Address);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '✅ Copied!',
        description: 'Chama invite link copied to clipboard',
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: '❌ Copy Failed',
        description: 'Please copy the link manually',
        variant: 'destructive',
      });
    }
  };

  const shareViaTwitter = () => {
    const inviteCodeText = inviteCode ? ` Use code: ${inviteCode.code.slice(-6)}` : '';
    const chamaNameText = chamaName ? `"${chamaName}"` : 'this chama';
    const text = `Join my Bitcoin savings circle ${chamaNameText} on Sacco & Chama! 🚀 Build wealth together through community-powered savings.${inviteCodeText} ${shareableLink}`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaWhatsApp = () => {
    const inviteCodeText = inviteCode ? `\n\nYour invite code: ${inviteCode.code}` : '';
    const chamaNameText = chamaName ? `"${chamaName}"` : 'this chama';
    const text = `Hey! Join my Bitcoin savings circle ${chamaNameText} on Sacco & Chama! We're building wealth together through community-powered savings.${inviteCodeText}\n\n${shareableLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const chamaNameText = chamaName ? `"${chamaName}"` : 'this chama';
    const subject = `Join my Bitcoin savings circle: ${chamaNameText}`;
    
    const inviteCodeText = inviteCode ? `\n\nYour invite code: ${inviteCode.code}\n` : '\n';
    
    const body = `Hi there!\n\nI'd like to invite you to join my Bitcoin savings circle ${chamaNameText} on Sacco & Chama.\n\nWe're building wealth together through community-powered savings circles where members contribute Bitcoin regularly and take turns receiving payouts.${inviteCodeText}\nClick here to join: ${shareableLink}\n\nYou'll need to connect your wallet and deposit collateral to participate.\n\nLooking forward to saving together!\n\nBest regards`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-bitcoin" />
              Invite to Chama
              {inviteCode && (
                <Badge variant="secondary" className="ml-2">
                  {inviteCode.currentUses}/{inviteCode.maxUses} uses
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {chamaName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inviting members to: <span className="font-semibold">{chamaName}</span>
            </p>
          )}
          {inviteCode && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Expires: {new Date(inviteCode.expiresAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Code: {inviteCode.code.slice(-6)}
              </span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="qr">QR Code</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            <TabsContent value="share" className="space-y-4">
              {/* Reward Preview */}
              <Alert className="border-bitcoin/20 bg-bitcoin/5">
                <Gift className="h-4 w-4 text-bitcoin" />
                <AlertDescription className="text-sm">
                  <div className="flex items-center justify-between">
                    <span>
                      Earn rewards when friends join your chama!
                    </span>
                    <Sparkles className="w-4 h-4 text-bitcoin" />
                  </div>
                </AlertDescription>
              </Alert>

              {/* Shareable Link */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shareable Link:
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshInviteCode}
                    disabled={isGeneratingCode}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingCode ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={shareableLink}
                    readOnly
                    className="font-mono text-xs bg-gray-50 dark:bg-gray-800"
                    placeholder={isGeneratingCode ? "Generating link..." : ""}
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(shareableLink)}
                    disabled={!shareableLink || isGeneratingCode}
                    className="bg-bitcoin hover:bg-bitcoin/90 text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Share via Social Media */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Share via:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={shareViaTwitter}
                    disabled={!shareableLink}
                    className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500"
                  >
                    <Twitter className="w-5 h-5 text-blue-500" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareViaWhatsApp}
                    disabled={!shareableLink}
                    className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-500"
                  >
                    <MessageCircle className="w-5 h-5 text-green-500" />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={shareViaEmail}
                    disabled={!shareableLink}
                    className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-gray-50 dark:hover:bg-gray-950 hover:border-gray-500"
                  >
                    <Mail className="w-5 h-5 text-gray-500" />
                    <span className="text-xs">Email</span>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qr" className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {shareableLink ? (
                  <QRCodeGenerator 
                    value={shareableLink} 
                    size={200}
                    className="w-full"
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <QrCode className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Generating QR code...</p>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Share this QR code for easy mobile access
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(shareableLink)}
                    disabled={!shareableLink}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-bitcoin">{userStats.totalInvites}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Invites</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{userStats.totalClicks}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Total Clicks</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.totalConversions}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Conversions</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{userStats.avgConversionRate}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Conv. Rate</div>
                </div>
              </div>
              
              {inviteCode && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2">Current Invite Code</h4>
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Code:</span>
                      <span className="font-mono">{inviteCode.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uses:</span>
                      <span>{inviteCode.currentUses}/{inviteCode.maxUses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={inviteCode.isActive ? "default" : "secondary"} className="text-xs">
                        {inviteCode.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Information Alert */}
          <Alert className="border-bitcoin/20 bg-bitcoin/5">
            <QrCode className="h-4 w-4 text-bitcoin" />
            <AlertDescription className="text-sm">
              Share this link with friends to invite them to your savings circle. 
              They'll need to connect their wallet and deposit collateral to join.
            </AlertDescription>
          </Alert>

          {/* Requirements */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Requirements to Join:
            </h4>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Connect a Bitcoin wallet</li>
              <li>• Deposit required security amount</li>
              <li>• Commit to regular contributions</li>
              <li>• Follow chama rules and schedule</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                copyToClipboard(shareableLink);
                onClose();
              }}
              disabled={!shareableLink || isGeneratingCode}
              className="flex-1 bg-bitcoin hover:bg-bitcoin/90 text-white"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy & Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
