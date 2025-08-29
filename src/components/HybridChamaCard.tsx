/**
 * Hybrid Chama Card Component - Displays chama with deploy functionality
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChamaActions } from '@/hooks/useChamaActions';
import { getChamaStatusInfo } from '@/hooks/useHybridChamas';
import { type OffchainChama, offchainChamaService } from '@/services/offchainChamaService';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useQuery } from '@tanstack/react-query';
import {
  Coins,
  Shield,
  Clock,
  Share2,
  Rocket,
  ExternalLink,
  Loader2,
  Bitcoin,
  Users,
  Crown,
  Settings
} from 'lucide-react';

interface HybridChamaCardProps {
  chama: OffchainChama;
  index: number;
}

export function HybridChamaCard({ chama, index }: HybridChamaCardProps) {
  const [, navigate] = useLocation();
  const { primaryWallet } = useDynamicContext();
  const { deployToChain, isDeployingToChain } = useChamaActions(chama.id);
  
  const statusInfo = getChamaStatusInfo(chama);
  const isCreator = chama.creator_address === primaryWallet?.address;
  const canDeploy = isCreator && statusInfo.isDeployable && !statusInfo.isOnChain;

  // Get user context for this chama
  const { data: userContext } = useQuery({
    queryKey: ['chama-user-context', chama.id, primaryWallet?.address],
    queryFn: async () => {
      if (!primaryWallet?.address) return null;
      return offchainChamaService.getUserChamaContext(chama.id, primaryWallet.address);
    },
    enabled: !!primaryWallet?.address
  });

  const handleDeploy = () => {
    deployToChain();
  };

  const handleViewDetails = () => {
    if (statusInfo.isOnChain && chama.chain_address) {
      // For on-chain chamas, go to the regular chama dashboard
      navigate(`/chama/${chama.chain_address}`);
    } else {
      // For off-chain chamas, go to hybrid dashboard using chama ID as address
      navigate(`/chama/${chama.id}/hybrid`);
    }
  };

  const formatAmount = (amount: string) => {
    return parseFloat(amount).toFixed(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <Card className="hover:shadow-md transition-all hover:border-bitcoin/30 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                {chama.name}
                {userContext?.isCreator && (
                  <Crown size={16} className="text-yellow-600" title="You created this chama" />
                )}
                {statusInfo.isOnChain && (
                  <ExternalLink size={16} className="text-green-600" title="On-chain" />
                )}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {userContext?.memberCount || 0}/{chama.member_target} members • {chama.round_duration_hours / 24}d rounds
                </p>
                {userContext?.isMember && !userContext?.isCreator && (
                  <Badge variant="secondary" className="text-xs">
                    Member
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className="border-bitcoin text-bitcoin">
              {statusInfo.label}
            </Badge>
          </div>

          {/* Chama Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Coins size={14} />
                Contribution
              </p>
              <p className="text-lg font-bold text-bitcoin">
                {formatAmount(chama.contribution_amount)} cBTC
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Shield size={14} />
                Security Deposit
              </p>
              <p className="text-lg font-bold text-green-600">
                {formatAmount(chama.security_deposit)} cBTC
              </p>
            </div>
          </div>

          {/* Status Messages */}
          {chama.status === 'draft' && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              💡 <strong>Next:</strong> Update status to "recruiting" to invite members
            </div>
          )}

          {chama.status === 'recruiting' && (
            <div className="text-sm text-blue-600 mb-4 p-2 bg-blue-50 dark:bg-blue-950 rounded">
              📢 <strong>Recruiting:</strong> Invite members to join your chama
            </div>
          )}

          {chama.status === 'waiting' && (
            <div className="text-sm text-orange-600 mb-4 p-2 bg-orange-50 dark:bg-orange-950 rounded">
              ⏳ <strong>Ready:</strong> All members joined! Deploy to blockchain
            </div>
          )}

          {chama.status === 'registered' && (
            <div className="text-sm text-purple-600 mb-4 p-2 bg-purple-50 dark:bg-purple-950 rounded">
              🔗 <strong>On-chain:</strong> Deployed, members can join with deposits
            </div>
          )}

          {chama.status === 'active' && (
            <div className="text-sm text-green-600 mb-4 p-2 bg-green-50 dark:bg-green-950 rounded">
              ✅ <strong>Active:</strong> ROSCA running, contributions in progress
            </div>
          )}

          {/* Chain Address */}
          {statusInfo.isOnChain && chama.chain_address && (
            <div className="text-xs text-gray-500 mb-4 flex items-center gap-1">
              <Bitcoin size={12} />
              <span>Chain: {chama.chain_address.slice(0, 8)}...{chama.chain_address.slice(-6)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>Created {new Date(chama.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Deploy Button */}
              {canDeploy && (
                <Button
                  size="sm"
                  onClick={handleDeploy}
                  disabled={isDeployingToChain}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isDeployingToChain ? (
                    <>
                      <Loader2 size={14} className="mr-1 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Rocket size={14} className="mr-1" />
                      Deploy
                    </>
                  )}
                </Button>
              )}

              {/* Context-aware action buttons */}
              {userContext?.isCreator ? (
                <>
                  {/* Invite Button - only for creators */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {/* TODO: Handle invite */}}
                    className="border-bitcoin/20 hover:border-bitcoin/40 hover:bg-bitcoin/5"
                  >
                    <Share2 size={14} className="mr-1" />
                    Invite
                  </Button>
                  
                  {/* Manage Button - creators see manage instead of view */}
                  <Button
                    size="sm"
                    className="bg-bitcoin hover:bg-bitcoin/90"
                    onClick={handleViewDetails}
                  >
                    <Settings size={14} className="mr-1" />
                    Manage
                  </Button>
                </>
              ) : userContext?.isMember ? (
                <>
                  {/* Member view button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    onClick={handleViewDetails}
                  >
                    <Users size={14} className="mr-1" />
                    My Chama
                  </Button>
                </>
              ) : (
                <>
                  {/* Non-member view button */}
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 text-gray-600 hover:bg-gray-50"
                    onClick={handleViewDetails}
                  >
                    View Details
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default HybridChamaCard;
