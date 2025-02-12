"use client";
import { Copy, Link } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";

export default function Home() {
  const [address, setAddress] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchData = async () => {
      if (address && isValidAddress) {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/1inch-proxy?address=${address}`);
          setApiResponse(response.data);
        } catch (error) {
          console.error("API Error:", error);
          setApiResponse({ error: "Failed to fetch token data" });
        } finally {
          setIsLoading(false);
        }
      } else {
        setApiResponse(null);
      }
    };

    fetchData();
  }, [address, isValidAddress]);

  const generateLink = () => {
    if (!address || !isValidAddress) return;
    const baseUrl =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://bnbswap-winks.vercel.app";
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-pink-100 to-yellow-100 text-gray-800 flex items-center justify-center p-3 font-mono relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 bg-white/50">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-300/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-pink-300/20 rounded-full translate-x-1/2 blur-2xl animate-pulse delay-75" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-300/20 rounded-full translate-y-1/2 blur-2xl animate-pulse delay-150" />
        <div className="absolute top-1/2 right-1/4 w-56 h-56 bg-cyan-300/20 rounded-full blur-2xl animate-pulse delay-300" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 rounded-2xl blur opacity-70 animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-white backdrop-blur-md shadow-2xl rounded-2xl p-6 space-y-3 border border-white">
          <div className="text-center">
            <p className="text-gray-600 font-medium">Enter BNB contract address to generate a sharable link</p>
          </div>

          {/* Input section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              BNB Contract Address
            </label>
            <div className="relative group">
              <input
                className={`w-full p-3 pl-10 rounded-lg bg-white/90 focus:outline-none border-2 transition-all duration-300 ${
                  !isValidAddress
                    ? "border-red-500 shadow-red-200"
                    : "border-cyan-400 focus:border-pink-300 hover:border-yellow-300 shadow-lg focus:shadow-pink-200"
                }`}
                placeholder="0x1234567890abcdef1234567890abcdef12345678"
                value={address}
                onChange={handleAddressChange}
              />
              <Link
                className="text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-hover:text-pink-300"
                size={20}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <ClipLoader color="#f472b6" size={20} />
                </div>
              )}
            </div>
            {!isValidAddress && address && (
              <p className="text-red-500 text-xs">Please enter a valid Ethereum address</p>
            )}
          </div>



          {/* Token info card */}
          {apiResponse && (
            <div className="transform transition-all duration-300 hover:scale-102">
              <div className="p-2 px-4 rounded-xl bg-gradient-to-r from-cyan-50 via-pink-50 to-yellow-50 shadow-lg border border-white/50">
                {apiResponse.error ? (
                  <p className="text-red-500 font-medium text-center">{apiResponse.error}</p>
                ) : (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 rounded-full blur-sm animate-pulse" />
                      <img
                        src={apiResponse.logoURI}
                        alt="Token Logo"
                        className="relative w-10 h-10 rounded-full border-2 border-white shadow-lg"
                      />
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">{apiResponse.name}</p>
                      <p className="text-gray-500 text-sm">{apiResponse.symbol}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generate button */}
          <button
            className={`w-full py-3 rounded-lg font-bold transition-all duration-300 transform ${
              !address || !isValidAddress
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 hover:opacity-90 active:scale-95 shadow-lg hover:shadow-xl text-white hover:text-gray-800"
            }`}
            onClick={generateLink}
            disabled={!address || !isValidAddress}
          >
            Generate Link
          </button>

          {/* Generated link section */}
          {generatedLink && (
            <div className="space-y-4 transform transition-all duration-300">
              <div className="bg-white/90 backdrop-blur-sm p-2 px-4 rounded-lg break-all text-sm flex items-center justify-between border-2 border-cyan-400 shadow-lg hover:shadow-xl">
                <span className="truncate mr-2 text-gray-600 font-medium">
                  {generatedLink}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="text-cyan-400 hover:text-pink-300 transition-colors p-2 rounded-lg hover:bg-gray-50"
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