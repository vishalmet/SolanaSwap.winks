"use client";
import { Copy, Link } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);

  const validateEthAddress = (address) => {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    if (newAddress) {
      setIsValidAddress(validateEthAddress(newAddress));
    } else {
      setIsValidAddress(true);
    }
  };

  const generateLink = () => {
    if (!address || !isValidAddress) return;
  
    const baseUrl =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://solanaswap-winks.vercel.app";
  
    const link = `${baseUrl}/wink/${address}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      try {
        await navigator.clipboard.writeText(generatedLink);
        alert("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-pink-100 to-yellow-100 text-gray-800 flex items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Decorative background patterns */}
      <div className="absolute inset-0 bg-white/50">
        <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-300/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-xl" />
        <div className="absolute top-1/4 right-0 w-40 h-40 bg-pink-300/20 rounded-full translate-x-1/2 blur-xl" />
        <div className="absolute bottom-0 left-1/3 w-36 h-36 bg-yellow-300/20 rounded-full translate-y-1/2 blur-xl" />
        <div className="absolute top-1/2 right-1/4 w-28 h-28 bg-cyan-300/20 rounded-full blur-xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 rounded-2xl blur opacity-70" />
        <div className="relative bg-white backdrop-blur-sm shadow-2xl rounded-2xl p-8 space-y-6 border border-white">
          <div className="text-center">
            <p className="text-gray-600">Enter BNB contract address to generate a sharable link</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              BNB Contract Address
            </label>
            <div className="relative">
              <input
                className={`w-full p-3 pl-10 rounded-lg bg-white/80 focus:outline-none border-2 transition-colors backdrop-blur-sm ${
                  !isValidAddress 
                    ? 'border-red-500' 
                    : 'border-cyan-400 focus:border-pink-300 hover:border-yellow-300'
                }`}
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={address}
                onChange={handleAddressChange}
              />
              <Link className="text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
            </div>
            {!isValidAddress && address && (
              <p className="text-red-500 text-xs mt-1">
                Please enter a valid Ethereum address
              </p>
            )}
          </div>
          
          <button
            className={`w-full py-3 rounded-lg text-white font-bold transition-all duration-300 ${
              !address || !isValidAddress 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 hover:opacity-90 active:scale-95'
            }`}
            onClick={generateLink}
            disabled={!address || !isValidAddress}
          >
            Generate Link
          </button>

          {generatedLink && (
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg break-all text-sm flex items-center justify-between border-2 border-cyan-400">
                <span className="truncate mr-2 text-gray-600">{generatedLink}</span>
                <button 
                  onClick={copyToClipboard} 
                  className="text-cyan-400 hover:text-pink-300 transition-colors"
                >
                  <Copy size={20} />
                </button>
              </div>  
            </div>
          )}
          
          <p className="text-center text-xs text-gray-400">Powered by winks.fun</p>
        </div>
      </div>
    </div>
  );
}