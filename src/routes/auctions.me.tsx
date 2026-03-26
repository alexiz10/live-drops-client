import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { getAuthSnapshot } from "../lib/auth";
import { useMyAuctions } from "../hooks/use-auctions";
import { getDynamicImage } from "../lib/utils";
import {useState} from "react";

export const Route = createFileRoute('/auctions/me')({
  beforeLoad: async () => {
    const snapshot = await getAuthSnapshot();

    if (snapshot.status === "unauthenticated") {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: MyListingsPage,
})

function MyListingsPage() {
  const [status, setStatus] = useState<'active' | 'ended'>('active');
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError } = useMyAuctions(status, page);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="size-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 font-medium tracking-tight">Loading your listings...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 text-red-700 rounded-2xl text-center font-medium border border-red-100">
        Failed to load your listings.
      </div>
    );
  }

  const auctions = data?.items || []
  const totalPages = data?.total_pages || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-4">
            My Dashboard
          </h1>

          <div className="flex bg-zinc-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => {
                setStatus('active');
                setPage(1);
              }}
              className={`px-6 py-2 cursor-pointer rounded-lg font-bold text-sm transition-all ${status === "active" ? "bg-white text-black shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Active Listings
            </button>
            <button
              onClick={() => {
                setStatus('ended');
                setPage(1);
              }}
              className={`px-6 py-2 cursor-pointer rounded-lg font-bold text-sm transition-all ${status === 'ended' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              Ended Listings
            </button>
          </div>
        </div>

        <Link to="/auctions/create" className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 active:scale-[0.98] transition-all">
          + New Listing
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 bg-zinc-50 rounded-4xl border border-zinc-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <span className="text-2xl">📦</span>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 mb-2">No listings found</h3>
          <p className="text-zinc-500 max-w-sm">
            You don't have any {status} listings right now.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {auctions.map((auction: any) => (
              <Link key={auction.id} to="/auctions/$auctionId" params={{ auctionId: auction.id }} className="group flex flex-col">
                <div className="relative w-full aspect-square bg-zinc-100 rounded-4xl overflow-hidden mb-5">
                  <img src={getDynamicImage(auction.id, auction.title)} alt={auction.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

                  <div className="absolute top-4 left-4">
                    {status === 'ended' ? (
                      <span className="bg-white/90 backdrop-blur-md text-zinc-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">Ended</span>
                    ) : (
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm animate-pulse">Live</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col grow px-2">
                  <h3 className="text-xl font-black text-zinc-900 leading-tight mb-1 line-clamp-1">{auction.title}</h3>
                  <div className="mt-auto flex justify-between items-end pt-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                        {status === 'ended' ? 'Final Price' : 'Current Bid'}
                      </p>
                      <p className="text-2xl font-black text-zinc-900 tracking-tighter">
                        ${Number(auction.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 ? (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-6 py-3 font-bold text-sm bg-zinc-100 text-zinc-900 rounded-full hover:bg-zinc-200 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <span className="font-bold text-sm text-zinc-500 tracking-widest uppercase">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 font-bold text-sm bg-zinc-100 text-zinc-900 rounded-full hover:bg-zinc-200 disabled:opacity-50 transition-colors"
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
