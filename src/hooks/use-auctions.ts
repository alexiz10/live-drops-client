import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { type AuctionInput } from "../lib/schemas";

export const useAuctionList = () => {
  return useQuery({
    queryKey: ['auctions', 'list'],
    queryFn: async () => {
      const response = await api.get('/auctions/');
      return response.data;
    }
  })
}

export const useAuctionDetails = (auctionId: string) => {
  return useQuery({
    queryKey: ['auctions', auctionId],
    queryFn: async () => {
      const response = await api.get(`/auctions/${auctionId}`);
      return response.data;
    }
  })
}

export const useCreateAuction = () => {
  return useMutation({
    mutationFn: async (data: AuctionInput) => {
      const payload = {
        ...data,
        end_time: new Date(data.end_time).toISOString(),
      }
      const response = await api.post('/auctions/', payload);
      return response.data;
    }
  })
}

export const usePlaceBid = (auctionId: string) => {
  return useMutation({
    mutationFn: async (amount: string) => {
      const response = await api.post(`/auctions/${auctionId}/bids`, {
        amount: parseFloat(amount)
      })
      return response.data;
    }
  })
}
