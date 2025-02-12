"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Wallet, Copy, ExternalLink } from "lucide-react";
import {
  VersionedTransaction,
  PublicKey,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWalletClient, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import axios from "axios";
import { useParams } from "next/navigation";

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

  const { isConnected , address} = useAccount();
  const params = useParams();
  const destAddress = params.address;

  

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
  };

  const swapParams = {
    src: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", // Token address of 1INCH
    dst: destAddress, // Token address of DAI
    amount: "1000000", // Amount of 1INCH to swap (in wei)
    from: address,
    slippage: 1, // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
    disableEstimate: false, // Set to true to disable estimation of swap details
    allowPartialFill: false // Set to true to allow partial filling of the swap order
  };

  const chainId = 56;

  const broadcastApiUrl = "https://api.1inch.dev/tx-gateway/v1.1/" + chainId + "/broadcast";
const apiBaseUrl = "https://api.1inch.dev/swap/v6.0/" + chainId;


// Construct full API request URL
function apiRequestUrl(methodName:any, queryParams:any) {
  return apiBaseUrl + methodName + "?" + new URLSearchParams(queryParams).toString();
}

// Post raw transaction to the API and return transaction hash
async function broadCastRawTransaction(rawTransaction:any) {
  return fetch(broadcastApiUrl, {
    method: "post",
    body: JSON.stringify({ rawTransaction }),
    headers: { "Content-Type": "application/json", Authorization: "Bearer uzF2lXeO9pYtpjthDs0ltrkVwDcup6bd" }
  })
    .then((res) => res.json())
    .then((res) => {
      return res.transactionHash;
    });
}


// async function buildTxForSwap(swapParams:any) {
//   const url = apiRequestUrl("/swap", swapParams);

//   // Fetch the swap transaction details from the API
//   return fetch(url, { headers: { "Content-Type": "application/json", Authorization: "Bearer uzF2lXeO9pYtpjthDs0ltrkVwDcup6bd" } })
//     .then((res) => res.json())
//     .then((res) => res.tx);
// }
const { data: walletClient } = useWalletClient();


async function signAndSendTransaction(transaction: any) {
  try {
    
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    // Prepare the transaction
    const tx = {
      to: transaction.to as `0x${string}`,
      value: transaction.value.toString(),
      data: (transaction.data || '0x') as `0x${string}`,
    };

    const hash = await walletClient.sendTransaction(tx);
    return hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}

// If you need to wait for transaction confirmation, you can use this helper
async function waitForTransaction(hash: string) {
  const { createPublicClient, http } = await import('viem');
  const { bsc } = await import('viem/chains');
  
  const client = createPublicClient({
    chain: bsc,
    transport: http()
  });
  
  const { waitForTransactionReceipt } = await import('viem/actions');
  const receipt = await waitForTransactionReceipt(client, { hash });
  return receipt;
}



  const handleSwap = async () => 
  {
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
      const response = await axios.post('/api/swap-proxy', {
        url: url
      });
      
      return response.data.tx;
    } catch (error) {
      console.error("Error in buildTxForSwap:", error);
      throw error;
    }
  }
  




  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] font-mono text-gray-800 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-4 space-y-3 border-y-4 border-x border-indigo-500">
        <div className="flex justify-end">
        
           <ConnectButton />

        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-2 px-4 rounded-lg border border-indigo-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-sm text-gray-600">
                Balance: {fromToken.balance} {fromToken.symbol}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                className="w-full bg-transparent text-lg focus:outline-none"
                placeholder="0"
                value={fromAmount}
                onChange={handleFromAmountChange}
              />
              <div className="flex items-center bg-indigo-100 rounded-full px-3 py-1">
                {/* <span className="text-2xl mr-2">{fromToken.icon}</span> */}
                <span className=" text-sm">{fromToken.symbol}</span>
              </div>
            </div>
            {tokenPrices &&
              tokenPrices["So11111111111111111111111111111111111111112"] && (
                <div className="text-xs text-gray-500 mt-1">
                  Price: $
                  {tokenPrices["So11111111111111111111111111111111111111112"]}
                </div>
              )}
          </div>

          <div className="flex justify-center">
           
          </div>

          <div className="bg-gray-50 p-2 px-4 rounded-lg border border-indigo-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">To</span>
              <span className="text-sm text-gray-600">
                Balance: {toToken.balance} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                className="w-full bg-transparent text-lg focus:outline-none"
                placeholder={isFetchingQuote ? "..." : "0"}
                readOnly
              />
              <div className="flex items-center bg-indigo-100 rounded-full px-3 py-1">
                {/* <span className="text-2xl mr-2">{toToken.icon}</span> */}
                <span className=" text-sm">{toToken.symbol}</span>
              </div>
            </div>
            {tokenPrices &&
              tokenPrices["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"] && (
                <div className="text-xs text-gray-500 mt-1">
                  Price: $
                  {tokenPrices["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]}
                </div>
              )}
          </div>
          {errorMessage && (
            <div className="flex items-center text-sm justify-center gap-2 p-3 mt-2 text-red-600 bg-red-100 rounded-lg">
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

          {successMessage && signatureLink && (
            <div className="flex items-center justify-center text-sm gap-2 p-3 mt-2 text-green-600 bg-green-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">{successMessage}</span>
              <a
                href={signatureLink}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:underline"
              >
                View on Solscan
              </a>
            </div>
          )}

          <button
            onClick={ handleSwap }
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            // disabled={isSwapping || isSigning || !fromAmount}
          >
swap          </button>
        </div>
        <div className="">
          <p className=" text-indigo-600 text-sm text-center">Powered by winks.fun</p>
        </div>
      </div>
    </div>
  );
};

export default SolanaSwapUI;
