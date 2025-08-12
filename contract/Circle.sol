// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ChamaCircle {
    using SafeERC20 for IERC20;

    /* -----------------------------------------------------------
                               CONSTANTS
    ----------------------------------------------------------- */
    IERC20  public token;               // address(0) = native
    uint256 public contribution;
    uint256 public securityDeposit;
    uint256 public roundDuration;
    uint256 public lateWindow;
    uint256 public latePenalty;
    uint256 public memberTarget;

    /* -----------------------------------------------------------
                               STATE
    ----------------------------------------------------------- */
    address public factory;
    address[] public members;
    mapping(address => bool) public isMember;
    mapping(address => uint256) public deposits;

    uint256 public currentRound = 1;
    uint256 public roundDeadline;       // when contribution window closes
    mapping(uint256 => address) public roundWinner; // deterministic queue
    mapping(uint256 => mapping(address => bool)) public contributed;

    /* -----------------------------------------------------------
                               EVENTS
    ----------------------------------------------------------- */
    event MemberJoined(address indexed member);
    event ContributionMade(address indexed member, uint256 round, uint256 amount);
    event RoundPayout(address indexed winner, uint256 round, uint256 pot);
    event RoundStarted(uint256 indexed round, uint256 deadline);
    event MemberLeft(address indexed member, uint256 returnedDeposit);

    /* -----------------------------------------------------------
                            INITIALISER
    ----------------------------------------------------------- */
    function initialize(
        address creator,
        IERC20 _token,
        uint256 _contribution,
        uint256 _securityDeposit,
        uint256 _roundDuration,
        uint256 _lateWindow,
        uint256 _latePenalty,
        uint256 _memberTarget
    ) external payable {
        require(factory == address(0), "Already init");
        factory = msg.sender;

        token           = _token;
        contribution    = _contribution;
        securityDeposit = _securityDeposit;
        roundDuration   = _roundDuration;
        lateWindow      = _lateWindow;
        latePenalty     = _latePenalty;
        memberTarget    = _memberTarget;

        // creator auto-joins
        _join(creator, msg.value);
        roundDeadline = block.timestamp + roundDuration;
        emit RoundStarted(1, roundDeadline);
    }

    /* -----------------------------------------------------------
                        JOIN (by code/ID is off-chain)
    ----------------------------------------------------------- */
    function join() external payable {
        require(!isMember[msg.sender], "Already member");
        require(members.length < memberTarget, "Full");
        _join(msg.sender, msg.value);
    }

    function _join(address who, uint256 value) private {
        isMember[who] = true;
        members.push(who);
        if (address(token) == address(0)) {
            require(value == securityDeposit, "Bad native deposit");
            deposits[who] = value;
        } else {
            token.safeTransferFrom(who, address(this), securityDeposit);
            deposits[who] = securityDeposit;
        }
        emit MemberJoined(who);
    }

    /* -----------------------------------------------------------
                        CONTRIBUTE
    ----------------------------------------------------------- */
    function contribute() external payable {
        require(isMember[msg.sender], "Not member");
        require(!contributed[currentRound][msg.sender], "Already contributed");

        uint256 amount = contribution;
        if (block.timestamp > roundDeadline) {
            require(block.timestamp <= roundDeadline + lateWindow, "Too late");
            amount += latePenalty;
        }

        if (address(token) == address(0)) {
            require(msg.value == amount, "Bad native amount");
        } else {
            token.safeTransferFrom(msg.sender, address(this), amount);
        }

        contributed[currentRound][msg.sender] = true;
        emit ContributionMade(msg.sender, currentRound, amount);

        // auto-payout when last member contributes
        if (_allContributed()) _payout();
    }

    /* -----------------------------------------------------------
                        AUTO-PAYOUT & NEXT ROUND
    ----------------------------------------------------------- */
    function _payout() private {
        address winner = members[(currentRound - 1) % members.length];
        uint256 pot = contribution * members.length;

        if (address(token) == address(0)) {
            (bool ok,) = winner.call{value: pot}("");
            require(ok, "Native payout failed");
        } else {
            token.safeTransfer(winner, pot);
        }

        emit RoundPayout(winner, currentRound, pot);

        // next round
        currentRound += 1;
        delete roundDeadline;
        roundDeadline = block.timestamp + roundDuration;
        emit RoundStarted(currentRound, roundDeadline);
    }

    /* -----------------------------------------------------------
                        LEAVE AFTER ALL ROUNDS
    ----------------------------------------------------------- */
    function leave() external {
        require(currentRound > memberTarget, "Circle not finished");
        require(isMember[msg.sender], "Not member");

        isMember[msg.sender] = false;
        uint256 amt = deposits[msg.sender];
        deposits[msg.sender] = 0;

        if (address(token) == address(0)) {
            (bool ok,) = msg.sender.call{value: amt}("");
            require(ok, "Native refund failed");
        } else {
            token.safeTransfer(msg.sender, amt);
        }
        emit MemberLeft(msg.sender, amt);
    }

    /* -----------------------------------------------------------
                        VIEW HELPERS (for UI)
    ----------------------------------------------------------- */
    function allContributed() external view returns (bool) {
        return _allContributed();
    }

    function _allContributed() private view returns (bool) {
        for (uint256 i = 0; i < members.length; ++i)
            if (!contributed[currentRound][members[i]]) return false;
        return true;
    }

    function memberCount() external view returns (uint256) {
        return members.length;
    }

    receive() external payable {}
}