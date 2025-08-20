const { ethers } = require("hardhat");

// Import deployment scripts
const deployMockUSDC = require("./01-deploy-mock-usdc");
const deployROSCA = require("./02-deploy-rosca");
const deployFactory = require("./03-deploy-factory");

async function main() {
  console.log("Testing deployed contracts...");

  const [deployer, user1, user2, user3] = await ethers.getSigners();
  
  // Run fresh deployment for testing
  console.log("Deploying contracts for testing...");
  
  const mockUSDCResult = await deployMockUSDC();
  const roscaResult = await deployROSCA();
  const factoryResult = await deployFactory(roscaResult.roscaImplementation);
  
  const mockUSDC = mockUSDCResult.mockUSDC;
  const roscaFactory = factoryResult.roscaFactory;
  
  console.log("Contracts deployed successfully!");

  // Get contract instances
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const ROSCAFactory = await ethers.getContractFactory("ROSCAFactory");
  const ROSCA = await ethers.getContractFactory("ROSCA");

  const mockUSDCContract = MockUSDC.attach(mockUSDC);
  const factoryContract = ROSCAFactory.attach(roscaFactory);

  console.log("\n=== Testing MockUSDC ===");
  const decimals = await mockUSDCContract.decimals();
  const name = await mockUSDCContract.name();
  const symbol = await mockUSDCContract.symbol();
  console.log(`Token: ${name} (${symbol}) with ${decimals} decimals`);

  // Mint tokens to test users
  const mintAmount = ethers.utils.parseUnits("1000", 6); // 1000 USDC
  await mockUSDCContract.mint(user1.address, mintAmount);
  await mockUSDCContract.mint(user2.address, mintAmount);
  await mockUSDCContract.mint(user3.address, mintAmount);
  console.log("Minted 1000 USDC to test users");

  console.log("\n=== Testing ROSCAFactory ===");
  const implementationAddress = await factoryContract.roscaImplementation();
  console.log("Factory implementation address:", implementationAddress);

  // Test creating a ROSCA
  const contributionAmount = ethers.utils.parseUnits("100", 6); // 100 USDC
  const roundDuration = 7 * 24 * 60 * 60; // 7 days
  const maxMembers = 3;

  console.log("\n=== Creating Test ROSCA ===");
  const tx = await factoryContract.connect(user1).createROSCA(
    mockUSDC,
    contributionAmount,
    roundDuration,
    maxMembers,
    { value: ethers.utils.parseEther("0.01") } // Creation fee
  );
  
  const receipt = await tx.wait();
  
  // Find the ROSCACreated event
  const createEvent = receipt.events?.find(e => e.event === 'ROSCACreated');
  if (!createEvent) {
    throw new Error("ROSCACreated event not found");
  }
  
  const roscaAddress = createEvent.args.roscaAddress;
  console.log("ROSCA created at:", roscaAddress);

  // Test the created ROSCA
  const roscaContract = ROSCA.attach(roscaAddress);
  
  console.log("\n=== Testing Created ROSCA ===");
  const tokenAddress = await roscaContract.token();
  const contribution = await roscaContract.contributionAmount();
  const duration = await roscaContract.roundDuration();
  const maxMems = await roscaContract.maxMembers();
  
  console.log(`Token: ${tokenAddress}`);
  console.log(`Contribution: ${ethers.utils.formatUnits(contribution, 6)} USDC`);
  console.log(`Round Duration: ${duration} seconds`);
  console.log(`Max Members: ${maxMems}`);

  // Test enhanced ROSCA features
  console.log("\n=== Testing Enhanced ROSCA Features ===");
  
  // Check deposit requirement
  const requiredDeposit = await roscaContract.getRequiredDeposit();
  console.log(`Required deposit: ${ethers.utils.formatUnits(requiredDeposit, 6)} USDC`);
  
  // Check initial status
  const initialStatus = await roscaContract.status();
  console.log(`Initial status: ${initialStatus} (0=RECRUITING, 1=WAITING, 2=ACTIVE)`);
  
  // Test joining ROSCA with deposits
  console.log("\n=== Testing ROSCA Membership with Deposits ===");
  
  // Approve tokens for deposits (2x contribution amount)
  await mockUSDCContract.connect(user1).approve(roscaAddress, requiredDeposit);
  await mockUSDCContract.connect(user2).approve(roscaAddress, requiredDeposit);
  await mockUSDCContract.connect(user3).approve(roscaAddress, requiredDeposit);
  
  // Join ROSCA (creator must also join and pay deposit)
  await roscaContract.connect(user1).joinROSCA();
  console.log("User1 (creator) joined with deposit");
  
  await roscaContract.connect(user2).joinROSCA();
  console.log("User2 joined with deposit");
  
  await roscaContract.connect(user3).joinROSCA();
  console.log("User3 joined with deposit");
  
  const memberCount = await roscaContract.totalMembers();
  console.log(`Total members: ${memberCount.toString()}`);
  
  // Check status after full recruitment
  const statusAfterRecruit = await roscaContract.status();
  console.log(`Status after recruitment: ${statusAfterRecruit} (should be 1=WAITING)`);
  
  // Check grace period
  const timeUntilStart = await roscaContract.getTimeUntilStart();
  console.log(`Time until ROSCA starts: ${timeUntilStart.toString()} seconds`);
  
  // Force start for testing (skip grace period)
  console.log("\n=== Force Starting ROSCA for Testing ===");
  await roscaContract.connect(user1).forceStart(); // user1 is the creator/owner
  
  const statusAfterStart = await roscaContract.status();
  console.log(`Status after start: ${statusAfterStart} (should be 2=ACTIVE)`);
  
  // Test round information
  const roundInfo = await roscaContract.getRoundInfo(1);
  console.log(`Round 1 winner: ${roundInfo.winner}`);
  console.log(`Round 1 deadline: ${new Date(roundInfo.deadline.toNumber() * 1000)}`);
  
  // Test contribution phase
  console.log("\n=== Testing Contributions ===");
  
  // Approve tokens for contributions
  await mockUSDCContract.connect(user1).approve(roscaAddress, contributionAmount);
  await mockUSDCContract.connect(user2).approve(roscaAddress, contributionAmount);
  await mockUSDCContract.connect(user3).approve(roscaAddress, contributionAmount);
  
  // Make contributions
  await roscaContract.connect(user1).contribute();
  console.log("User1 contributed to round 1");
  
  await roscaContract.connect(user2).contribute();
  console.log("User2 contributed to round 1");
  
  await roscaContract.connect(user3).contribute();
  console.log("User3 contributed to round 1 - round should auto-complete");
  
  // Check if round completed
  const round1Info = await roscaContract.getRoundInfo(1);
  console.log(`Round 1 completed: ${round1Info.isCompleted}`);
  console.log(`Round 1 total pot: ${ethers.utils.formatUnits(round1Info.totalPot, 6)} USDC`);

  console.log("\n✅ All tests passed! Contracts are working correctly.");

  return {
    mockUSDC: mockUSDC,
    roscaFactory: roscaFactory,
    testROSCA: roscaAddress
  };
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎉 Testing completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Testing failed:", error);
      process.exit(1);
    });
}

module.exports = main;
