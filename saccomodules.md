# SACCO Modularization Breakdown

This document outlines the modular architecture for the SACCO smart contract system, designed to overcome contract size limits, improve maintainability, security, and upgradeability, while preserving the existing API for frontend and integrations.

## Overview

The SACCO contract is split into the following modules, each handling a distinct domain of functionality. The main `Sacco.sol` contract acts as an orchestrator, delegating calls to these modules. All public/external function names and signatures are preserved at the orchestrator level to avoid breaking changes.

---

## Module Structure

### 1. SaccoMembers.sol
**Responsibilities:**
- Member registration and management
- Membership eligibility and status
- Share purchase system (mandatory for joining)
- Member registry and data access
- Membership events

**Key Functions:**
- `registerMember()` (now requires share purchase)
- `isMember(address)`
- `getMember(address)`
- `getAllMembers()`
- `purchaseShares(uint256 amount)`

---

### 2. SaccoShares.sol
**Responsibilities:**
- Share issuance, transfer, and tracking
- Share-based ownership structure
- Voting power calculation
- Minimum share requirements enforcement

**Key Functions:**
- `purchaseShares(uint256 amount)`
- `transferShares(address to, uint256 amount)`
- `getShareBalance(address)`
- `totalShares()`

---

### 3. SaccoSavings.sol
**Responsibilities:**
- Savings deposits and withdrawals
- Savings tracking per member
- Interest accrual on savings
- Savings used as loan collateral

**Key Functions:**
- `depositSavings()`
- `withdrawSavings(uint256 amount)`
- `getSavings(address)`
- `calculateInterest(address)`

---

### 4. SaccoLoans.sol
**Responsibilities:**
- Loan request, approval, and repayment
- Loan tracking per member
- Interest calculation, late penalties
- Loan limits (tied to savings/shares)

**Key Functions:**
- `requestLoan(uint256 amount, uint256 duration)`
- `approveLoan(address borrower)`
- `repayLoan(uint256 loanId)`
- `getLoans(address)`
- `calculateLoanLimit(address)`

---

### 5. SaccoGovernance.sol
**Responsibilities:**
- Board of directors management
- Committee bid and voting system
- Proposal creation and voting
- Democratic governance (no owner dependency)

**Key Functions:**
- `submitCommitteeBid()`
- `voteOnCommitteeBid(uint256 bidId)`
- `removeBoardMember(address member)`
- `getBoardMembers()`
- `createProposal(string calldata description)`
- `voteOnProposal(uint256 proposalId, bool support)`
- `executeProposal(uint256 proposalId)`

---

### 6. SaccoDividends.sol
**Responsibilities:**
- Dividend calculation and distribution
- Dividend events

**Key Functions:**
- `distributeDividends()`
- `getDividendBalance(address)`

---

## Orchestrator: Sacco.sol
- Exposes the same external/public API as before
- Delegates logic to the relevant module contract via internal calls
- Handles cross-module coordination (e.g., share-based voting, dividend triggers)
- Maintains access control and pausable logic

---

## Upgrade & Security Patterns
- Use OpenZeppelin's `ReentrancyGuard`, `Pausable`, and `AccessControl` in orchestrator and modules
- Use custom errors for gas efficiency
- All modules are upgradeable independently (future-proofing)

---

## Rationale
- **Contract size**: Each module is small and focused, deployable within EVM limits
- **Maintainability**: Easier to test, audit, and upgrade
- **Security**: Separation of concerns and role-based access
- **Frontend Compatibility**: No breaking changes to function names/signatures

---

## Next Steps
1. Implement each module as a separate contract
2. Refactor Sacco.sol to delegate to modules
3. Update deployment scripts and config
4. Test API compatibility with frontend hooks
