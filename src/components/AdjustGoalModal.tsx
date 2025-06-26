
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdjustGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdjustGoalModal = ({ isOpen, onClose }: AdjustGoalModalProps) => {
  const { toast } = useToast();
  const [newGoal, setNewGoal] = useState("1000");
  const [frequency, setFrequency] = useState("daily");

  const presetGoals = [
    { label: "BEGINNER", amount: "500", description: "Start small" },
    { label: "MODERATE", amount: "1000", description: "Steady growth" },
    { label: "AGGRESSIVE", amount: "2500", description: "Fast accumulation" },
    { label: "WHALE", amount: "5000", description: "Maximum impact" }
  ];

  const handleSaveGoal = () => {
    const goal = parseInt(newGoal);
    if (goal <= 0) return;

    toast({
      title: "🎯 Goal Updated",
      description: `Your ${frequency} stacking goal has been set to ${goal.toLocaleString()} sats`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card cyber-border neon-glow max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
            <Target className="w-5 h-5 text-orange-400" />
            Adjust Stacking Goal
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-muted-foreground font-mono mb-3 block">FREQUENCY</Label>
            <div className="flex gap-2">
              {["daily", "weekly"].map((freq) => (
                <Button
                  key={freq}
                  size="sm"
                  variant={frequency === freq ? "default" : "outline"}
                  onClick={() => setFrequency(freq)}
                  className={`cyber-button flex-1 ${
                    frequency === freq ? 'bg-orange-500 text-black' : ''
                  }`}
                >
                  {freq.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-muted-foreground font-mono mb-3 block">PRESET GOALS</Label>
            <div className="grid grid-cols-2 gap-3">
              {presetGoals.map((preset) => (
                <div
                  key={preset.label}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    newGoal === preset.amount
                      ? 'bg-orange-500/20 border-orange-500/50'
                      : 'bg-background/30 border-border hover:border-orange-500/30'
                  }`}
                  onClick={() => setNewGoal(preset.amount)}
                >
                  <div className="text-center">
                    <Badge variant="outline" className="mb-2 font-mono text-xs">
                      {preset.label}
                    </Badge>
                    <div className="font-bold text-foreground font-mono">
                      {parseInt(preset.amount).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {preset.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="customGoal" className="text-muted-foreground font-mono">CUSTOM AMOUNT (SATS)</Label>
            <Input
              id="customGoal"
              type="number"
              placeholder="Enter custom amount"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
            />
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 font-mono text-sm">GOAL PREVIEW</span>
            </div>
            <p className="text-foreground font-mono">
              Stack <span className="font-bold text-orange-400">{parseInt(newGoal || "0").toLocaleString()} sats</span> {frequency}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {frequency === "daily" ? "~" + (parseInt(newGoal || "0") * 365).toLocaleString() + " sats/year" 
               : "~" + (parseInt(newGoal || "0") * 52).toLocaleString() + " sats/year"}
            </p>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 cyber-button">
              CANCEL
            </Button>
            <Button 
              onClick={handleSaveGoal}
              disabled={!newGoal || parseInt(newGoal) <= 0}
              className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black"
            >
              SAVE GOAL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
