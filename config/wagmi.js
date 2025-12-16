import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { localhost, sepolia } from "wagmi/chains";
import { http } from "viem";

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const LOCAL_RPC = process.env.NEXT_PUBLIC_LOCAL_RPC_URL || "http://127.0.0.1:8545";
const SEPOLIA_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

// Configure localhost network with minimal polling
const localhostChain = {
  ...localhost,
  name: "Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"],
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
};

export const config = getDefaultConfig({
  appName: "Health DApp",
  projectId: PROJECT_ID,
  chains: [localhostChain, sepolia],
  ssr: true,
  transports: {
    [localhostChain.id]: http(LOCAL_RPC, {
      // Reduce polling - check every 60 seconds instead of 4 seconds
      batch: {
        wait: 100,
      },
      retryCount: 3,
      retryDelay: 1000,
      timeout: 30000,
    }),
    [sepolia.id]: http(SEPOLIA_RPC, {
      batch: {
        wait: 100,
      },
      retryCount: 3,
      retryDelay: 1000,
      timeout: 30000,
    }),
  },
  // Global polling interval - 60 seconds
  pollingInterval: 60000,
});
