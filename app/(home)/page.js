"use client";
import { Copy, Link } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [address, setAddress] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);

  // Function to validate Ethereum address
  const validateEthAddress = (address) => {
    // Check if it matches the Ethereum address format (0x followed by 40 hex chars)
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleAddressChange = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    // Only validate if there's input
    if (newAddress) {
      setIsValidAddress(validateEthAddress(newAddress));
    } else {
      setIsValidAddress(true); // Reset validation when input is empty
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
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] text-gray-800 flex items-center justify-center p-4 font-mono">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6 border-y-4 border-x border-indigo-500">
        <div className="text-center">
          {/* <h2 className="text-2xl font-bold text-indigo-600 mb-2">Link Generator</h2> */}
          <p className="text-gray-500">Enter Solana wallet address to generate a sharable link</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient's Wallet Address
          </label>
          <div className="relative">
            <input
              className={`w-full p-3 pl-10 border-2 rounded-lg bg-gray-50 focus:outline-none ${
                !isValidAddress ? 'border-red-500' : 'border-indigo-300 focus:border-indigo-500'
              }`}
              placeholder="0x1234567890abcdef1234567890abcdef12345678"
              value={address}
              onChange={handleAddressChange}
              prefix={<Link className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />}
            />
            <Link className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
          </div>
          {!isValidAddress && address && (
            <p className="text-red-500 text-xs mt-1">
              Please enter a valid Ethereum address
            </p>
          )}
        </div>
        
        <button
          className={`w-full py-3 rounded-lg text-white transition-all duration-300 ${
            !address || !isValidAddress 
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }`}
          onClick={generateLink}
          disabled={!address || !isValidAddress}
        >
          Generate Link
        </button>

        {generatedLink && (
          <div className="space-y-4">
            <div className="bg-gray-100 p-3 rounded-lg break-all text-sm flex items-center justify-between">
              <span className="truncate mr-2">{generatedLink}</span>
              <button 
                onClick={copyToClipboard} 
                className="text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <Copy size={20} />
              </button>
            </div>  
          </div>
        )}
        
        <p className="text-center text-xs text-gray-500">Powered by winks.fun</p>
      </div>
    </div>
  );
}