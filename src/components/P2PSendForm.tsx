
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Modal } from "@/components/ui/modal";
import { useP2PSending } from "@/hooks/useP2PSending";
import { useToast } from "@/hooks/use-toast";
import { Send, Zap, AlertCircle, CheckCircle, Wallet } from "lucide-react";
import { formatUnits, isAddress } from "viem";

interface P2PSendFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const P2PSendForm = ({ isOpen, onClose }: P2PSendFormProps) => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feeEstimate, setFeeEstimate] = useState<{
    gasEstimate: bigint;
    feeEstimate: bigint;
    canSponsor: boolean;
  } | null>(null);

  const { toast } = useToast();
  const { 
    sendSats, 
    estimateFee, 
    isLoading, 
    txHash, 
    error, 
    isSuccess, 
    balance,
    isConnected 
  } = useP2PSending({ sponsorGas: true });

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && txHash) {
      setShowSuccessModal(true);
      // Reset form
      setRecipient("");
      setAmount("");
      setNote("");
      setFeeEstimate(null);
    }
  }, [isSuccess, txHash]);

  // Estimate fees when recipient and amount change
  useEffect(() => {
    const estimateTransactionFee = async () => {
      if (recipient && amount && isAddress(recipient)) {
        try {
          const btcAmount = (parseInt(amount) / 100000000).toString();
          const estimate = await estimateFee(recipient, btcAmount);
          setFeeEstimate(estimate);
        } catch (error) {
          console.error('Fee estimation failed:', error);
          setFeeEstimate(null);
        }
      } else {
        setFeeEstimate(null);
      }
    };

    const debounceTimer = setTimeout(estimateTransactionFee, 500);
    return () => clearTimeout(debounceTimer);
  }, [recipient, amount, estimateFee]);

  const handleSend = async () => {
    if (!recipient || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter recipient address and amount",
        variant: "destructive"
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }

    if (!isAddress(recipient)) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Bitcoin/Ethereum address",
        variant: "destructive"
      });
      return;
    }

    const satsAmount = parseInt(amount);
    if (satsAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    // Check if user has sufficient balance
    if (balance) {
      const amountInWei = BigInt(satsAmount) * BigInt(10000000000); // Convert sats to wei (rough conversion)
      if (amountInWei > balance.value) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough balance for this transaction",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      await sendSats(recipient, satsAmount, note);
      onClose();
    } catch (error) {
      console.error('Send transaction failed:', error);
      // Error is already handled in the hook
    }
  };

  const formatBalance = () => {
    if (!balance) return "0";
    return `${formatUnits(balance.value, balance.decimals)} ${balance.symbol}`;
  };

  const isValidAddress = recipient ? isAddress(recipient) : true;
  const canSend = recipient && amount && isValidAddress && isConnected && !isLoading;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-card cyber-border neon-glow max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground font-mono glitch-text">
              <Send className="w-5 h-5 text-green-400" />
              Send Bitcoin on Citrea
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Wallet Status */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-mono">Balance:</span>
              </div>
              <span className="font-mono text-sm">{formatBalance()}</span>
            </div>

            {/* Connection Warning */}
            {!isConnected && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please connect your wallet to send Bitcoin.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="recipient" className="text-muted-foreground font-mono">RECIPIENT ADDRESS</Label>
              <Input
                id="recipient"
                placeholder="0x... or bc1q..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className={`bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border ${
                  !isValidAddress ? 'border-red-500' : ''
                }`}
              />
              {recipient && !isValidAddress && (
                <p className="text-red-400 text-xs mt-1 font-mono">Invalid address format</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="amount" className="text-muted-foreground font-mono">AMOUNT (SATS)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
              {amount && (
                <p className="text-muted-foreground text-xs mt-1 font-mono">
                  ≈ {(parseInt(amount) / 100000000).toFixed(8)} BTC
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="note" className="text-muted-foreground font-mono">NOTE (OPTIONAL)</Label>
              <Input
                id="note"
                placeholder="Payment for..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-background/50 border-orange-500/30 text-foreground font-mono cyber-border"
              />
            </div>

            {/* Fee Estimate */}
            {feeEstimate && (
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono">Transaction Fee:</span>
                  <div className="flex items-center gap-2">
                    {feeEstimate.canSponsor ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <Zap className="w-3 h-3 mr-1" />
                        SPONSORED
                      </Badge>
                    ) : (
                      <span className="font-mono">
                        {formatUnits(feeEstimate.feeEstimate, 18)} cBTC
                      </span>
                    )}
                  </div>
                </div>
                {feeEstimate.canSponsor && (
                  <p className="text-xs text-green-600 font-mono">
                    🎉 Gas fees sponsored for this transaction!
                  </p>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-mono">
                  {error.message}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1 cyber-button">
                CANCEL
              </Button>
              <Button 
                onClick={handleSend}
                disabled={!canSend}
                className="flex-1 cyber-button bg-green-500 hover:bg-green-600 text-black"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                    SENDING...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    SEND
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <LoadingModal
        isOpen={isLoading}
        title="Sending Bitcoin..."
        description="Broadcasting transaction to Citrea network"
      />

      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
        type="success"
        title="Bitcoin Sent Successfully! ⚡"
        description="Your transaction has been broadcast to the Citrea network"
        amount={`${amount} sats`}
        recipient={recipient}
        txHash={txHash}
      />
    </>
  );
};
