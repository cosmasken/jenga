const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ROSCA implementation...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ROSCA = await ethers.getContractFactory("ROSCA");
  const roscaImplementation = await ROSCA.deploy();
  await roscaImplementation.deployed();

  console.log("ROSCA implementation deployed to:", roscaImplementation.address);

  // Verify the contract is properly deployed by checking if it's a contract
  const code = await ethers.provider.getCode(roscaImplementation.address);
  if (code === "0x") {
    throw new Error("ROSCA implementation deployment failed - no code at address");
  }

  console.log("ROSCA implementation deployment verified");

  return {
    roscaImplementation: roscaImplementation.address
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
