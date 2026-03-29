import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { type ChartBid } from "../../lib/bid-utils";

interface PriceChartProps {
  data: ChartBid[];
}

export function PriceChart({ data }: PriceChartProps) {
  return (
    <div>
      <p className="mb-4 text-sm font-semibold tracking-wider text-zinc-500 uppercase">
        Price History
      </p>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide={true} />
            <YAxis domain={["dataMin", "auto"]} hide={true} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number | string | readonly (number | string)[] | undefined) => {
                const numericValue = Array.isArray(value) ? value[0] : value;
                return [`$${Number(numericValue || 0).toFixed(2)}`, "Bid"];
              }}
              labelFormatter={(label: unknown) => {
                const index = typeof label === "number" ? label : 0;
                const bid = data[index];
                return bid?.time || "";
              }}
              labelStyle={{ color: "#71717a", fontWeight: "bold", marginBottom: "4px" }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAmount)"
              isAnimationActive={true}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
