#!/usr/bin/env node

/**
 * ROSCA Factory Deployment Script
 * 
 * Usage:
 *   node scripts/deploy-factory.js --network testnet
 *   node scripts/deploy-factory.js --network mainnet
 */

const fs = require('fs');
const path = require('path');
const { createWalletClient, createPublicClient, http, parseEther } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// Network configurations
const NETWORKS = {
  citrea_testnet: {
    name: 'Citrea Testnet',
    chainId: 5115,
    rpcUrl: 'https://rpc.testnet.citrea.xyz',
    explorerUrl: 'https://explorer.testnet.citrea.xyz'
  },
  citrea_mainnet: {
    name: 'Citrea Mainnet', 
    chainId: 62298,
    rpcUrl: 'https://rpc.citrea.xyz',
    explorerUrl: 'https://explorer.citrea.xyz'
  }
};

async function main() {
  const args = process.argv.slice(2);
  const networkArg = args.find(arg => arg.startsWith('--network='))?.split('=')[1] || 'testnet';
  const network = networkArg === 'mainnet' ? 'citrea_mainnet' : 'citrea_testnet';
  
  console.log(`🚀 Deploying ROSCAFactory to ${NETWORKS[network].name}...`);
  
  // Check for private key
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY environment variable required');
    console.log('   Set it with: export PRIVATE_KEY=0x...');
    process.exit(1);
  }

  // Load contract artifacts
  const buildDir = path.join(__dirname, '../build');
  
  try {
    const factoryABI = JSON.parse(fs.readFileSync(path.join(buildDir, 'ROSCAFactory.abi'), 'utf8'));
    const factoryBytecode = '0x' + fs.readFileSync(path.join(buildDir, 'ROSCAFactory.bin'), 'utf8');
    
    console.log('✅ Contract artifacts loaded');
    console.log(`   Factory bytecode size: ${Math.round(factoryBytecode.length / 2 / 1024)} KB`);
    
    if (factoryBytecode.length > 49152 * 2) {
      console.warn('⚠️  Contract size exceeds Ethereum limit (24KB)');
      console.warn('   This may fail on some networks');
    }

    // Setup clients
    const account = privateKeyToAccount(privateKey);
    
    const publicClient = createPublicClient({
      transport: http(NETWORKS[network].rpcUrl),
      chain: {
        id: NETWORKS[network].chainId,
        name: NETWORKS[network].name,
        network: network,
        nativeCurrency: { name: 'Bitcoin', symbol: 'cBTC', decimals: 18 },
        rpcUrls: {
          default: { http: [NETWORKS[network].rpcUrl] }
        },
        blockExplorers: {
          default: { 
            name: 'Explorer', 
            url: NETWORKS[network].explorerUrl 
          }
        }
      }
    });

    const walletClient = createWalletClient({
      account,
      transport: http(NETWORKS[network].rpcUrl),
      chain: publicClient.chain
    });

    // Check account balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`💰 Deployer balance: ${Number(balance) / 1e18} cBTC`);
    
    if (balance < parseEther('0.01')) {
      console.error('❌ Insufficient balance for deployment');
      console.log('   Need at least 0.01 cBTC for gas fees');
      process.exit(1);
    }

    // Estimate gas
    console.log('⏳ Estimating deployment gas...');
    
    try {
      const gasEstimate = await publicClient.estimateContractDeploymentGas({
        abi: factoryABI,
        bytecode: factoryBytecode,
        account: account.address
      });
      
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
    } catch (gasError) {
      console.warn('⚠️  Could not estimate gas, proceeding anyway...');
    }

    // Deploy the factory
    console.log('🚀 Deploying factory contract...');
    
      const deployHash = await walletClient.deployContract({
        abi: factoryABI,
        bytecode: factoryBytecode,
        args: [account.address] // EnhancedFactory constructor requires fee collector address
      });

    console.log(`📝 Transaction hash: ${deployHash}`);
    console.log(`🔍 View on explorer: ${NETWORKS[network].explorerUrl}/tx/${deployHash}`);

    // Wait for deployment
    console.log('⏳ Waiting for deployment confirmation...');
    
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: deployHash,
      timeout: 300_000 // 5 minutes
    });

    if (receipt.status === 'success') {
      console.log('✅ Factory deployed successfully!');
      console.log(`📍 Factory address: ${receipt.contractAddress}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`🔍 View contract: ${NETWORKS[network].explorerUrl}/address/${receipt.contractAddress}`);
      
      // Verify the deployment
      console.log('\n🔍 Verifying deployment...');
      
      try {
        const stats = await publicClient.readContract({
          address: receipt.contractAddress,
          abi: factoryABI,
          functionName: 'getFactoryStats'
        });
        
        console.log('✅ Factory verification successful');
        console.log(`   Initial stats: ${stats.toString()}`);
      } catch (verifyError) {
        console.warn('⚠️  Could not verify factory deployment:', verifyError.message);
      }

      // Save deployment info
      const deploymentInfo = {
        network: NETWORKS[network].name,
        chainId: NETWORKS[network].chainId,
        factoryAddress: receipt.contractAddress,
        deploymentHash: deployHash,
        deployedAt: new Date().toISOString(),
        gasUsed: receipt.gasUsed.toString(),
        deployer: account.address
      };

      const deploymentFile = path.join(__dirname, `../deployments/${network}-factory.json`);
      fs.mkdirSync(path.dirname(deploymentFile), { recursive: true });
      fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
      
      console.log(`💾 Deployment info saved to: ${deploymentFile}`);

      // Update constants file
      const constantsTemplate = `
// Auto-generated by deploy-factory.js
export const FACTORY_ADDRESS = "${receipt.contractAddress}" as const;
export const FACTORY_DEPLOYMENT = ${JSON.stringify(deploymentInfo, null, 2)} as const;

export const CONTRACT_TYPES = {
  CHAMA: 'chama',
  ENHANCED_ROSCA: 'enhanced_rosca',
  PERSONAL_SAVINGS: 'personal_savings', 
  GROUP_SAVINGS: 'group_savings'
} as const;
`;

      const constantsFile = path.join(__dirname, `../src/config/factory-${network}.ts`);
      fs.mkdirSync(path.dirname(constantsFile), { recursive: true });
      fs.writeFileSync(constantsFile, constantsTemplate);
      
      console.log(`📝 Constants file created: ${constantsFile}`);
      console.log('\n🎉 Deployment complete!');
      console.log('\n📋 Next steps:');
      console.log(`   1. Import factory address in your frontend:`);
      console.log(`      import { FACTORY_ADDRESS } from './config/factory-${network}';`);
      console.log(`   2. Copy ABIs to your src/abi/ folder`);
      console.log(`   3. Test contract creation through your UI`);
      
    } else {
      console.error('❌ Deployment failed');
      console.error(`   Status: ${receipt.status}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    
    if (error.message.includes('insufficient funds')) {
      console.log('💡 Need more cBTC for gas fees');
    } else if (error.message.includes('nonce')) {
      console.log('💡 Try again, nonce issue should resolve');
    } else if (error.message.includes('gas')) {
      console.log('💡 Try with higher gas limit or lower gas price');
    }
    
    process.exit(1);
  }
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n👋 Deployment cancelled');
  process.exit(0);
});

main().catch(console.error);
