export interface AuctionResponse {
  id: string;
  title: string;
  description: string;
  starting_price: number;
  current_price: string;
  end_time: string;
  owner_id: string;
  highest_bidder_id: string | null;
  highest_bidder_email: string | null;
  user_has_participated: boolean;
  user_max_bid: string | null;
}
