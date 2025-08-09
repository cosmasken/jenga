/**
 * Basic ROSCA Contract Tests
 * Tests core functionality of the ROSCA smart contract
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ROSCA Contract", function () {
  let rosca;
  let owner;
  let addr1;
  let addr2;
  let addr3;

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy ROSCA contract
    const ROSCA = await ethers.getContractFactory("ROSCA");
    rosca = await ROSCA.deploy();
    await rosca.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await rosca.getAddress()).to.be.properAddress;
    });

    it("Should initialize with zero groups", async function () {
      expect(await rosca.groupCount()).to.equal(0);
    });

    it("Should initialize with zero disputes", async function () {
      expect(await rosca.disputeCount()).to.equal(0);
    });
  });

  describe("Group Creation", function () {
    it("Should create a group successfully", async function () {
      const contribution = ethers.parseEther("0.1");
      const roundLength = 30 * 24 * 60 * 60; // 30 days
      const maxMembers = 5;

      await expect(
        rosca.createGroup(
          ethers.ZeroAddress, // Native token
          contribution,
          roundLength,
          maxMembers,
          { value: contribution }
        )
      ).to.emit(rosca, "Created");

      expect(await rosca.groupCount()).to.equal(1);
    });

    it("Should automatically add creator as first member", async function () {
      const contribution = ethers.parseEther("0.1");
      const roundLength = 30 * 24 * 60 * 60;
      const maxMembers = 5;

      await rosca.createGroup(
        ethers.ZeroAddress,
        contribution,
        roundLength,
        maxMembers,
        { value: contribution }
      );

      const groupDetails = await rosca.getGroupDetails(0);
      expect(groupDetails.creator).to.equal(owner.address);
      expect(groupDetails.memberCount).to.equal(1);
      expect(groupDetails.currentRound).to.equal(1);
    });

    it("Should reject invalid parameters", async function () {
      const contribution = ethers.parseEther("0.1");
      const roundLength = 30 * 24 * 60 * 60;

      // Zero contribution
      await expect(
        rosca.createGroup(ethers.ZeroAddress, 0, roundLength, 5, { value: 0 })
      ).to.be.revertedWith("Contribution must be > 0");

      // Zero round length
      await expect(
        rosca.createGroup(ethers.ZeroAddress, contribution, 0, 5, { value: contribution })
      ).to.be.revertedWith("Round length must be > 0");

      // Invalid max members (too few)
      await expect(
        rosca.createGroup(ethers.ZeroAddress, contribution, roundLength, 1, { value: contribution })
      ).to.be.revertedWith("Invalid max members");

      // Invalid max members (too many)
      await expect(
        rosca.createGroup(ethers.ZeroAddress, contribution, roundLength, 51, { value: contribution })
      ).to.be.revertedWith("Invalid max members");
    });

    it("Should require exact contribution amount for native token", async function () {
      const contribution = ethers.parseEther("0.1");
      const roundLength = 30 * 24 * 60 * 60;
      const maxMembers = 5;

      // Too little value
      await expect(
        rosca.createGroup(
          ethers.ZeroAddress,
          contribution,
          roundLength,
          maxMembers,
          { value: ethers.parseEther("0.05") }
        )
      ).to.be.revertedWith("Must send exact contribution amount");

      // Too much value
      await expect(
        rosca.createGroup(
          ethers.ZeroAddress,
          contribution,
          roundLength,
          maxMembers,
          { value: ethers.parseEther("0.2") }
        )
      ).to.be.revertedWith("Must send exact contribution amount");
    });
  });

  describe("Group Joining", function () {
    beforeEach(async function () {
      // Create a group first
      const contribution = ethers.parseEther("0.1");
      const roundLength = 30 * 24 * 60 * 60;
      const maxMembers = 5;

      await rosca.createGroup(
        ethers.ZeroAddress,
        contribution,
        roundLength,
        maxMembers,
        { value: contribution }
      );
    });

    it("Should allow joining a group", async function () {
      const contribution = ethers.parseEther("0.1");

      await expect(
        rosca.connect(addr1).joinGroup(0, { value: contribution })
      ).to.emit(rosca, "Joined");

      const groupDetails = await rosca.getGroupDetails(0);
      expect(groupDetails.memberCount).to.equal(2);
    });

    it("Should reject joining non-existent group", async function () {
      const contribution = ethers.parseEther("0.1");

      await expect(
        rosca.connect(addr1).joinGroup(999, { value: contribution })
      ).to.be.revertedWith("Group does not exist");
    });

    it("Should reject duplicate membership", async function () {
      const contribution = ethers.parseEther("0.1");

      // Join once
      await rosca.connect(addr1).joinGroup(0, { value: contribution });

      // Try to join again
      await expect(
        rosca.connect(addr1).joinGroup(0, { value: contribution })
      ).to.be.revertedWith("Already a member");
    });

    it("Should reject joining when group is full", async function () {
      const contribution = ethers.parseEther("0.1");

      // Fill the group (max 5 members, creator is already 1)
      await rosca.connect(addr1).joinGroup(0, { value: contribution });
      await rosca.connect(addr2).joinGroup(0, { value: contribution });
      await rosca.connect(addr3).joinGroup(0, { value: contribution });

      // Get another signer for the 5th member
      const [, , , , addr4] = await ethers.getSigners();
      await rosca.connect(addr4).joinGroup(0, { value: contribution });

      // Now try to join with 6th member
      const [, , , , , addr5] = await ethers.getSigners();
      await expect(
        rosca.connect(addr5).joinGroup(0, { value: contribution })
      ).to.be.revertedWith("Group is full");
    });
  });

  describe("Group Management", function () {
    beforeEach(async function () {
      // Create a group and add a member
      const contribution = ethers.parseEther("0.1");
      const roundLength = 30 * 24 * 60 * 60;
      const maxMembers = 5;

      await rosca.createGroup(
        ethers.ZeroAddress,
        contribution,
        roundLength,
        maxMembers,
        { value: contribution }
      );

      await rosca.connect(addr1).joinGroup(0, { value: contribution });
    });

    it("Should allow creator to set group status", async function () {
      await expect(rosca.setGroupStatus(0, false))
        .to.emit(rosca, "GroupStatusChanged")
        .withArgs(0, false);

      const groupDetails = await rosca.getGroupDetails(0);
      expect(groupDetails.isActive).to.be.false;
    });

    it("Should reject non-creator setting group status", async function () {
      await expect(
        rosca.connect(addr1).setGroupStatus(0, false)
      ).to.be.revertedWith("Not the group creator");
    });

    it("Should allow creator to kick members", async function () {
      await expect(rosca.kickMember(0, addr1.address))
        .to.emit(rosca, "Leave")
        .withArgs(0, addr1.address);

      const groupDetails = await rosca.getGroupDetails(0);
      expect(groupDetails.memberCount).to.equal(1); // Only creator left
    });

    it("Should reject non-creator kicking members", async function () {
      await expect(
        rosca.connect(addr1).kickMember(0, owner.address)
      ).to.be.revertedWith("Not the group creator");
    });

    it("Should reject creator kicking themselves", async function () {
      await expect(
        rosca.kickMember(0, owner.address)
      ).to.be.revertedWith("Cannot kick yourself");
    });
  });
});
