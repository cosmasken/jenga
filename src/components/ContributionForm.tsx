
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { useContributeToCycle } from "@/hooks/useWagmiContracts";
import { CHAMA_ADDRESSES } from "@/config";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Loader2 } from "lucide-react";

// Available chamas from the config
const AVAILABLE_CHAMAS = Object.keys(CHAMA_ADDRESSES) as Array<keyof typeof CHAMA_ADDRESSES>;

interface ContributionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributionForm = ({ isOpen, onClose }: ContributionFormProps) => {
  const [formData, setFormData] = useState({
    poolId: "",
    amount: "",
    note: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();
  const { contribute, isLoading, isSuccess, hash } = useContributeToCycle();

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: "Contribution Successful!",
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
      });
      
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        poolId: "",
        amount: "",
        note: ""
      });
    }
  }, [isSuccess, hash, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.poolId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convert amount from sats to BTC
      const amountBtc = (parseFloat(formData.amount) / 100000000).toString();
      
      // Contribute to the cycle using Wagmi
      await contribute(parseInt(formData.poolId), amountBtc);
      
    } catch (error) {
      console.error('Contribution error:', error);
      toast({
        title: "Contribution Failed",
        description: error instanceof Error ? error.message : "Failed to contribute. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    // Reset form
    setFormData({ poolId: "", amount: "", note: "" });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Make a Contribution</DialogTitle>
            <DialogDescription className="text-center">
              Contribute to your chama's pool on the Citrea network
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="poolId" className="text-foreground font-mono">Pool ID *</Label>
              <Input
                id="poolId"
                type="number"
                value={formData.poolId}
                onChange={(e) => setFormData({...formData, poolId: e.target.value})}
                placeholder="0"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono"
              />
            </div>

            <div>
              <Label htmlFor="amount" className="text-foreground font-mono">Amount (sats) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="5000"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono"
              />
            </div>

            <div>
              <Label htmlFor="note" className="text-foreground font-mono">Note (Optional)</Label>
              <Input
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                placeholder="Add a note..."
                className="bg-background/50 border-orange-500/50 text-foreground font-mono"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button type="submit" className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black">
                CONTRIBUTE
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingModal 
        isOpen={isLoading} 
        title="Processing Contribution..." 
        description="Adding your sats to the chama pool"
      />

      <Modal
        isOpen={showSuccess}
        onClose={handleSuccess}
        type="contribution"
        title="Contribution Successful!"
        description="Your sats have been added to the chama pool"
        amount={`${formData.amount} sats`}
        chamaName={`Pool ${formData.poolId}`}
      />
    </>
  );
};
