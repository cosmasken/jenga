
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";

interface JoinChamaFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinChamaForm = ({ isOpen, onClose }: JoinChamaFormProps) => {
  const [formData, setFormData] = useState({
    inviteCode: "",
    nickname: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.inviteCode) {
      toast({
        title: "Missing Information",
        description: "Please enter the invite code",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call with random success/failure
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.3; // 70% success rate
    
    setIsLoading(false);
    
    if (success) {
      setShowSuccess(true);
    } else {
      setShowError(true);
    }
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    // Reset form
    setFormData({ inviteCode: "", nickname: "" });
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
              <Label htmlFor="inviteCode" className="text-foreground font-mono">Invite Code *</Label>
              <Input
                id="inviteCode"
                value={formData.inviteCode}
                onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}
                placeholder="Enter 6-digit invite code"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
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
                {'>'} Make sure you trust the chama members before joining
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
