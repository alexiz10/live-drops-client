import { create } from "zustand";

interface AuctionState {
  currentPrice: string | null;
  highestBidderId: string | null;
  timeRemaining: number | null;
  isEnded: boolean;
  isConnected: boolean;

  connect: (auctionId: string) => void;
  disconnect: () => void;
}

let ws: WebSocket | null = null;

export const useAuctionStore = create<AuctionState>(set => ({
  currentPrice: null,
  highestBidderId: null,
  timeRemaining: null,
  isEnded: false,
  isConnected: false,

  connect: (auctionId: string) => {
    if (ws?.readyState === WebSocket.OPEN) return;

    ws = new WebSocket(`ws://localhost:8000/api/v1/auctions/${auctionId}/ws`);

    ws.onopen = () => {
      set({ isConnected: true });
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);

        switch (data.event) {
          case "new_highest_bid":
            set({
              currentPrice: data.new_price,
              highestBidderId: data.bidder_Id,
            })
            break;
          case "time_update":
            set({ timeRemaining: data.time_remaining });
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
      ws.close();
      ws = null;
    }

    set({
      currentPrice: null,
      highestBidderId: null,
      timeRemaining: null,
      isEnded: false,
      isConnected: false,
    })
  }
}))
