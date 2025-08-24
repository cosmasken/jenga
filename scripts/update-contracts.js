#!/usr/bin/env node

/**
 * Script to automatically update frontend configuration with new contract addresses
 * Usage: node scripts/update-contracts.js [deployment-file]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateFrontendConfig(deploymentData) {
  console.log('🔧 Updating frontend configuration...');
  
  const configPath = path.join(__dirname, '../src/config/index.ts');
  
  try {
    // Read current config file
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update contract addresses
    const addressUpdates = {
      'ROSCA_FACTORY': deploymentData.contracts.roscaFactory,
      'MICRO_SACCO': deploymentData.contracts.microSacco,
      'USDC': deploymentData.contracts.mockUSDC
    };
    
    // Update each address in the CONTRACT_ADDRESSES section
    for (const [key, address] of Object.entries(addressUpdates)) {
      const regex = new RegExp(`(${key}:\\s*\\(import\\.meta\\.env\\.VITE_\\w+\\s*\\|\\|\\s*')([^']+)('\\s*\\)\\s*as\\s*Address)`, 'g');
      configContent = configContent.replace(regex, `$1${address}$3`);
      console.log(`   ✓ Updated ${key}: ${address}`);
    }
    
    // Update deployment info
    const now = new Date().toISOString();
    configContent = configContent.replace(
      /timestamp: '[^']*'/,
      `timestamp: '${now}'`
    );
    configContent = configContent.replace(
      /deployer: '[^']*'/,
      `deployer: '${deploymentData.deployer}'`
    );
    configContent = configContent.replace(
      /version: '[^']*'/,
      `version: '4.1.0'`
    );
    
    // Write updated config
    fs.writeFileSync(configPath, configContent);
    console.log(`   ✅ Frontend config updated: ${configPath}`);
    
  } catch (error) {
    console.error(`   ❌ Failed to update frontend config: ${error.message}`);
    throw error;
  }
}

function updateEnvironmentFile(deploymentData) {
  console.log('🌍 Updating environment file...');
  
  const envPath = path.join(__dirname, '../.env');
  
  try {
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add contract addresses
    const envUpdates = {
      'VITE_ROSCA_FACTORY_ADDRESS': deploymentData.contracts.roscaFactory,
      'VITE_MICRO_SACCO_ADDRESS': deploymentData.contracts.microSacco,
      'VITE_USDC_ADDRESS': deploymentData.contracts.mockUSDC
    };
    
    for (const [key, value] of Object.entries(envUpdates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
        console.log(`   ✓ Updated ${key}`);
      } else {
        envContent += `\n${newLine}`;
        console.log(`   ✓ Added ${key}`);
      }
    }
    
    // Write updated .env file
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log(`   ✅ Environment file updated: ${envPath}`);
    
  } catch (error) {
    console.error(`   ❌ Failed to update environment file: ${error.message}`);
    throw error;
  }
}

function main() {
  const args = process.argv.slice(2);
  const deploymentFile = args[0] || path.join(__dirname, '../contract/deployments/citrea_testnet.json');
  
  console.log('🚀 Updating frontend with latest contract addresses...');
  console.log(`📄 Reading deployment data from: ${deploymentFile}`);
  
  try {
    // Read deployment data
    if (!fs.existsSync(deploymentFile)) {
      throw new Error(`Deployment file not found: ${deploymentFile}`);
    }
    
    const deploymentData = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    
    console.log('📋 Contract Addresses:');
    console.log(`   MockUSDC:      ${deploymentData.contracts.mockUSDC}`);
    console.log(`   ROSCAFactory:  ${deploymentData.contracts.roscaFactory}`);
    console.log(`   MicroSacco:    ${deploymentData.contracts.microSacco}`);
    
    // Update frontend configuration
    updateFrontendConfig(deploymentData);
    
    // Update environment file
    updateEnvironmentFile(deploymentData);
    
    console.log('\n✅ FRONTEND AUTOMATICALLY UPDATED');
    console.log('=================================');
    console.log('✓ Contract addresses updated in src/config/index.ts');
    console.log('✓ Environment variables updated in .env');
    console.log('✓ No manual configuration needed!');
    console.log('\n🚀 Ready to run: npm run dev');
    
  } catch (error) {
    console.error('\n❌ UPDATE FAILED');
    console.error('================');
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
main();

export { updateFrontendConfig, updateEnvironmentFile };
