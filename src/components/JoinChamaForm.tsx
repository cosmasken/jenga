import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useSaccoFactory } from "@/hooks/useSaccoFactory";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, AlertCircle, CheckCircle, Zap, Users } from "lucide-react";

interface JoinChamaFormProps {
  isOpen: boolean;
  onClose: () => void;
  chama?: any;
}

export const JoinChamaForm = ({ isOpen, onClose, chama }: JoinChamaFormProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { toast } = useToast();
  
  const { 
    joinPool, 
    isJoining, 
    joinSuccess, 
    joinTxHash,
    isConnected 
  } = useSaccoFactory();

  // Handle successful join
  useEffect(() => {
    if (joinSuccess && joinTxHash) {
      setShowSuccessModal(true);
      toast({
        title: "🎉 Successfully Joined Chama!",
        description: `Welcome to ${chama?.name}! You're now part of the savings circle.`,
      });
    }
  }, [joinSuccess, joinTxHash, chama?.name, toast]);

  const handleJoin = async () => {
    if (!chama) {
      toast({
        title: "Error",
        description: "No chama selected to join",
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
      await joinPool(chama.id);
    } catch (error) {
      console.error('Join failed:', error);
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
              <UserPlus className="w-5 h-5 text-blue-400" />
              JOIN CHAMA
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
                <span className="text-muted-foreground font-mono">MEMBERS:</span>
                <span className="font-semibold text-foreground font-mono">{chama.members}/{chama.maxMembers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-mono">CREATOR:</span>
                <span className="font-semibold text-foreground font-mono">
                  {chama.creator.slice(0, 6)}...{chama.creator.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-mono">STATUS:</span>
                <Badge className={chama.state === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {chama.state}
                </Badge>
              </div>
            </div>

            {/* Joining Requirements */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground font-mono">INITIAL CONTRIBUTION REQUIRED</p>
                <div className="text-3xl font-bold text-blue-400 font-mono">
                  {contributionAmountSats.toLocaleString()} sats
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  ≈ {contributionAmountBTC} BTC
                </div>
              </div>
            </div>

            {/* Chama Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground font-mono">How it works:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                  <p>Pay initial contribution to join the savings circle</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                  <p>Contribute {contributionAmountSats.toLocaleString()} sats each cycle</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                  <p>Receive full pool payout when it's your turn</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">4</div>
                  <p>Build on-chain reputation and credit history</p>
                </div>
              </div>
            </div>

            {/* Status Checks */}
            <div className="space-y-3">
              {!isConnected && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please connect your wallet to join this chama.
                  </AlertDescription>
                </Alert>
              )}

              {chama.state !== 'Active' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This chama is not active and cannot accept new members.
                  </AlertDescription>
                </Alert>
              )}

              {chama.members >= chama.maxMembers && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This chama is full and cannot accept new members.
                  </AlertDescription>
                </Alert>
              )}

              {chama.role !== 'Non-member' && (
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    You are already a {chama.role.toLowerCase()} of this chama.
                  </AlertDescription>
                </Alert>
              )}

              {chama.canJoin && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ready to join! Your membership will be recorded on the Citrea blockchain.
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
                New users may qualify for sponsored gas fees when joining their first chama.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 cyber-button"
                disabled={isJoining}
              >
                CANCEL
              </Button>
              <Button 
                onClick={handleJoin}
                disabled={!chama.canJoin || isJoining || !isConnected}
                className="flex-1 cyber-button bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isJoining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    JOINING...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    JOIN CHAMA
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isJoining}
        title="Joining Chama..."
        description="Processing your membership on the Citrea network"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccess}
        type="success"
        title="Welcome to the Chama! 🎉"
        description="You've successfully joined the savings circle"
        amount={`${contributionAmountSats.toLocaleString()} sats`}
        chamaName={chama.name}
        txHash={joinTxHash}
        onConfirm={handleSuccess}
        confirmText="CONTINUE"
      />
    </>
  );
};
