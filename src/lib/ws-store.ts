import { create } from "zustand";

interface AuctionState {
  currentPrice: string | null;
  highestBidderId: string | null;
  highestBidderEmail: string | null;
  timeRemaining: number | null;
  isEnded: boolean;
  isConnected: boolean;
  liveBids: { amount: number; time: string }[];

  connect: (auctionId: string) => void;
  disconnect: () => void;
}

let ws: WebSocket | null = null;

export const useAuctionStore = create<AuctionState>(set => ({
  currentPrice: null,
  highestBidderId: null,
  highestBidderEmail: null,
  timeRemaining: null,
  isEnded: false,
  isConnected: false,
  liveBids: [],

  connect: (auctionId: string) => {
    if (ws) {
      ws.onmessage = null;
      ws.onclose = null;
      ws.close()
      ws = null;
    }

    set({
      currentPrice: null,
      highestBidderId: null,
      highestBidderEmail: null,
      timeRemaining: null,
      isEnded: false,
      isConnected: false,
      liveBids: [],
    });

    ws = new WebSocket(`ws://localhost:8000/api/v1/auctions/${auctionId}/ws`);

    ws.onopen = () => {
      set({ isConnected: true });
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        switch (data.event) {
          case "new_highest_bid":
            set(state => ({
              currentPrice: data.new_price,
              highestBidderId: data.bidder_id,
              highestBidderEmail: data.bidder_email,
              liveBids: [...state.liveBids, {
                amount: parseFloat(data.new_price),
                time: new Date().toISOString(),
              }]
            }));
            break;
          case "time_update":
            set({
              timeRemaining: data.time_remaining,
              isEnded: data.time_remaining <= 0
            });
            break;
          case "auction_ended":
            set({ isEnded: true, timeRemaining: 0 })
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message", error);
      }
    };

    ws.onclose = () => {
      set({ isConnected: false });
      ws = null;
    }
  },

  disconnect: () => {
    if (ws) {
      ws.onmessage = null;
      ws.onclose = null;
      ws.close();
      ws = null;
    }

    set({
      currentPrice: null,
      highestBidderId: null,
      highestBidderEmail: null,
      timeRemaining: null,
      isEnded: false,
      isConnected: false,
      liveBids: [],
    })
  }
}))
