"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Wallet, Copy, ExternalLink } from 'lucide-react';

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
    symbol: 'SOL',
    balance: 10.5,
    icon: ''
  });

  const [toToken, setToToken] = useState<Token>({
    symbol: 'USDC',
    balance: 250.75,
    icon: ''
  });

  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<string>('');
  const [isFetchingQuote, setIsFetchingQuote] = useState<boolean>(false); 
  const [quoteResponse, setQuoteResponse] = useState<QuoteResponse | null>(null);

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
        setToAmount(''); // Clear toAmount if fromAmount is empty
        return;
      }

      setIsFetchingQuote(true); // Start preloader
      try {
        const response = await fetch(
          `https://api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=${parseFloat(fromAmount) * 100000000}&slippageBps=50&restrictIntermediateTokens=true`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Quote Response:", data);
        setToAmount(data.outAmount);
        setQuoteResponse(data);
      } catch (error) {
        console.error("Error fetching Jupiter quote:", error);
        setToAmount('Error fetching quote'); 
        setQuoteResponse(null);
      } finally {
        setIsFetchingQuote(false); 
      }
    };

    fetchJupiterQuote();
  }, [fromAmount]);

  const handleSwap = async () => {
    if (!quoteResponse || !walletAddress) return;

    setIsSwapping(true);
    try {
      const swapResponse = await fetch('https://api.jup.ag/swap/v1/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: walletAddress,
          dynamicComputeUnitLimit: true,
          dynamicSlippage: true,
            prioritizationFeeLamports: {
              priorityLevelWithMaxLamports: {
                maxLamports: 1000000,
                priorityLevel: "veryHigh"
              }
            }
        })
      });

      if (!swapResponse.ok) {
        throw new Error(`HTTP error! status: ${swapResponse.status}`);
      }

      const swapResult = await swapResponse.json();
      console.log("Swap Response:", swapResult);
      // Here you would typically handle the swap result, e.g., show a success message
    } catch (error) {
      console.error("Error during swap:", error);
      // Handle the error, e.g., show an error message to the user
    } finally {
      setIsSwapping(false);
    }
  };


  // const handleSwap = () => {
  //   setIsSwapping(true);
  //   setTimeout(() => {
  //     setIsSwapping(false);
  //   }, 2000);
  // };

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
      window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank');
    }
  };

  const checkIfWalletIsConnected = async () => {
    if (typeof window !== 'undefined' && window.solana?.isPhantom) {
      try {
        const resp = await window.solana.connect({ onlyIfTrusted: true });
        setWalletAddress(resp.publicKey.toString());
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.solana) {
      try {
        const resp = await window.solana.connect();
        setWalletAddress(resp.publicKey.toString());
      } catch (error) {
        console.error("Error connecting to wallet:", error);
      }
    } else {
      alert("Solana object not found! Install Phantom Wallet or another compatible wallet.");
    }
  };

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] font-mono text-gray-800 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6 border-y-4 border-x border-indigo-500">
        <div className="flex justify-end">
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-indigo-200">
              <Wallet className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
              </span>
              <div className="flex gap-1">
                <div className="relative">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={copyToClipboard}
                    onMouseEnter={() => setShowTooltip('copy')}
                    onMouseLeave={() => setShowTooltip('')}
                  >
                    <Copy className="h-4 w-4 text-gray-500 hover:text-indigo-600" />
                  </button>
                  {showTooltip === 'copy' && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded">
                      {isCopied ? 'Copied!' : 'Copy address'}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={openInExplorer}
                    onMouseEnter={() => setShowTooltip('explorer')}
                    onMouseLeave={() => setShowTooltip('')}
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500 hover:text-indigo-600" />
                  </button>
                  {showTooltip === 'explorer' && (
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
          </div>

          <button
            className={`w-full py-3 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              !fromAmount || !walletAddress
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
            onClick={handleSwap}
            disabled={!fromAmount || isSwapping || !walletAddress}
          >
            {isSwapping ? 'Swapping...' : 'Swap'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          Powered by winks.fun
        </p>
      </div>
    </div>
  );
};

export default SolanaSwapUI;
