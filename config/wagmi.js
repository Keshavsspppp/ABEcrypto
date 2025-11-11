import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { localhost, sepolia } from "wagmi/chains";
import { http } from "viem";

const PROJECT_ID = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;
const LOCAL_RPC = process.env.NEXT_PUBLIC_LOCAL_RPC_URL || "http://127.0.0.1:8545";
const SEPOLIA_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

// Configure localhost network properly for MetaMask
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
    [localhostChain.id]: http(LOCAL_RPC),
    [sepolia.id]: http(SEPOLIA_RPC),
  },
});
