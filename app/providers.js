// app/providers.js
"use client";
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient instance
const queryClient = new QueryClient();

const metisChain = {
  id: 1088,
  name: 'Metis Andromeda',
  network: 'metis',
  nativeCurrency: {
    decimals: 18,
    name: 'METIS',
    symbol: 'METIS',
  },
  rpcUrls: {
    public: { http: ['https://andromeda.metis.io/?owner=1088'] },
    default: { http: ['https://andromeda.metis.io/?owner=1088'] },
  },
  blockExplorers: {
    default: { name: 'MetisScan', url: 'https://andromeda-explorer.metis.io' },
  }
};

const config = getDefaultConfig({
  appName: 'Winks Donation',
  projectId: '2844...', // Replace with your actual WalletConnect project ID
  chains: [metisChain],
  transports: {
    [metisChain.id]: http()
  },
});

export function Providers({ children }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={config.chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  );
}

export { ConnectButton };