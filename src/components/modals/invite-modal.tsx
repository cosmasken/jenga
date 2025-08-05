import { useState } from "react";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Share2, Copy, Check } from "lucide-react";
import { generateInvite } from "@/lib/faker";

export function InviteModal() {
  const { showInviteModal, setShowInviteModal, selectedGroupId, groups } = useStore();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const selectedGroup = groups.find(g => g.id === selectedGroupId);
  const inviteCode = generateInvite();
  
  // Get replit domains from environment or use fallback
  const replitDomains = import.meta.env.VITE_REPLIT_DOMAINS || window.location.host;
  const domain = replitDomains.split(',')[0];
  const inviteUrl = `${window.location.protocol}//${domain}/?invite=${inviteCode}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast({
        title: "Invite Link Copied!",
        description: "Share this link with friends to invite them to your group.",
        className: "bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,49%)]",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = inviteUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      setCopied(true);
      toast({
        title: "Invite Link Copied!",
        description: "Share this link with friends to invite them to your group.",
        className: "bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,49%)]",
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join my Bitcoin ROSCA group - ${selectedGroup?.name}`,
          text: "Start saving Bitcoin together with decentralized ROSCA groups!",
          url: inviteUrl,
        });
      } catch (err) {
        // User canceled sharing or error occurred
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          <div className="inline-block p-4 bg-[hsl(27,87%,54%)]/10 rounded-full mb-4">
            <Share2 className="h-8 w-8 text-[hsl(27,87%,54%)]" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invite Friends
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Share this link to invite friends to {selectedGroup?.name || "your group"}
          </p>
          
          <div className="mb-6">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
              <Input
                value={inviteUrl}
                readOnly
                className="flex-1 bg-transparent border-none text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                data-testid="input-invite-url"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="ml-2 text-[hsl(27,87%,54%)] hover:text-[hsl(27,87%,49%)] hover:bg-[hsl(27,87%,54%)]/10"
                data-testid="button-copy-invite"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <p>Group: <span className="font-medium text-gray-900 dark:text-gray-100">{selectedGroup?.name}</span></p>
            <p>Weekly Contribution: <span className="font-medium text-[hsl(27,87%,54%)]">₿{selectedGroup?.weeklyContribution.toFixed(3)}</span></p>
            <p>Available Spots: <span className="font-medium text-green-600">{selectedGroup ? selectedGroup.maxMembers - selectedGroup.members.length : 0}</span></p>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="flex-1"
              data-testid="button-close-invite"
            >
              Close
            </Button>
            <Button
              onClick={shareInvite}
              className="flex-1 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
              data-testid="button-share-invite"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
