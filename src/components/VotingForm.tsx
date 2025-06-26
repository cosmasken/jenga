
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";

interface VotingFormProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: {
    id: number;
    title: string;
    description: string;
    amount?: string;
    timeLeft: string;
  } | null;
}

export const VotingForm = ({ isOpen, onClose, proposal }: VotingFormProps) => {
  const [vote, setVote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vote) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setShowSuccess(true);
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    setVote("");
  };

  if (!proposal) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground font-mono glitch-text">
              CAST YOUR VOTE
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground font-mono text-sm">{proposal.title}</h4>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/50 font-mono text-xs">
                  {proposal.timeLeft} left
                </Badge>
              </div>
              {proposal.amount && (
                <p className="text-orange-400 font-mono text-sm mb-2">{proposal.amount}</p>
              )}
              <p className="text-muted-foreground text-xs font-mono">{proposal.description}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-foreground font-mono">Your Vote</Label>
                <RadioGroup value={vote} onValueChange={setVote} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="yes" />
                    <Label htmlFor="yes" className="text-green-400 font-mono">YES - Support this proposal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="no" />
                    <Label htmlFor="no" className="text-red-400 font-mono">NO - Reject this proposal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="abstain" id="abstain" />
                    <Label htmlFor="abstain" className="text-muted-foreground font-mono">ABSTAIN - No preference</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 cyber-button">
                  CANCEL
                </Button>
                <Button 
                  type="submit" 
                  disabled={!vote}
                  className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black"
                >
                  CAST VOTE
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal 
        isOpen={isLoading} 
        title="Casting Vote..." 
        description="Recording your vote on the blockchain"
      />

      <Modal
        isOpen={showSuccess}
        onClose={handleSuccess}
        type="vote"
        title="Vote Recorded!"
        description={`Your ${vote.toUpperCase()} vote has been recorded for: ${proposal.title}`}
      />
    </>
  );
};
