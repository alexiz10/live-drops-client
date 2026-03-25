import {createFileRoute, Link} from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import {api} from "../lib/api.ts";

export const Route = createFileRoute('/')({
  component: Dashboard,
})

interface AuctionListItem {
  id: string;
  title: string;
  description: string;
  current_price: string | number;
  end_time: string;
}

function Dashboard() {
  const { data: auctions, isLoading, isError } = useQuery<AuctionListItem[]>({
    queryKey: ['auctions', 'list'],
    queryFn: async () => {
      const response = await api.get('/auctions/');
      return response.data;
    }
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-xl text-gray-500 font-medium">Loading auctions...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-700 p-6 rounded-xl text-center border border-red-100">
        Failed to load auctions. Please make sure the backend is running.
      </div>
    );
  }

  if (!auctions || auctions.length === 0) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Auctions</h2>
        <p className="text-gray-600 mb-8">Be the first to list an item on the platform!</p>
        <Link
          to="/auctions/create"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition"
        >
          Create an Auction
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Live Auctions</h1>
          <p className="text-gray-600">Browse and bid on active items.</p>
        </div>
        <Link
          to="/auctions/create"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          + New Auction
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map(auction => {
          const isEnded = new Date(auction.end_time) <= new Date();

          return (
            <Link
              key={auction.id}
              to="/auctions/$auctionId"
              params={{ auctionId: auction.id }}
              className="block bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow hover:border-indigo-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {auction.title}
                </h3>
                {isEnded ? (
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md">Ended</span>
                ) : (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md">Live</span>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-10">
                {auction.description}
              </p>

              <div className="flex justify-between items-end pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Current Price</p>
                  <p className="text-2xl font-mono font-bold text-gray-900">
                    ${Number(auction.current_price).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-medium mb-1">Ends At</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(auction.end_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
