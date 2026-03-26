import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { getAuthSnapshot } from "../lib/auth";
import { useMyAuctions } from "../hooks/use-auctions";
import { getDynamicImage } from "../lib/utils";
import { useState } from "react";

interface AuctionItem {
  id: string;
  title: string;
  current_price: number | string;
  end_time?: string;
}

export const Route = createFileRoute("/auctions/me")({
  beforeLoad: async () => {
    const snapshot = await getAuthSnapshot();

    if (snapshot.status === "unauthenticated") {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: MyListingsPage,
});

function MyListingsPage() {
  const [status, setStatus] = useState<"active" | "ended">("active");
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useMyAuctions(status, page);

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 size-12 animate-spin rounded-full border-4 border-zinc-200 border-t-black" />
          <p className="font-medium tracking-tight text-zinc-500">Loading your listings...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-2xl border border-red-100 bg-red-50 p-6 text-center font-medium text-red-700">
        Failed to load your listings.
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
            My Dashboard
          </h1>

          <div className="flex w-fit rounded-xl bg-zinc-100 p-1">
            <button
              onClick={() => {
                setStatus("active");
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg px-6 py-2 text-sm font-bold transition-all ${status === "active" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Active Listings
            </button>
            <button
              onClick={() => {
                setStatus("ended");
                setPage(1);
              }}
              className={`cursor-pointer rounded-lg px-6 py-2 text-sm font-bold transition-all ${status === "ended" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Ended Listings
            </button>
          </div>
        </div>

        <Link
          to="/auctions/create"
          className="inline-flex items-center justify-center rounded-xl bg-black px-6 py-3 font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
        >
          + New Listing
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-4xl border border-zinc-100 bg-zinc-50 px-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="mb-2 text-xl font-bold text-zinc-900">No listings found</h3>
          <p className="max-w-sm text-zinc-500">You don't have any {status} listings right now.</p>
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
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                        $
                        {Number(auction.current_price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
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
                className="rounded-full bg-zinc-100 px-6 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm font-bold tracking-widest text-zinc-500 uppercase">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-full bg-zinc-100 px-6 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:opacity-50"
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
