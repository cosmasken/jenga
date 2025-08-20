const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying MockUSDC...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.deployed();

  console.log("MockUSDC deployed to:", mockUSDC.address);
  
  // Mint some tokens to the deployer for testing
  const mintAmount = ethers.utils.parseUnits("10000", 6); // 10,000 USDC (6 decimals)
  await mockUSDC.mint(deployer.address, mintAmount);
  console.log(`Minted ${ethers.utils.formatUnits(mintAmount, 6)} USDC to deployer`);

  return {
    mockUSDC: mockUSDC.address
  };
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
