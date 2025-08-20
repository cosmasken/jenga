const { ethers } = require("hardhat");

async function main(roscaImplementationAddress) {
  console.log("Deploying ROSCAFactory...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  if (!roscaImplementationAddress) {
    throw new Error("ROSCA implementation address is required");
  }

  console.log("Using ROSCA implementation address:", roscaImplementationAddress);

  const ROSCAFactory = await ethers.getContractFactory("ROSCAFactory");
  const roscaFactory = await ROSCAFactory.deploy(roscaImplementationAddress);
  await roscaFactory.deployed();

  console.log("ROSCAFactory deployed to:", roscaFactory.address);

  // Verify the factory is properly set up
  const implementationAddress = await roscaFactory.roscaImplementation();
  console.log("Factory implementation address:", implementationAddress);
  
  if (implementationAddress.toLowerCase() !== roscaImplementationAddress.toLowerCase()) {
    throw new Error("Factory implementation address mismatch");
  }

  console.log("ROSCAFactory deployment verified");

  return {
    roscaFactory: roscaFactory.address
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
