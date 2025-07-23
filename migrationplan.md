# Jenga Contract Modularization & Frontend Migration Plan

## Overview
This plan outlines the separation of concerns for the Jenga smart contract and the corresponding frontend hook modularization to improve maintainability, security, and code organization.

## Phase 1: Smart Contract Separation

### 1.1 Create ChamaCore.sol
**Purpose**: Core chama functionality - creation, joining, contributions, payouts
**Functions to Extract**:
- `createChama()`
- `joinChama()`
- `startChama()`
- `stackBTC()` (contribution)
- `_checkCycleCompletion()`
- `_processCyclePayout()`
- `_resetCycle()`
- `_completeChama()`
- `processMissedContributions()`
- `_shuffleMembers()`

**State Variables**:
- `chamaCount`
- `chamas` mapping
- `contributions` mapping
- `hasContributedThisCycle` mapping
- `lastContributionTimestamp` mapping

**Events**:
- `ChamaCreated`
- `ChamaJoined`
- `ChamaStarted`
- `ChamaClosed`
- `ChamaCycleCompleted`
- `ChamaCyclePayout`
- `ChamaContributionMissed`
- `ContributionMade`
- `PayoutProcessed`
- `ChamaCompleted`
- `CollateralDeposited`
- `CollateralReturned`
- `CollateralForfeited`

### 1.2 Create ChamaGamification.sol
**Purpose**: Scoring, achievements, and user engagement features
**Functions to Extract**:
- Achievement tracking logic
- Score management
- Profile management
- Invitation system

**State Variables**:
- `scores` mapping
- `achievements` mapping
- `invitations` mapping
- `inviteHashToAddress` mapping
- `profiles` mapping

**Events**:
- `AchievementUnlocked`
- `InviteGenerated`
- `InviteAccepted`

### 1.3 Create P2PTransfer.sol
**Purpose**: Peer-to-peer transfers and red envelope functionality
**Functions to Extract**:
- `sendP2P()`
- `sendRedEnvelope()`
- `claimRedEnvelope()`

**State Variables**:
- `redEnvelopeCount`
- `transactions` mapping
- `redEnvelopes` mapping

**Events**:
- `P2PSent`
- `RedEnvelopeSent`
- `RedEnvelopeClaimed`

### 1.4 Create JengaFactory.sol
**Purpose**: Main contract that orchestrates all modules
**Responsibilities**:
- Deploy and manage module contracts
- Provide unified interface
- Handle cross-module interactions
- Implement access control

## Phase 2: Frontend Hook Modularization

### 2.1 Create useChama.ts
**Purpose**: Core chama functionality hooks
**Hooks to Extract from useJenga**:
- `useCreateChama()`
- `useJoinChama()`
- `useStartChama()`
- `useStackBTC()`
- `useProcessMissedContributions()`
- `useGetChamaDetails()`
- `useGetChamaMembers()`
- `useGetMemberContributions()`
- `useGetCycleInfo()`
- `useGetMemberCollateral()`
- `useIsCollateralReturned()`
- `useGetTotalCollateral()`
- `useGetMemberPayoutPosition()`
- `useHasMemberReceivedPayout()`

### 2.2 Create useChamaGamification.ts
**Purpose**: Gamification and social features
**Hooks to Extract**:
- `useGetUserScore()`
- `useGetUserAchievements()`
- `useGenerateInvite()`
- `useLogInviteAcceptance()`
- `useGetUserProfile()`
- `useCreateProfile()`

### 2.3 Create useP2P.ts
**Purpose**: P2P transfers and red envelopes
**Hooks to Extract**:
- `useSendP2P()`
- `useSendRedEnvelope()`
- `useClaimRedEnvelope()`
- `useGetRedEnvelopeDetails()`
- `useGetTransactionHistory()`

### 2.4 Update useJenga.ts
**Purpose**: Main orchestrator hook that combines all modules
**Responsibilities**:
- Re-export all hooks from modules
- Provide unified interface for backward compatibility
- Handle cross-module state management

## Phase 3: Frontend Component Updates

### 3.1 Components Using Chama Hooks
**Files to Update**:
- `src/pages/Dashboard.tsx`
- `src/components/dashboard/ChamaCard.tsx`
- `src/components/dashboard/CreateChamaModal.tsx`
- `src/components/dashboard/JoinChamaModal.tsx`
- `src/components/dashboard/ChamaDetails.tsx`

**Changes**:
- Replace `useJenga` imports with `useChama`
- Update hook calls to use modular hooks
- Test all chama-related functionality

