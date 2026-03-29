import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";

import { useAuctionStore } from "../lib/ws-store";
import { useAuthStore } from "../lib/store";
import { useDrawerStore } from "../lib/drawer-store";
import { useAuctionDetails, usePlaceBid, useAuctionBids } from "../hooks/use-auctions";
import { getDynamicImage, formatTime } from "../lib/utils";
import { deduplicateAndFormatBids } from "../lib/bid-utils";
import { PriceChart, BiddingTerminal, MobileBiddingDrawer } from "../components/auctions";

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
  const { isOpen: isDrawerOpen, reset: resetDrawer } = useDrawerStore();

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
    return () => {
      disconnect();
      resetDrawer();
    };
  }, [auctionId, connect, disconnect, resetDrawer]);

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



  const combinedBids = deduplicateAndFormatBids(
    initialBids,
    useAuctionStore(state => state.liveBids),
    auctionData ? Number(auctionData.starting_price) : undefined,
  );

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


  return (
    <div
      className={`min-h-[calc(100vh-73px)] bg-white ${isDrawerOpen ? "pb-85" : "pb-24"} md:pb-12`}
    >
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

              <PriceChart data={combinedBids} />

              <div className="mt-2 hidden md:block">
                <BiddingTerminal
                  displayIsEnded={displayIsEnded}
                  isWinning={!!isWinning}
                  isLosing={!!isLosing}
                  hasBids={hasBids}
                  displayHasParticipated={displayHasParticipated}
                  displayUserMaxBid={displayUserMaxBid}
                  displayPrice={displayPrice}
                  isAuthenticated={auth.status === "authenticated"}
                  bidAmount={bidAmount}
                  setBidAmount={setBidAmount}
                  bidError={bidError}
                  onPlaceBid={handlePlaceBid}
                  onSubmit={e => {
                    e.preventDefault();
                    handlePlaceBid(bidAmount);
                  }}
                  isPending={placeBidMutation.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <MobileBiddingDrawer
        displayPrice={displayPrice}
        displayTime={displayTime}
        displayIsEnded={displayIsEnded}
        isLosing={!!isLosing}
        displayHasParticipated={displayHasParticipated}
        className="md:hidden"
      >
        <BiddingTerminal
          displayIsEnded={displayIsEnded}
          isWinning={!!isWinning}
          isLosing={!!isLosing}
          hasBids={hasBids}
          displayHasParticipated={displayHasParticipated}
          displayUserMaxBid={displayUserMaxBid}
          displayPrice={displayPrice}
          isAuthenticated={auth.status === "authenticated"}
          bidAmount={bidAmount}
          setBidAmount={setBidAmount}
          bidError={bidError}
          onPlaceBid={handlePlaceBid}
          onSubmit={e => {
            e.preventDefault();
            handlePlaceBid(bidAmount);
          }}
          isPending={placeBidMutation.isPending}
        />
      </MobileBiddingDrawer>
    </div>
  );
}
