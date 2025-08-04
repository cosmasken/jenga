// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    Mini-ROSCA – dev-test edition
    • ETH or ERC-20
    • One payout per member → rounds == members.length
    • Join / leave only between rounds
    • Admin can schedule round-length change with 12 h delay
    • Members can rage-quit during delay window
*/

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MiniROSCA is ReentrancyGuard {
    using SafeERC20 for IERC20;
    uint256 constant ROUND_DELAY = 12 hours;
    uint256 constant MAX_MEMBERS = 50;

    /* ---------------------------------------------------------- */
    struct Group {
        uint40  id;               // slot 0
        uint40  roundLength;      // seconds
        uint40  nextDue;          // timestamp
        address token;            // address(0) == ETH
        uint96  contribution;     // wei / token units
        uint8   currentRound;     // 1..members.length
        address[] members;        // slot 1
        mapping(address => bool) isMember;
        mapping(address => bool) hasPaid;
        mapping(address => bool) hasBeenPaid;
        uint40  newRoundLength;   // slot 2
        uint40  changeActivates;  // 0 = nothing pending
    }

    uint256 public groupCount;
    mapping(uint256 => Group) public groups;

    /* ---------------------------------------------------------- */
    event Created (uint256 indexed id, address indexed token, uint256 contribution, uint256 roundLength);
    event Contrib (uint256 indexed id, address indexed member, uint256 amount);
    event Payout  (uint256 indexed id, address indexed recipient, uint256 amount);
    event Leave   (uint256 indexed id, address indexed member);
    event RoundLenChangeScheduled(uint256 indexed id, uint256 newLength, uint256 activates);

    /* ---------------------------------------------------------- */
    modifier memberOf(uint256 gid) {
        require(groups[gid].isMember[msg.sender], "!member");
        _;
    }

    /* ---------------------------------------------------------- */
    function createGroup(
        address _token,
        uint96  _contribution,
        uint40  _roundLength
    ) external returns (uint256 gid) {
        require(_contribution > 0 && _roundLength > 0, "bad params");

        gid = ++groupCount;
        Group storage g = groups[gid];
        g.id         = uint40(gid);
        g.token      = _token;
        g.contribution = _contribution;
        g.roundLength  = _roundLength;
        g.nextDue      = uint40(block.timestamp + _roundLength);

        g.members.push(msg.sender);
        g.isMember[msg.sender] = true;

        emit Created(gid, _token, _contribution, _roundLength);
    }

    /* ---------------------------------------------------------- */
    function contribute(uint256 gid) external payable memberOf(gid) {
        Group storage g = groups[gid];
        require(!g.hasPaid[msg.sender], "paid");
        require(block.timestamp <= g.nextDue, "late");

        uint256 amt = g.contribution;
        if (g.token == address(0)) {
            require(msg.value == amt, "bad eth");
        } else {
            IERC20(g.token).safeTransferFrom(msg.sender, address(this), amt);
        }

        g.hasPaid[msg.sender] = true;
        emit Contrib(gid, msg.sender, amt);

        if (_allPaid(gid)) _nextRound(gid);
    }

    /* ---------------------------------------------------------- */
    function leaveGroup(uint256 gid) external memberOf(gid) {
        Group storage g = groups[gid];
        require(g.hasBeenPaid[msg.sender], "not paid");
        require(block.timestamp > g.nextDue, "round active");
        _removeMember(gid, msg.sender);
        emit Leave(gid, msg.sender);
    }

    /* ---------------------------------------------------------- */
    function scheduleRoundLength(uint256 gid, uint40 newLen) external {
        require(msg.sender == groups[gid].members[0], "!creator");
        Group storage g = groups[gid];
        g.newRoundLength  = newLen;
        g.changeActivates = uint40(block.timestamp + ROUND_DELAY);
        emit RoundLenChangeScheduled(gid, newLen, g.changeActivates);
    }

    function rageQuit(uint256 gid) external memberOf(gid) {
        Group storage g = groups[gid];
        require(g.changeActivates != 0 && block.timestamp < g.changeActivates, "!window");
        _removeMember(gid, msg.sender);
        emit Leave(gid, msg.sender);
    }

    /* ---------------------------------------------------------- */
    function _allPaid(uint256 gid) internal view returns (bool) {
        Group storage g = groups[gid];
        for (uint i = 0; i < g.members.length; i++) {
            if (!g.hasPaid[g.members[i]]) return false;
        }
        return true;
    }

    function _nextRound(uint256 gid) internal {
        Group storage g = groups[gid];
        uint256 payoutAmount = uint256(g.contribution) * g.members.length;
        address recipient = g.members[g.currentRound - 1];
        g.hasBeenPaid[recipient] = true;

        if (g.token == address(0)) {
            (bool ok,) = recipient.call{value: payoutAmount}("");
            require(ok);
        } else {
            IERC20(g.token).safeTransfer(recipient, payoutAmount);
        }
        emit Payout(gid, recipient, payoutAmount);

        g.currentRound++;
        if (g.currentRound > g.members.length) {
            /* finished */
        } else {
            if (g.changeActivates != 0 && block.timestamp >= g.changeActivates) {
                g.roundLength = g.newRoundLength;
                g.changeActivates = 0;
            }
            g.nextDue = uint40(block.timestamp + g.roundLength);
            for (uint i = 0; i < g.members.length; i++) {
                g.hasPaid[g.members[i]] = false;
            }
        }
    }

    /* unordered remove, gas O(M) with M <= 50 */
    function _removeMember(uint256 gid, address member) internal {
        Group storage g = groups[gid];
        uint256 len = g.members.length;
        for (uint i = 0; i < len; i++) {
            if (g.members[i] == member) {
                g.members[i] = g.members[len - 1];
                g.members.pop();
                g.isMember[member] = false;
                return;
            }
        }
    }

    /* ---------------------------------------------------------- */
    receive() external payable {}
}