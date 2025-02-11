"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, Wallet, Copy, ExternalLink } from "lucide-react";
import {
  VersionedTransaction,
  PublicKey,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";

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

interface SolanaWindow extends Window {
  solana?: {
    connect: () => Promise<{ publicKey: PublicKey }>;
    disconnect: () => Promise<void>;
    isPhantom: boolean;
    signTransaction: (
      transaction: VersionedTransaction
    ) => Promise<VersionedTransaction>;
    signAllTransactions: (
      transactions: VersionedTransaction[]
    ) => Promise<VersionedTransaction[]>;
    on: (event: string, callback: (args: any) => void) => void;
    removeListener: (event: string, callback: (args: any) => void) => void;
  };
}

declare const window: SolanaWindow;

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

  const handleSwapTokens = () => {
    const tempToken = { ...fromToken };
    setFromToken(toToken);
    setToToken(tempToken);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
  };

  useEffect(() => {
    const fetchJupiterQuote = async () => {
      if (!fromAmount) {
        setToAmount("");
        setQuoteResponse(null);
        return;
      }

      setIsFetchingQuote(true);
      try {
        const response = await fetch(
          `https://api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${
            parseFloat(fromAmount) * 100000000
          }&slippageBps=50&restrictIntermediateTokens=true`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Quote Response:", data);
        setToAmount(data.outAmount);
        setQuoteResponse(data);
        setErrorMessage(null); // Clear any previous error message
      } catch (error) {
        console.error("Error fetching Jupiter quote:", error);
        setToAmount("Error fetching quote");
        setQuoteResponse(null);
        // setErrorMessage(error.message || "Failed to fetch quote");
      } finally {
        setIsFetchingQuote(false);
      }
    };

    fetchJupiterQuote();
  }, [fromAmount]);

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const priceResponse = await fetch(
          "https://api.jup.ag/price/v2?ids=JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN,So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
        );
        if (!priceResponse.ok) {
          throw new Error(`HTTP error! status: ${priceResponse.status}`);
        }
        const priceData = await priceResponse.json();
        console.log("Price Data:", priceData);

        // Extract prices and store them in the state
        const prices: { [key: string]: number } = {};
        if (priceData.data) {
          Object.values(priceData.data).forEach((token: any) => {
            prices[token.id] = parseFloat(token.price);
          });
          setTokenPrices(prices);
        } else {
          console.error("Price data structure is unexpected:", priceData);
        }
      } catch (error) {
        console.error("Error fetching token prices:", error);
      }
    };

    fetchTokenPrices();
  }, []);

  const handleSwap = async () => {
    if (!quoteResponse || !walletAddress) {
      setErrorMessage("Quote response or wallet address missing.");
      return;
    }
    setIsSwapping(true);
    setIsSigning(true);
    setErrorMessage(null);
    setSuccessMessage(null); // Clear any previous success message
    setSignatureLink(null);

    try {
      const swapResponse = await fetch("https://api.jup.ag/swap/v1/swap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: walletAddress,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
          prioritizationFeeLamports: 0,
          // {
          //   priorityLevelWithMaxLamports: {
          //     maxLamports: 1000000,
          //     priorityLevel: "veryHigh"
          //   }
          // }
        }),
      });
      if (!swapResponse.ok) {
        const errorData = await swapResponse.json();
        throw new Error(
          `HTTP error! status: ${swapResponse.status}, message: ${
            errorData.message || "Unknown error"
          }`
        );
      }

      const swapResult = await swapResponse.json();
      console.log("Swap Response:", swapResult);

      if (swapResult.swapTransaction) {
        const transactionBase64 = swapResult.swapTransaction;
        //const transactionBytes = Buffer.from(transactionBase64, 'base64');  //Original Code
        const transactionBytes = Buffer.from(
          transactionBase64,
          "base64"
        ).values(); //Updated Code

        // Deserialize the transaction
        let transaction: VersionedTransaction;
        try {
          //transaction = VersionedTransaction.deserialize(transactionBytes);  //Original Code
          transaction = VersionedTransaction.deserialize(
            new Uint8Array(transactionBytes)
          ); //Updated Code
        } catch (deserializationError) {
          console.error(
            "Transaction deserialization error:",
            deserializationError
          );
          setErrorMessage(
            `Transaction deserialization failed: ${
              deserializationError.message || "Unknown error"
            }`
          );
          return;
        }

        console.log("Deserialized Transaction:", transaction);

        if (window.solana) {
          try {
            // Get latest blockhash
            const latestBlockhash = await connection.getLatestBlockhash();

            // Update the transaction's message
            transaction.message.recentBlockhash = latestBlockhash.blockhash;

            //  Sign the transaction
            const signedTransaction = await window.solana.signTransaction(
              transaction
            );

            //  Log the signed transaction and signature
            console.log("signedTransaction", signedTransaction);

            //  Send the transaction
            const signature = await connection.sendRawTransaction(
              signedTransaction.serialize()
            );

            console.log("Transaction Signature", signature);

            //  Confirm the transaction
            const confirmation = await connection.confirmTransaction(signature);

            //  Log the transaction confirmation
            console.log("Transaction Confirmation", confirmation);

            console.log(`Transaction completed: ${signature}`);
            setErrorMessage(null);
            setSuccessMessage("Transaction completed!");
            setSignatureLink(`https://solscan.io/tx/${signature}`);
          } catch (signingError) {
            console.error("Signing error", signingError);
            setErrorMessage(
              `Transaction signing failed: ${
                signingError.message || "Unknown error"
              }`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error during swap:", error);
      setErrorMessage(`Swap failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsSwapping(false);
      setIsSigning(false);
    }
  };

  // const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  const connection = new Connection(
    "https://muddy-fabled-sunset.solana-mainnet.quiknode.pro/435d00ad7febaa296fef61977d1e0832b9472652",
    "confirmed"
  );

  const toAmountFormat = parseFloat(toAmount) / 100000;

  const copyToClipboard = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const openInExplorer = () => {
    if (walletAddress) {
      window.open(
        `https://explorer.solana.com/address/${walletAddress}`,
        "_blank"
      );
    }
  };

  const checkIfWalletIsConnected = async () => {
    if (typeof window !== "undefined" && window.solana?.isPhantom) {
      try {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        setWalletAddress(resp.publicKey.toString());
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.solana) {
      try {
        const resp = await window.solana.connect();
        setWalletAddress(resp.publicKey.toString());
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert(
        "Solana object not found! Install Phantom Wallet or another compatible wallet."
      );
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  let buttonText = "Swap";
  if (!walletAddress) {
    buttonText = "Connect Wallet";
  } else if (!fromAmount) {
    buttonText = "Enter Amount";
  } else if (isSwapping) {
    buttonText = "Swapping...";
  } else if (isSigning) {
    buttonText = "Signing...";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] font-mono text-gray-800 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6 border-y-4 border-x border-indigo-500">
        <div className="flex justify-end">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-indigo-200">
              <Wallet className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">
                {walletAddress.substring(0, 6)}...
                {walletAddress.substring(walletAddress.length - 4)}
              </span>
              <div className="flex gap-1">
                <div className="relative">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={copyToClipboard}
                    onMouseEnter={() => setShowTooltip("copy")}
                    onMouseLeave={() => setShowTooltip("")}
                  >
                    <Copy className="h-4 w-4 text-gray-500 hover:text-indigo-600" />
                  </button>
                  {showTooltip === "copy" && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded">
                      {isCopied ? "Copied!" : "Copy address"}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={openInExplorer}
                    onMouseEnter={() => setShowTooltip("explorer")}
                    onMouseLeave={() => setShowTooltip("")}
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500 hover:text-indigo-600" />
                  </button>
                  {showTooltip === "explorer" && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded">
                      View in Explorer
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-indigo-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">From</span>
              <span className="text-sm text-gray-600">
                Balance: {fromToken.balance} {fromToken.symbol}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                className="w-full bg-transparent text-2xl focus:outline-none"
                placeholder="0"
                value={fromAmount}
                onChange={handleFromAmountChange}
              />
              <div className="flex items-center bg-indigo-100 rounded-full px-3 py-1">
                <span className="text-2xl mr-2">{fromToken.icon}</span>
                <span>{fromToken.symbol}</span>
              </div>
            </div>
            {tokenPrices && tokenPrices["So11111111111111111111111111111111111111112"] && (
              <div className="text-xs text-gray-500 mt-1">
                Price: $
                {
                  tokenPrices["So11111111111111111111111111111111111111112"]
                }
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSwapTokens}
              className="p-2 rounded-full hover:bg-indigo-50 border-2 border-indigo-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4 text-indigo-600" />
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-indigo-300">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">To</span>
              <span className="text-sm text-gray-600">
                Balance: {toToken.balance} {toToken.symbol}
              </span>
            </div>
            <div className="flex items-center">
              <input
                type="number"
                className="w-full bg-transparent text-2xl focus:outline-none"
                placeholder={isFetchingQuote ? "..." : "0"}
                value={toAmountFormat}
                readOnly
              />
              <div className="flex items-center bg-indigo-100 rounded-full px-3 py-1">
                <span className="text-2xl mr-2">{toToken.icon}</span>
                <span>{toToken.symbol}</span>
              </div>
            </div>
            {tokenPrices &&
              tokenPrices["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"] && (
                <div className="text-xs text-gray-500 mt-1">
                  Price: $
                  {
                    tokenPrices["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"]
                  }
                </div>
              )}
          </div>
          {errorMessage && (
            <div className="flex items-center justify-center gap-2 p-3 mt-2 text-red-600 bg-red-100 rounded-lg">
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

          {successMessage && (
            <div className="flex items-center justify-center gap-2 p-3 mt-2 text-green-600 bg-green-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 00-1.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {successMessage}
              {signatureLink && (
                <a
                  href={signatureLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View on Solscan
                </a>
              )}
            </div>
          )}

          <button
            onClick={walletAddress ? handleSwap : connectWallet}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            disabled={isSwapping || isSigning || !fromAmount}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SolanaSwapUI;
