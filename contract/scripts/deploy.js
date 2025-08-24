/**
 * Simple deployment runner - calls the enhanced deployment script
 */

const deployEnhanced = require('./deploy-enhanced');

async function main() {
  console.log("🚀 Running enhanced deployment with automatic frontend updates...\n");
  
  try {
    const results = await deployEnhanced();
    console.log("\n✅ Deployment completed successfully!");
    return results;
  } catch (error) {
    console.error("\n❌ Deployment failed:", error.message);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
