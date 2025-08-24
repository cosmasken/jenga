const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Enhanced deployment script with nonce management and automatic frontend updates
 * Features:
 * - Automatic nonce management to prevent transaction conflicts
 * - Automatic frontend config updates
 * - Automatic .env file updates
 * - Retry logic for failed transactions
 * - Comprehensive error handling
 */

class DeploymentManager {
  constructor() {
    this.deployer = null;
    this.currentNonce = null;
    this.deploymentResults = {};
    this.startTime = Date.now();
    this.frontendConfigPath = path.join(__dirname, "../../src/config/index.ts");
    this.frontendEnvPath = path.join(__dirname, "../../.env");
  }

  async initialize() {
    console.log("🚀 Starting enhanced deployment process...");
    console.log(`📡 Network: ${hre.network.name}`);
    
    [this.deployer] = await hre.ethers.getSigners();
    console.log(`👤 Deployer address: ${this.deployer.address}`);
    
    // Get current nonce and balance
    this.currentNonce = await this.deployer.getTransactionCount();
    const balance = await this.deployer.getBalance();
    
    console.log(`💰 Account balance: ${hre.ethers.utils.formatEther(balance)} cBTC`);
    console.log(`🔢 Starting nonce: ${this.currentNonce}`);
    
    if (balance.lt(hre.ethers.utils.parseEther("0.01"))) {
      throw new Error("Insufficient balance for deployment. Need at least 0.01 cBTC for gas fees.");
    }
  }

