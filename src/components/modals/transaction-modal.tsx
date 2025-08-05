import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bitcoin, Loader2 } from "lucide-react";

export function TransactionModal() {
  const { showTransactionModal, setShowTransactionModal, selectedGroupId, payContribution } = useStore();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (!selectedGroupId) return;
    
    setIsProcessing(true);
    
    // Simulate transaction processing
    setTimeout(() => {
      payContribution(selectedGroupId);
      setIsProcessing(false);
      setShowTransactionModal(false);
      
      toast({
        title: "Payment Confirmed!",
        description: "Your contribution has been successfully processed.",
        className: "bg-green-500 text-white border-green-600",
      });
      
      // Show success toast after processing
      setTimeout(() => {
        toast({
          title: "Transaction Complete",
          description: "₿0.05 sent successfully to the group pool.",
          className: "bg-[hsl(27,87%,54%)] text-white border-[hsl(27,87%,49%)]",
        });
      }, 2000);
    }, 3000);
  };

  return (
    <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
      <DialogContent className="max-w-md">
        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-block p-4 bg-[hsl(27,87%,54%)]/10 rounded-full mb-4">
                <Bitcoin className="h-8 w-8 text-[hsl(27,87%,54%)]" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Confirm Payment
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Review your Bitcoin contribution details
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₿0.05</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-400">Network Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">₿0.0002</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[hsl(27,87%,54%)]/10 rounded-lg border border-[hsl(27,87%,54%)]/20">
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                  <span className="font-bold text-[hsl(27,87%,54%)]">₿0.0502</span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTransactionModal(false)}
                  className="flex-1"
                  data-testid="button-cancel-transaction"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-1 bg-[hsl(27,87%,54%)] hover:bg-[hsl(27,87%,49%)] text-white"
                  data-testid="button-confirm-transaction"
                >
                  Confirm Payment
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center py-8"
            >
              <div className="inline-block p-4 bg-[hsl(27,87%,54%)]/10 rounded-full mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Bitcoin className="h-8 w-8 text-[hsl(27,87%,54%)]" />
                </motion.div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Processing Transaction
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Confirming your Bitcoin payment on the network...
              </p>
              
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[hsl(27,87%,54%)] mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Please wait...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
