export interface PhantomProvider {
    isPhantom?: boolean;
    connect: (args?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString: () => string } }>;
  }
  
  declare global {
    interface Window {
      solana?: PhantomProvider;
    }
  }