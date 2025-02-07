"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { ConnectButton } from '../../providers';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

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
    <div className="min-h-screen bg-gradient-to-t from-customStart to-customEnd/50 font-mono text-white">
      <div className="flex justify-center items-center min-h-screen max-w-[500px] mx-auto">
        <div className="bg-customGrayFill/50 h-fit rounded w-full p-10">
          <div className="flex justify-end mb-6">
            <ConnectButton />
          </div>
          
          <div className="mb-6">
            <div className="mb-2">Recipient's wallet address</div>
            <input
              className="w-full p-2 bg-transparent border border-customGrayStroke placeholder-slate-500 rounded cursor-not-allowed opacity-75 text-sm"
              value={recipientAddress}
              disabled
            />
          </div>
          
          <div className="mb-6">
            <div className="mb-2">Enter amount</div>
            <input
              type="number"
              className="w-full p-2 bg-transparent border border-customGrayStroke placeholder-slate-500 rounded"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button
            className="bg-customButtonStroke p-2 w-full rounded relative disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleDonate}
            disabled={!isConnected || isLoading || isTransactionPending || !amount}
          >
            {isLoading || isTransactionPending ? (
              <>
                <span className="opacity-0">Donate</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              </>
            ) : !isConnected ? (
              'Connect Wallet to Donate'
            ) : !amount ? (
              'Enter Amount'
            ) : (
              'Donate'
            )}
          </button>
          <p className="text-center pt-4">Powered by winks.fun</p>
        </div>
      </div>
    </div>
  );
}