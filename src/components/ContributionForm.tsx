import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useSaccoFactory } from "@/hooks/useSaccoFactory";
import { useToast } from "@/hooks/use-toast";
import { Coins, AlertCircle, CheckCircle, Zap } from "lucide-react";

interface ContributionFormProps {
  isOpen: boolean;
  onClose: () => void;
  chama?: any;
}

export const ContributionForm = ({ isOpen, onClose, chama }: ContributionFormProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();
  
  const { 
    contributeToCycle, 
    isContributing, 
    contributeSuccess, 
    contributeTxHash,
    isConnected 
  } = useSaccoFactory();

  // Handle successful contribution
  useEffect(() => {
    if (contributeSuccess && contributeTxHash) {
      setShowSuccessModal(true);
      toast({
        title: "🎉 Contribution Successful!",
        description: `Your contribution to ${chama?.name} has been recorded on Citrea.`,
      });
    }
  }, [contributeSuccess, contributeTxHash, chama?.name, toast]);

  const handleContribute = async () => {
    if (!chama) {
      toast({
        title: "Error",
        description: "No chama selected for contribution",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    try {
      await contributeToCycle(chama.id);
    } catch (error) {
      console.error('Contribution failed:', error);
      // Error handling is done in the hook
    }
  };

  const handleSuccess = () => {
    setShowSuccessModal(false);
    onClose();
  };

  if (!chama) return null;

  const contributionAmountSats = chama.weeklyTarget;
  const contributionAmountBTC = (contributionAmountSats / 100000000).toFixed(8);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground font-mono glitch-text flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-400" />
              CONTRIBUTE TO CYCLE
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Chama Info */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-mono">CHAMA:</span>
                <span className="font-semibold text-foreground font-mono">{chama.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-mono">CURRENT CYCLE:</span>
                <span className="font-semibold text-foreground font-mono">{chama.currentCycle}/{chama.totalCycles}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-mono">NEXT PAYOUT:</span>
                <span className="font-semibold text-blue-400 font-mono">{chama.nextPayout}</span>
              </div>
            </div>

            {/* Contribution Amount */}
            <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-mono">CONTRIBUTION AMOUNT</p>
                <div className="text-3xl font-bold text-green-400 font-mono">
                  {contributionAmountSats.toLocaleString()} sats
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  ≈ {contributionAmountBTC} BTC
                </div>
              </div>
            </div>

            {/* Status Checks */}
            <div className="space-y-3">
              {!isConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your wallet to contribute.
                  </AlertDescription>
                </Alert>
              )}

              {chama.state !== 'Active' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This chama is not active and cannot accept contributions.
                  </AlertDescription>
                </Alert>
              )}

              {chama.role === 'Non-member' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You must join this chama before contributing.
                  </AlertDescription>
                </Alert>
              )}

              {chama.canContribute && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ready to contribute! This will be recorded on the Citrea blockchain.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Gas Sponsorship Info */}
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span className="font-medium text-sm">Gas Sponsorship</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Small contributions may qualify for sponsored gas fees based on your user level.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 cyber-button"
                disabled={isContributing}
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleContribute}
                disabled={!chama.canContribute || isContributing || !isConnected}
                className="flex-1 cyber-button bg-green-500 hover:bg-green-600 text-white"
              >
                {isContributing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    CONTRIBUTING...
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4 mr-2" />
                    CONTRIBUTE
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isContributing}
        title="Contributing to Cycle..."
        description="Broadcasting your contribution to the Citrea network"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccess}
        type="contribution"
        title="Contribution Successful! 🎉"
        description="Your contribution has been recorded on the blockchain"
        amount={`${contributionAmountSats.toLocaleString()} sats`}
        chamaName={chama.name}
        txHash={contributeTxHash}
        onConfirm={handleSuccess}
        confirmText="CONTINUE"
      />
    </>
  );
};
