import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import {
  Share2,
  Copy,
  QrCode,
  Users,
  ExternalLink,
  Twitter,
  MessageCircle,
  Mail,
  X
} from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'chama' | 'app';
  chamaName?: string;
  chamaId?: string;
  shareableLink?: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  type,
  chamaName,
  chamaId,
  shareableLink: providedLink
}: InviteModalProps) {
  const [shareableLink, setShareableLink] = useState('');

  // Generate shareable link based on type
  useEffect(() => {
    if (providedLink) {
      setShareableLink(providedLink);
    } else if (type === 'chama' && chamaId) {
      const baseUrl = window.location.origin;
      setShareableLink(`${baseUrl}/join-chama?id=${chamaId}&ref=invite`);
    } else if (type === 'app') {
      const baseUrl = window.location.origin;
      setShareableLink(`${baseUrl}?ref=invite`);
    }
  }, [type, chamaId, providedLink]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: '✅ Copied!',
        description: 'Invite link copied to clipboard',
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
    const text = type === 'chama' 
      ? `Join my Bitcoin savings circle "${chamaName}" on Sacco & Chama! 🚀 Build wealth together through community-powered savings. ${shareableLink}`
      : `Join me on Sacco & Chama - the Bitcoin finance platform for DeFi lending and community savings! 🚀 ${shareableLink}`;
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareViaWhatsApp = () => {
    const text = type === 'chama'
      ? `Hey! Join my Bitcoin savings circle "${chamaName}" on Sacco & Chama! We're building wealth together through community-powered savings. ${shareableLink}`
      : `Hey! Check out Sacco & Chama - an amazing Bitcoin finance platform for DeFi lending and community savings! ${shareableLink}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = type === 'chama'
      ? `Join my Bitcoin savings circle: ${chamaName}`
      : 'Join me on Sacco & Chama - Bitcoin Finance Platform';
    
    const body = type === 'chama'
      ? `Hi there!\n\nI'd like to invite you to join my Bitcoin savings circle "${chamaName}" on Sacco & Chama.\n\nWe're building wealth together through community-powered savings circles where members contribute Bitcoin regularly and take turns receiving payouts.\n\nClick here to join: ${shareableLink}\n\nYou'll need to connect your wallet and deposit collateral to participate.\n\nLooking forward to saving together!\n\nBest regards`
      : `Hi there!\n\nI'd like to invite you to join Sacco & Chama - an innovative Bitcoin finance platform that combines DeFi lending with community savings circles.\n\nWith Sacco & Chama you can:\n• Use Bitcoin as collateral to borrow USDC (Sacco DeFi)\n• Join community savings circles (Chamas)\n• Participate in cooperative governance\n\nJoin here: ${shareableLink}\n\nBest regards`;
    
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
              {type === 'chama' ? 'Invite to Chama' : 'Invite to Sacco & Chama'}
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
          {type === 'chama' && chamaName && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Inviting members to: <span className="font-semibold">{chamaName}</span>
            </p>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Shareable Link */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Shareable Link:
            </label>
            <div className="flex gap-2">
              <Input
                value={shareableLink}
                readOnly
                className="font-mono text-xs bg-gray-50 dark:bg-gray-800"
                placeholder="Generating link..."
              />
              <Button
                size="sm"
                onClick={() => copyToClipboard(shareableLink)}
                disabled={!shareableLink}
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
                className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-500"
              >
                <Twitter className="w-5 h-5 text-blue-500" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={shareViaWhatsApp}
                className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-green-50 dark:hover:bg-green-950 hover:border-green-500"
              >
                <MessageCircle className="w-5 h-5 text-green-500" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={shareViaEmail}
                className="flex flex-col items-center gap-2 h-auto py-3 hover:bg-gray-50 dark:hover:bg-gray-950 hover:border-gray-500"
              >
                <Mail className="w-5 h-5 text-gray-500" />
                <span className="text-xs">Email</span>
              </Button>
            </div>
          </div>

          {/* Information Alert */}
          <Alert className="border-bitcoin/20 bg-bitcoin/5">
            <QrCode className="h-4 w-4 text-bitcoin" />
            <AlertDescription className="text-sm">
              {type === 'chama' ? (
                <>
                  Share this link with friends to invite them to your savings circle. 
                  They'll need to connect their wallet and deposit collateral to join.
                </>
              ) : (
                <>
                  Share this link to invite friends to Sacco & Chama. They can explore 
                  both DeFi lending and community savings features.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Requirements */}
          {type === 'chama' && (
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
          )}

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
              disabled={!shareableLink}
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
