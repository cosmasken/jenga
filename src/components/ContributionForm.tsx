
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";
import { 
  getSaccoFactoryContract, 
  switchToCitreaNetwork, 
  formatTokenAmount, 
  parseTokenAmount, 
  checkAndApproveToken
} from "@/utils/ethUtils";
import { CONTRACT_ADDRESSES, CHAMA_ADDRESSES, TOKEN } from "@/config";

// Available chamas from the config
const AVAILABLE_CHAMAS = Object.keys(CHAMA_ADDRESSES) as Array<keyof typeof CHAMA_ADDRESSES>;

interface ContributionFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContributionForm = ({ isOpen, onClose }: ContributionFormProps) => {
  const [formData, setFormData] = useState({
    chama: "",
    amount: "",
    note: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const chamas = AVAILABLE_CHAMAS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.chama) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const saccoFactory = await getSaccoFactoryContract(true);
      const parsedAmount = parseTokenAmount(formData.amount);
      const chamaAddress = CHAMA_ADDRESSES[formData.chama as keyof typeof CHAMA_ADDRESSES];
      
      // For native token (BTC) transfers, we don't need to approve
      // Just send the transaction with the value
      const tx = await saccoFactory.contributeToCycle(
        chamaAddress,
        { value: parsedAmount }
      );
      
      // Wait for transaction confirmation
      await tx.wait();
      
      // Show success message with transaction hash
      toast({
        title: "Deposit Successful!",
        description: `Your contribution of ${formData.amount} tokens has been submitted.`,
      });
      
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Deposit failed:", error);
      
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your deposit",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    // Reset form
    setFormData({ chama: "", amount: "", note: "" });
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
              <Label htmlFor="chama" className="text-foreground font-mono">Select Chama *</Label>
              <Select onValueChange={(value) => setFormData({...formData, chama: value})}>
                <SelectTrigger className="bg-background/50 border-orange-500/50 text-foreground font-mono">
                  <SelectValue placeholder="Choose your chama" />
                </SelectTrigger>
                <SelectContent className="bg-card cyber-border">
                  {chamas.map((chama) => (
                    <SelectItem key={chama} value={chama}>{chama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        chamaName={formData.chama}
      />
    </>
  );
};
