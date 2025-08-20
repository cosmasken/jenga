const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ROSCA implementation...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ROSCA = await ethers.getContractFactory("ROSCA");
  // Deploy with dummy values - actual initialization happens in clones
  // Using address(0) as token and valid dummy values for the rest
  const roscaImplementation = await ROSCA.deploy(
    ethers.constants.AddressZero, // _token (dummy - address(0) for native ETH)
    ethers.utils.parseEther("1"), // _contributionAmount (dummy - 1 ETH)
    86400, // _roundDuration (dummy - 1 day)
    2, // _maxMembers (dummy - minimum valid value)
    deployer.address // _creator (deployer address to satisfy Ownable)
  );
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