  async deployContract(contractName, constructorArgs = [], options = {}) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`\n📦 Deploying ${contractName} (attempt ${attempt + 1}/${maxRetries})...`);
        console.log(`   🔢 Using nonce: ${this.currentNonce}`);
        
        const ContractFactory = await hre.ethers.getContractFactory(contractName);
        
        // Deploy with explicit nonce and gas settings
        const deployOptions = {
          nonce: this.currentNonce,
          gasLimit: options.gasLimit || 8000000, // Increased for large contracts
          gasPrice: options.gasPrice || hre.ethers.utils.parseUnits("5", "gwei"), // Increased gas price
          ...options
        };
        
        const contract = await ContractFactory.deploy(...constructorArgs, deployOptions);
        
        // Wait for deployment with timeout
        console.log(`   ⏳ Waiting for deployment transaction...`);
        await Promise.race([
          contract.deployed(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Deployment timeout")), 120000) // 2 minute timeout
          )
        ]);
        
        const address = contract.address;
        console.log(`   ✅ ${contractName} deployed to: ${address}`);
        console.log(`   🧾 Transaction hash: ${contract.deployTransaction.hash}`);
        
        // Increment nonce for next transaction
        this.currentNonce++;
        
        return { contract, address };
        
      } catch (error) {
        attempt++;
        console.error(`   ❌ Deployment attempt ${attempt} failed:`, error.message);
        
        if (attempt >= maxRetries) {
          throw new Error(`Failed to deploy ${contractName} after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry and refresh nonce
        console.log(`   ⏳ Waiting 10 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        this.currentNonce = await this.deployer.getTransactionCount();
        console.log(`   🔄 Refreshed nonce: ${this.currentNonce}`);
      }
    }
  }

  async executeTransaction(contract, methodName, args = [], options = {}) {
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`   📞 Calling ${methodName} (attempt ${attempt + 1}/${maxRetries})...`);
        console.log(`   🔢 Using nonce: ${this.currentNonce}`);
        
        const txOptions = {
          nonce: this.currentNonce,
          gasLimit: options.gasLimit || 1000000, // Increased for transactions
          gasPrice: options.gasPrice || hre.ethers.utils.parseUnits("5", "gwei"), // Increased gas price
          ...options
        };
        
        const tx = await contract[methodName](...args, txOptions);
        console.log(`   ⏳ Waiting for transaction confirmation...`);
        
        const receipt = await Promise.race([
          tx.wait(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Transaction timeout")), 60000) // 1 minute timeout
          )
        ]);
        
        console.log(`   ✅ Transaction confirmed: ${tx.hash}`);
        
        // Increment nonce for next transaction
        this.currentNonce++;
        
        return receipt;
        
      } catch (error) {
        attempt++;
        console.error(`   ❌ Transaction attempt ${attempt} failed:`, error.message);
        
        if (attempt >= maxRetries) {
          throw new Error(`Failed to execute ${methodName} after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Wait before retry and refresh nonce
        console.log(`   ⏳ Waiting 5 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        this.currentNonce = await this.deployer.getTransactionCount();
        console.log(`   🔄 Refreshed nonce: ${this.currentNonce}`);
      }
    }
  }

  async deployAllContracts() {
    try {
      // =============================================================================
      // STEP 1: Deploy MockUSDC
      // =============================================================================
      console.log("\n🪙 Step 1: Deploying MockUSDC...");
      
      const initialSupply = hre.ethers.utils.parseUnits("1000000", 6); // 1M USDC (6 decimals)
      const { contract: mockUSDC, address: mockUSDCAddress } = await this.deployContract(
        "MockUSDC", 
        [initialSupply]
      );
      
      this.deploymentResults.mockUSDC = mockUSDCAddress;
      
      // Mint some tokens to the deployer for testing
      const mintAmount = hre.ethers.utils.parseUnits("50000", 6); // 50,000 USDC for testing
      await this.executeTransaction(mockUSDC, "mint", [this.deployer.address, mintAmount]);
      console.log(`   💵 Minted ${hre.ethers.utils.formatUnits(mintAmount, 6)} USDC to deployer`);

      // =============================================================================
      // STEP 2: Deploy ROSCAFactory
      // =============================================================================
      console.log("\n🏭 Step 2: Deploying ROSCAFactory...");
      
      const { contract: roscaFactory, address: roscaFactoryAddress } = await this.deployContract("ROSCAFactory");
      this.deploymentResults.roscaFactory = roscaFactoryAddress;
      
      // Verify the factory is properly set up
      const factoryStats = await roscaFactory.getFactoryStats();
      console.log(`   📊 Factory stats - Total created: ${factoryStats[0]}, Active: ${factoryStats[1]}, Creation fee: ${hre.ethers.utils.formatEther(factoryStats[2])} cBTC`);

      // =============================================================================
      // STEP 3: Deploy MicroSacco
      // =============================================================================
      console.log("\n🏦 Step 3: Deploying MicroSacco...");
      
      // For now, use MockUSDC as both USDC and governance token
      const govTokenAddress = mockUSDCAddress; // Placeholder - use USDC as gov token for demo
      
      console.log(`   🔧 Deploying with governance token: ${govTokenAddress}`);
      console.log(`   🔧 Deploying with USDC token: ${mockUSDCAddress}`);
      
      const { contract: microSacco, address: microSaccoAddress } = await this.deployContract(
        "MicroSacco", 
        [govTokenAddress, mockUSDCAddress]
      );
      
      this.deploymentResults.microSacco = microSaccoAddress;
      
      // Verify MicroSacco deployment
      const deployedGovToken = await microSacco.govToken();
      const deployedUSDC = await microSacco.usdc();
      const joinFee = await microSacco.JOIN_FEE();
      const maxLTV = await microSacco.MAX_LTV_BPS();
      
      console.log(`   ✓ Gov Token: ${deployedGovToken}`);
      console.log(`   ✓ USDC: ${deployedUSDC}`);
      console.log(`   ✓ Join Fee: ${hre.ethers.utils.formatEther(joinFee)} cBTC`);
      console.log(`   ✓ Max LTV: ${maxLTV.toString()} bps (${Number(maxLTV) / 100}%)`);

      return this.deploymentResults;

    } catch (error) {
      console.error("\n❌ DEPLOYMENT FAILED");
      console.error("===================");
      console.error(`Error: ${error.message}`);
      throw error;
    }
  }

  async saveDeploymentData() {
    console.log("\n💾 Saving deployment results...");
    
    const deploymentData = {
      network: hre.network.name,
      chainId: hre.network.config.chainId,
      deployer: this.deployer.address,
      timestamp: new Date().toISOString(),
      deploymentTime: `${((Date.now() - this.startTime) / 1000).toFixed(2)}s`,
      contracts: this.deploymentResults,
      verification: {
        mockUSDC: this.deploymentResults.mockUSDC,
        roscaFactory: this.deploymentResults.roscaFactory,
        microSacco: this.deploymentResults.microSacco
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

    return deploymentData;
  }

  async updateFrontendConfig() {
    console.log("\n🔧 Updating frontend configuration...");
    
    try {
      // Use the dedicated update script
      const updateScript = path.join(__dirname, "../../scripts/update-contracts.js");
      const deploymentFile = path.join(__dirname, "..", "deployments", `${hre.network.name}.json`);
      
      // Run the update script
      const { spawn } = require('child_process');
      
      return new Promise((resolve, reject) => {
        const updateProcess = spawn('node', [updateScript, deploymentFile], {
          stdio: 'inherit',
          cwd: path.join(__dirname, "../..")
        });
        
        updateProcess.on('close', (code) => {
          if (code === 0) {
            console.log(`   ✅ Frontend configuration updated successfully`);
            resolve();
          } else {
            reject(new Error(`Update script failed with code ${code}`));
          }
        });
        
        updateProcess.on('error', (error) => {
          reject(error);
        });
      });
      
    } catch (error) {
      console.error(`   ❌ Failed to update frontend config: ${error.message}`);
      throw error;
    }
  }

  async updateEnvironmentFile() {
    // This is now handled by the update script
    console.log("   ✓ Environment file update handled by update script");
  }

  async displaySummary(deploymentData) {
    console.log("\n🎉 DEPLOYMENT SUMMARY");
    console.log("========================");
    console.log(`Network: ${deploymentData.network} (Chain ID: ${deploymentData.chainId})`);
    console.log(`Deployer: ${deploymentData.deployer}`);
    console.log(`Deployment time: ${deploymentData.deploymentTime}`);
    console.log("\n📋 Contract Addresses:");
    console.log(`MockUSDC:           ${this.deploymentResults.mockUSDC}`);
    console.log(`ROSCAFactory:       ${this.deploymentResults.roscaFactory}`);
    console.log(`MicroSacco:         ${this.deploymentResults.microSacco}`);
    
    console.log("\n🔗 Explorer Links:");
    const explorerBase = "https://explorer.testnet.citrea.xyz/address";
    console.log(`MockUSDC:           ${explorerBase}/${this.deploymentResults.mockUSDC}`);
    console.log(`ROSCAFactory:       ${explorerBase}/${this.deploymentResults.roscaFactory}`);
    console.log(`MicroSacco:         ${explorerBase}/${this.deploymentResults.microSacco}`);

    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
      console.log("\n🔧 VERIFICATION COMMANDS");
      console.log("========================");
      console.log("Run these commands to verify contracts on the explorer:");
      console.log(`npx hardhat verify --network ${hre.network.name} ${this.deploymentResults.mockUSDC} "1000000000000"`);
      console.log(`npx hardhat verify --network ${hre.network.name} ${this.deploymentResults.roscaFactory}`);
      console.log(`npx hardhat verify --network ${hre.network.name} ${this.deploymentResults.microSacco} "${this.deploymentResults.mockUSDC}" "${this.deploymentResults.mockUSDC}"`);
    }

    console.log("\n✅ FRONTEND AUTOMATICALLY UPDATED");
    console.log("=================================");
    console.log("✓ Contract addresses updated in src/config/index.ts");
    console.log("✓ Environment variables updated in .env");
    console.log("✓ No manual configuration needed!");
    console.log("\n🚀 Ready to run: npm run dev");
  }
}

async function main() {
  const deployment = new DeploymentManager();
  
  try {
    // Initialize deployment
    await deployment.initialize();
    
    // Deploy all contracts
    await deployment.deployAllContracts();
    
    // Save deployment data
    const deploymentData = await deployment.saveDeploymentData();
    
    // Update frontend configuration
    await deployment.updateFrontendConfig();
    
    // Update environment file
    await deployment.updateEnvironmentFile();
    
    // Display summary
    await deployment.displaySummary(deploymentData);
    
    return deployment.deploymentResults;
    
  } catch (error) {
    console.error("\n💥 DEPLOYMENT PROCESS FAILED 💥");
    console.error("================================");
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
      console.log("Frontend is automatically configured and ready to use!");
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
