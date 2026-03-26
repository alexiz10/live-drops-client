import React from "react";
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useAuctionStore } from "../lib/ws-store";
import { useAuthStore } from "../lib/store";
import {useAuctionDetails, usePlaceBid} from "../hooks/use-auctions.ts";
import {getDynamicImage} from "../lib/utils.ts";

export const Route = createFileRoute('/auctions/$auctionId')({
  component: LiveAuctionRoom,
})

function LiveAuctionRoom() {
  const { auctionId } = Route.useParams();
  const auth = useAuthStore();
  const {
    currentPrice: wsCurrentPrice,
    highestBidderId: wsHighestBidderId,
    highestBidderEmail: wsHighestBidderEmail,
    timeRemaining,
    isEnded,
    isConnected,
    connect,
    disconnect,
  } = useAuctionStore();

  const [bidAmount, setBidAmount] = useState<string>("")
  const [bidError, setBidError] = useState<string | null>(null);

  const { data: auctionData, isLoading: isAuctionLoading, isError } = useAuctionDetails(auctionId);
  const placeBidMutation = usePlaceBid(auctionId);

  useEffect(() => {
    connect(auctionId);
    return () => disconnect();
  }, [auctionId, connect, disconnect])

  const handleBidSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setBidError(null);
    if (!bidAmount || isNaN(Number(bidAmount))) {
      setBidError("Please enter a valid amount");
      return;
    }
    placeBidMutation.mutate(bidAmount, {
      onSuccess: () => {
        setBidAmount("");
        setBidError(null);
      },
      onError: (error: any) => {
        setBidError(error.response?.data?.detail || "Failed to place bid");
      }
    })
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
  const displayHighestBidderId = wsHighestBidderId || auctionData.highest_bidder_id;
  const displayHighestBidderEmail = wsHighestBidderEmail || auctionData.highest_bidder_email || 'No bids yet';

  const currentUserId = auth.status === 'authenticated' ? auth.userId : null;
  const hasBids = displayHighestBidderId !== null;
  const isWinning = currentUserId && currentUserId === displayHighestBidderId;
  const isLosing = currentUserId && hasBids && currentUserId !== displayHighestBidderId;

  const renderBiddingTerminal = () => (
    <div className="flex flex-col gap-4">
      {displayIsEnded ? (
        <div className={`p-4 rounded-xl text-center font-bold text-sm ${isWinning ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-100 text-zinc-500'}`}>
          {isWinning ? '🎉 You won this auction!' : 'Auction Ended'}
        </div>
      ) : isWinning ? (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center font-bold text-sm border border-emerald-200">
          You are the highest bidder
        </div>
      ) : isLosing ? (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-center font-bold text-sm border border-red-200">
          You have been outbid!
        </div>
      ) : null}

      {displayIsEnded ? null : auth.status === "authenticated" ? (
        <form onSubmit={handleBidSubmit} noValidate className="flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-lg">$</span>
            <input
              type="number"
              step="0.01"
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
              className="w-full pl-8 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black focus:border-black text-xl font-black text-zinc-900 transition-all outline-none"
              placeholder="0.00"
              disabled={placeBidMutation.isPending}
            />
          </div>
          {bidError ? <p className="text-red-500 text-sm font-medium px-2">{bidError}</p> : null}
          <button
            type="submit"
            disabled={placeBidMutation.isPending}
            className="w-full bg-black cursor-pointer text-white p-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl  shadow-black/10"
          >
            {placeBidMutation.isPending ? "Processing..." : "Place Bid"}
          </button>
        </form>
      ) : (
        <div className="p-4 bg-zinc-100 text-zinc-500 rounded-2xl text-center font-medium text-sm">
          Please sign in to place a bid.
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white min-h-[calc(100vh-73px)] pb-52 md:pb-12">
      <div className="max-w-7xl mx-auto md:px-6 md:py-8 flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="w-full md:w-[60%] lg:w-[65%] flex flex-col gap-6">
          <div className="w-full aspect-square md:aspect-4/3 bg-zinc-100 md:rounded-4xl overflow-hidden relative group">
            <img src={getDynamicImage(auctionData.id, auctionData.title)} alt={auctionData.title} className="size-full object-cover" />

            <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
              <div className={`size-2 rounded-full ${isConnected && !displayIsEnded ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`} />
              <span className="text-xs font-bold text-zinc-900 tracking-wide uppercase">
                {displayIsEnded ? 'Ended' : isConnected ? 'Live' : 'Connecting'}
              </span>
            </div>
          </div>

          <div className="px-5 md:px-0">
            <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.1] mb-6">
              {auctionData.title}
            </h1>

            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 text-lg leading-relaxed whitespace-pre-wrap">
                {auctionData.description}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-[40%] lg:w-[35%] px-5 md:px-0">
          <div className="md:sticky md:top-24 flex flex-col gap-6">
            <div className="bg-white md:bg-zinc-50 md:border border-zinc-200 rounded-4xl md:p-8 flex flex-col gap-6">
              <div>
                <p className="text-zinc-500 font-semibold text-sm uppercase tracking-wider mb-2">Current Bid</p>
                <motion.div
                  key={displayPrice}
                  initial={{ scale: 1.05, color: '#10b981' }}
                  animate={{ scale: 1, color: '#09090b' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="text-5xl lg:text-6xl font-black tracking-tighter"
                >
                  ${Number(displayPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </motion.div>

                {displayHighestBidderEmail && !displayIsEnded ? (
                  <div className="mt-3 inline-flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Highest Bidder</span>
                    <span className="text-xs font-bold text-zinc-900">{displayHighestBidderEmail}</span>
                  </div>
                ) : null}
              </div>

              <div className="h-px w-full bg-zinc-200" />

              <div>
                <p className="text-zinc-500 font-semibold text-sm uppercase tracking-wider mb-2">Time Remaining</p>
                <div className={`text-3xl font-bold tracking-tight ${displayTime && displayTime <= 60 && !displayIsEnded ? 'text-red-500 animate-pulse' : 'text-zinc-900'}`}>
                  {formatTime(displayTime)}
                </div>
              </div>

              <div className="hidden md:block mt-2">
                {renderBiddingTerminal()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-zinc-200 p-4 pb-safe shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-50">
        {renderBiddingTerminal()}
      </div>
    </div>
  );
}
