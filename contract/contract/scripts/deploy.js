const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

// Import individual deployment scripts
const deployMockUSDC = require("./01-deploy-mock-usdc");
const deployROSCA = require("./02-deploy-rosca");
const deployFactory = require("./03-deploy-factory");

async function main() {
  console.log("Starting full deployment process...");
  console.log("Network:", hre.network.name);
  
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("Deployer balance:", ethers.utils.formatEther(await deployer.getBalance()));

  const deploymentResults = {};

  try {
    // Step 1: Deploy MockUSDC
    console.log("\n=== Step 1: Deploying MockUSDC ===");
    const mockUSDCResult = await deployMockUSDC();
    deploymentResults.mockUSDC = mockUSDCResult.mockUSDC;
    console.log("✅ MockUSDC deployed successfully");

    // Step 2: Deploy ROSCA Implementation
    console.log("\n=== Step 2: Deploying ROSCA Implementation ===");
    const roscaResult = await deployROSCA();
    deploymentResults.roscaImplementation = roscaResult.roscaImplementation;
    console.log("✅ ROSCA implementation deployed successfully");

    // Step 3: Deploy ROSCAFactory
    console.log("\n=== Step 3: Deploying ROSCAFactory ===");
    const factoryResult = await deployFactory(deploymentResults.roscaImplementation);
    deploymentResults.roscaFactory = factoryResult.roscaFactory;
    console.log("✅ ROSCAFactory deployed successfully");

    // Step 4: Save deployment addresses
    console.log("\n=== Step 4: Saving deployment results ===");
    const deploymentData = {
      network: hre.network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deploymentResults
    };

    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    
    console.log(`Deployment data saved to: ${deploymentFile}`);

    // Step 5: Display summary
    console.log("\n=== Deployment Summary ===");
    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`MockUSDC: ${deploymentResults.mockUSDC}`);
    console.log(`ROSCA Implementation: ${deploymentResults.roscaImplementation}`);
    console.log(`ROSCAFactory: ${deploymentResults.roscaFactory}`);

    // Step 6: Optional verification steps
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\n=== Next Steps ===");
      console.log("1. Verify contracts on block explorer (if supported):");
      console.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentResults.mockUSDC}`);
      console.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentResults.roscaImplementation}`);
      console.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentResults.roscaFactory} ${deploymentResults.roscaImplementation}`);
      console.log("\n2. Update frontend configuration with new addresses");
      console.log("\n3. Test the deployment by creating a ROSCA through the factory");
    }

    return deploymentResults;

  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎉 Deployment completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;
