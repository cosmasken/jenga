import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bitcoin, TrendingUp } from 'lucide-react';
import { Chama } from '@/types/chama';

interface StackBTCModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chama?: Chama;
}

export const StackBTCModal: React.FC<StackBTCModalProps> = ({ open, onOpenChange, chama }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const suggestedAmount = chama ? (chama.contributionAmount / 1e18).toFixed(3) : '0.02';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock success/failure (90% success rate)
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      toast({
        title: "Contribution Successful! 🎯",
        description: `${amount} BTC stacked${chama ? ` to ${chama.name}` : ''}. Keep building your Bitcoin stack!`,
      });
      setAmount('');
      onOpenChange(false);
    } else {
      toast({
        title: "Contribution Failed",
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
            <Bitcoin className="w-5 h-5 text-orange-500" />
            Stack BTC{chama && ` - ${chama.name}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {chama && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Chama Details</span>
              </div>
              <div className="text-sm text-orange-700 space-y-1">
                <p>Monthly contribution: {suggestedAmount} BTC</p>
                <p>Members: {chama.members.length}/{chama.maxMembers}</p>
                <p>Cycle: {chama.cycleDuration} months</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (BTC)</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={suggestedAmount}
                required
                className="pr-20"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                BTC
              </div>
            </div>
            {chama && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(suggestedAmount)}
                className="w-full text-xs"
              >
                Use suggested amount ({suggestedAmount} BTC)
              </Button>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Stacking Tips:</p>
              <ul className="space-y-1 text-xs">
                <li>• Consistent contributions build wealth over time</li>
                <li>• Dollar-cost averaging reduces volatility risk</li>
                <li>• Stay committed to your Chama schedule</li>
              </ul>
            </div>
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
              className="flex-1 bg-gradient-to-r from-orange-400 to-yellow-500 hover:from-orange-500 hover:to-yellow-600"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Stacking...
                </>
              ) : (
                'Stack BTC'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};