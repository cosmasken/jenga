/**
 * ROSCA Contract Deployment Script
 * Deploys the ROSCA contract to Citrea testnet and updates frontend config
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting ROSCA contract deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "cBTC");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no balance. Please fund it from the Citrea faucet: https://citrea.xyz/faucet");
  }
  
  // Deploy the ROSCA contract
  console.log("📦 Deploying ROSCA contract...");
  const ROSCA = await ethers.getContractFactory("ROSCA");
  
  // Deploy with gas estimation
  const estimatedGas = await ethers.provider.estimateGas({
    data: ROSCA.bytecode,
  });
  console.log("⛽ Estimated gas:", estimatedGas.toString());
  
  const rosca = await ROSCA.deploy({
    gasLimit: estimatedGas * 120n / 100n, // Add 20% buffer
  });
  
  console.log("⏳ Waiting for deployment transaction...");
  await rosca.waitForDeployment();
  
  const contractAddress = await rosca.getAddress();
  console.log("✅ ROSCA contract deployed to:", contractAddress);
  
  // Verify deployment by calling a view function
  try {
    const groupCount = await rosca.groupCount();
    console.log("🔍 Contract verification - Group count:", groupCount.toString());
  } catch (error) {
    console.warn("⚠️  Could not verify contract deployment:", error.message);
  }
  
  // Update frontend config.ts
  await updateFrontendConfig(contractAddress);
  
  // Save deployment info
  const deploymentInfo = {
    network: "citrea-testnet",
    contractAddress: contractAddress,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: rosca.deploymentTransaction()?.hash,
    blockNumber: rosca.deploymentTransaction()?.blockNumber,
  };
  
  const deploymentPath = path.join(__dirname, "../deployments.json");
  let deployments = {};
  
  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }
  
  deployments["citrea-testnet"] = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  
  console.log("📄 Deployment info saved to:", deploymentPath);
  console.log("🎉 Deployment completed successfully!");
  console.log("\n📋 Summary:");
  console.log("- Contract Address:", contractAddress);
  console.log("- Network: Citrea Testnet (Chain ID: 5115)");
  console.log("- Explorer:", `https://explorer.testnet.citrea.xyz/address/${contractAddress}`);
  console.log("- Frontend config updated automatically");
}

/**
 * Updates the frontend config.ts file with the new contract address
 * @param {string} contractAddress - The deployed contract address
 */
async function updateFrontendConfig(contractAddress) {
  const configPath = path.join(__dirname, "../../src/config.ts");
  
  if (!fs.existsSync(configPath)) {
    console.warn("⚠️  Frontend config.ts not found at:", configPath);
    return;
  }
  
  try {
    let configContent = fs.readFileSync(configPath, "utf8");
    
    // Replace the ROSCA contract address
    const oldAddressRegex = /ROSCA:\s*['"`]0x[a-fA-F0-9]{40}['"`]\s*as\s+Address/;
    const newAddressLine = `ROSCA: '${contractAddress}' as Address`;
    
    if (oldAddressRegex.test(configContent)) {
      configContent = configContent.replace(oldAddressRegex, newAddressLine);
      fs.writeFileSync(configPath, configContent);
      console.log("✅ Frontend config.ts updated with new contract address");
    } else {
      console.warn("⚠️  Could not find ROSCA address pattern in config.ts");
      console.log("📝 Please manually update the ROSCA address to:", contractAddress);
    }
  } catch (error) {
    console.error("❌ Error updating frontend config:", error.message);
    console.log("📝 Please manually update the ROSCA address in src/config.ts to:", contractAddress);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
