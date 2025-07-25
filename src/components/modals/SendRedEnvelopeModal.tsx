import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gift, Users, Shuffle } from 'lucide-react';
import { useSendRedEnvelope } from '@/hooks/useJenga';
import { useSacco } from '@/hooks/useSacco';
import { parseEther } from 'viem';
import { useAccount } from 'wagmi';

interface SendRedEnvelopeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendRedEnvelopeModal: React.FC<SendRedEnvelopeModalProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    amount: '',
    recipients: '',
    message: '',
    mode: 'equal' as 'equal' | 'random'
  });
  const { toast } = useToast();
  const { address } = useAccount();
  const { sendRedEnvelope, isPending, isConfirming, isConfirmed, error } = useSendRedEnvelope();
  const { useGetMemberAddresses } = useSacco();
  const { memberAddresses } = useGetMemberAddresses();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to send red envelopes.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || !formData.recipients) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const recipientCount = parseInt(formData.recipients);
      const totalAmount = parseEther(formData.amount);
      
      // Select random recipients from member addresses
      const selectedRecipients = memberAddresses
        .filter(addr => addr !== address) // Exclude sender
        .slice(0, recipientCount);

      if (selectedRecipients.length < recipientCount) {
        toast({
          title: "Not Enough Recipients",
          description: `Only ${selectedRecipients.length} members available as recipients.`,
          variant: "destructive",
        });
        return;
      }

      sendRedEnvelope(
        selectedRecipients,
        totalAmount,
        formData.mode === 'random',
        formData.message || 'Happy sharing! 🧧'
      );
      
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send red envelope. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle transaction success
  React.useEffect(() => {
    if (isConfirmed) {
      const recipientCount = parseInt(formData.recipients);
      toast({
        title: "Red Envelope Sent Successfully! 🧧",
        description: `${formData.amount} BTC sent to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''} with ${formData.mode} distribution.`,
      });
      setFormData({ amount: '', recipients: '', message: '', mode: 'equal' });
      onOpenChange(false);
    }
  }, [isConfirmed, formData.recipients, formData.amount, formData.mode, toast, onOpenChange]);

  // Handle transaction error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to send red envelope. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-red-500" />
            Send Red Envelope
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (BTC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.001"
              max="0.1"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.01"
              required
            />
            <p className="text-xs text-gray-500">Maximum 0.1 BTC per red envelope</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipients">Number of Recipients</Label>
            <Select value={formData.recipients} onValueChange={(value) => setFormData(prev => ({ ...prev, recipients: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 recipient</SelectItem>
                <SelectItem value="2">2 recipients</SelectItem>
                <SelectItem value="3">3 recipients</SelectItem>
                <SelectItem value="5">5 recipients</SelectItem>
                <SelectItem value="10">10 recipients</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode">Distribution Mode</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.mode === 'equal' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, mode: 'equal' }))}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Equal Split
              </Button>
              <Button
                type="button"
                variant={formData.mode === 'random' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, mode: 'random' }))}
                className="flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                Random Split
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              {formData.mode === 'equal' 
                ? 'Each recipient gets an equal amount' 
                : 'Recipients get random amounts (lucky draw!)'
              }
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="HODL strong! 🚀"
              rows={3}
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.message.length}/100 characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isPending || isConfirming}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={isPending || isConfirming || !formData.amount || !formData.recipients || parseFloat(formData.amount) > 0.1}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Sending...' : 'Confirming...'}
                </>
              ) : (
                'Send Red Envelope'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};