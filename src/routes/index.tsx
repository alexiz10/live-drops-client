import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuctionList } from "../hooks/use-auctions";
import { useState } from "react";
import { getDynamicImage } from "../lib/utils";

interface AuctionItem {
  id: string;
  title: string;
  current_price: number | string;
  end_time?: string;
}

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [status, setStatus] = useState<"active" | "ended">("active");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useAuctionList(status, page);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          <p className="font-medium tracking-tight text-gray-500">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center font-medium text-red-700">
        Failed to load catalog. Please ensure the server is running.
      </div>
    );
  }

  const auctions = data?.items || [];
  const totalPages = data?.total_pages || 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
            Marketplace
          </h1>

          <div className="flex w-fit rounded-xl bg-zinc-100 p-1">
            <button
              onClick={() => {
                setStatus("active");
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg px-6 py-2 text-sm font-bold transition-all ${status === "active" ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Live Now
            </button>
            <button
              onClick={() => {
                setStatus("ended");
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg px-6 py-2 text-sm font-bold transition-all ${status === "ended" ? "bg-white text-black shadow-md" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Past Drops
            </button>
          </div>
        </div>
      </div>

      {auctions.length === 0 ? (
        <div className="py-20 text-center font-medium text-zinc-500">
          No auctions found for this filter.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {auctions.map((auction: AuctionItem) => (
              <Link
                key={auction.id}
                to="/auctions/$auctionId"
                params={{ auctionId: auction.id }}
                className="group flex flex-col"
              >
                <div className="relative mb-5 aspect-square w-full overflow-hidden rounded-4xl bg-zinc-100">
                  <img
                    src={getDynamicImage(auction.id, auction.title)}
                    alt={auction.title}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <div className="absolute top-4 left-4">
                    {status === "ended" ? (
                      <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black tracking-widest text-zinc-600 uppercase shadow-sm backdrop-blur-md">
                        Ended
                      </span>
                    ) : (
                      <span className="animate-pulse rounded-full bg-emerald-500 px-3 py-1.5 text-[10px] font-black tracking-widest text-white uppercase shadow-sm">
                        Live
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex grow flex-col px-2">
                  <h3 className="mb-1 line-clamp-1 text-xl leading-tight font-black text-zinc-900">
                    {auction.title}
                  </h3>
                  <div className="mt-auto flex items-end justify-between pt-4">
                    <div>
                      <p className="mb-0.5 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
                        {status === "ended" ? "Final Price" : "Current Bid"}
                      </p>
                      <p className="text-2xl font-black tracking-tighter text-zinc-900">
                        {Number(auction.current_price).toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="cursor-pointer rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-medium text-zinc-500">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="cursor-pointer rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
