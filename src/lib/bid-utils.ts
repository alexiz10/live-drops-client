interface BidData {
  created_at?: string;
  time?: string;
  amount: number | string;
}

export interface ChartBid {
  time: string;
  amount: number;
  index: number;
}

export function deduplicateAndFormatBids(
  initialBids: BidData[] | undefined,
  liveBids: BidData[],
  startingPrice?: number,
): ChartBid[] {
  const allBids = [...(initialBids || []), ...liveBids];

  // Deduplicate by timestamp and amount to avoid showing the same bid twice
  const uniqueBids = Array.from(
    new Map(
      allBids.map(bid => {
        const timestamp = new Date(bid.created_at || bid.time || 0).getTime();
        const amount = Number(bid.amount);
        // Use timestamp + amount as unique key
        return [`${timestamp}-${amount}`, { timestamp, amount }];
      }),
    ).values(),
  ).sort((a, b) => a.timestamp - b.timestamp);

  const combinedBids = uniqueBids
    .map((bid, index) => ({
      time: new Date(bid.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      amount: bid.amount,
      index, // Add unique index for each data point
    }))
    .filter((bid, index, array) => {
      // Keep the first bid always
      if (index === 0) return true;
      // Only keep bids where the amount is different from the previous bid
      return bid.amount !== array[index - 1].amount;
    });

  // If no bids exist, add the starting price
  if (combinedBids.length === 0 && startingPrice !== undefined) {
    combinedBids.push({
      time: "Start",
      amount: startingPrice,
      index: 0,
    });
  }

  return combinedBids;
}
