// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SaccoMembers.sol";
import "./SaccoShares.sol";
import "./SaccoSavings.sol";
import "./SaccoLoans.sol";
import "./SaccoGovernance.sol";
import "./SaccoDividends.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title Sacco Orchestrator
 * @notice Delegates all logic to module contracts. Exposes the same API as the legacy Sacco contract.
 */
contract Sacco is AccessControl, Pausable {
    SaccoMembers public members;
    SaccoShares public shares;
    SaccoSavings public savings;
    SaccoLoans public loans;
    SaccoGovernance public governance;
    SaccoDividends public dividends;

    constructor(
        address _admin,
        address _members,
        address _shares,
        address _savings,
        address _loans,
        address _governance,
        address _dividends
    ) {
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        members = SaccoMembers(_members);
        shares = SaccoShares(_shares);
        savings = SaccoSavings(_savings);
        loans = SaccoLoans(_loans);
        governance = SaccoGovernance(_governance);
        dividends = SaccoDividends(_dividends);
    }

    // --- Membership & Shares ---
    function registerMember() external payable whenNotPaused {
        members.registerMember{value: msg.value}();
    }
    function isMember(address user) external view returns (bool) {
        return members.isMember(user);
    }
    function getMember(address user) external view returns (address) {
        return members.getMember(user);
    }
    function getAllMembers() external view returns (address[] memory) {
        return members.getAllMembers();
    }
    function purchaseShares(uint256 amount) external payable whenNotPaused {
        members.purchaseShares{value: msg.value}(amount);
    }
    function transferShares(address to, uint256 amount) external whenNotPaused {
        shares.transferShares(to, amount);
    }
    function getShareBalance(address user) external view returns (uint256) {
        return shares.getShareBalance(user);
    }
    function totalShares() external view returns (uint256) {
        return shares.totalShares();
    }

    // --- Savings ---
    function depositSavings() external payable whenNotPaused {
        savings.depositSavings{value: msg.value}();
    }
    function withdrawSavings(uint256 amount) external whenNotPaused {
        savings.withdrawSavings(amount);
    }
    function getSavings(address user) external view returns (uint256) {
        return savings.getSavings(user);
    }
    function calculateInterest(address user) external view returns (uint256) {
        return savings.calculateInterest(user);
    }

    // --- Loans ---
    function requestLoan(uint256 amount, uint256 duration) external whenNotPaused {
        loans.requestLoan(msg.sender, amount, duration);
    }
    function approveLoan(address borrower) external whenNotPaused {
        loans.approveLoan(borrower);
    }
    function repayLoan(uint256 loanId) external payable whenNotPaused {
        loans.repayLoan{value: msg.value}(loanId);
    }
    function getLoans(address user) external view returns (uint256[] memory) {
        return loans.getLoans(user);
    }
    function calculateLoanLimit(address user) external view returns (uint256) {
        return loans.calculateLoanLimit(user);
    }

    // --- Governance ---
    function submitCommitteeBid() external payable whenNotPaused {
        governance.submitCommitteeBid{value: msg.value}();
    }
    function voteOnCommitteeBid(uint256 bidId) external whenNotPaused {
        governance.voteOnCommitteeBid(bidId);
    }
    function removeBoardMember(address member) external whenNotPaused {
        governance.removeBoardMember(member);
    }
    function getBoardMembers() external view returns (address[] memory) {
        return governance.getBoardMembers();
    }
    function createProposal(string calldata description) external whenNotPaused {
        governance.createProposal(description);
    }
    function voteOnProposal(uint256 proposalId, bool support) external whenNotPaused {
        governance.voteOnProposal(proposalId, support);
    }
    function executeProposal(uint256 proposalId) external whenNotPaused {
        governance.executeProposal(proposalId);
    }

    // --- Dividends ---
    function distributeDividends() external whenNotPaused {
        dividends.distributeDividends();
    }
    function getDividendBalance(address user) external view returns (uint256) {
        return dividends.getDividendBalance(user);
    }

    // --- Admin ---
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
