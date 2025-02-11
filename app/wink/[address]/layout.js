// app/wink/[address]/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import { SolanaProvider } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }) {
  const baseUrl = "https://solanaswap-winks.vercel.app";
  const address = params;

  return {
    title: "SolanaSwap - DEX",
    description: "Swap Solana tokens quickly and easily on SolanaSwap, a decentralized exchange.",
    metadataBase: new URL(baseUrl),
    other: {
      "twitter:card": "player",
      "twitter:site": "@winksdotfun",
      "twitter:title": "Solana swap - Decentralized Exchange",
      "twitter:description": "Swap Solana tokens quickly and easily on SolanaSwap, a decentralized exchange.",
      "twitter:player": `${baseUrl}/wink/${address}`,
      "twitter:player:width": "360",
      "twitter:player:height": "560",
      "twitter:image":
        "https://res.cloudinary.com/dvddnptpi/image/upload/v1739295236/v88tpojl9qcfwdwbcsgm.png",
    },
  };
}

export default function AddressLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaProvider>
          {children}
        </SolanaProvider>
      </body>
    </html>
  );
}