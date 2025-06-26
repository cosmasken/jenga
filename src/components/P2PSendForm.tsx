
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { Send } from "lucide-react";

interface P2PSendFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const P2PSendForm = ({ isOpen, onClose }: P2PSendFormProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSend = async () => {
    if (!recipient || !amount) return;
    
    setIsLoading(true);
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    onClose();
    setShowSuccessModal(true);
    
    // Reset form
    setRecipient("");
    setAmount("");
    setNote("");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Send className="w-5 h-5 text-green-400" />
              Send Bitcoin
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient" className="text-muted-foreground font-mono">RECIPIENT ADDRESS</Label>
              <Input
                id="recipient"
                placeholder="bc1q..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-muted-foreground font-mono">AMOUNT (SATS)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div>
              <Label htmlFor="note" className="text-muted-foreground font-mono">NOTE (OPTIONAL)</Label>
              <Input
                id="note"
                placeholder="Payment for..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!recipient || !amount}
                className="flex-1 cyber-button bg-green-500 hover:bg-green-600 text-black"
              >
                SEND
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isLoading}
        title="Sending Bitcoin..."
        description="Broadcasting transaction to the network"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Bitcoin Sent Successfully! ⚡"
        description="Your transaction has been broadcast to the network"
        amount={`${amount} sats`}
        recipient={recipient}
      />
    </>
  );
};
