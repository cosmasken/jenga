// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable"

contract SACCO {
    struct Proposal {
        string description; // Proposal details
        uint256 deadline;   // Voting deadline
        uint256 yesVotes;   // Votes in favor
        uint256 noVotes;    // Votes against
        bool executed;      // Whether the proposal has been executed
        address proposer;   // Address of the proposer
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256) public votingPower;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    uint256 public totalProposals;
    uint256 public votingDuration = 10 minutes;
    mapping(address => bool) public registeredMembers;
    address[] public registeredMembersArray; // New array to store registered members
    mapping(address => uint256) public savings;

    event MemberRegistered(address indexed member);
    event SavingsDeposited(address indexed member, uint256 amount);

    event LoanIssued(address indexed borrower, uint256 amount, uint256 loanId);
    event LoanRepaid(address indexed borrower, uint256 loanId, uint256 amount);
    event DividendPaid(address indexed member, uint256 amount);

    struct Loan {
        uint256 amount;
        uint256 repaymentAmount; // amount + interest
        uint256 duration; // in seconds
        uint256 startTime;
        uint256 nextRepaymentTime;
        uint256 repaidAmount;
        bool repaid;
        address borrower;
    }

    mapping(address => uint256[]) public memberLoans; // member => list of loan IDs
    mapping(uint256 => Loan) public loans;
    uint256 public nextLoanId;
    uint256 public loanInterestRate = 5; // 5%

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function registerMember(address _member) external onlyOwner {
        require(!registeredMembers[_member], "Member already registered");
        registeredMembers[_member] = true;
        registeredMembersArray.push(_member);
        emit MemberRegistered(_member);
    }

    function depositSavings() external payable {
        require(registeredMembers[msg.sender], "Only registered members can deposit savings");
        require(msg.value > 0, "Deposit amount must be greater than zero");
        savings[msg.sender] += msg.value;
        emit SavingsDeposited(msg.sender, msg.value);
    }

    function requestLoan(uint256 _amount, uint256 _duration) external {
        require(registeredMembers[msg.sender], "Only registered members can request loans");
        require(_amount > 0, "Loan amount must be greater than zero");
        require(savings[msg.sender] >= _amount / 10, "Savings too low for loan collateral (10%)"); // Example collateral

        uint256 repaymentAmount = _amount + (_amount * loanInterestRate / 100);

        loans[nextLoanId] = Loan({
            amount: _amount,
            repaymentAmount: repaymentAmount,
            duration: _duration,
            startTime: block.timestamp,
            nextRepaymentTime: block.timestamp + (_duration / 4), // Example: 4 installments
            repaidAmount: 0,
            repaid: false,
            borrower: msg.sender
        });

        memberLoans[msg.sender].push(nextLoanId);
        emit LoanIssued(msg.sender, _amount, nextLoanId);
        nextLoanId++;
    }

    function repayLoan(uint256 _loanId) external payable {
        Loan storage loan = loans[_loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.repaid, "Loan already repaid");
        require(msg.value > 0, "Repayment amount must be greater than zero");

        uint256 remainingAmount = loan.repaymentAmount - loan.repaidAmount;
        uint256 amountToRepay = msg.value;

        if (amountToRepay >= remainingAmount) {
            loan.repaidAmount += remainingAmount;
            loan.repaid = true;
            payable(owner).transfer(remainingAmount); // Transfer to SACCO owner/treasury
        } else {
            loan.repaidAmount += amountToRepay;
            payable(owner).transfer(amountToRepay);
        }
        emit LoanRepaid(msg.sender, _loanId, msg.value);
    }

    function penalizeLatePayment(uint256 _loanId) external onlyOwner {
        Loan storage loan = loans[_loanId];
        require(!loan.repaid, "Loan already repaid");
        require(block.timestamp > loan.nextRepaymentTime, "Payment not yet late");

        // Example penalty: increase repayment amount by 1%
        loan.repaymentAmount += (loan.repaymentAmount * 1 / 100);
        loan.nextRepaymentTime = block.timestamp + (loan.duration / 4); // Reset next repayment time
    }

    function distributeDividends() external onlyOwner {
        uint256 dividendPerMember = 0.0001 ether; // Example fixed dividend

        for (uint i = 0; i < registeredMembersArray.length; i++) {
            address memberAddress = registeredMembersArray[i];
            if (savings[memberAddress] > 0) {
                payable(memberAddress).transfer(dividendPerMember);
                emit DividendPaid(memberAddress, dividendPerMember);
            }
        }
    }

    function createProposal(string calldata description) external {
        require(votingPower[msg.sender] > 0, "No voting power");

        proposals[totalProposals] = Proposal({
            description: description,
            deadline: block.timestamp + votingDuration,
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            proposer: msg.sender
        });

        totalProposals++;
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];

        require(block.timestamp < proposal.deadline, "Voting has ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(votingPower[msg.sender] > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;

        if (support) {
            proposal.yesVotes += votingPower[msg.sender];
        } else {
            proposal.noVotes += votingPower[msg.sender];
        }
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];

        require(block.timestamp >= proposal.deadline, "Voting still active");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.yesVotes > proposal.noVotes, "Proposal did not pass");

        proposal.executed = true;

        // Logic for proposal execution
        // Example: transfer STT to proposer as a reward for successful vote pass
        payable(proposal.proposer).transfer(0.001 ether);
    }
}
