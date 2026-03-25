import {createFileRoute, Link} from '@tanstack/react-router'
import {useAuctionList} from "../hooks/use-auctions.ts";

export const Route = createFileRoute('/')({
  component: Dashboard,
})

const placeholderImg = "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop";

function Dashboard() {
  const { data: auctions, isLoading, isError } = useAuctionList();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="size-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium tracking-tight">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-red-50 text-red-700 rounded-2xl text-center font-medium border border-red-100">
        Failed to load catalog. Please ensure the server is running.
      </div>
    );
  }

  if (!auctions || auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="size-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
          <span className="text-4xl">🏷️</span>
        </div>
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-3">No Active Listings</h2>
        <p className="text-zinc-500 text-lg mb-8 max-w-sm">
          The marketplace is currently empty. Be the first to list an exclusive item.
        </p>
        <Link to="/auctions/create" className="bg-black text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 active:scale-[0.98] transition-all shadow-xl shadow-black/10">
          Create Listing
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-16">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-2">
            Live Drops
          </h1>
          <p className="text-zinc-500 font-medium text-lg">
            Bid on exclusive, authenticated items.
          </p>
        </div>
        <Link
          to="/auctions/create"
          className="inline-flex items-center justify-center bg-zinc-100 text-zinc-900 px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 active:scale-[0.98] transition-all"
        >
          + Sell an Item
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
        {auctions.map(auction => {
          const isEnded = new Date(auction.end_time) <= new Date();

          return (
            <Link key={auction.id} to="/auctions/$auctionId" params={{ auctionId: auction.id }} className="group flex flex-col">
              <div className="relative w-full aspect-square bg-zinc-100 rounded-4xl overflow-hidden mb-5">
                <img
                  src={placeholderImg}
                  alt={auction.title}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute top-4 left-4">
                  {isEnded ? (
                    <span className="bg-white/90 backdrop-blur-md text-zinc-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                      Ended
                    </span>
                  ) : (
                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm animate-pulse">
                      Live
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col grow px-2">
                <h3 className="text-xl font-black text-zinc-900 leading-tight mb-1 line-clamp-1 group-hover:text-zinc-600 transition-colors">
                  {auction.title}
                </h3>
                <p className="text-sm font-medium text-zinc-500 mb-4 line-clamp-1">
                  {auction.description}
                </p>

                <div className="mt-auto flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                      {isEnded ? 'Final Price' : 'Current Bid'}
                    </p>
                    <p className="text-2xl font-black text-zinc-900 tracking-tighter">
                      ${Number(auction.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
