import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { 
  useClaimRedEnvelope, 
  useGetUserClaimableEnvelopes,
  useGetRedEnvelopeDetails,
  formatRedEnvelopeAmount,
  weiToSats
} from '../../hooks/useRedEnvelope';
import { 
  Gift, 
  ExternalLink,
  Loader2,
  CheckCircle,
  Clock,
  User
} from 'lucide-react';
import { useAccount } from 'wagmi';
import { Address } from 'viem';

interface ClaimRedEnvelopeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClaimRedEnvelopeModal: React.FC<ClaimRedEnvelopeModalProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [selectedEnvelopeId, setSelectedEnvelopeId] = useState<bigint | null>(null);
  const [claimingEnvelopeId, setClaimingEnvelopeId] = useState<bigint | null>(null);

  const { toast } = useToast();
  const { address } = useAccount();

  // Get user's claimable envelopes
  const { 
    data: claimableEnvelopes = [], 
    isLoading: loadingEnvelopes,
    refetch: refetchEnvelopes
  } = useGetUserClaimableEnvelopes(address as Address);

  const { 
    claimRedEnvelope, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useClaimRedEnvelope();

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Red Envelope Claimed! 🎉",
        description: (
          <div className="space-y-2">
            <p>You've successfully claimed your red envelope!</p>
            <a 
              href={`https://explorer.testnet.citrea.xyz/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              View on Explorer
            </a>
          </div>
        ),
      });
      
      setClaimingEnvelopeId(null);
      setSelectedEnvelopeId(null);
      refetchEnvelopes();
    }
  }, [isConfirmed, hash, toast, refetchEnvelopes]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      console.error('Claim red envelope error:', error);
      
      let errorMessage = 'Failed to claim red envelope. Please try again.';
      
      if (error.message.includes('Already claimed')) {
        errorMessage = 'This red envelope has already been claimed.';
      } else if (error.message.includes('Not a recipient')) {
        errorMessage = 'You are not a recipient of this red envelope.';
      } else if (error.message.includes('Envelope already fully claimed')) {
        errorMessage = 'This red envelope has been fully claimed.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      }
      
      toast({
        title: 'Claim Failed',
        description: errorMessage,
        variant: "destructive",
      });
      
      setClaimingEnvelopeId(null);
    }
  }, [error, toast]);

  const handleClaim = (envelopeId: bigint) => {
    setClaimingEnvelopeId(envelopeId);
    claimRedEnvelope(envelopeId);
  };

  const handleBatchClaim = () => {
    // For now, claim them one by one
    // In the future, we could implement batch claiming
    if (claimableEnvelopes.length > 0) {
      handleClaim(claimableEnvelopes[0]);
    }
  };

  if (loadingEnvelopes) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-red-500" />
              <p className="text-gray-500">Loading your red envelopes...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-red-500" />
            Claim Red Envelopes 🧧
            {claimableEnvelopes.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({claimableEnvelopes.length} available)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {claimableEnvelopes.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Red Envelopes to Claim
              </h3>
              <p className="text-gray-500 mb-6">
                You don't have any red envelopes waiting to be claimed.
              </p>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Batch claim button */}
              {claimableEnvelopes.length > 1 && (
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-red-900 dark:text-red-100">
                        Multiple Red Envelopes Available
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        You have {claimableEnvelopes.length} red envelopes waiting to be claimed.
                      </p>
                    </div>
                    <Button
                      onClick={handleBatchClaim}
                      disabled={isPending || isConfirming}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        'Claim All'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Individual envelopes */}
              <div className="space-y-3">
                {claimableEnvelopes.map((envelopeId) => (
                  <RedEnvelopeItem
                    key={envelopeId.toString()}
                    envelopeId={envelopeId}
                    onClaim={handleClaim}
                    isClaimingThis={claimingEnvelopeId === envelopeId}
                    disabled={isPending || isConfirming}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface RedEnvelopeItemProps {
  envelopeId: bigint;
  onClaim: (envelopeId: bigint) => void;
  isClaimingThis: boolean;
  disabled: boolean;
}

const RedEnvelopeItem: React.FC<RedEnvelopeItemProps> = ({
  envelopeId,
  onClaim,
  isClaimingThis,
  disabled
}) => {
  const { data: envelopeDetails, isLoading } = useGetRedEnvelopeDetails(envelopeId);

  if (isLoading || !envelopeDetails) {
    return (
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const [sender, recipients, totalAmount, amounts, claimed, timestamp, claimedCount] = envelopeDetails;
  const recipientIndex = recipients.findIndex(r => r.toLowerCase() === (window as any).ethereum?.selectedAddress?.toLowerCase());
  const myAmount = recipientIndex >= 0 ? amounts[recipientIndex] : 0n;
  const timeAgo = new Date(Number(timestamp) * 1000).toLocaleDateString();

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-red-300 dark:hover:border-red-600 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
            <Gift className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Red Envelope #{envelopeId.toString()}
              </h3>
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                {formatRedEnvelopeAmount(myAmount)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                From {sender.slice(0, 6)}...{sender.slice(-4)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </span>
              <span>
                {claimedCount}/{recipients.length} claimed
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onClaim(envelopeId)}
          disabled={disabled}
          className="bg-red-500 hover:bg-red-600"
        >
          {isClaimingThis ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Claiming...
            </>
          ) : (
            <>
              <Gift className="w-4 h-4 mr-2" />
              Claim
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
