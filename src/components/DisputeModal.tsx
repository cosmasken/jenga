/**
 * DisputeModal Component
 * Handles dispute creation and voting for ROSCA groups
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRosca, type RoscaGroup, type DisputeInfo } from '@/hooks/useRosca';
import { useSupabase } from '@/hooks/useSupabase';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  X,
  Loader2,
  CheckCircle,
  Clock,
  Scale,
  MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Address } from 'viem';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'vote';
  groupInfo?: RoscaGroup | null;
  disputeInfo?: DisputeInfo | null;
}

export function DisputeModal({ isOpen, onClose, mode, groupInfo, disputeInfo }: DisputeModalProps) {
  const { primaryWallet } = useDynamicContext();
  const { 
    createDispute, 
    voteOnDispute, 
    hasVotedOnDispute,
    isLoading 
  } = useRosca();
  const { 
    logActivity,
    createNotification 
  } = useSupabase();
  const { success, error: showError, transactionPending } = useRoscaToast();

  // Create dispute state
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [disputeReason, setDisputeReason] = useState('');
  const [currentStep, setCurrentStep] = useState<'form' | 'submitting' | 'success'>('form');

  // Vote dispute state
  const [hasVoted, setHasVoted] = useState(false);
  const [isCheckingVote, setIsCheckingVote] = useState(false);

  // Check if user has already voted (for vote mode)
  useEffect(() => {
    if (mode === 'vote' && disputeInfo && primaryWallet?.address && isOpen) {
      checkVoteStatus();
    }
  }, [mode, disputeInfo, primaryWallet?.address, isOpen]);

  const checkVoteStatus = async () => {
    if (!disputeInfo || !primaryWallet?.address) return;

    try {
      setIsCheckingVote(true);
      const voted = await hasVotedOnDispute(disputeInfo.id, primaryWallet.address as Address);
      setHasVoted(voted);
    } catch (error) {
      console.error('❌ Failed to check vote status:', error);
    } finally {
      setIsCheckingVote(false);
    }
  };

  const handleCreateDispute = async () => {
    if (!groupInfo || !selectedMember || !disputeReason.trim() || !primaryWallet?.address) return;

    try {
      setCurrentStep('submitting');
      
      const pendingToast = transactionPending("creating dispute");
      
      // Step 1: Create dispute on blockchain
      console.log('🔄 Creating dispute on blockchain...');
      const hash = await createDispute(groupInfo.id, selectedMember as Address, disputeReason.trim());
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Dispute creation hash:', hash);

      // Step 2: Log activity (only after transaction hash is returned)
      await logActivity(
        'dispute_created',
        'group',
        groupInfo.id.toString(),
        `Created dispute against member in group ${groupInfo.id}`,
        {
          group_id: groupInfo.id,
          defendant: selectedMember,
          reason: disputeReason.trim(),
          transaction_hash: hash
        }
      );

      // Step 3: Create notifications for group members
      try {
        if (groupInfo.members) {
          for (const member of groupInfo.members) {
            if (member !== primaryWallet.address && member !== selectedMember) {
              await createNotification({
                user_wallet_address: member,
                title: 'New Dispute Requires Your Vote 🗳️',
                message: `A dispute has been raised in your ROSCA group. Your vote is needed to resolve it.`,
                type: 'warning',
                category: 'dispute',
                group_id: groupInfo.id.toString(),
                data: {
                  group_id: groupInfo.id,
                  dispute_reason: disputeReason.trim(),
                  transaction_hash: hash
                }
              });
            }
          }
        }
      } catch (notificationError) {
        console.warn('⚠️ Could not create notifications:', notificationError);
      }

      pendingToast.dismiss();
      success('Dispute Created!', 'Your dispute has been submitted for group voting.');
      
      setCurrentStep('success');
      setTimeout(() => onClose(), 2000);
      
    } catch (error) {
      console.error('❌ Failed to create dispute:', error);
      showError('Dispute Creation Failed', 'Could not create the dispute. Please try again.');
      setCurrentStep('form');
    }
  };

  const handleVoteOnDispute = async (support: boolean) => {
    if (!disputeInfo || !primaryWallet?.address) return;

    try {
      const pendingToast = transactionPending("submitting vote");
      
      // Step 1: Vote on blockchain
      console.log('🔄 Voting on dispute:', disputeInfo.id, 'support:', support);
      const hash = await voteOnDispute(disputeInfo.id, support);
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Vote transaction hash:', hash);

      // Step 2: Log activity (only after transaction hash is returned)
      await logActivity(
        'dispute_voted',
        'dispute',
        disputeInfo.id.toString(),
        `Voted ${support ? 'for' : 'against'} dispute ${disputeInfo.id}`,
        {
          dispute_id: disputeInfo.id,
          group_id: disputeInfo.groupId,
          vote: support ? 'for' : 'against',
          transaction_hash: hash
        }
      );

      // Step 3: Create notification for dispute parties
      try {
        await createNotification({
          user_wallet_address: disputeInfo.complainant,
          title: 'New Vote on Your Dispute 📊',
          message: `A group member has voted on your dispute. Check the current status.`,
          type: 'info',
          category: 'dispute',
          data: {
            dispute_id: disputeInfo.id,
            vote: support ? 'for' : 'against',
            transaction_hash: hash
          }
        });
      } catch (notificationError) {
        console.warn('⚠️ Could not create notification:', notificationError);
      }

      pendingToast.dismiss();
      success('Vote Submitted!', `Your vote has been recorded.`);
      
      setHasVoted(true);
      setTimeout(() => onClose(), 1500);
      
    } catch (error) {
      console.error('❌ Failed to vote on dispute:', error);
      showError('Vote Failed', 'Could not submit your vote. Please try again.');
    }
  };

  const handleClose = () => {
    if (currentStep !== 'submitting' && !isLoading) {
      onClose();
      // Reset state
      setTimeout(() => {
        setCurrentStep('form');
        setSelectedMember('');
        setDisputeReason('');
        setHasVoted(false);
      }, 300);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">Active</Badge>;
      case 'Resolved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Resolved</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {mode === 'create' ? 'Create Dispute' : 'Vote on Dispute'}
            </h2>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={currentStep === 'submitting' || isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {mode === 'create' ? (
            <AnimatePresence mode="wait">
              {currentStep === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Group Info */}
                  {groupInfo && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Group Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Group ID:</span>
                          <Badge variant="secondary">#{groupInfo.id}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Member Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="member">Select Member to Dispute</Label>
                    <Select value={selectedMember} onValueChange={setSelectedMember}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a group member" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupInfo?.members?.filter(member => member !== primaryWallet?.address).map((member) => (
                          <SelectItem key={member} value={member}>
                            {member.slice(0, 6)}...{member.slice(-4)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dispute Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Dispute Reason *</Label>
                    <Textarea
                      id="reason"
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="Explain why you are raising this dispute..."
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {disputeReason.length}/500 characters
                    </p>
                  </div>

                  {/* Warning */}
                  <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                            Important Notice
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                            Disputes are voted on by all group members. If upheld, the disputed member will be removed from the group.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 'submitting' && (
                <motion.div
                  key="submitting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-bitcoin mb-4" />
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                    Creating Dispute...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Please confirm the transaction in your wallet
                  </p>
                </motion.div>
              )}

              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">
                    Dispute Created!
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Group members will now vote on your dispute
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            // Vote Mode
            <div className="space-y-6">
              {disputeInfo && (
                <>
                  {/* Dispute Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Dispute Details</CardTitle>
                        {getStatusBadge(disputeInfo.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Dispute ID:</span>
                        <Badge variant="secondary">#{disputeInfo.id}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Complainant:</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {disputeInfo.complainant.slice(0, 6)}...{disputeInfo.complainant.slice(-4)}
                        </code>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Defendant:</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {disputeInfo.defendant.slice(0, 6)}...{disputeInfo.defendant.slice(-4)}
                        </code>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(disputeInfo.createdAt * 1000), { addSuffix: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Dispute Reason */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Dispute Reason
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {disputeInfo.reason}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Voting Status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Voting Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm">Support</span>
                        </div>
                        <Badge variant="secondary">{disputeInfo.votesFor}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-500" />
                          <span className="text-sm">Reject</span>
                        </div>
                        <Badge variant="secondary">{disputeInfo.votesAgainst}</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Vote Status */}
                  {isCheckingVote ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          <span className="text-sm">Checking vote status...</span>
                        </div>
                      </CardContent>
                    </Card>
                  ) : hasVoted ? (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              You have already voted on this dispute
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                              Thank you for participating in the resolution process.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : disputeInfo.status !== 'Active' ? (
                    <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Voting has ended
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              This dispute has been {disputeInfo.status.toLowerCase()}.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          {mode === 'create' && currentStep === 'form' && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleCreateDispute}
                disabled={!selectedMember || !disputeReason.trim() || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Create Dispute
                  </>
                )}
              </Button>
            </div>
          )}

          {mode === 'vote' && disputeInfo && !hasVoted && disputeInfo.status === 'Active' && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleVoteOnDispute(false)}
                  disabled={isLoading}
                  className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/20"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                
                <Button
                  onClick={() => handleVoteOnDispute(true)}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Support
                </Button>
              </div>
            </div>
          )}

          {mode === 'vote' && (hasVoted || disputeInfo?.status !== 'Active') && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
