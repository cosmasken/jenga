// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SACCO is ReentrancyGuard {
    // Share-based ownership system
    struct Member {
        uint256 shares;
        uint256 savings;
        uint256 lastInterestUpdate;
        uint256 joinDate;
        bool isActive;
        uint256 totalLoansReceived;
        uint256 guaranteeCapacity;
    }
    
    struct Proposal {
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        address proposer;
        ProposalType proposalType;
        address targetMember; // For member registration proposals
    }
    
    struct LoanGuarantee {
        address guarantor;
        uint256 amount;
        bool active;
    }
    
    enum ProposalType {
        GENERAL,
        MEMBER_REGISTRATION,
        INTEREST_RATE_CHANGE,
        DIVIDEND_DISTRIBUTION
    }

    // Share-based ownership constants
    uint256 public constant MINIMUM_SHARES = 10;
    uint256 public constant SHARE_PRICE = 0.001 ether; // 0.001 ETH per share
    uint256 public constant SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
    
    // Interest rates
    uint256 public constant SAVINGS_INTEREST_RATE = 5; // 5% per annum
    uint256 public constant LOAN_INTEREST_RATE = 10; // 10% per annum
    
    // Mappings
    mapping(address => Member) public members;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => LoanGuarantee[]) public loanGuarantees;
    mapping(address => uint256[]) public memberLoans;
    
    // Arrays for iteration
    address[] public memberAddresses;
    
    // State variables
    uint256 public totalProposals;
    uint256 public totalShares;
    uint256 public totalSavings;
    uint256 public votingDuration = 7 days; // More reasonable voting period
    address public founder; // Initial founder, governance transfers to members

    // Events
    event SharesPurchased(address indexed member, uint256 shares, uint256 amount);
    event MemberRegistered(address indexed member, uint256 shares);
    event MembershipProposed(address indexed proposer, address indexed candidate);
    event SavingsDeposited(address indexed member, uint256 amount);
    event InterestPaid(address indexed member, uint256 amount);
    event GuaranteeProvided(address indexed guarantor, uint256 loanId, uint256 amount);
    event GuaranteeReleased(address indexed guarantor, uint256 loanId, uint256 amount);

    event LoanIssued(address indexed borrower, uint256 amount, uint256 loanId);
    event LoanRepaid(address indexed borrower, uint256 loanId, uint256 amount);
    event DividendPaid(address indexed member, uint256 amount);

    struct Loan {
        uint256 amount;
        uint256 repaymentAmount;
        uint256 duration;
        uint256 startTime;
        uint256 nextRepaymentTime;
        uint256 repaidAmount;
        bool repaid;
        address borrower;
        uint256 guaranteeRequired;
        uint256 guaranteeProvided;
    }
    
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;

    constructor() {
        founder = msg.sender;
        // Founder gets initial shares to bootstrap the SACCO
        members[msg.sender] = Member({
            shares: MINIMUM_SHARES,
            savings: 0,
            lastInterestUpdate: block.timestamp,
            joinDate: block.timestamp,
            isActive: true,
            totalLoansReceived: 0,
            guaranteeCapacity: 0
        });
        memberAddresses.push(msg.sender);
        totalShares = MINIMUM_SHARES;
        
        emit MemberRegistered(msg.sender, MINIMUM_SHARES);
    }
    
    modifier onlyMember() {
        require(members[msg.sender].isActive, "Only active members can perform this action");
        _;
    }
    
    modifier onlyFounder() {
        require(msg.sender == founder, "Only founder can perform this action");
        _;
    }

    // Share purchase function - entry point to SACCO membership
    function purchaseShares(uint256 _shares) external payable nonReentrant {
        require(_shares >= MINIMUM_SHARES, "Must purchase minimum shares");
        require(msg.value == _shares * SHARE_PRICE, "Incorrect payment amount");
        
        if (!members[msg.sender].isActive) {
            // New member - requires proposal and voting (except for founder)
            require(msg.sender == founder || _shares == MINIMUM_SHARES, "New members can only buy minimum shares initially");
            
            if (msg.sender != founder) {
                // Create membership proposal
                _createMembershipProposal(msg.sender);
                // Hold the payment in escrow until approved
                return;
            }
        }
        
        _addShares(msg.sender, _shares, msg.value);
    }
    
    // Democratic member registration through proposals
    function proposeMembership(address _candidate) external onlyMember {
        require(!members[_candidate].isActive, "Already a member");
        _createMembershipProposal(_candidate);
    }
    
    function _createMembershipProposal(address _candidate) internal {
        proposals[totalProposals] = Proposal({
            description: string(abi.encodePacked("Membership proposal for ", _addressToString(_candidate))),
            deadline: block.timestamp + votingDuration,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            proposer: msg.sender,
            proposalType: ProposalType.MEMBER_REGISTRATION,
            targetMember: _candidate
        });
        
        emit MembershipProposed(msg.sender, _candidate);
        totalProposals++;
    }
    
    function _addShares(address _member, uint256 _shares, uint256 _payment) internal {
        if (!members[_member].isActive) {
            // New member
            members[_member] = Member({
                shares: _shares,
                savings: 0,
                lastInterestUpdate: block.timestamp,
                joinDate: block.timestamp,
                isActive: true,
                totalLoansReceived: 0,
                guaranteeCapacity: _shares * SHARE_PRICE / 2 // 50% of share value
            });
            memberAddresses.push(_member);
            emit MemberRegistered(_member, _shares);
        } else {
            // Existing member buying more shares
            members[_member].shares += _shares;
            members[_member].guaranteeCapacity += _shares * SHARE_PRICE / 2;
        }
        
        totalShares += _shares;
        emit SharesPurchased(_member, _shares, _payment);
    }
    
    // Enhanced savings deposit with interest calculation
    function depositSavings() external payable onlyMember nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        
        // Calculate and pay interest before updating savings
        _calculateAndPayInterest(msg.sender);
        
        members[msg.sender].savings += msg.value;
        totalSavings += msg.value;
        
        emit SavingsDeposited(msg.sender, msg.value);
    }
    
    // Calculate and pay interest on savings
    function _calculateAndPayInterest(address _member) internal {
        Member storage member = members[_member];
        if (member.savings == 0) return;
        
        uint256 timeElapsed = block.timestamp - member.lastInterestUpdate;
        uint256 interest = (member.savings * SAVINGS_INTEREST_RATE * timeElapsed) / (100 * SECONDS_PER_YEAR);
        
        if (interest > 0 && address(this).balance >= interest) {
            member.savings += interest;
            member.lastInterestUpdate = block.timestamp;
            totalSavings += interest;
            
            emit InterestPaid(_member, interest);
        }
    }
    
    // Batch interest calculation for all members
    function calculateInterestForAllMembers() external {
        for (uint i = 0; i < memberAddresses.length; i++) {
            if (members[memberAddresses[i]].isActive) {
                _calculateAndPayInterest(memberAddresses[i]);
            }
        }
    }

    // Enhanced loan request with member guarantees
    function requestLoan(uint256 _amount, uint256 _duration, string calldata /* _purpose */) external onlyMember nonReentrant {
        require(_amount > 0, "Loan amount must be greater than zero");
        require(_duration >= 30 days && _duration <= 365 days, "Invalid loan duration");
        
        Member storage borrower = members[msg.sender];
        
        // Calculate loan limit based on savings and membership duration
        uint256 maxLoanAmount = _calculateMaxLoanAmount(msg.sender);
        require(_amount <= maxLoanAmount, "Loan amount exceeds limit");
        
        // Calculate guarantee requirement (50% of loan amount for new members, 25% for established members)
        uint256 guaranteeRequired = 0;
        if (block.timestamp - borrower.joinDate < 365 days) {
            guaranteeRequired = _amount / 2; // 50% for new members
        } else if (borrower.totalLoansReceived < 3) {
            guaranteeRequired = _amount / 4; // 25% for members with few loans
        }
        
        uint256 repaymentAmount = _amount + (_amount * LOAN_INTEREST_RATE * _duration) / (100 * SECONDS_PER_YEAR);
        
        loans[nextLoanId] = Loan({
            amount: _amount,
            repaymentAmount: repaymentAmount,
            duration: _duration,
            startTime: block.timestamp,
            nextRepaymentTime: block.timestamp + (_duration / 4),
            repaidAmount: 0,
            repaid: false,
            borrower: msg.sender,
            guaranteeRequired: guaranteeRequired,
            guaranteeProvided: 0
        });
        
        memberLoans[msg.sender].push(nextLoanId);
        borrower.totalLoansReceived++;
        
        emit LoanIssued(msg.sender, _amount, nextLoanId);
        nextLoanId++;
    }
    
    // Calculate maximum loan amount based on savings and membership status
    function _calculateMaxLoanAmount(address _member) internal view returns (uint256) {
        Member storage member = members[_member];
        uint256 savingsMultiplier;
        
        // Loan limits based on membership duration and history
        if (block.timestamp - member.joinDate < 90 days) {
            savingsMultiplier = 2; // 2x savings for new members
        } else if (block.timestamp - member.joinDate < 365 days) {
            savingsMultiplier = 3; // 3x savings for members < 1 year
        } else {
            savingsMultiplier = 5; // 5x savings for established members
        }
        
        return member.savings * savingsMultiplier;
    }
    
    // Provide guarantee for another member's loan
    function provideGuarantee(uint256 _loanId) external payable onlyMember nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower != address(0), "Loan does not exist");
        require(loan.borrower != msg.sender, "Cannot guarantee own loan");
        require(!loan.repaid, "Loan already repaid");
        require(msg.value > 0, "Guarantee amount must be greater than zero");
        
        Member storage guarantor = members[msg.sender];
        require(guarantor.guaranteeCapacity >= msg.value, "Insufficient guarantee capacity");
        
        // Add guarantee
        loanGuarantees[_loanId].push(LoanGuarantee({
            guarantor: msg.sender,
            amount: msg.value,
            active: true
        }));
        
        loan.guaranteeProvided += msg.value;
        guarantor.guaranteeCapacity -= msg.value;
        
        emit GuaranteeProvided(msg.sender, _loanId, msg.value);
        
        // If loan is fully guaranteed, disburse the loan
        if (loan.guaranteeProvided >= loan.guaranteeRequired) {
            _disburseLoan(_loanId);
        }
    }
    
    // Disburse loan to borrower
    function _disburseLoan(uint256 _loanId) internal {
        Loan storage loan = loans[_loanId];
        require(address(this).balance >= loan.amount, "Insufficient SACCO funds");
        
        payable(loan.borrower).transfer(loan.amount);
    }

    // Enhanced loan repayment with guarantee release
    function repayLoan(uint256 _loanId) external payable onlyMember nonReentrant {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.repaid, "Loan already repaid");
        require(msg.value > 0, "Repayment amount must be greater than zero");
        
        uint256 remainingAmount = loan.repaymentAmount - loan.repaidAmount;
        uint256 amountToRepay = msg.value > remainingAmount ? remainingAmount : msg.value;
        
        loan.repaidAmount += amountToRepay;
        
        // If loan is fully repaid, release guarantees
        if (loan.repaidAmount >= loan.repaymentAmount) {
            loan.repaid = true;
            _releaseGuarantees(_loanId);
        }
        
        // Return excess payment to borrower
        if (msg.value > amountToRepay) {
            payable(msg.sender).transfer(msg.value - amountToRepay);
        }
        
        emit LoanRepaid(msg.sender, _loanId, amountToRepay);
    }
    
    // Release guarantees when loan is repaid
    function _releaseGuarantees(uint256 _loanId) internal {
        LoanGuarantee[] storage guarantees = loanGuarantees[_loanId];
        
        for (uint i = 0; i < guarantees.length; i++) {
            if (guarantees[i].active) {
                address guarantor = guarantees[i].guarantor;
                uint256 amount = guarantees[i].amount;
                
                // Restore guarantee capacity
                members[guarantor].guaranteeCapacity += amount;
                
                // Return guarantee amount
                payable(guarantor).transfer(amount);
                
                guarantees[i].active = false;
                emit GuaranteeReleased(guarantor, _loanId, amount);
            }
        }
    }

    // Enhanced penalty system with member governance
    function penalizeLatePayment(uint256 _loanId) external onlyMember {
        Loan storage loan = loans[_loanId];
        require(!loan.repaid, "Loan already repaid");
        require(block.timestamp > loan.nextRepaymentTime, "Payment not yet late");
        require(members[msg.sender].shares >= MINIMUM_SHARES * 2, "Insufficient shares to impose penalty");
        
        // Progressive penalty based on how late the payment is
        uint256 daysLate = (block.timestamp - loan.nextRepaymentTime) / 86400;
        uint256 penaltyRate = daysLate > 30 ? 5 : (daysLate > 7 ? 2 : 1); // 1%, 2%, or 5%
        
        loan.repaymentAmount += (loan.repaymentAmount * penaltyRate / 100);
        loan.nextRepaymentTime = block.timestamp + (loan.duration / 4);
    }

    // Democratic dividend distribution based on shares and savings
    function distributeDividends() external onlyMember nonReentrant {
        require(members[msg.sender].shares >= MINIMUM_SHARES * 5, "Insufficient shares to distribute dividends");
        require(address(this).balance > totalSavings, "No surplus for dividends");
        
        uint256 surplus = address(this).balance - totalSavings;
        uint256 dividendPool = surplus / 2; // 50% of surplus as dividends
        
        // Calculate total weighted shares (shares + savings weight)
        uint256 totalWeightedShares = 0;
        for (uint i = 0; i < memberAddresses.length; i++) {
            if (members[memberAddresses[i]].isActive) {
                totalWeightedShares += _calculateMemberWeight(memberAddresses[i]);
            }
        }
        
        // Distribute dividends proportionally
        for (uint i = 0; i < memberAddresses.length; i++) {
            address memberAddr = memberAddresses[i];
            if (members[memberAddr].isActive) {
                uint256 memberWeight = _calculateMemberWeight(memberAddr);
                uint256 dividend = (dividendPool * memberWeight) / totalWeightedShares;
                
                if (dividend > 0) {
                    payable(memberAddr).transfer(dividend);
                    emit DividendPaid(memberAddr, dividend);
                }
            }
        }
    }
    
    // Calculate member weight for dividend distribution (shares + savings factor)
    function _calculateMemberWeight(address _member) internal view returns (uint256) {
        Member storage member = members[_member];
        // Weight = shares + (savings / SHARE_PRICE) / 10 (savings contribute but less than shares)
        return member.shares + (member.savings / SHARE_PRICE) / 10;
    }

    // Enhanced proposal creation with share-based voting power
    function createProposal(string calldata description, ProposalType _type) external onlyMember {
        require(members[msg.sender].shares >= MINIMUM_SHARES, "Insufficient shares to create proposal");
        
        proposals[totalProposals] = Proposal({
            description: description,
            deadline: block.timestamp + votingDuration,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            proposer: msg.sender,
            proposalType: _type,
            targetMember: address(0)
        });
        
        totalProposals++;
    }

    // Share-based voting system
    function vote(uint256 proposalId, bool support) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp < proposal.deadline, "Voting has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(members[msg.sender].shares > 0, "No voting power");
        
        hasVoted[proposalId][msg.sender] = true;
        uint256 votingPower = members[msg.sender].shares;
        
        if (support) {
            proposal.yesVotes += votingPower;
        } else {
            proposal.noVotes += votingPower;
        }
    }

    // Enhanced proposal execution with type-specific logic
    function executeProposal(uint256 proposalId) external onlyMember {
        Proposal storage proposal = proposals[proposalId];
        
        require(block.timestamp >= proposal.deadline, "Voting still active");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.yesVotes > proposal.noVotes, "Proposal did not pass");
        require(proposal.yesVotes >= totalShares / 3, "Insufficient participation"); // Quorum requirement
        
        proposal.executed = true;
        
        // Execute based on proposal type
        if (proposal.proposalType == ProposalType.MEMBER_REGISTRATION) {
            _executeMembershipProposal(proposal.targetMember);
        } else if (proposal.proposalType == ProposalType.INTEREST_RATE_CHANGE) {
            // Interest rate changes would need additional parameters
            // This is a placeholder for more complex proposal types
        } else if (proposal.proposalType == ProposalType.DIVIDEND_DISTRIBUTION) {
            // Trigger dividend distribution
            // This could be automated or require additional logic
        }
        
        // Reward proposer for successful proposal
        if (address(this).balance >= 0.001 ether) {
            payable(proposal.proposer).transfer(0.001 ether);
        }
    }
    
    // Execute approved membership proposal
    function _executeMembershipProposal(address _newMember) internal {
        require(!members[_newMember].isActive, "Already a member");
        
        // Add new member with minimum shares
        _addShares(_newMember, MINIMUM_SHARES, MINIMUM_SHARES * SHARE_PRICE);
    }
    
    // Utility function to convert address to string (simplified)
    function _addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint(uint8(value[i + 12] >> 4))];
            str[3+i*2] = alphabet[uint(uint8(value[i + 12] & 0x0f))];
        }
        return string(str);
    }
    
    // View functions for frontend integration
    function getMemberInfo(address _member) external view returns (
        uint256 shares,
        uint256 savings,
        uint256 joinDate,
        bool isActive,
        uint256 totalLoansReceived,
        uint256 guaranteeCapacity
    ) {
        Member storage member = members[_member];
        return (
            member.shares,
            member.savings,
            member.joinDate,
            member.isActive,
            member.totalLoansReceived,
            member.guaranteeCapacity
        );
    }
    
    function getLoanGuarantees(uint256 _loanId) external view returns (LoanGuarantee[] memory) {
        return loanGuarantees[_loanId];
    }
    
    function getMaxLoanAmount(address _member) external view returns (uint256) {
        return _calculateMaxLoanAmount(_member);
    }
    
    // Emergency functions (only for critical situations)
    function emergencyWithdraw() external onlyFounder {
        require(memberAddresses.length == 1, "Can only be used when founder is sole member");
        payable(founder).transfer(address(this).balance);
    }
}
