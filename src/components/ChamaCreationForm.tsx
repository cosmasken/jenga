
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/hooks/use-toast";

interface ChamaCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChamaCreationForm = ({ isOpen, onClose }: ChamaCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weeklyTarget: "",
    maxMembers: "",
    duration: "",
    purpose: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.weeklyTarget || !formData.maxMembers) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setShowSuccess(true);
    
    // Reset form
    setFormData({
      name: "",
      description: "",
      weeklyTarget: "",
      maxMembers: "",
      duration: "",
      purpose: ""
    });
  };

  const handleSuccess = () => {
    setShowSuccess(false);
    onClose();
    toast({
      title: "🎉 CHAMA CREATED!",
      description: "Your savings circle is ready. Share the invite link with members.",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground font-mono glitch-text">
              CREATE NEW CHAMA
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-foreground font-mono">Chama Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Women Farmers Circle"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground font-mono">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of your chama"
                className="bg-background/50 border-orange-500/50 text-foreground font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weeklyTarget" className="text-foreground font-mono">Weekly Target (sats) *</Label>
                <Input
                  id="weeklyTarget"
                  type="number"
                  value={formData.weeklyTarget}
                  onChange={(e) => setFormData({...formData, weeklyTarget: e.target.value})}
                  placeholder="5000"
                  className="bg-background/50 border-orange-500/50 text-foreground font-mono"
                />
              </div>

              <div>
                <Label htmlFor="maxMembers" className="text-foreground font-mono">Max Members *</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({...formData, maxMembers: e.target.value})}
                  placeholder="10"
                  className="bg-background/50 border-orange-500/50 text-foreground font-mono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-foreground font-mono">Duration</Label>
              <Select onValueChange={(value) => setFormData({...formData, duration: value})}>
                <SelectTrigger className="bg-background/50 border-orange-500/50 text-foreground font-mono">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-card cyber-border">
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purpose" className="text-foreground font-mono">Purpose</Label>
              <Select onValueChange={(value) => setFormData({...formData, purpose: value})}>
                <SelectTrigger className="bg-background/50 border-orange-500/50 text-foreground font-mono">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent className="bg-card cyber-border">
                  <SelectItem value="savings">General Savings</SelectItem>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                  <SelectItem value="investment">Investment Pool</SelectItem>
                  <SelectItem value="business">Business Funding</SelectItem>
                  <SelectItem value="education">Education Fund</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button type="submit" className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black">
                CREATE CHAMA
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <LoadingModal 
        isOpen={isLoading} 
        title="Creating Chama..." 
        description="Setting up your savings circle"
      />

      <Modal
        isOpen={showSuccess}
        onClose={handleSuccess}
        type="create-chama"
        title="Chama Created Successfully!"
        description="Your savings circle is ready. Share the invite code with members to get started."
        chamaName={formData.name}
        onConfirm={handleSuccess}
        confirmText="COPY INVITE CODE"
      />
    </>
  );
};
