import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";

import { useAuctionStore } from "../lib/ws-store";
import { useAuthStore } from "../lib/store";
import { useAuctionDetails, usePlaceBid, useAuctionBids } from "../hooks/use-auctions";
import { getDynamicImage } from "../lib/utils";

export const Route = createFileRoute("/auctions/$auctionId")({
  component: LiveAuctionRoom,
});

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
  const queryClient = useQueryClient();

  const [now, setNow] = useState(() => Date.now());
  const [bidAmount, setBidAmount] = useState<string>("");
  const [bidError, setBidError] = useState<string | null>(null);
  const [sessionParticipated, setSessionParticipated] = useState<boolean>(false);

  const { data: auctionData, isLoading: isAuctionLoading, isError } = useAuctionDetails(auctionId);
  const { data: initialBids } = useAuctionBids(auctionId);
  const placeBidMutation = usePlaceBid(auctionId);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    connect(auctionId);
    return () => disconnect();
  }, [auctionId, connect, disconnect]);

  const handlePlaceBid = (amount: string) => {
    setBidError(null);
    if (!amount || isNaN(Number(amount))) {
      setBidError("Please enter a valid amount");
      return;
    }
    placeBidMutation.mutate(amount, {
      onSuccess: data => {
        setBidAmount("");
        setBidError(null);
        setSessionParticipated(true);

        if (data && data.is_winner === false) {
          setBidError("You were immediately outbid by a proxy limit!");
        }

        void queryClient.invalidateQueries({ queryKey: ["auctions", auctionId] });
      },
      onError: (error: unknown) => {
        if (isAxiosError(error)) {
          setBidError(error.response?.data?.detail || "Failed to place bid");
        } else if (error instanceof Error) {
          setBidError(error.message);
        } else {
          setBidError("An unexpected error occurred");
        }
      },
    });
  };

  const handleBidSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    handlePlaceBid(bidAmount);
  };

  const formatTime = (seconds: number | null) => {
    if (seconds === null) return "--:--";
    if (seconds <= 0) return "00:00";

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

    const mStr = m.toString().padStart(2, "0");
    const sStr = s.toString().padStart(2, "0");

    if (parts.length > 0) {
      return `${parts.join(" ")} ${mStr}m ${sStr}s`;
    }

    return `${mStr}:${sStr}`;
  };

  const allBids = [...(initialBids || []), ...useAuctionStore(state => state.liveBids)];

  // Deduplicate by timestamp and amount to avoid showing the same bid twice
  const uniqueBids = Array.from(
    new Map(
      allBids.map(bid => {
        const timestamp = new Date(bid.created_at || bid.time).getTime();
        const amount = Number(bid.amount);
        // Use timestamp + amount as unique key
        return [`${timestamp}-${amount}`, { timestamp, amount }];
      }),
    ).values(),
  ).sort((a, b) => a.timestamp - b.timestamp);

  const combinedBids = uniqueBids
    .map((bid, index) => ({
      time: new Date(bid.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      amount: bid.amount,
      index, // Add unique index for each data point
    }))
    .filter((bid, index, array) => {
      // Keep the first bid always
      if (index === 0) return true;
      // Only keep bids where the amount is different from the previous bid
      return bid.amount !== array[index - 1].amount;
    });

  if (combinedBids.length === 0 && auctionData) {
    combinedBids.push({
      time: "Start",
      amount: Number(auctionData.starting_price),
      index: 0,
    });
  }

  if (isAuctionLoading) {
    return (
      <div className="mx-auto mt-8 flex max-w-4xl justify-center p-8">
        <div className="animate-pulse text-xl font-medium text-gray-500">
          Loading auction details...
        </div>
      </div>
    );
  }

  if (isError || !auctionData) {
    return (
      <div className="mx-auto mt-8 max-w-4xl rounded-xl bg-red-50 p-8 text-center text-red-700">
        Auction not found or failed to load.
      </div>
    );
  }

  const calculateInitialTime = () => {
    const end = new Date(auctionData.end_time).getTime();
    const remainingSeconds = Math.floor((end - now) / 1000);
    return remainingSeconds > 0 ? remainingSeconds : 0;
  };

  const displayPrice = wsCurrentPrice || auctionData?.current_price || "---.--";
  const displayTime = timeRemaining !== null ? timeRemaining : calculateInitialTime();
  const displayIsEnded = isEnded || displayTime <= 0;
  const displayHighestBidderId = wsHighestBidderId || auctionData.highest_bidder_id;
  const displayHighestBidderEmail =
    wsHighestBidderEmail || auctionData.highest_bidder_email || "No bids yet";
  const displayHasParticipated = sessionParticipated || auctionData.user_has_participated || false;
  const displayUserMaxBid = auctionData.user_max_bid;

  const currentUserId = auth.status === "authenticated" ? auth.userId : null;
  const hasBids = displayHighestBidderId !== null;
  const isWinning = currentUserId && currentUserId === displayHighestBidderId;
  const isLosing = currentUserId && hasBids && currentUserId !== displayHighestBidderId;

  const renderBiddingTerminal = () => (
    <div className="flex flex-col gap-4">
      {displayIsEnded ? (
        <div
          className={`rounded-xl p-4 text-center text-sm font-bold ${isWinning ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "bg-zinc-100 text-zinc-500"}`}
        >
          {isWinning ? "🎉 You won this auction!" : "Auction Ended"}
        </div>
      ) : isWinning ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-700">
          You are the highest bidder
        </div>
      ) : isLosing && displayHasParticipated ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm font-bold text-red-600">
          You have been outbid!
        </div>
      ) : hasBids && !isWinning ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-100 p-3 text-center text-sm font-bold text-zinc-600">
          Active Proxy War
        </div>
      ) : null}

      {displayUserMaxBid && displayHasParticipated && isWinning ? (
        <div className="rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-center">
          <p className="mb-1 text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            Your Max Bid
          </p>
          <p className="text-lg font-bold text-zinc-900">
            $
            {Number(displayUserMaxBid).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      ) : null}

      {displayIsEnded ? null : auth.status === "authenticated" ? (
        <form onSubmit={handleBidSubmit} noValidate className="flex flex-col gap-3">
          <div className="flex gap-2">
            {[1, 2, 3].map(amount => {
              const basePrice =
                isWinning && displayUserMaxBid
                  ? Number(displayUserMaxBid)
                  : isNaN(Number(displayPrice))
                    ? 0
                    : Number(displayPrice);
              const quickBidAmount = basePrice + amount;
              return (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handlePlaceBid(quickBidAmount.toString())}
                  disabled={placeBidMutation.isPending}
                  className="flex-1 cursor-pointer rounded-xl bg-zinc-100 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ${quickBidAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-lg font-bold text-zinc-400">
              $
            </span>
            <input
              type="number"
              step="1.00"
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 pl-8 text-xl font-black text-zinc-900 transition-all outline-none focus:border-black focus:bg-white focus:ring-2 focus:ring-black"
              placeholder="Your max limit..."
              disabled={placeBidMutation.isPending}
            />
          </div>

          <div className="px-2">
            <p className="text-xs font-medium text-zinc-500">
              Enter your absolute maximum budget. Our system will automatically bid the lowest
              amount possible to keep you in the lead.
            </p>
          </div>

          {bidError ? <p className="px-2 text-sm font-medium text-red-500">{bidError}</p> : null}

          <button
            type="submit"
            disabled={placeBidMutation.isPending}
            className="w-full cursor-pointer rounded-2xl bg-black p-4 text-lg font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {placeBidMutation.isPending ? "Processing..." : "Set Max Bid"}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl bg-zinc-100 p-4 text-center text-sm font-medium text-zinc-500">
          Please sign in to place a bid.
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white pb-85 md:pb-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:px-6 md:py-8 lg:gap-12">
        <div className="flex w-full flex-col gap-6 md:w-[60%] lg:w-[65%]">
          <div className="group relative aspect-square w-full overflow-hidden bg-zinc-100 md:aspect-4/3 md:rounded-4xl">
            <img
              src={getDynamicImage(auctionData.id, auctionData.title)}
              alt={auctionData.title}
              className="size-full object-cover"
            />

            <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm backdrop-blur-md">
              <div
                className={`size-2 rounded-full ${isConnected && !displayIsEnded ? "animate-pulse bg-emerald-500" : "bg-zinc-400"}`}
              />
              <span className="text-xs font-bold tracking-wide text-zinc-900 uppercase">
                {displayIsEnded ? "Ended" : isConnected ? "Live" : "Connecting"}
              </span>
            </div>
          </div>

          <div className="px-5 md:px-0">
            <h1 className="mb-6 text-3xl leading-[1.1] font-black tracking-tight text-zinc-900 md:text-5xl">
              {auctionData.title}
            </h1>

            <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-zinc-50 p-6 md:hidden">
              <div>
                <p className="mb-1 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  {displayIsEnded ? "Final Price" : "Current Bid"}
                </p>
                <div className="text-4xl font-black tracking-tighter text-zinc-900">
                  $
                  {Number(displayPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <div className="h-px w-full bg-zinc-200" />

              <div>
                <p className="mb-1 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  {displayIsEnded ? "Status" : "Time Remaining"}
                </p>
                <div
                  className={`text-2xl font-bold tracking-tight ${displayTime && displayTime <= 60 && !displayIsEnded ? "animate-pulse text-red-500" : "text-zinc-900"}`}
                >
                  {displayIsEnded ? "ENDED" : formatTime(displayTime)}
                </div>
              </div>
            </div>

            <div className="prose max-w-none prose-zinc">
              <p className="text-lg leading-relaxed whitespace-pre-wrap text-zinc-600">
                {auctionData.description}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full px-5 md:w-[40%] md:px-0 lg:w-[35%]">
          <div className="flex flex-col gap-6 md:sticky md:top-24">
            <div className="flex flex-col gap-6 rounded-4xl border-zinc-200 bg-white md:border md:bg-zinc-50 md:p-8">
              <div className="hidden md:block">
                <p className="mb-2 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  {displayIsEnded ? "Final Price" : "Current Bid"}
                </p>
                <motion.div
                  key={displayPrice}
                  initial={{ scale: 1.05, color: "#10b981" }}
                  animate={{ scale: 1, color: "#09090b" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-5xl font-black tracking-tighter lg:text-6xl"
                >
                  $
                  {Number(displayPrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </motion.div>

                {displayHighestBidderEmail && !displayIsEnded ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5">
                    <span className="text-xs font-bold tracking-wider text-zinc-500 uppercase">
                      Highest Bidder
                    </span>
                    <span className="text-xs font-bold text-zinc-900">
                      {displayHighestBidderEmail}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="hidden h-px w-full bg-zinc-200 md:block" />

              <div className="hidden md:block">
                <p className="mb-2 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  {displayIsEnded ? "Status" : "Time Remaining"}
                </p>
                <div
                  className={`text-3xl font-bold tracking-tight ${displayTime && displayTime <= 60 && !displayIsEnded ? "animate-pulse text-red-500" : "text-zinc-900"}`}
                >
                  {displayIsEnded ? "ENDED" : formatTime(displayTime)}
                </div>
              </div>

              <div className="hidden h-px w-full bg-zinc-200 md:block" />

              <div>
                <p className="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  Price History
                </p>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={combinedBids} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" hide={true} />
                      <YAxis domain={["dataMin", "auto"]} hide={true} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(
                          value: number | string | readonly (number | string)[] | undefined,
                        ) => {
                          const numericValue = Array.isArray(value) ? value[0] : value;
                          return [`$${Number(numericValue || 0).toFixed(2)}`, "Bid"];
                        }}
                        labelFormatter={(label: unknown) => {
                          const index = typeof label === "number" ? label : 0;
                          const bid = combinedBids[index];
                          return bid?.time || "";
                        }}
                        labelStyle={{ color: "#71717a", fontWeight: "bold", marginBottom: "4px" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        isAnimationActive={true}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="mt-2 hidden md:block">{renderBiddingTerminal()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-50 rounded-t-3xl border-t border-zinc-200 bg-white/95 p-5 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl md:hidden">
        {!displayIsEnded ? (
          <div className="mb-4 flex items-center justify-between px-1">
            <span className="text-sm font-bold tracking-wider text-zinc-500 uppercase">
              Ends In
            </span>
            <span
              className={`text-xl font-black ${displayTime && displayTime <= 60 && !displayIsEnded ? "animate-pulse text-red-500" : "text-zinc-900"}`}
            >
              {formatTime(displayTime)}
            </span>
          </div>
        ) : null}
        {renderBiddingTerminal()}
      </div>
    </div>
  );
}
