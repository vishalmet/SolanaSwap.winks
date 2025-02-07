"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ConnectButton } from '../../providers';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { DollarSign, Loader2, WalletIcon } from "lucide-react";

export default function DonationPage() {
  const params = useParams();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recipientAddress = params.address || "";

  // Get wallet connection 
  const { isConnected } = useAccount();
  
  // Transaction hooks
  const { sendTransaction } = useSendTransaction();
  const { isLoading: isTransactionPending } = useWaitForTransactionReceipt();

  const handleDonate = async () => {
    if (!amount || !isConnected) return;

    try {
      setIsLoading(true);
      await sendTransaction({
        to: recipientAddress,
        value: parseEther(amount),
      });
    } catch (error) {
      console.error('Transaction failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4f8] to-[#e0e7ff] font-mono text-gray-800 flex items-center justify-center p-4">
    <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8 space-y-6 border-y-4 border-x border-indigo-500">
      <div className="flex justify-end">
        <ConnectButton />
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipient's Wallet Address
          </label>
          <div className="relative">
            <input
              className="w-full p-3 pl-10 bg-gray-50 border-2 border-gray-300 rounded-lg opacity-75 cursor-not-allowed text-sm"
              value={recipientAddress}
              disabled
              prefix={<WalletIcon className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />}
            />
            <WalletIcon className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Amount
          </label>
          <div className="relative">
            <input
              type="number"
              className="w-full p-3 pl-10 bg-gray-50 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              prefix={<DollarSign className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />}
            />
            <DollarSign className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
          </div>
        </div>

        <button
          className={`w-full py-3 rounded-lg text-white transition-all duration-300 flex items-center justify-center ${
            (!isConnected || isLoading || isTransactionPending || !amount)
              ? 'bg-indigo-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
          }`}
          onClick={handleDonate}
          disabled={!isConnected || isLoading || isTransactionPending || !amount}
        >
          {isLoading || isTransactionPending ? (
            <Loader2 className="animate-spin" size={20} />
          ) : !isConnected ? (
            'Connect Wallet to Donate'
          ) : !amount ? (
            'Enter Amount'
          ) : (
            'Donate'
          )}
        </button>
      </div>
      
      <p className="text-center text-xs text-gray-500">Powered by winks.fun</p>
    </div>
  </div>

  );
}