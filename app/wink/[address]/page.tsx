"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw,
  Wallet,
  Copy,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletClient, useAccount, useBalance } from "wagmi";
import { parseEther } from "viem";
import axios from "axios";
import { useParams } from "next/navigation";
import { ethers } from 'ethers';


interface Token {
  symbol: string;
  balance: number;
  icon: string;
}

interface QuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: {
    amount: string;
    feeBps: number;
  };
  priceImpactPct: string;
  routePlan: Array<any>;
  contextSlot: number;
  timeTaken: number;
}

const SolanaSwapUI: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [fromToken, setFromToken] = useState<Token>({
    symbol: "SOL",
    balance: 0,
    icon: "",
  });

  const [toToken, setToToken] = useState<Token>({
    symbol: "USDC",
    balance: 0,
    icon: "",
  });

  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false); // new signing state
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<string>("");
  const [isFetchingQuote, setIsFetchingQuote] = useState<boolean>(false);
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [signatureLink, setSignatureLink] = useState<string | null>(null);
  const [tokenPrices, setTokenPrices] = useState<{
    [key: string]: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [showAdditionalUI, setShowAdditionalUI] = useState<boolean>(false);
  const [bnbAmount, setBnbAmount] = useState<string>("");
  const [points, setPoints] = useState<number | null>(null);
  const [quoteData, setQuoteData] = useState<any | null>(null);
  const [weiAmount, setWeiAmount] = useState<string>("");


  const handleBnbAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBnbAmount = event.target.value;
    setBnbAmount(newBnbAmount);

    try {
      // Convert BNB to Wei using ethers.js
      const wei = ethers.utils.parseEther(newBnbAmount);
      setWeiAmount(wei.toString());
    } catch (error: any) {
      console.error("Error converting to Wei:", error.message);
      setWeiAmount(""); // Clear weiAmount on error
    }
  };

  const { isConnected, address } = useAccount();
  const params = useParams();
  const destAddress = params.address;

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
  };

  const result = useBalance({
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  });

  const swapParams = {
    src: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Token address of 1INCH
    dst: destAddress, // Token address of DAI
    amount: weiAmount,
    from: address,
    slippage: 1, // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
    disableEstimate: false, // Set to true to disable estimation of swap details
    allowPartialFill: false, // Set to true to allow partial filling of the swap order
  };

  const chainId = 56;

  const broadcastApiUrl =
    "https://api.1inch.dev/tx-gateway/v1.1/" + chainId + "/broadcast";
  const apiBaseUrl = "https://api.1inch.dev/swap/v6.0/" + chainId;

  // Construct full API request URL
  function apiRequestUrl(methodName: any, queryParams: any) {
    return (
      apiBaseUrl +
      methodName +
      "?" +
      new URLSearchParams(queryParams).toString()
    );
  }

  // Post raw transaction to the API and return transaction hash
  async function broadCastRawTransaction(rawTransaction: any) {
    return fetch(broadcastApiUrl, {
      method: "post",
      body: JSON.stringify({ rawTransaction }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer uzF2lXeO9pYtpjthDs0ltrkVwDcup6bd",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        return res.transactionHash;
      });
  }

  const { data: walletClient } = useWalletClient();

  async function signAndSendTransaction(transaction: any) {
    try {
      if (!walletClient) {
        throw new Error("Wallet not connected");
      }

      // Prepare the transaction
      const tx = {
        to: transaction.to as `0x${string}`,
        value: transaction.value.toString(),
        data: (transaction.data || "0x") as `0x${string}`,
      };

      const hash = await walletClient.sendTransaction(tx);
      return hash;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  }

  // If you need to wait for transaction confirmation, you can use this helper
  async function waitForTransaction(hash: string) {
    const { createPublicClient, http } = await import("viem");
    const { bsc } = await import("viem/chains");

    const client = createPublicClient({
      chain: bsc,
      transport: http(),
    });

    const { waitForTransactionReceipt } = await import("viem/actions");
    const receipt = await waitForTransactionReceipt(client, { 
      hash: hash as `0x${string}` 
    });
    return receipt;
  }

  const handleSwap = async () => {
    const swapTransaction = await buildTxForSwap(swapParams);

    console.log("Transaction for swap: ", swapTransaction);

    const res = await signAndSendTransaction(swapTransaction);
    console.log("Transaction hash: ", res);

    const receipt = await waitForTransaction(res);
    console.log("Transaction receipt: ", receipt);
  };

  async function buildTxForSwap(swapParams: any) {
    const url = apiRequestUrl("/swap", swapParams);

    try {
      const response = await axios.post("/api/swap-proxy", {
        url: url,
      });

      return response.data.tx;
    } catch (error) {
      console.error("Error in buildTxForSwap:", error);
      throw error;
    }
  }

  const srcAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
  const dstAddress = destAddress;
  const fetchData = async () => {
    setIsLoading(true);
    const weiAmountNumber = Number(weiAmount);
    if(weiAmountNumber <= 0){  
        return;
    }
    try {
  

        console.log(weiAmount);
        const response = await axios.post('/api/quote-proxy', {
            src: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
            dst: destAddress,
            amount: weiAmount
        });
        
        if(response.status === 200) {
            // Convert wei to ETH before setting the quote data
            const ethAmount = ethers.utils.formatEther(response.data.dstAmount);
            console.log("ethAmount", ethAmount);
            setQuoteData(ethAmount);
        }
        console.log(response.data);
    } catch (error) {
        console.error(error);
        setQuoteData({ error: 'Failed to fetch quote' });
    } finally {
        setIsLoading(false);
    }
};

useEffect(() => {
    if (bnbAmount && destAddress) {
        fetchData();
    }
}, [bnbAmount, destAddress]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/1inch-proxy?address=${destAddress}`
        );
        setApiResponse(response.data);
        console.log("API Response:", response.data);
      } catch (error) {
        console.error("API Error:", error);
        setApiResponse({ error: "Failed to fetch token data" });
      } finally {
        setIsLoading(false);
      }
    };

    if (showAdditionalUI) {
      fetchData();
    }
  }, [showAdditionalUI]);

  const ResData = apiResponse;
  console.log("====================================");
  console.log(ResData);
  console.log("====================================");

  const handleContinue = () => {
    setShowAdditionalUI(true);
  };

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-200 via-pink-100 to-yellow-100 text-gray-800 flex items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 bg-white">
        <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-300/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl animate-pulse" />
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-pink-300/20 rounded-full translate-x-1/2 blur-2xl animate-pulse delay-75" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-yellow-300/20 rounded-full translate-y-1/2 blur-2xl animate-pulse delay-150" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-100 to-yellow-300 rounded-2xl blur opacity-70" />
        {/* Main card */}
        <div className="relative bg-white shadow-2xl rounded-2xl p-6 space-y-4 border border-white">
          {/* Connect Button */}
          <div className="flex justify-end mb-2">
            <ConnectButton />
          </div>
          {!showAdditionalUI && (
            <div className="">
              <p>Buy DOGE tokens with BNB in one-click</p>
            </div>
          )}
          {!showAdditionalUI && (
            <div className="">
              {/* Main card */}
              <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4 border border-gray-200">
                {/* Points Display */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Your Points</p>
                    <div className="text-3xl font-bold text-gray-900">
                      {points || 0}
                    </div>
                  </div>
                </div>

                {/* Memecoin Card */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  {/* Token Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={
                        apiResponse?.LogoURI ||
                        "https://res.cloudinary.com/dvddnptpi/image/upload/v1739379832/frfgvnra42g6x7ovmana.webp"
                      }
                      alt="Token Logo"
                      className="w-16 h-16 rounded-full border-2 border-white shadow-sm"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {apiResponse?.name || "Loading..."}
                      </h3>
                      <p className="text-gray-600">
                        {apiResponse?.symbol || "MEME"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4">
                    Buy {apiResponse?.symbol || "meme"} tokens with BNB in one
                    click and earn points!
                  </p>

                  {/* Button */}
                  <button
                    className="w-full flex items-center justify-center p-3 rounded-xl font-semibold
                         bg-blue-600 text-white
                         hover:bg-blue-700 active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
                    onClick={handleContinue}
                  >
                    <span className="mr-2">Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats Cards */}
                {/* <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-200">
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="font-bold text-gray-900">${apiResponse?.price || "0.00"}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center border border-gray-200">
              <p className="text-sm text-gray-600">24h Volume</p>
              <p className="font-bold text-gray-900">${apiResponse?.volume24h || "0.00"}</p>
            </div>
          </div> */}

                {/* Footer */}
                <div className="pt-4">
                  <p className="text-center text-sm font-medium text-gray-600">
                    Powered by winks.fun
                  </p>
                </div>
              </div>
            </div>
          )}
          {showAdditionalUI && (
            <>
              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-center text-sm justify-center gap-2 p-4 mt-2 text-red-600 bg-red-50 rounded-xl border border-red-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errorMessage}
                </div>
              )}
              {showAdditionalUI && (
                <div className="p-2 px-4 rounded-xl bg-gradient-to-r from-cyan-50 via-pink-50 to-yellow-50 shadow-lg border border-white/50">
                  <div className="flex flex-col items-start justify-between space-y-2">
                    {" "}
                    {/* Changed to flex-col */}
                    <div className=" flex items-center space-x-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 rounded-full blur-sm animate-pulse" />
                        <img
                          src="https://res.cloudinary.com/dvddnptpi/image/upload/v1739379832/frfgvnra42g6x7ovmana.webp"
                          alt="Token Logo"
                          className="relative w-10 h-10 rounded-full border-2 border-white shadow-lg"
                        />
                      </div>
                      <div>
                        <p className="text-gray-800 font-bold">BNB </p>
                        <p className="text-gray-500 text-sm">BNB </p>
                      </div>
                    </div>
                    <input
                      type="number"
                      placeholder="Enter BNB amount"
                      value={bnbAmount}
                      onChange={handleBnbAmountChange}
                      className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                  </div>
                </div>
              )}
              {apiResponse && (
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-lg border border-white">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 rounded-full blur-sm animate-pulse" />
                      <img
                        src={apiResponse.LogoURI}
                        alt="Token Logo"
                        className="relative w-10 h-10 rounded-full border-2 border-white shadow-lg"
                      />
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">
                        {apiResponse.symbol}
                      </p>
                      <p className="text-gray-500 text-sm">
                        {apiResponse.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">
                        {quoteData ? quoteData : "0.00"}
                      </p>
                   
                    </div>
                  </div>
                </div>
              )}
              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="w-full py-4 rounded-xl font-bold transition-all duration-300 transform bg-gradient-to-r from-cyan-400 via-pink-300 to-yellow-300 text-white hover:opacity-90 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Swap
              </button>
            </>
          )}

          {/* Footer */}
          <div className="pt-2">
            <p className="text-center text-sm font-medium bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Powered by winks.fun
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolanaSwapUI;
