import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Bitcoin } from 'lucide-react';
import { useCreateChama } from '../../hooks/useJengaContract';
import { useAccount } from 'wagmi';

interface CreateChamaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateChamaModal: React.FC<CreateChamaModalProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    contributionAmount: '',
    cycleDuration: '',
    maxMembers: ''
  });
  
  const { toast } = useToast();
  const { isConnected } = useAccount();
  const { 
    createChama, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error,
    hash 
  } = useCreateChama();

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      toast({
        title: "Chama Created Successfully! 🎉",
        description: `"${formData.name}" is now live and ready for members to join.`,
      });
      setFormData({ name: '', contributionAmount: '', cycleDuration: '', maxMembers: '' });
      onOpenChange(false);
    }
  }, [isConfirmed, formData.name, toast, onOpenChange]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      toast({
        title: "Failed to Create Chama",
        description: error.message || "Transaction failed. Please check your wallet and try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a chama.",
        variant: "destructive",
      });
      return;
    }

    try {
      createChama(
        formData.name,
        formData.contributionAmount,
        BigInt(parseInt(formData.cycleDuration) * 30 * 24 * 60 * 60), // Convert months to seconds
        BigInt(formData.maxMembers)
      );
    } catch (err) {
      console.error('Error creating chama:', err);
    }
  };

  const isLoading = isPending || isConfirming;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            Create New Chama
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Chama Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Bitcoin Hodlers Circle"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution">Monthly Contribution (cBTC)</Label>
            <Select value={formData.contributionAmount} onValueChange={(value) => setFormData(prev => ({ ...prev, contributionAmount: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.01">0.01 cBTC</SelectItem>
                <SelectItem value="0.02">0.02 cBTC</SelectItem>
                <SelectItem value="0.03">0.03 cBTC</SelectItem>
                <SelectItem value="0.05">0.05 cBTC</SelectItem>
                <SelectItem value="0.1">0.1 cBTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Cycle Duration</Label>
            <Select value={formData.cycleDuration} onValueChange={(value) => setFormData(prev => ({ ...prev, cycleDuration: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="9">9 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="members">Maximum Members</Label>
            <Select value={formData.maxMembers} onValueChange={(value) => setFormData(prev => ({ ...prev, maxMembers: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select max members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 members</SelectItem>
                <SelectItem value="5">5 members</SelectItem>
                <SelectItem value="8">8 members</SelectItem>
                <SelectItem value="10">10 members</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hash && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Transaction submitted: 
                <a 
                  href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 underline hover:no-underline"
                >
                  View on Explorer
                </a>
              </p>
            </div>
          )}

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
              disabled={isLoading || !formData.name || !formData.contributionAmount || !formData.cycleDuration || !formData.maxMembers || !isConnected}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isPending ? 'Confirming...' : 'Creating...'}
                </>
              ) : (
                'Create Chama'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};