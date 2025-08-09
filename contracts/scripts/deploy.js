/**
 * Complete Deployment Script for Jenga Contracts
 * Deploys ROSCA contract and fake ERC20 tokens (USDC, USDT, DAI) to Citrea testnet
 * Updates frontend config with all deployed addresses
 */

const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting complete Jenga contract deployment...");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "cBTC");
  
  if (balance === 0n) {
    throw new Error("❌ Deployer account has no balance. Please fund it from the Citrea faucet: https://citrea.xyz/faucet");
  }
  
  const deployedContracts = {};
  
  // Deploy ROSCA contract
  console.log("\n📦 Deploying ROSCA contract...");
  const ROSCA = await ethers.getContractFactory("ROSCA");
  const estimatedGasROSCA = await ethers.provider.estimateGas({
    data: ROSCA.bytecode,
  });
  console.log("⛽ Estimated gas for ROSCA:", estimatedGasROSCA.toString());
  
  const rosca = await ROSCA.deploy({
    gasLimit: estimatedGasROSCA * 120n / 100n, // Add 20% buffer
  });
  await rosca.waitForDeployment();
  const roscaAddress = await rosca.getAddress();
  deployedContracts.ROSCA = roscaAddress;
  console.log("✅ ROSCA contract deployed to:", roscaAddress);
  
  // Verify ROSCA deployment
  try {
    const groupCount = await rosca.groupCount();
    console.log("🔍 ROSCA verification - Group count:", groupCount.toString());
  } catch (error) {
    console.warn("⚠️  Could not verify ROSCA deployment:", error.message);
  }
  
  // Deploy Fake USDC
  console.log("\n📦 Deploying Fake USDC...");
  const FakeUSDC = await ethers.getContractFactory("FakeUSDC");
  const fakeUSDC = await FakeUSDC.deploy();
  await fakeUSDC.waitForDeployment();
  const usdcAddress = await fakeUSDC.getAddress();
  deployedContracts.USDC = usdcAddress;
  console.log("✅ Fake USDC deployed to:", usdcAddress);
  
  // Verify USDC deployment
  try {
    const usdcName = await fakeUSDC.name();
    const usdcSymbol = await fakeUSDC.symbol();
    const usdcDecimals = await fakeUSDC.decimals();
    const usdcSupply = await fakeUSDC.totalSupply();
    console.log(`🔍 USDC verification - ${usdcName} (${usdcSymbol}), ${usdcDecimals} decimals, ${ethers.formatUnits(usdcSupply, usdcDecimals)} total supply`);
  } catch (error) {
    console.warn("⚠️  Could not verify USDC deployment:", error.message);
  }
  
  // Deploy Fake USDT
  console.log("\n📦 Deploying Fake USDT...");
  const FakeUSDT = await ethers.getContractFactory("FakeUSDT");
  const fakeUSDT = await FakeUSDT.deploy();
  await fakeUSDT.waitForDeployment();
  const usdtAddress = await fakeUSDT.getAddress();
  deployedContracts.USDT = usdtAddress;
  console.log("✅ Fake USDT deployed to:", usdtAddress);
  
  // Verify USDT deployment
  try {
    const usdtName = await fakeUSDT.name();
    const usdtSymbol = await fakeUSDT.symbol();
    const usdtDecimals = await fakeUSDT.decimals();
    const usdtSupply = await fakeUSDT.totalSupply();
    console.log(`🔍 USDT verification - ${usdtName} (${usdtSymbol}), ${usdtDecimals} decimals, ${ethers.formatUnits(usdtSupply, usdtDecimals)} total supply`);
  } catch (error) {
    console.warn("⚠️  Could not verify USDT deployment:", error.message);
  }
  
  // Deploy Fake DAI
  console.log("\n📦 Deploying Fake DAI...");
  const FakeDAI = await ethers.getContractFactory("FakeDAI");
  const fakeDAI = await FakeDAI.deploy();
  await fakeDAI.waitForDeployment();
  const daiAddress = await fakeDAI.getAddress();
  deployedContracts.DAI = daiAddress;
  console.log("✅ Fake DAI deployed to:", daiAddress);
  
  // Verify DAI deployment
  try {
    const daiName = await fakeDAI.name();
    const daiSymbol = await fakeDAI.symbol();
    const daiDecimals = await fakeDAI.decimals();
    const daiSupply = await fakeDAI.totalSupply();
    console.log(`🔍 DAI verification - ${daiName} (${daiSymbol}), ${daiDecimals} decimals, ${ethers.formatEther(daiSupply)} total supply`);
  } catch (error) {
    console.warn("⚠️  Could not verify DAI deployment:", error.message);
  }
  
  // Update frontend config
  await updateFrontendConfig(deployedContracts);
  
  // Save deployment info
  const deploymentInfo = {
    network: "citrea-testnet",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    contracts: {
      ROSCA: {
        address: roscaAddress,
        name: "ROSCA",
        type: "Main Contract"
      },
      USDC: {
        address: usdcAddress,
        name: "Fake USD Coin",
        symbol: "fUSDC",
        decimals: 6,
        type: "ERC20 Token"
      },
      USDT: {
        address: usdtAddress,
        name: "Fake Tether USD",
        symbol: "fUSDT",
        decimals: 6,
        type: "ERC20 Token"
      },
      DAI: {
        address: daiAddress,
        name: "Fake Dai Stablecoin",
        symbol: "fDAI",
        decimals: 18,
        type: "ERC20 Token"
      }
    }
  };
  
  const deploymentPath = path.join(__dirname, "../deployments.json");
  let deployments = {};
  
  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }
  
  deployments["citrea-testnet"] = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));
  
  console.log("\n📄 Deployment info saved to:", deploymentPath);
  console.log("🎉 Complete deployment finished successfully!");
  
  console.log("\n📋 Deployment Summary:");
  console.log("=".repeat(60));
  console.log("🏦 ROSCA Contract:", roscaAddress);
  console.log("💵 Fake USDC:", usdcAddress);
  console.log("💵 Fake USDT:", usdtAddress);
  console.log("💵 Fake DAI:", daiAddress);
  console.log("🌐 Network: Citrea Testnet (Chain ID: 5115)");
  console.log("🔍 Explorer Base URL: https://explorer.testnet.citrea.xyz/address/");
  console.log("✅ Frontend config updated automatically");
  
  console.log("\n🚰 Faucet Instructions:");
  console.log("Users can call the faucet() function on each token to get:");
  console.log("- 1000 fUSDC (6 decimals)");
  console.log("- 1000 fUSDT (6 decimals)");
  console.log("- 1000 fDAI (18 decimals)");
  console.log("- Cooldown: 24 hours between claims per token");
  
  console.log("\n🔗 Contract Links:");
  console.log("- ROSCA:", `https://explorer.testnet.citrea.xyz/address/${roscaAddress}`);
  console.log("- USDC:", `https://explorer.testnet.citrea.xyz/address/${usdcAddress}`);
  console.log("- USDT:", `https://explorer.testnet.citrea.xyz/address/${usdtAddress}`);
  console.log("- DAI:", `https://explorer.testnet.citrea.xyz/address/${daiAddress}`);
}

