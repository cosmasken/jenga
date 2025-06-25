
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gift, Users, Zap } from "lucide-react";

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
  confirmText = "Continue"
}: ModalProps) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
      case "redenvelope":
        return <Gift className="w-16 h-16 text-red-500 mx-auto mb-4" />;
      case "contribution":
      case "create-chama":
        return <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />;
      case "stacking":
        return <Zap className="w-16 h-16 text-orange-500 mx-auto mb-4" />;
      default:
        return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "redenvelope":
        return "bg-red-50";
      case "contribution":
      case "create-chama":
        return "bg-blue-50";
      case "stacking":
        return "bg-orange-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getBackgroundColor()} max-w-md`}>
        <DialogHeader className="text-center">
          {getIcon()}
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {(amount || recipient || chamaName) && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            {amount && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-orange-600">{amount}</span>
              </div>
            )}
            {recipient && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Recipient:</span>
                <span className="font-semibold">{recipient}</span>
              </div>
            )}
            {chamaName && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Chama:</span>
                <span className="font-semibold">{chamaName}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          {onConfirm && (
            <Button onClick={onConfirm} className="flex-1 bg-orange-500 hover:bg-orange-600">
              {confirmText}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
