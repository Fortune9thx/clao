import { createConfig, http } from "wagmi";
import { injected, metaMask, coinbaseWallet } from "wagmi/connectors";
import { defineChain } from "viem";

// Chain IDs and RPCs sourced from the official genlayer-js SDK (v1.1.8):
//   studionet:       id 61999, https://studio.genlayer.com/api
//   testnetBradbury: id 4221,  https://rpc-bradbury.genlayer.com
//
// Both chains are registered so MetaMask can switch between them.
// The active chain for contract calls is controlled by VITE_GL_NETWORK in .env.local.

export const genlayerStudionet = defineChain({
  id: 61999,
  name: "GenLayer Studionet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://studio.genlayer.com/api"] },
  },
  blockExplorers: {
    default: { name: "GenLayer Studio", url: "https://studio.genlayer.com" },
  },
  testnet: true,
});

export const genlayerBradbury = defineChain({
  id: 4221,
  name: "GenLayer Bradbury",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc-bradbury.genlayer.com"] },
  },
  blockExplorers: {
    default: { name: "GenLayer Bradbury Explorer", url: "https://explorer-bradbury.genlayer.com" },
  },
  testnet: true,
});

// Bradbury first — it is the primary network prompted on connect.
// Studionet stays registered for development wallets.
export const wagmiConfig = createConfig({
  chains: [genlayerBradbury, genlayerStudionet],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: "CLAO — Cognitive OS" }),
  ],
  transports: {
    [genlayerStudionet.id]: http("https://studio.genlayer.com/api"),
    [genlayerBradbury.id]: http("https://rpc-bradbury.genlayer.com"),
  },
  ssr: false,
});

// The chain IDs we consider "supported" for the network guard in TopBar.
export const SUPPORTED_CHAIN_IDS = new Set<number>([
  genlayerStudionet.id,
  genlayerBradbury.id,
]);
