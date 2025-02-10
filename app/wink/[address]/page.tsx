"use client";
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface Token {
  symbol: string;
  balance: number;
  icon: string;
}

const SolanaSwapUI: React.FC = () => {
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

  const handleSwapTokens = () => {
    // Only swap tokens, not amounts
    const tempToken = { ...fromToken };
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Recalculate toAmount based on new token positions
    if (fromAmount) {
      setToAmount((parseFloat(fromAmount) * 1.02).toFixed(2));
    }
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromAmount(value);
    setToAmount((parseFloat(value) * 1.02).toFixed(2));
  };

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] font-mono text-gray-800 flex items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6 border-y-4 border-x border-indigo-500">
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
              className="bg-white border-2 border-indigo-300 rounded-full p-2 hover:bg-indigo-50 transition"
            >
              <RefreshCw className="text-indigo-600" size={20} />
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
                placeholder="0"
                value={toAmount}
                readOnly
              />
              <div className="flex items-center bg-indigo-100 rounded-full px-3 py-1">
                <span className="text-2xl mr-2">{toToken.icon}</span>
                <span>{toToken.symbol}</span>
              </div>
            </div>
          </div>

          <button
            className={`w-full py-3 rounded-lg text-white transition-all duration-300 ${
              !fromAmount 
                ? 'bg-indigo-300 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
            }`}
            onClick={handleSwap}
            disabled={!fromAmount || isSwapping}
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