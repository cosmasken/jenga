const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Hash-Based ROSCA contracts...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Deploy HashROSCAFactory
  const HashROSCAFactory = await ethers.getContractFactory("HashROSCAFactory");
  const factory = await HashROSCAFactory.deploy();
  await factory.waitForDeployment();
  
  const factoryAddress = await factory.getAddress();
  console.log("✅ HashROSCAFactory deployed to:", factoryAddress);
  
  // Deploy MockUSDC (for testing)
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  
  const usdcAddress = await usdc.getAddress();
  console.log("✅ MockUSDC deployed to:", usdcAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: "citrea-testnet",
    timestamp: new Date().toISOString(),
    contracts: {
      HashROSCAFactory: factoryAddress,
      MockUSDC: usdcAddress
    }
  };
  
  console.log("\n📋 Deployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n🔧 Update your .env file:");
  console.log(`VITE_HASH_ROSCA_FACTORY_ADDRESS=${factoryAddress}`);
  console.log(`VITE_USDC_ADDRESS=${usdcAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
