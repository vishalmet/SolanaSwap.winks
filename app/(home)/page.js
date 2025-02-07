"use client";
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
    const link = `https://donate-dynamic.vercel.app/wink/${address}`;
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
    <div className="min-h-screen bg-gradient-to-t from-customStart to-customEnd/50 font-mono text-white">
      <div className="flex justify-center items-center min-h-screen max-w-[500px] mx-auto">
        <div className="bg-customGrayFill/50 h-fit rounded w-full p-10">
          <div>
            Enter Recipient's wallet address
            <input
              className={`w-full p-2 bg-transparent border ${
                !isValidAddress ? 'border-red-500' : 'border-customGrayStroke'
              } placeholder-slate-500 mt-2 rounded`}
              placeholder="0x1234567890abcdef1234567890abcdef12345678"
              value={address}
              onChange={handleAddressChange}
            />
            {!isValidAddress && (
              <p className="text-red-500 text-sm mt-1">
                Please enter a valid Ethereum address
              </p>
            )}
          </div>
          <button
            className={`bg-customButtonStroke p-2 w-full mt-6 rounded ${
              !address || !isValidAddress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={generateLink}
            disabled={!address || !isValidAddress}
          >
            Generate Link
          </button>

          {generatedLink && (
            <div className="mt-4">
              <div className="bg-black/20 p-2 rounded break-all">
                {generatedLink}
              </div>
              <button
                className="bg-customButtonStroke p-2 w-full mt-2 rounded"
                onClick={copyToClipboard}
              >
                Copy Link
              </button>
            </div>
          )}
          <p className="text-center pt-4">Powered by winks.fun</p>
        </div>
      </div>
    </div>
  );
}