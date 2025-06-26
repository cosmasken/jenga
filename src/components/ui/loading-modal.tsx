
import * as React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  description?: string;
}

export const LoadingModal = ({ 
  isOpen, 
  title = "Processing...", 
  description = "Please wait while we process your request" 
}: LoadingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-card cyber-border neon-glow max-w-sm" hideCloseButton>
        <div className="text-center py-6">
          <Loader2 className="w-16 h-16 text-orange-400 mx-auto mb-4 animate-spin neon-glow" />
          <h3 className="text-lg font-bold text-foreground font-mono glitch-text mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm font-mono">{description}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
