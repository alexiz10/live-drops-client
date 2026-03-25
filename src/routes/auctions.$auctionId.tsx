import React from "react";
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import {useMutation, useQuery} from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuctionStore } from "../lib/ws-store";
import { useAuthStore } from "../lib/store";
import { api } from "../lib/api";

export const Route = createFileRoute('/auctions/$auctionId')({
  component: LiveAuctionRoom,
})

function LiveAuctionRoom() {
  const { auctionId } = Route.useParams();
  const auth = useAuthStore();
  const {
    currentPrice: wsCurrentPrice,
    timeRemaining,
    isEnded,
    isConnected,
    connect,
    disconnect,
  } = useAuctionStore();

  const [bidAmount, setBidAmount] = useState<string>("")
  const [bidError, setBidError] = useState<string | null>(null);

  const { data: auctionData, isLoading: isAuctionLoading, isError } = useQuery({
    queryKey: ['auction', auctionId],
    queryFn: async () => {
      const response = await api.get(`/auctions/${auctionId}`);
      return response.data;
    }
  })

  useEffect(() => {
    connect(auctionId);
    return () => disconnect();
  }, [auctionId, connect, disconnect])

  const placeBidMutation = useMutation({
    mutationFn: async (amount: string) => {
      const response = await api.post(`/auctions/${auctionId}/bids`, {
        amount: parseFloat(amount),
      })
      return response.data;
    },
    onSuccess: () => {
      setBidAmount("");
      setBidError(null);
    },
    onError: (error: any) => {
      setBidError(error.response?.data?.detail || "Failed to place bid");
    }
  })

  const handleBidSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setBidError(null);
    if (!bidAmount || isNaN(Number(bidAmount))) {
      setBidError("Please enter a valid amount");
      return;
    }
    placeBidMutation.mutate(bidAmount);
  }

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    if (seconds <= 0) return '00:00';

    const y = Math.floor(seconds / 31_536_000);
    const mo = Math.floor((seconds % 31_536_000) / 2_592_000);
    const w = Math.floor((seconds % 2_592_000) / 604_800);
    const d = Math.floor((seconds % 604_800) / 86_400);
    const h = Math.floor((seconds % 86_400) / 3_600);
    const m = Math.floor((seconds % 3_600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (y > 0) parts.push(`${y}y`);
    if (mo > 0) parts.push(`${mo}mo`);
    if (w > 0) parts.push(`${w}w`);
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);

    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    if (parts.length > 0) {
      return `${parts.join(' ')} ${mStr}m ${sStr}s`;
    }

    return `${mStr}:${sStr}`;
  }

  if (isAuctionLoading) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 flex justify-center">
        <div className="animate-pulse text-xl text-gray-500 font-medium">Loading auction details...</div>
      </div>
    );
  }

  if (isError || !auctionData) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-8 bg-red-50 text-red-700 rounded-xl text-center">
        Auction not found or failed to load.
      </div>
    );
  }

  const calculateInitialTime = () => {
    const end = new Date(auctionData.end_time).getTime();
    const now = Date.now();
    const remainingSeconds = Math.floor((end - now) / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  }

  const displayPrice = wsCurrentPrice || auctionData?.current_price || '---.--';

  const displayTime = timeRemaining !== null ? timeRemaining : calculateInitialTime();

  const displayIsEnded = isEnded || displayTime <= 0;

  return (
    <div className="max-w-4xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">{auctionData.title}</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isConnected ? '● Live' : '○ Disconnected'}
          </div>
        </div>
        <p className="text-gray-600 mb-8">
          {auctionData.description}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <p className="text-sm font-medium text-gray-500 mb-1">Time Remaining</p>
            <p className={`text-4xl font-mono font-bold ${displayTime && displayTime <= 60 ? 'text-red-600' : 'text-gray-900'}`}>
              {formatTime(displayTime)}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 overflow-hidden">
            <p className="text-sm font-medium text-gray-500 mb-1">Current Price</p>
            <motion.p
              key={displayPrice}
              initial={{ scale: 1.1, color: "#16a34a" }}
              animate={{ scale: 1, color: "#111827" }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-mono font-bold text-gray-900"
            >
              ${displayPrice}
            </motion.p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Place a Bid</h2>

        {displayIsEnded ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl font-medium text-center border border-red-100">
            Auction has ended!
          </div>
        ) : auth.status === "authenticated" ? (
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  className="w-full pl-8 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 text-lg font-bold"
                  placeholder="0.00"
                  disabled={placeBidMutation.isPending}
                />
              </div>
              {bidError ? (
                <p className="text-red-600 text-sm mt-2">{bidError}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={placeBidMutation.isPending}
              className="w-full bg-indigo-600 cursor-pointer text-white p-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {placeBidMutation.isPending ? "Submitting..." : "Submit Bid"}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 text-gray-600 p-4 rounded-xl text-center border border-gray-100">
            You must be signed in to bid.
          </div>
        )}
      </div>
    </div>
  )
}
