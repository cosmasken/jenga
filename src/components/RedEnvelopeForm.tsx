
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { Gift } from "lucide-react";

interface RedEnvelopeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RedEnvelopeForm = ({ isOpen, onClose }: RedEnvelopeFormProps) => {
  const [message, setMessage] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [recipients, setRecipients] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCreate = async () => {
    if (!message || !totalAmount || !recipients) return;
    
    setIsLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setIsLoading(false);
    onClose();
    setShowSuccessModal(true);
    
    // Reset form
    setMessage("");
    setTotalAmount("");
    setRecipients("");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Gift className="w-5 h-5 text-red-400" />
              Create Red Envelope
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="message" className="text-muted-foreground font-mono">LUCKY MESSAGE</Label>
              <Input
                id="message"
                placeholder="Happy New Year!"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-background/50 border-red-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div>
              <Label htmlFor="totalAmount" className="text-muted-foreground font-mono">TOTAL AMOUNT (SATS)</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="10000"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="bg-background/50 border-red-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div>
              <Label htmlFor="recipients" className="text-muted-foreground font-mono">NUMBER OF RECIPIENTS</Label>
              <Input
                id="recipients"
                type="number"
                placeholder="5"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                className="bg-background/50 border-red-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm font-mono">
                Each recipient will receive approximately {totalAmount && recipients ? Math.floor(parseInt(totalAmount) / parseInt(recipients)) : '---'} sats
              </p>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button 
                onClick={handleCreate}
                disabled={!message || !totalAmount || !recipients}
                className="flex-1 cyber-button bg-red-500 hover:bg-red-600 text-white"
              >
                CREATE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isLoading}
        title="Creating Red Envelope..."
        description="Preparing your lucky money for distribution"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="redenvelope"
        title="Red Envelope Created! 🧧"
        description="Your lucky money is ready to be claimed"
        amount={`${totalAmount} sats`}
      />
    </>
  );
};
