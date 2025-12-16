const hre = require("hardhat");

async function main() {
  console.log("Deploying Healthcare contract with encrypted medical record features...");

  const Healthcare = await hre.ethers.getContractFactory("Healthcare");
  const healthcare = await Healthcare.deploy();

  await healthcare.waitForDeployment();

  const address = await healthcare.getAddress();
  console.log("Healthcare contract deployed to:", address);

  // Save contract address to .env
  console.log("\nAdd this to your .env.local file:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  // Verify contract on Etherscan (optional)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\nWaiting for block confirmations...");
    await healthcare.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification error:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
