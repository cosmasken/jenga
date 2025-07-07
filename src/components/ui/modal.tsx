
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Users, Zap, Shield, Target, ExternalLink, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "contribution" | "vote" | "redenvelope" | "create-chama" | "stacking";
  title: string;
  description: string;
  amount?: string;
  recipient?: string;
  chamaName?: string;
  txHash?: string;
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
  txHash,
  onConfirm,
  confirmText = "CONTINUE"
}: ModalProps) => {
  const { toast } = useToast();

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

  const copyTxHash = () => {
    if (txHash) {
      navigator.clipboard.writeText(txHash);
      toast({
        title: "Copied!",
        description: "Transaction hash copied to clipboard",
      });
    }
  };

  const openExplorer = () => {
    if (txHash) {
      // Open Citrea explorer
      window.open(`https://explorer.testnet.citrea.xyz/tx/${txHash}`, '_blank');
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
        
        {(amount || recipient || chamaName || txHash) && (
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
                <span className="font-semibold text-foreground font-mono">
                  {recipient.length > 20 ? `${recipient.slice(0, 10)}...${recipient.slice(-8)}` : recipient}
                </span>
              </div>
            )}
            {chamaName && (
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground font-mono">CHAMA:</span>
                <span className="font-semibold text-foreground font-mono">{chamaName}</span>
              </div>
            )}
            {txHash && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-mono">TX HASH:</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyTxHash}
                      className="h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={openExplorer}
                      className="h-6 px-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground break-all bg-muted/50 p-2 rounded">
                  {txHash}
                </div>
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
