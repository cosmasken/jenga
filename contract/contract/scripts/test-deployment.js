const { ethers } = require("hardhat");

async function main() {
  console.log("Testing deployed contracts...");

  const [deployer, user1, user2, user3] = await ethers.getSigners();
  
  // Load deployment addresses (adjust path if needed)
  const deploymentFile = `./deployments/${hre.network.name}.json`;
  let deploymentData;
  
  try {
    deploymentData = require(deploymentFile);
  } catch (error) {
    console.error("Deployment file not found. Please run deployment first.");
    process.exit(1);
  }

  const { mockUSDC, roscaFactory } = deploymentData.contracts;

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
  const tokenAddress = await roscaContract.contributionToken();
  const contribution = await roscaContract.contributionAmount();
  const duration = await roscaContract.roundDuration();
  const maxMems = await roscaContract.maxMembers();
  
  console.log(`Token: ${tokenAddress}`);
  console.log(`Contribution: ${ethers.utils.formatUnits(contribution, 6)} USDC`);
  console.log(`Round Duration: ${duration} seconds`);
  console.log(`Max Members: ${maxMems}`);

  // Test joining ROSCA
  console.log("\n=== Testing ROSCA Membership ===");
  
  // Approve tokens for the ROSCA contract
  await mockUSDCContract.connect(user1).approve(roscaAddress, contributionAmount);
  await mockUSDCContract.connect(user2).approve(roscaAddress, contributionAmount);
  await mockUSDCContract.connect(user3).approve(roscaAddress, contributionAmount);
  
  // Join ROSCA (user1 is already a member as creator)
  await roscaContract.connect(user2).joinROSCA();
  await roscaContract.connect(user3).joinROSCA();
  
  console.log("All users joined ROSCA successfully");

  const memberCount = await roscaContract.memberCount();
  console.log("Total members:", memberCount.toString());

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
