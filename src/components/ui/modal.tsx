
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Users, Zap, Shield, Target } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "contribution" | "vote" | "redenvelope" | "create-chama" | "stacking";
  title: string;
  description: string;
  amount?: string;
  recipient?: string;
  chamaName?: string;
  onConfirm?: () => void;
  confirmText?: string;
}

export const Modal = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  description, 
  amount, 
  recipient, 
  chamaName,
  onConfirm,
  confirmText = "CONTINUE"
}: ModalProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 neon-glow" />;
      case "redenvelope":
        return <Gift className="w-16 h-16 text-red-400 mx-auto mb-4 neon-glow" />;
      case "contribution":
      case "create-chama":
        return <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 neon-glow" />;
      case "stacking":
        return <Target className="w-16 h-16 text-orange-400 mx-auto mb-4 neon-glow" />;
      default:
        return <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 neon-glow" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-card cyber-border";
      case "redenvelope":
        return "bg-card cyber-border";
      case "contribution":
      case "create-chama":
        return "bg-card cyber-border";
      case "stacking":
        return "bg-card cyber-border";
      default:
        return "bg-card cyber-border";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getBackgroundColor()} max-w-md neon-glow`}>
        <DialogHeader className="text-center">
          {getIcon()}
          <DialogTitle className="text-xl font-bold text-foreground font-mono glitch-text">{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2 font-mono">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {(amount || recipient || chamaName) && (
          <div className="border-t border-border pt-4 mt-4">
            {amount && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground font-mono">AMOUNT:</span>
                <span className="font-semibold text-orange-400 font-mono">{amount}</span>
              </div>
            )}
            {recipient && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground font-mono">RECIPIENT:</span>
                <span className="font-semibold text-foreground font-mono">{recipient}</span>
              </div>
            )}
            {chamaName && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground font-mono">CHAMA:</span>
                <span className="font-semibold text-foreground font-mono">{chamaName}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 cyber-button">
            CLOSE
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} className="flex-1 cyber-button bg-orange-500 hover:bg-orange-600 text-black">
              {confirmText}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
