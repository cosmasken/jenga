/**
 * Fake ERC20 Tokens Tests
 * Tests for FakeUSDC, FakeUSDT, and FakeDAI contracts
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Fake ERC20 Tokens", function () {
  let fakeUSDC, fakeUSDT, fakeDAI;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy all fake tokens
    const FakeUSDC = await ethers.getContractFactory("FakeUSDC");
    fakeUSDC = await FakeUSDC.deploy();
    await fakeUSDC.waitForDeployment();

    const FakeUSDT = await ethers.getContractFactory("FakeUSDT");
    fakeUSDT = await FakeUSDT.deploy();
    await fakeUSDT.waitForDeployment();

    const FakeDAI = await ethers.getContractFactory("FakeDAI");
    fakeDAI = await FakeDAI.deploy();
    await fakeDAI.waitForDeployment();
  });

  describe("FakeUSDC", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await fakeUSDC.name()).to.equal("Fake USD Coin");
      expect(await fakeUSDC.symbol()).to.equal("fUSDC");
      expect(await fakeUSDC.decimals()).to.equal(6);
      expect(await fakeUSDC.totalSupply()).to.equal(1_000_000 * 10**6);
      expect(await fakeUSDC.balanceOf(owner.address)).to.equal(1_000_000 * 10**6);
    });

    it("Should allow faucet claims", async function () {
      const initialBalance = await fakeUSDC.balanceOf(addr1.address);
      expect(initialBalance).to.equal(0);

      await fakeUSDC.connect(addr1).faucet();
      
      const newBalance = await fakeUSDC.balanceOf(addr1.address);
      expect(newBalance).to.equal(1000 * 10**6);
    });

    it("Should enforce faucet cooldown", async function () {
      // First claim should work
      await fakeUSDC.connect(addr1).faucet();
      
      // Second claim should fail due to cooldown
      await expect(
        fakeUSDC.connect(addr1).faucet()
      ).to.be.revertedWith("Faucet cooldown not met");
    });

    it("Should check faucet claim status correctly", async function () {
      // Initially should be able to claim
      let [canClaim, timeUntil] = await fakeUSDC.canClaimFaucet(addr1.address);
      expect(canClaim).to.be.true;
      expect(timeUntil).to.equal(0);

      // After claiming, should not be able to claim
      await fakeUSDC.connect(addr1).faucet();
      [canClaim, timeUntil] = await fakeUSDC.canClaimFaucet(addr1.address);
      expect(canClaim).to.be.false;
      expect(timeUntil).to.be.greaterThan(0);
    });

    it("Should allow owner to mint tokens", async function () {
      const initialBalance = await fakeUSDC.balanceOf(addr1.address);
      
      await fakeUSDC.mint(addr1.address, 500); // 500 USDC
      
      const newBalance = await fakeUSDC.balanceOf(addr1.address);
      expect(newBalance).to.equal(initialBalance + BigInt(500 * 10**6));
    });

    it("Should allow burning tokens", async function () {
      // First get some tokens
      await fakeUSDC.connect(addr1).faucet();
      const initialBalance = await fakeUSDC.balanceOf(addr1.address);
      
      // Burn 100 tokens
      await fakeUSDC.connect(addr1).burn(100);
      
      const newBalance = await fakeUSDC.balanceOf(addr1.address);
      expect(newBalance).to.equal(initialBalance - BigInt(100 * 10**6));
    });
  });

  describe("FakeUSDT", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await fakeUSDT.name()).to.equal("Fake Tether USD");
      expect(await fakeUSDT.symbol()).to.equal("fUSDT");
      expect(await fakeUSDT.decimals()).to.equal(6);
      expect(await fakeUSDT.totalSupply()).to.equal(1_000_000 * 10**6);
      expect(await fakeUSDT.balanceOf(owner.address)).to.equal(1_000_000 * 10**6);
    });

    it("Should allow faucet claims", async function () {
      const initialBalance = await fakeUSDT.balanceOf(addr1.address);
      expect(initialBalance).to.equal(0);

      await fakeUSDT.connect(addr1).faucet();
      
      const newBalance = await fakeUSDT.balanceOf(addr1.address);
      expect(newBalance).to.equal(1000 * 10**6);
    });

    it("Should enforce faucet cooldown", async function () {
      await fakeUSDT.connect(addr1).faucet();
      
      await expect(
        fakeUSDT.connect(addr1).faucet()
      ).to.be.revertedWith("Faucet cooldown not met");
    });
  });

  describe("FakeDAI", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await fakeDAI.name()).to.equal("Fake Dai Stablecoin");
      expect(await fakeDAI.symbol()).to.equal("fDAI");
      expect(await fakeDAI.decimals()).to.equal(18);
      expect(await fakeDAI.totalSupply()).to.equal(ethers.parseEther("1000000"));
      expect(await fakeDAI.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
    });

    it("Should allow faucet claims", async function () {
      const initialBalance = await fakeDAI.balanceOf(addr1.address);
      expect(initialBalance).to.equal(0);

      await fakeDAI.connect(addr1).faucet();
      
      const newBalance = await fakeDAI.balanceOf(addr1.address);
      expect(newBalance).to.equal(ethers.parseEther("1000"));
    });

    it("Should enforce faucet cooldown", async function () {
      await fakeDAI.connect(addr1).faucet();
      
      await expect(
        fakeDAI.connect(addr1).faucet()
      ).to.be.revertedWith("Faucet cooldown not met");
    });

    it("Should allow burning tokens", async function () {
      // First get some tokens
      await fakeDAI.connect(addr1).faucet();
      const initialBalance = await fakeDAI.balanceOf(addr1.address);
      
      // Burn 100 tokens
      await fakeDAI.connect(addr1).burn(100);
      
      const newBalance = await fakeDAI.balanceOf(addr1.address);
      expect(newBalance).to.equal(initialBalance - ethers.parseEther("100"));
    });
  });

  describe("Cross-token functionality", function () {
    it("Should allow claiming from all token faucets", async function () {
      // Claim from all faucets
      await fakeUSDC.connect(addr1).faucet();
      await fakeUSDT.connect(addr1).faucet();
      await fakeDAI.connect(addr1).faucet();

      // Check balances
      expect(await fakeUSDC.balanceOf(addr1.address)).to.equal(1000 * 10**6);
      expect(await fakeUSDT.balanceOf(addr1.address)).to.equal(1000 * 10**6);
      expect(await fakeDAI.balanceOf(addr1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("Should have independent cooldowns", async function () {
      // Claim from USDC
      await fakeUSDC.connect(addr1).faucet();
      
      // Should still be able to claim from USDT and DAI
      await expect(fakeUSDT.connect(addr1).faucet()).to.not.be.reverted;
      await expect(fakeDAI.connect(addr1).faucet()).to.not.be.reverted;
      
      // But not from USDC again
      await expect(
        fakeUSDC.connect(addr1).faucet()
      ).to.be.revertedWith("Faucet cooldown not met");
    });

    it("Should allow different users to claim simultaneously", async function () {
      // Both users should be able to claim from all tokens
      await fakeUSDC.connect(addr1).faucet();
      await fakeUSDC.connect(addr2).faucet();
      
      expect(await fakeUSDC.balanceOf(addr1.address)).to.equal(1000 * 10**6);
      expect(await fakeUSDC.balanceOf(addr2.address)).to.equal(1000 * 10**6);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to mint", async function () {
      await expect(
        fakeUSDC.connect(addr1).mint(addr2.address, 1000)
      ).to.be.revertedWithCustomError(fakeUSDC, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to mint to any address", async function () {
      await fakeUSDC.mint(addr1.address, 1000);
      expect(await fakeUSDC.balanceOf(addr1.address)).to.equal(1000 * 10**6);
    });
  });
});
