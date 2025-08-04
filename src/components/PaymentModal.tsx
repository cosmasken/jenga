import React, { useState } from 'react';
import { useRosca } from '../hooks/useRosca';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: number;
  groupName: string;
  contributionAmount: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  open, 
  onOpenChange, 
  groupId, 
  groupName, 
  contributionAmount 
}) => {
  const { contribute, isLoading } = useRosca();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await contribute(groupId);
      
      // Show success message (you can add toast here)
      console.log('Payment successful!');
      
      onOpenChange(false);
    } catch (error) {
      console.error('Payment failed:', error);
      // Show error message (you can add toast here)
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open) return null;

  // Estimated network fee for Citrea (Bitcoin L2) transactions
  const networkFee = 0.0001; // cBTC
  const total = parseFloat(contributionAmount) + networkFee;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-card rounded-t-2xl sm:rounded-2xl border border-gray-200 dark:border-border shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-border">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-bitcoin-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-bitcoin-orange text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Monthly Contribution</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pay your {contributionAmount} cBTC contribution to {groupName}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
        
        {/* Payment Details */}
        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Contribution Amount</span>
              <span className="font-semibold font-mono">{contributionAmount} cBTC</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Network Fee (est.)</span>
              <span className="font-semibold font-mono">{networkFee.toFixed(4)} cBTC</span>
            </div>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-bitcoin-orange font-mono">{total.toFixed(4)} cBTC</span>
            </div>
          </div>

          {/* Important Info */}
          <div className="p-4 bg-bitcoin-orange/10 border border-bitcoin-orange/20 rounded-lg mb-6">
            <div className="flex items-start gap-2">
              <span className="w-4 h-4 text-bitcoin-orange mt-0.5">ℹ️</span>
              <div className="text-sm text-bitcoin-orange">
                <div className="font-medium mb-1">Payment Information</div>
                <div className="space-y-1 text-xs">
                  <div>• This payment will be recorded on the blockchain</div>
                  <div>• Transaction cannot be reversed once confirmed</div>
                  <div>• Make sure you have enough cBTC for gas fees</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmPayment}
              disabled={isLoading || isProcessing}
              className="w-full bg-gradient-to-r from-bitcoin-orange to-bitcoin-orange-dark text-white py-3 rounded-xl font-medium transition-all hover:shadow-bitcoin disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="spinner border-white"></div>
                  Processing...
                </div>
              ) : (
                'Confirm Payment'
              )}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
