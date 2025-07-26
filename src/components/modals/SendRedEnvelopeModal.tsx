import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { useContacts, Contact } from '../../hooks/useContacts';
import { useSendRedEnvelope, satsToWei, formatRedEnvelopeAmount } from '../../hooks/useRedEnvelope';
import { ContactsModal } from './ContactsModal';
import { 
  Gift, 
  Plus, 
  X, 
  Users, 
  Shuffle, 
  Equal,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Address, isAddress } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { citreaTestnet } from '../../wagmi';

interface SendRedEnvelopeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RecipientInput {
  id: string;
  address: string;
  name?: string;
  isValid: boolean;
}

export const SendRedEnvelopeModal: React.FC<SendRedEnvelopeModalProps> = ({ open, onOpenChange }) => {
  const [recipients, setRecipients] = useState<RecipientInput[]>([
    { id: '1', address: '', isValid: false }
  ]);
  const [totalAmount, setTotalAmount] = useState('');
  const [message, setMessage] = useState('');
  const [distributionMode, setDistributionMode] = useState<'equal' | 'random'>('equal');
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'form' | 'confirm' | 'sending'>('form');

  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { getContactByAddress } = useContacts();
  
  // Get user balance
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address,
    chainId: citreaTestnet.id,
  });

  const { 
    sendRedEnvelope, 
    hash, 
    error, 
    isPending, 
    isConfirming, 
    isConfirmed 
  } = useSendRedEnvelope();

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Red Envelope Sent! 🧧",
        description: (
          <div className="space-y-2">
            <p>Your red envelope has been sent successfully!</p>
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
      resetModal();
    }
  }, [isConfirmed, hash, toast]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      console.error('Red envelope error:', error);
      
      let errorMessage = 'Failed to send red envelope. Please try again.';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds. You need enough cBTC for the envelope plus gas fees.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message.includes('execution reverted')) {
        if (error.message.includes('No recipients')) {
          errorMessage = 'No recipients specified.';
        } else if (error.message.includes('Too many recipients')) {
          errorMessage = 'Too many recipients. Maximum 20 allowed.';
        } else if (error.message.includes('Amount too small')) {
          errorMessage = 'Amount too small. Minimum 1000 sats required.';
        } else if (error.message.includes('Invalid recipient')) {
          errorMessage = 'One or more recipient addresses are invalid.';
        } else if (error.message.includes('Duplicate recipient')) {
          errorMessage = 'Duplicate recipients are not allowed.';
        } else if (error.message.includes('Cannot send to yourself')) {
          errorMessage = 'You cannot send a red envelope to yourself.';
        }
      }
      
      toast({
        title: 'Red Envelope Failed',
        description: errorMessage,
        variant: "destructive",
      });
      
      setCurrentStep('form');
    }
  }, [error, toast]);

  const resetModal = () => {
    setRecipients([{ id: '1', address: '', isValid: false }]);
    setTotalAmount('');
    setMessage('');
    setDistributionMode('equal');
    setCurrentStep('form');
    onOpenChange(false);
  };

  const addRecipient = () => {
    if (recipients.length >= 20) {
      toast({
        title: 'Maximum Recipients',
        description: 'You can send to a maximum of 20 recipients.',
        variant: 'destructive',
      });
      return;
    }

    const newId = Date.now().toString();
    setRecipients(prev => [...prev, { id: newId, address: '', isValid: false }]);
  };

  const removeRecipient = (id: string) => {
    if (recipients.length <= 1) return;
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const updateRecipient = (id: string, address: string) => {
    const isValid = isAddress(address);
    const contact = isValid ? getContactByAddress(address as Address) : undefined;
    
    setRecipients(prev => prev.map(r => 
      r.id === id 
        ? { ...r, address, isValid, name: contact?.name }
        : r
    ));
  };

  const handleContactSelect = (contact: Contact) => {
    // Find first empty recipient slot or add new one
    const emptyIndex = recipients.findIndex(r => !r.address);
    if (emptyIndex !== -1) {
      updateRecipient(recipients[emptyIndex].id, contact.address);
    } else {
      const newId = Date.now().toString();
      setRecipients(prev => [...prev, { 
        id: newId, 
        address: contact.address, 
        name: contact.name,
        isValid: true 
      }]);
    }
  };

  const validateForm = () => {
    if (!isConnected) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to send red envelopes.',
        variant: 'destructive',
      });
      return false;
    }

    const validRecipients = recipients.filter(r => r.isValid);
    if (validRecipients.length === 0) {
      toast({
        title: 'No Valid Recipients',
        description: 'Please add at least one valid recipient address.',
        variant: 'destructive',
      });
      return false;
    }

    // Check for duplicates
    const addresses = validRecipients.map(r => r.address.toLowerCase());
    const uniqueAddresses = new Set(addresses);
    if (addresses.length !== uniqueAddresses.size) {
      toast({
        title: 'Duplicate Recipients',
        description: 'Please remove duplicate recipient addresses.',
        variant: 'destructive',
      });
      return false;
    }

    // Check if user is sending to themselves
    if (address && addresses.includes(address.toLowerCase())) {
      toast({
        title: 'Invalid Recipient',
        description: 'You cannot send a red envelope to yourself.',
        variant: 'destructive',
      });
      return false;
    }

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return false;
    }

    const amountSats = Math.floor(parseFloat(totalAmount) * 100000000); // Convert BTC to sats
    if (amountSats < 1000) {
      toast({
        title: 'Amount Too Small',
        description: 'Minimum amount is 1000 sats (0.00001 BTC).',
        variant: 'destructive',
      });
      return false;
    }

    // Check balance
    if (balance) {
      const requiredAmount = satsToWei(amountSats);
      const gasBuffer = satsToWei(10000); // 10k sats buffer for gas
      
      if (balance.value < requiredAmount + gasBuffer) {
        toast({
          title: 'Insufficient Balance',
          description: 'You do not have enough balance for this red envelope plus gas fees.',
          variant: 'destructive',
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setCurrentStep('confirm');
  };

  const handleConfirmSend = () => {
    const validRecipients = recipients.filter(r => r.isValid);
    const amountSats = Math.floor(parseFloat(totalAmount) * 100000000);
    
    setCurrentStep('sending');
    
    sendRedEnvelope({
      recipients: validRecipients.map(r => r.address as Address),
      totalAmount: satsToWei(amountSats),
      isRandom: distributionMode === 'random',
      message: message.trim() || 'Happy to share!'
    });
  };

  const validRecipients = recipients.filter(r => r.isValid);
  const amountSats = totalAmount ? Math.floor(parseFloat(totalAmount) * 100000000) : 0;
  const amountPerRecipient = validRecipients.length > 0 && amountSats > 0 
    ? Math.floor(amountSats / validRecipients.length) 
    : 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-red-500" />
              Send Red Envelope 🧧
            </DialogTitle>
          </DialogHeader>

          {currentStep === 'form' && (
            <div className="flex-1 overflow-y-auto space-y-6">
              {/* How Red Envelopes Work */}
              <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
                <h3 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  How Red Envelopes Work
                </h3>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Send Bitcoin gifts to multiple recipients at once</li>
                  <li>• Choose equal distribution or random amounts for fun</li>
                  <li>• Recipients can claim their share anytime</li>
                  <li>• Unclaimed envelopes can be reclaimed after 30 days</li>
                </ul>
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Recipients ({validRecipients.length}/20)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowContactsModal(true)}
                      className="flex items-center gap-1"
                    >
                      <Users className="w-3 h-3" />
                      From Contacts
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addRecipient}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recipients.map((recipient, index) => (
                    <div key={recipient.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder={`Recipient ${index + 1} address (0x...)`}
                          value={recipient.address}
                          onChange={(e) => updateRecipient(recipient.id, e.target.value)}
                          className={`${
                            recipient.address && !recipient.isValid 
                              ? 'border-red-500 focus:border-red-500' 
                              : recipient.isValid 
                                ? 'border-green-500 focus:border-green-500'
                                : ''
                          }`}
                        />
                        {recipient.name && (
                          <p className="text-xs text-gray-500 mt-1">{recipient.name}</p>
                        )}
                      </div>
                      {recipients.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                          className="p-1 h-auto text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Total Amount (BTC)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.00001"
                  min="0.00001"
                  max="1"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="0.001"
                  required
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Minimum: 0.00001 BTC (1,000 sats)</span>
                  {balance && (
                    <span>Balance: {parseFloat(balance.formatted).toFixed(6)} cBTC</span>
                  )}
                </div>
                {validRecipients.length > 0 && amountPerRecipient > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {distributionMode === 'equal' 
                      ? `Each recipient gets: ${amountPerRecipient.toLocaleString()} sats`
                      : 'Random amounts will be distributed to each recipient'
                    }
                  </p>
                )}
              </div>

              {/* Distribution Mode */}
              <div className="space-y-3">
                <Label>Distribution Mode</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={distributionMode === 'equal' ? 'default' : 'outline'}
                    onClick={() => setDistributionMode('equal')}
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Equal className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">Equal Split</div>
                      <div className="text-xs opacity-70">Same amount for everyone</div>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={distributionMode === 'random' ? 'default' : 'outline'}
                    onClick={() => setDistributionMode('random')}
                    className="flex items-center gap-2 h-auto p-4"
                  >
                    <Shuffle className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">Random</div>
                      <div className="text-xs opacity-70">Surprise amounts!</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Happy New Year! 🎉"
                  rows={2}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500">{message.length}/200 characters</p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={validRecipients.length === 0 || !totalAmount || balanceLoading}
                  className="flex-1"
                >
                  {balanceLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Review & Send'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetModal}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <Gift className="w-12 h-12 mx-auto mb-4 text-red-500" />
                <h3 className="text-lg font-medium mb-2">Confirm Red Envelope</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Review the details before sending your red envelope
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                    <span className="font-medium">{totalAmount} cBTC ({amountSats.toLocaleString()} sats)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recipients:</span>
                    <span className="font-medium">{validRecipients.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Distribution:</span>
                    <span className="font-medium capitalize">{distributionMode}</span>
                  </div>
                  {distributionMode === 'equal' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Per Recipient:</span>
                      <span className="font-medium">{amountPerRecipient.toLocaleString()} sats</span>
                    </div>
                  )}
                  {message && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-600 dark:text-gray-400">Message:</span>
                      <p className="mt-1 text-sm">{message}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Recipients:</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {validRecipients.map((recipient, index) => (
                      <div key={recipient.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <span>{recipient.name || `Recipient ${index + 1}`}</span>
                        <span className="font-mono text-xs">{recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConfirmSend}
                  disabled={isPending || isConfirming}
                  className="flex-1"
                >
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Red Envelope 🧧'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('form')}
                  disabled={isPending || isConfirming}
                >
                  Back
                </Button>
              </div>
            </div>
          )}

          {currentStep === 'sending' && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-red-500" />
              <h3 className="text-lg font-medium mb-2">Sending Red Envelope...</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ContactsModal
        open={showContactsModal}
        onOpenChange={setShowContactsModal}
        onSelectContact={handleContactSelect}
        selectMode={true}
        multiSelect={true}
      />
    </>
  );
};
