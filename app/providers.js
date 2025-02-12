// app/providers.js
"use client";
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, ConnectButton } from '@rainbow-me/rainbowkit';
import { WagmiConfig } from 'wagmi';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a new QueryClient instance
const queryClient = new QueryClient();

const bscChain = {
  id: 56, // BNB Smart Chain (BSC) chain ID
  name: 'BNB Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    decimals: 18,
    name: 'BNB',
    symbol: 'BNB',
  },
  rpcUrls: {
    public: { http: ['https://bsc-dataseed.binance.org/'] }, // You might want to use a more reliable public RPC URL
    default: { http: ['https://bsc-dataseed.binance.org/'] }, // Consider using a service like Chainstack or QuickNode for better reliability
  },
  blockExplorers: {
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
};


const config = getDefaultConfig({
  appName: 'Winks Donation',
  projectId: '2844...', // Replace with your actual WalletConnect project ID
  chains: [bscChain],
  transports: {
    [bscChain.id]: http()
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