### 3.2 Components Using Gamification Hooks
**Files to Update**:
- `src/components/dashboard/UserProfile.tsx`
- `src/components/dashboard/AchievementBadge.tsx`
- `src/components/dashboard/ScoreDisplay.tsx`
- `src/components/dashboard/InviteSystem.tsx`

**Changes**:
- Replace `useJenga` imports with `useChamaGamification`
- Update achievement and scoring displays
- Test gamification features

### 3.3 Components Using P2P Hooks
**Files to Update**:
- `src/components/dashboard/P2PTransfer.tsx`
- `src/components/dashboard/RedEnvelopeModal.tsx`
- `src/components/dashboard/TransactionHistory.tsx`

**Changes**:
- Replace `useJenga` imports with `useP2P`
- Update P2P and red envelope functionality
- Test transfer features

## Phase 4: Contract Deployment & Integration

### 4.1 Deploy New Contracts
**Order of Deployment**:
1. Deploy `ChamaCore.sol`
2. Deploy `ChamaGamification.sol`
3. Deploy `P2PTransfer.sol`
4. Deploy `JengaFactory.sol` with module addresses
5. Update contract addresses in frontend config

### 4.2 Update ABIs
**Files to Update**:
- `src/abi/ChamaCore.json`
- `src/abi/ChamaGamification.json`
- `src/abi/P2PTransfer.json`
- `src/abi/JengaFactory.json`
- Update `src/contracts/` configuration files

### 4.3 Update Contract Configurations
**Files to Update**:
- `src/contracts/chama-core-contract.ts`
- `src/contracts/chama-gamification-contract.ts`
- `src/contracts/p2p-contract.ts`
- `src/contracts/jenga-factory-contract.ts`

## Phase 5: Testing & Validation

### 5.1 Contract Testing
- [ ] Unit tests for each module contract
- [ ] Integration tests for cross-module interactions
- [ ] Gas optimization testing
- [ ] Security audit of separated contracts

### 5.2 Frontend Testing
- [ ] Test all modular hooks individually
- [ ] Test component updates with new hooks
- [ ] End-to-end testing of user flows
- [ ] Performance testing of modular architecture

### 5.3 Migration Testing
- [ ] Test backward compatibility
- [ ] Validate data migration if needed
- [ ] Test deployment process
- [ ] Validate contract interactions

## Phase 6: Documentation & Cleanup

### 6.1 Update Documentation
- [ ] Update README with new architecture
- [ ] Document new contract interfaces
- [ ] Update API documentation for hooks
- [ ] Create migration guide for developers

### 6.2 Code Cleanup
- [ ] Remove deprecated code
- [ ] Update import statements
- [ ] Clean up unused dependencies
- [ ] Optimize bundle size

## Implementation Timeline

### Week 1: Contract Separation
- [ ] Create ChamaCore.sol
- [ ] Create ChamaGamification.sol
- [ ] Create P2PTransfer.sol
- [ ] Create JengaFactory.sol

### Week 2: Frontend Hook Modularization
- [ ] Create useChama.ts
- [ ] Create useChamaGamification.ts
- [ ] Create useP2P.ts
- [ ] Update useJenga.ts

### Week 3: Component Updates
- [ ] Update chama-related components
- [ ] Update gamification components
- [ ] Update P2P components
- [ ] Test all updates

### Week 4: Deployment & Testing
- [ ] Deploy contracts to testnet
- [ ] Update frontend configuration
- [ ] Comprehensive testing
- [ ] Documentation updates

## Success Criteria

### Contract Separation Success
- [ ] Each contract has single responsibility
- [ ] Gas costs are optimized or maintained
- [ ] All functionality preserved
- [ ] Security improved with modular design

### Frontend Modularization Success
- [ ] Hooks are logically separated
- [ ] Components use appropriate hooks
- [ ] Bundle size is optimized
- [ ] Developer experience improved

### Overall Migration Success
- [ ] All existing functionality works
- [ ] Code is more maintainable
- [ ] Performance is maintained or improved
- [ ] Security is enhanced

## Risk Mitigation

### Contract Risks
- **Risk**: Breaking changes in contract interfaces
- **Mitigation**: Maintain backward compatibility layer

### Frontend Risks
- **Risk**: Hook dependency issues
- **Mitigation**: Gradual migration with fallbacks

### Deployment Risks
- **Risk**: Contract deployment failures
- **Mitigation**: Thorough testnet testing before mainnet

## Notes
- Maintain backward compatibility during migration
- Use feature flags for gradual rollout
- Keep original contracts as backup
- Document all breaking changes
- Test thoroughly at each phase

---

**Status**: Planning Phase
**Last Updated**: 2025-07-23
**Next Review**: After Phase 1 completion
