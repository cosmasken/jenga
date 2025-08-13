# Sacco & Chama Invite System Design

## Overview

This document outlines a comprehensive invite system for the Sacco & Chama platform that enables users to invite friends to both the platform and specific chamas, with tracking, rewards, and social features.

## Current State Analysis

### Existing Components
- **InviteModal**: Basic modal for sharing links via social media, email, and clipboard
- **JoinChamaPage**: Page for joining chamas via address input
- **Dashboard**: Contains invite buttons for both app and chama invites
- **LocalStorage**: Used for storing user chama data

### Current Limitations
- No referral tracking system
- No invite rewards or incentives
- No invite code generation
- No analytics on invite success rates
- No on-chain invite verification
- Limited social sharing options

## Proposed Invite System Architecture

### 1. Smart Contract Enhancements

#### A. Invite Tracking Contract
```solidity
contract InviteTracker {
    struct Invite {
        address inviter;
        address invitee;
        bytes32 inviteCode;
        uint256 timestamp;
        bool claimed;
        InviteType inviteType;
    }
    
    enum InviteType { PLATFORM, CHAMA }
    
    mapping(bytes32 => Invite) public invites;
    mapping(address => bytes32[]) public userInvites;
    mapping(address => uint256) public inviteCount;
    mapping(address => uint256) public successfulInvites;
    
    event InviteCreated(address indexed inviter, bytes32 indexed code, InviteType inviteType);
    event InviteUsed(address indexed invitee, bytes32 indexed code, address indexed inviter);
    event RewardClaimed(address indexed user, uint256 amount, InviteType inviteType);
}
```

#### B. Chama Contract Modifications
```solidity
// Add to ChamaCircle.sol
mapping(address => address) public invitedBy;
mapping(address => uint256) public inviteRewards;

function joinWithInvite(bytes32 inviteCode) external payable {
    // Verify invite code and track referral
    address inviter = inviteTracker.getInviter(inviteCode);
    require(inviter != address(0), "Invalid invite");
    require(inviter != msg.sender, "Cannot invite yourself");
    
    invitedBy[msg.sender] = inviter;
    _join(msg.sender, msg.value);
    
    // Reward inviter
    inviteRewards[inviter] += calculateInviteReward();
    inviteTracker.markInviteUsed(inviteCode, msg.sender);
}
```

### 2. Frontend Invite System

#### A. Invite Code Generation
```typescript
interface InviteCode {
  code: string;
  type: 'platform' | 'chama';
  chamaAddress?: Address;
  inviter: Address;
  expiresAt: Date;
  maxUses: number;
  currentUses: number;
}

class InviteCodeGenerator {
  static generateCode(inviter: Address, type: 'platform' | 'chama'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${type.toUpperCase()}_${inviter.slice(2, 8)}_${timestamp}_${random}`;
  }
}
```

### 3. Implementation Plan

#### Phase 1: Basic Invite System (Week 1-2)
- [ ] Enhanced InviteModal with QR codes
- [ ] Invite code generation and storage
- [ ] URL parameter handling
- [ ] Basic reward preview
- [ ] Social sharing improvements

#### Phase 2: Tracking & Analytics (Week 3-4)
- [ ] Invite tracking service
- [ ] Analytics dashboard
- [ ] Invite history and stats
- [ ] Performance metrics

#### Phase 3: Smart Contract Integration (Week 5-6)
- [ ] Deploy InviteTracker contract
- [ ] Modify Chama contracts for invite support
- [ ] On-chain reward distribution
- [ ] Invite verification system

### 4. Reward System

#### A. Reward Structure
```typescript
interface RewardTiers {
  platform: {
    inviter: string; // 0.001 cBTC per successful invite
    invitee: string; // 0.0005 cBTC welcome bonus
  };
  chama: {
    inviter: string; // 5% of security deposit
    invitee: string; // 10% discount on security deposit
  };
}
```

### 5. User Experience Flow

#### A. Inviter Journey
1. User clicks "Invite Friends" in dashboard
2. InviteModal opens with reward preview
3. User generates custom invite code
4. User shares via preferred channel
5. User tracks invite performance in dashboard
6. User claims rewards when invites convert

#### B. Invitee Journey
1. User clicks invite link
2. Landing page shows invite details and rewards
3. User connects wallet (invite code stored)
4. User completes onboarding with bonus
5. User joins chama or uses platform
6. Both users receive rewards

## Success Metrics

- **Invite Conversion Rate**: Target 15-25%
- **Click-Through Rate**: Target 40-60%
- **User Retention**: 30-day retention of invited users
- **Viral Coefficient**: Average invites per user

## Conclusion

This comprehensive invite system will transform Sacco & Chama into a viral, community-driven platform that rewards users for growing the network through on-chain verification, attractive rewards, and social features.