/**
 * Updates the frontend config.ts file with the new contract addresses
 * @param {Object} contracts - Object containing contract addresses
 */
async function updateFrontendConfig(contracts) {
  const configPath = path.join(__dirname, "../../src/config.ts");
  
  if (!fs.existsSync(configPath)) {
    console.warn("⚠️  Frontend config.ts not found at:", configPath);
    return;
  }
  
  try {
    let configContent = fs.readFileSync(configPath, "utf8");
    
    // Replace contract addresses
    const replacements = [
      {
        regex: /ROSCA:\s*['"`]0x[a-fA-F0-9]{40}['"`]\s*as\s+Address/,
        replacement: `ROSCA: '${contracts.ROSCA}' as Address`
      },
      {
        regex: /USDC:\s*['"`]0x[a-fA-F0-9]{40}['"`]\s*as\s+Address/,
        replacement: `USDC: '${contracts.USDC}' as Address`
      },
      {
        regex: /USDT:\s*['"`]0x[a-fA-F0-9]{40}['"`]\s*as\s+Address/,
        replacement: `USDT: '${contracts.USDT}' as Address`
      },
      {
        regex: /DAI:\s*['"`]0x[a-fA-F0-9]{40}['"`]\s*as\s+Address/,
        replacement: `DAI: '${contracts.DAI}' as Address`
      }
    ];
    
    let updatedCount = 0;
    replacements.forEach(({ regex, replacement }) => {
      if (regex.test(configContent)) {
        configContent = configContent.replace(regex, replacement);
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      fs.writeFileSync(configPath, configContent);
      console.log(`✅ Frontend config.ts updated with ${updatedCount} contract addresses`);
    } else {
      console.warn("⚠️  Could not find contract address patterns in config.ts");
      console.log("📝 Please manually update the contract addresses:");
      Object.entries(contracts).forEach(([name, address]) => {
        console.log(`   ${name}: '${address}' as Address,`);
      });
    }
  } catch (error) {
    console.error("❌ Error updating frontend config:", error.message);
    console.log("📝 Please manually update the contract addresses in src/config.ts:");
    Object.entries(contracts).forEach(([name, address]) => {
      console.log(`   ${name}: '${address}' as Address,`);
    });
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
