import React from "react";
import { getQuickBidIncrements } from "../../lib/utils";

interface BiddingTerminalProps {
  // Auction state
  displayIsEnded: boolean;
  isWinning: boolean;
  isLosing: boolean;
  hasBids: boolean;
  displayHasParticipated: boolean;
  displayUserMaxBid: string | null;
  displayPrice: string;

  // User state
  isAuthenticated: boolean;

  // Bid form state
  bidAmount: string;
  setBidAmount: (amount: string) => void;
  bidError: string | null;

  // Actions
  onPlaceBid: (amount: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
}

export function BiddingTerminal({
  displayIsEnded,
  isWinning,
  isLosing,
  hasBids,
  displayHasParticipated,
  displayUserMaxBid,
  displayPrice,
  isAuthenticated,
  bidAmount,
  setBidAmount,
  bidError,
  onPlaceBid,
  onSubmit,
  isPending,
}: BiddingTerminalProps) {
  return (
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

      {displayIsEnded ? null : isAuthenticated ? (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
          <div className="flex gap-2">
            {(() => {
              const basePrice =
                isWinning && displayUserMaxBid
                  ? Number(displayUserMaxBid)
                  : isNaN(Number(displayPrice))
                    ? 0
                    : Number(displayPrice);
              const increments = getQuickBidIncrements(basePrice, hasBids);

              return increments.map(increment => {
                const quickBidAmount = basePrice + increment;
                return (
                  <button
                    key={increment}
                    type="button"
                    onClick={() => onPlaceBid(quickBidAmount.toString())}
                    disabled={isPending}
                    className="flex-1 cursor-pointer rounded-xl bg-zinc-100 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ${quickBidAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </button>
                );
              });
            })()}
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
              disabled={isPending}
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
            disabled={isPending || !bidAmount}
            className="w-full cursor-pointer rounded-2xl bg-black p-4 text-lg font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Processing..." : "Set Max Bid"}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl bg-zinc-100 p-4 text-center text-sm font-medium text-zinc-500">
          Please sign in to place a bid.
        </div>
      )}
    </div>
  );
}
