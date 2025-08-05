/**
 * GroupManagementModal Component
 * Admin functions for group creators to manage their ROSCA groups
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useRosca, type RoscaGroup } from '@/hooks/useRosca';
import { useSupabase } from '@/hooks/useSupabase';
import { useRoscaToast } from '@/hooks/use-rosca-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Settings, 
  Users, 
  UserMinus,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Crown,
  Shield,
  Clock
} from 'lucide-react';
import { formatEther } from 'viem';
import type { Address } from 'viem';

interface GroupManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupInfo: RoscaGroup | null;
  onGroupUpdated?: () => void;
}

export function GroupManagementModal({ 
  isOpen, 
  onClose, 
  groupInfo, 
  onGroupUpdated 
}: GroupManagementModalProps) {
  const { primaryWallet } = useDynamicContext();
  const { 
    setGroupStatus, 
    kickMember, 
    isLoading 
  } = useRosca();
  const { 
    logActivity,
    createNotification 
  } = useSupabase();
  const { success, error: showError, transactionPending } = useRoscaToast();

  const [currentAction, setCurrentAction] = useState<'none' | 'toggle-status' | 'kick-member'>('none');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Check if current user is the group creator
  const isCreator = groupInfo?.creator === primaryWallet?.address;
  const canManage = isCreator && groupInfo?.currentRound === 0; // Can only manage before rounds start

  const handleToggleGroupStatus = async () => {
    if (!groupInfo || !isCreator) return;

    try {
      setCurrentAction('toggle-status');
      setIsUpdatingStatus(true);
      
      const newStatus = !groupInfo.isActive;
      const pendingToast = transactionPending(`${newStatus ? 'opening' : 'closing'} group`);
      
      console.log('🔄 Updating group status to:', newStatus);
      const hash = await setGroupStatus(groupInfo.id, newStatus);
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Group status update hash:', hash);

      // Log activity (only after transaction hash is returned)
      await logActivity(
        'group_status_changed',
        'group',
        groupInfo.id.toString(),
        `${newStatus ? 'Opened' : 'Closed'} group for new members`,
        {
          group_id: groupInfo.id,
          new_status: newStatus,
          transaction_hash: hash
        }
      );

      // Notify existing members about status change
      try {
        if (groupInfo.members) {
          for (const member of groupInfo.members) {
            if (member !== primaryWallet?.address) {
              await createNotification({
                user_wallet_address: member,
                title: `Group ${newStatus ? 'Opened' : 'Closed'} 📢`,
                message: `The group creator has ${newStatus ? 'opened the group for new members' : 'closed the group to new members'}.`,
                type: 'info',
                category: 'group',
                group_id: groupInfo.id.toString(),
                data: {
                  group_id: groupInfo.id,
                  new_status: newStatus,
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
      success(
        `Group ${newStatus ? 'Opened' : 'Closed'}!`, 
        `Your group is now ${newStatus ? 'accepting new members' : 'closed to new members'}.`
      );
      
      // Update local state
      if (groupInfo) {
        groupInfo.isActive = newStatus;
      }
      
      onGroupUpdated?.();
      
    } catch (error) {
      console.error('❌ Failed to update group status:', error);
      showError('Update Failed', 'Could not update group status. Please try again.');
    } finally {
      setCurrentAction('none');
      setIsUpdatingStatus(false);
    }
  };

  const handleKickMember = async (memberAddress: string) => {
    if (!groupInfo || !isCreator || !memberAddress) return;

    try {
      setCurrentAction('kick-member');
      setSelectedMember(memberAddress);
      
      const pendingToast = transactionPending('removing member');
      
      console.log('🔄 Kicking member:', memberAddress);
      const hash = await kickMember(groupInfo.id, memberAddress as Address);
      
      if (!hash) {
        throw new Error('Failed to get transaction hash');
      }

      console.log('✅ Kick member hash:', hash);

      // Log activity (only after transaction hash is returned)
      await logActivity(
        'member_kicked',
        'group',
        groupInfo.id.toString(),
        `Removed member from group ${groupInfo.id}`,
        {
          group_id: groupInfo.id,
          kicked_member: memberAddress,
          transaction_hash: hash
        }
      );

      // Notify the kicked member
      try {
        await createNotification({
          user_wallet_address: memberAddress,
          title: 'Removed from Group ⚠️',
          message: `You have been removed from the ROSCA group by the group creator.`,
          type: 'warning',
          category: 'group',
          group_id: groupInfo.id.toString(),
          data: {
            group_id: groupInfo.id,
            reason: 'Removed by group creator',
            transaction_hash: hash
          }
        });

        // Notify other members
        if (groupInfo.members) {
          for (const member of groupInfo.members) {
            if (member !== primaryWallet?.address && member !== memberAddress) {
              await createNotification({
                user_wallet_address: member,
                title: 'Member Removed from Group 👥',
                message: `A member has been removed from your ROSCA group by the creator.`,
                type: 'info',
                category: 'group',
                group_id: groupInfo.id.toString(),
                data: {
                  group_id: groupInfo.id,
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
      success('Member Removed!', 'The member has been removed from the group.');
      
      onGroupUpdated?.();
      
    } catch (error) {
      console.error('❌ Failed to kick member:', error);
      showError('Removal Failed', 'Could not remove the member. Please try again.');
    } finally {
      setCurrentAction('none');
      setSelectedMember('');
    }
  };

  const handleClose = () => {
    if (currentAction === 'none') {
      onClose();
    }
  };

  if (!isOpen || !groupInfo) return null;

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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Group Management
            </h2>
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              <Crown className="h-3 w-3 mr-1" />
              Creator
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={currentAction !== 'none'}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Group Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Group ID:</span>
                  <Badge variant="secondary">#{groupInfo.id}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Members:</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {groupInfo.memberCount} / {groupInfo.maxMembers}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Round:</span>
                  <Badge variant={groupInfo.currentRound === 0 ? "secondary" : "default"}>
                    {groupInfo.currentRound === 0 ? 'Not Started' : `Round ${groupInfo.currentRound}`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                  <Badge variant={groupInfo.isActive ? "default" : "secondary"}>
                    {groupInfo.isActive ? "Accepting Members" : "Closed"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Management Actions */}
            {!canManage ? (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        Management Restricted
                      </p>
                      <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                        {!isCreator 
                          ? "Only the group creator can manage this group."
                          : "Group management is only available before the first round starts."
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Group Status Toggle */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Group Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor="group-status" className="text-sm font-medium">
                          Accept New Members
                        </Label>
                        <p className="text-xs text-gray-500 mt-1">
                          {groupInfo.isActive 
                            ? "Group is currently accepting new members"
                            : "Group is closed to new members"
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {isUpdatingStatus ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Switch
                            id="group-status"
                            checked={groupInfo.isActive}
                            onCheckedChange={handleToggleGroupStatus}
                            disabled={currentAction !== 'none'}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Member Management */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Member Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {groupInfo.members && groupInfo.members.length > 1 ? (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Remove members from the group (only before rounds start):
                        </p>
                        {groupInfo.members
                          .filter(member => member !== primaryWallet?.address)
                          .map((member) => (
                            <div key={member} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4 text-gray-500" />
                                </div>
                                <div>
                                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {member.slice(0, 6)}...{member.slice(-4)}
                                  </code>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleKickMember(member)}
                                disabled={currentAction !== 'none' || selectedMember === member}
                                className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/20"
                              >
                                {currentAction === 'kick-member' && selectedMember === member ? (
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <UserMinus className="h-3 w-3 mr-1" />
                                )}
                                Remove
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No other members to manage
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Round Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Round Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Round Length:</span>
                        <span className="text-sm font-medium">
                          {Math.floor(groupInfo.roundLength / (24 * 60 * 60))} days
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Payout:</span>
                        <span className="text-sm font-medium">
                          {formatEther(groupInfo.contribution * BigInt(groupInfo.memberCount))} cBTC
                        </span>
                      </div>

                      {groupInfo.currentRound === 0 && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Note:</strong> The first round will start automatically when the group reaches {groupInfo.maxMembers} members.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={currentAction !== 'none'}
            >
              {currentAction !== 'none' ? 'Processing...' : 'Close'}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
