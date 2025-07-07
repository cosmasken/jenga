
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { useJoinPool } from "@/hooks/useWagmiContracts";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Loader2 } from "lucide-react";

interface JoinChamaFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinChamaForm = ({ isOpen, onClose }: JoinChamaFormProps) => {
  const [formData, setFormData] = useState({
    poolId: "",
    nickname: ""
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();
  const { primaryWallet } = useDynamicContext();
  const { joinPool, isLoading, isSuccess, hash } = useJoinPool();

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && hash) {
      toast({
        title: "Successfully Joined Chama!",
        description: `Transaction hash: ${hash.slice(0, 10)}...`,
      });
      
      setShowSuccess(true);
      
      // Reset form
      setFormData({
        poolId: "",
        nickname: ""
      });
    }
  }, [isSuccess, hash, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.poolId) {
      toast({
        title: "Missing Information",
        description: "Please enter the pool ID",
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
      const poolId = parseInt(formData.poolId);
      
      // For now, we'll use a default contribution amount
      // In a real app, you'd fetch the pool details first to get the required amount
      const contributionAmount = "0.001"; // 0.001 BTC as default
      
      // Join the pool with the required contribution
      await joinPool(poolId, contributionAmount);
      
    } catch (error) {
      console.error('Error joining chama:', error);
      toast({
        title: "Join Failed",
        description: "Failed to join chama. Please try again.",
        variant: "destructive"
      });
      setShowError(true);
    }
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    // Reset form
    setFormData({ poolId: "", nickname: "" });
  };

  const handleError = () => {
    setShowError(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground font-mono glitch-text">
              JOIN CHAMA CIRCLE
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="poolId" className="text-foreground font-mono">Pool ID *</Label>
              <Input
                id="poolId"
                value={formData.poolId}
                onChange={(e) => setFormData({...formData, poolId: e.target.value})}
                placeholder="Enter pool ID (e.g., 0, 1, 2...)"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono text-center text-lg tracking-widest"
              />
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Get the pool ID from the chama creator
              </p>
            </div>

            <div>
              <Label htmlFor="nickname" className="text-foreground font-mono">Nickname (Optional)</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                placeholder="How others will see you"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-3">
              <p className="text-blue-400 text-xs font-mono">
                {'>'} You'll need to pay the pool's contribution amount to join
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button type="submit" className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black">
                JOIN CHAMA
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingModal 
        isOpen={isLoading} 
        title="Joining Chama..." 
        description="Verifying invite code and adding you to the circle"
      />

      <Modal
        isOpen={showSuccess}
        onClose={handleSuccess}
        type="success"
        title="Welcome to the Circle!"
        description="You've successfully joined the chama. Start contributing to build your savings together."
        chamaName="Tech Builders Fund"
      />

      <Modal
        isOpen={showError}
        onClose={handleError}
        type="success"
        title="Invalid Invite Code"
        description="The invite code is invalid or expired. Please check with the chama admin for a new code."
      />
    </>
  );
};
