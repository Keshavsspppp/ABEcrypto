import "../styles/globals.css";
import Head from "next/head";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { config } from "../config/wagmi";
import Layout from "../components/layout/Layout";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Health Care Management DApp</title>
        <meta
          name="description"
          content="A powerful Web3 Health Care Management DApp built with Next.js, RainbowKit, and Wagmi"
        />
        <link rel="icon" href="/logo.png" />
      </Head>
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={config}>
          <RainbowKitProvider
            chains={config.chains}
            theme={{
              blurs: {
                modalOverlay: "blur(4px)",
              },
              colors: {
                accentColor: "#3B82F6",
                accentColorForeground: "white",
                actionButtonBorder: "rgba(255, 255, 255, 0.04)",
                actionButtonBorderMobile: "rgba(255, 255, 255, 0.08)",
                actionButtonSecondaryBackground: "rgba(255, 255, 255, 0.08)",
                closeButton: "rgba(224, 232, 255, 0.6)",
                closeButtonBackground: "rgba(255, 255, 255, 0.08)",
                connectButtonBackground: "#3B82F6",
                connectButtonBackgroundError: "#EF4444",
                connectButtonInnerBackground:
                  "linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))",
                connectButtonText: "white",
                connectButtonTextError: "white",
                connectionIndicator: "#22C55E",
                downloadBottomCardBackground:
                  "linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #1E293B",
                downloadTopCardBackground:
                  "linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #1E293B",
                error: "#EF4444",
                generalBorder: "rgba(255, 255, 255, 0.08)",
                generalBorderDim: "rgba(255, 255, 255, 0.04)",
                menuItemBackground: "rgba(224, 232, 255, 0.1)",
                modalBackdrop: "rgba(0, 0, 0, 0.3)",
                modalBackground: "white",
                modalBorder: "rgba(255, 255, 255, 0.08)",
                modalText: "#1F2937",
                modalTextDim: "#6B7280",
                modalTextSecondary: "#9CA3AF",
                profileAction: "rgba(224, 232, 255, 0.1)",
                profileActionHover: "rgba(224, 232, 255, 0.2)",
                profileForeground: "rgba(224, 232, 255, 0.05)",
                selectedOptionBorder: "rgba(224, 232, 255, 0.1)",
                standby: "#F59E0B",
              },
              fonts: {
                body: "Inter, system-ui, sans-serif",
              },
              radii: {
                actionButton: "12px",
                connectButton: "12px",
                menuButton: "12px",
                modal: "16px",
                modalMobile: "16px",
              },
              shadows: {
                connectButton: "0 4px 12px 0 rgba(59, 130, 246, 0.15)",
                dialog: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                profileDetailsAction: "0 2px 6px 0 rgba(37, 99, 235, 0.2)",
                selectedOption: "0 2px 6px 0 rgba(0, 0, 0, 0.24)",
                selectedWallet: "0 2px 6px 0 rgba(0, 0, 0, 0.12)",
                walletLogo: "0 2px 16px 0 rgba(0, 0, 0, 0.16)",
              },
            }}
          >
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "white",
                  color: "#374151",
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  border: "1px solid #E5E7EB",
                  borderRadius: "12px",
                  padding: "16px",
                },
                success: {
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "white",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "white",
                  },
                },
              }}
            />
          </RainbowKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </>
  );
}

export default MyApp;
