// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper function to validate private key
function getPrivateKey() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    return [];
  }
  // Remove 0x prefix if present and validate length (64 hex chars = 32 bytes)
  const cleanKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  if (cleanKey.length !== 64) {
    return [];
  }
  return [privateKey];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.NETWORK_RPC_URL || "https://rpc.sepolia.org",
      accounts: getPrivateKey(),
      chainId: 11155111,
    },
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    cache: "./cache",
    tests: "./test",
  },

  sourcify: {
    enabled: true,
  },
};
