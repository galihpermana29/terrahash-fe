"use client";

import { WagmiProvider, http } from "wagmi";
import { hedera, hederaTestnet } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

// RainbowKit returns a wagmi config; no need to call createConfig manually.
const config = getDefaultConfig({
  appName: "TerraHash",
  projectId,
  chains: [hedera, hederaTestnet],
  transports: {
    [hedera.id]: http(),
    [hederaTestnet.id]: http(),
  },
  ssr: true, // Next.js App Router
});

export default function WalletProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
