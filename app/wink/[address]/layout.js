// app/wink/[address]/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import { Providers } from "@/app/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }) {
  const baseUrl = "https://donate-dynamic.vercel.app";
  const { address } = params;

  return {
    title: "Donate | Dynamic Payment",
    description: "Send donations easily with dynamic payment links",
    metadataBase: new URL(baseUrl),
    other: {
      "twitter:card": "player",
      "twitter:site": "@YourTwitterHandle",
      "twitter:title": "Dynamic Payment Link",
      "twitter:description": "Send donations easily with dynamic payment links",
      "twitter:player": `${baseUrl}/wink/${address}`,
      "twitter:player:width": "360",
      "twitter:player:height": "560",
      "twitter:image":
        "https://res.cloudinary.com/dg8ssfxu3/image/upload/v1722584912/ud/y6uypvxozxsutmrkhot0.png",
    },
  };
}

export default function AddressLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
