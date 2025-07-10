import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Gift, Users, Shuffle } from 'lucide-react';

interface SendRedEnvelopeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SendRedEnvelopeModal: React.FC<SendRedEnvelopeModalProps> = ({ open, onOpenChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    recipients: '',
    message: '',
    mode: 'equal' as 'equal' | 'random'
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock success/failure (85% success rate)
    const isSuccess = Math.random() > 0.15;

    if (isSuccess) {
      const recipientCount = parseInt(formData.recipients);
      toast({
        title: "Red Envelope Sent Successfully! 🧧",
        description: `${formData.amount} BTC sent to ${recipientCount} recipient${recipientCount > 1 ? 's' : ''} with ${formData.mode} distribution.`,
      });
      setFormData({ amount: '', recipients: '', message: '', mode: 'equal' });
      onOpenChange(false);
    } else {
      toast({
        title: "Failed to Send Red Envelope",
        description: "Transaction failed. Please check your wallet balance and try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

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
              max="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.005"
              required
            />
            <p className="text-xs text-gray-500">Maximum 0.01 BTC per red envelope</p>
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600"
              disabled={isLoading || !formData.amount || !formData.recipients || parseFloat(formData.amount) > 0.01}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
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