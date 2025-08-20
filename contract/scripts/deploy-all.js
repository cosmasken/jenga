const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Unified deployment script for all contracts
 * Deploys: MockUSDC, ROSCA Implementation, ROSCAFactory, and MicroSacco
 */
async function main() {
  console.log("🚀 Starting unified deployment process...");
  console.log(`📡 Network: ${hre.network.name}`);
  
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer address: ${deployer.address}`);
  
  // Check balance (use ethers v5 compatible method)
  const balance = await deployer.getBalance();
  console.log(`💰 Account balance: ${hre.ethers.utils.formatEther(balance)} ETH`);
  
  const deploymentResults = {};
  const startTime = Date.now();

  try {
    // =============================================================================
    // STEP 1: Deploy MockUSDC
    // =============================================================================
    console.log("\n🪙 Step 1: Deploying MockUSDC...");
    
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const initialSupply = hre.ethers.utils.parseUnits("1000000", 6); // 1M USDC (6 decimals)
    const mockUSDC = await MockUSDC.deploy(initialSupply);
    await mockUSDC.deployed();
    
    const mockUSDCAddress = mockUSDC.address;
    deploymentResults.mockUSDC = mockUSDCAddress;
    console.log(`✅ MockUSDC deployed to: ${mockUSDCAddress}`);
    
    // Mint some tokens to the deployer for testing
    const mintAmount = hre.ethers.utils.parseUnits("50000", 6); // 50,000 USDC for testing
    await mockUSDC.mint(deployer.address, mintAmount);
    console.log(`   💵 Minted ${hre.ethers.utils.formatUnits(mintAmount, 6)} USDC to deployer`);

    // =============================================================================
    // STEP 2: Deploy ROSCAFactory (no implementation needed - creates contracts directly)
    // =============================================================================
    console.log("\n🏭 Step 2: Deploying ROSCAFactory...");
    
    const ROSCAFactory = await hre.ethers.getContractFactory("ROSCAFactory");
    const roscaFactory = await ROSCAFactory.deploy();
    await roscaFactory.deployed();
    
    const roscaFactoryAddress = roscaFactory.address;
    deploymentResults.roscaFactory = roscaFactoryAddress;
    console.log(`✅ ROSCAFactory deployed to: ${roscaFactoryAddress}`);
    
    // Verify the factory is properly set up
    const factoryStats = await roscaFactory.getFactoryStats();
    console.log(`   📊 Factory stats - Total created: ${factoryStats[0]}, Active: ${factoryStats[1]}, Creation fee: ${hre.ethers.utils.formatEther(factoryStats[2])} ETH`);

    // =============================================================================
    // STEP 4: Deploy MicroSacco
    // =============================================================================
    console.log("\n🏦 Step 4: Deploying MicroSacco...");
    
    // For now, use MockUSDC as both USDC and governance token
    const govTokenAddress = mockUSDCAddress; // Placeholder - use USDC as gov token for demo
    
    const MicroSacco = await hre.ethers.getContractFactory("MicroSacco");
    console.log(`   🔧 Deploying with governance token: ${govTokenAddress}`);
    console.log(`   🔧 Deploying with USDC token: ${mockUSDCAddress}`);
    
    const microSacco = await MicroSacco.deploy(govTokenAddress, mockUSDCAddress);
    await microSacco.deployed();
    
    const microSaccoAddress = microSacco.address;
    deploymentResults.microSacco = microSaccoAddress;
    console.log(`✅ MicroSacco deployed to: ${microSaccoAddress}`);
    
    // Verify MicroSacco deployment
    const deployedGovToken = await microSacco.govToken();
    const deployedUSDC = await microSacco.usdc();
    const joinFee = await microSacco.JOIN_FEE();
    const maxLTV = await microSacco.MAX_LTV_BPS();
    
    console.log(`   ✓ Gov Token: ${deployedGovToken}`);
    console.log(`   ✓ USDC: ${deployedUSDC}`);
    console.log(`   ✓ Join Fee: ${hre.ethers.utils.formatEther(joinFee)} ETH`);
    console.log(`   ✓ Max LTV: ${maxLTV.toString()} bps (${Number(maxLTV) / 100}%)`);

    // =============================================================================
    // STEP 5: Save deployment data
    // =============================================================================
    console.log("\n💾 Step 5: Saving deployment results...");
    
    const deploymentData = {
      network: hre.network.name,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      deploymentTime: `${((Date.now() - startTime) / 1000).toFixed(2)}s`,
      contracts: deploymentResults,
      verification: {
        mockUSDC: mockUSDCAddress,
        roscaFactory: roscaFactoryAddress,
        microSacco: microSaccoAddress
      }
    };

    // Ensure deployments directory exists
    const deploymentsDir = path.join(__dirname, "..", "deployments");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment file
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
    console.log(`📄 Deployment data saved to: ${deploymentFile}`);

    // =============================================================================
    // STEP 6: Display summary
    // =============================================================================
    console.log("\n🎉 DEPLOYMENT SUMMARY");
    console.log("========================");
    console.log(`Network: ${hre.network.name}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Deployment time: ${deploymentData.deploymentTime}`);
    console.log("\n📋 Contract Addresses:");
    console.log(`MockUSDC:           ${deploymentResults.mockUSDC}`);
    console.log(`ROSCAFactory:       ${deploymentResults.roscaFactory}`);
    console.log(`MicroSacco:         ${deploymentResults.microSacco}`);

    // =============================================================================
    // STEP 7: Next steps information
    // =============================================================================
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\n🔧 NEXT STEPS");
      console.log("==============");
      console.log("1. Verify contracts on block explorer:");
      console.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentResults.mockUSDC} ${initialSupply}`);
      console.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentResults.roscaFactory}`);
      console.log(`   npx hardhat verify --network ${hre.network.name} ${deploymentResults.microSacco} ${govTokenAddress} ${mockUSDCAddress}`);
      
      console.log("\n2. Update frontend environment variables:");
      console.log(`   VITE_ROSCA_FACTORY_ADDRESS=${deploymentResults.roscaFactory}`);
      console.log(`   VITE_MICRO_SACCO_ADDRESS=${deploymentResults.microSacco}`);
      console.log(`   VITE_USDC_ADDRESS=${deploymentResults.mockUSDC}`);
      
      console.log("\n3. Test the deployment:");
      console.log(`   npm run test-deployment`);
    }

    return deploymentResults;

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED");
    console.error("===================");
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(`Stack trace: ${error.stack}`);
    }
    throw error;
  }
}

// Export for use in other scripts
module.exports = main;

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log("\n🎊 ALL DEPLOYMENTS COMPLETED SUCCESSFULLY! 🎊");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 DEPLOYMENT PROCESS FAILED 💥");
      console.error(error);
      process.exit(1);
    });
}
