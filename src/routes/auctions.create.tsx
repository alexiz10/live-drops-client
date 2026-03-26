import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type AuctionInput, auctionSchema } from "../lib/schemas";
import { getAuthSnapshot } from "../lib/auth";
import { useCreateAuction } from "../hooks/use-auctions";

export const Route = createFileRoute("/auctions/create")({
  beforeLoad: async () => {
    const snapshot = await getAuthSnapshot();

    if (snapshot.status === "unauthenticated") {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: CreateAuctionPage,
});

function CreateAuctionPage() {
  const navigate = useNavigate();
  const createAuctionMutation = useCreateAuction();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuctionInput>({
    resolver: zodResolver(auctionSchema),
  });

  const onSubmit = (data: AuctionInput) => {
    createAuctionMutation.mutate(data, {
      onSuccess: () => {
        void navigate({ to: "/" });
      },
    });
  };

  const inputClass =
    "w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black text-lg font-medium text-zinc-900 transition-all outline-none";
  const labelClass = "block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="mb-3 text-4xl font-black tracking-tight text-zinc-900 md:text-5xl">
          List an Item
        </h1>
        <p className="text-lg font-medium text-zinc-500">
          Set your starting price and let the bidding war begin.
        </p>
      </div>

      {createAuctionMutation.isError ? (
        <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-center font-bold text-red-600">
          Failed to create listing. Please try again.
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-8 rounded-[2.5rem] border-zinc-100 bg-white md:border md:p-10 md:shadow-2xl md:shadow-zinc-200/40"
      >
        <div>
          <label htmlFor="title" className={labelClass}>
            Listing Title
          </label>
          <input
            id="title"
            className={inputClass}
            placeholder="e.g., LEGO Star Wars Collection"
            {...register("title")}
          />
          {errors.title ? (
            <p className="mt-2 ml-2 text-sm font-bold text-red-500">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={5}
            className={`${inputClass} resize-none`}
            placeholder="Describe the item in detail..."
            {...register("description")}
          />
          {errors.description ? (
            <p className="mt-2 ml-2 text-sm font-bold text-red-500">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label htmlFor="starting_price" className={labelClass}>
              Starting Price ($)
            </label>
            <input
              id="starting_price"
              type="number"
              step="0.01"
              className={`${inputClass} pl-9 font-mono font-bold`}
              placeholder="0.00"
              {...register("starting_price", { valueAsNumber: true })}
            />
            {errors.starting_price ? (
              <p className="mt-2 ml-2 text-sm font-bold text-red-500">
                {errors.starting_price.message}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="end_time" className={labelClass}>
              End Time
            </label>
            <input
              id="end_time"
              type="datetime-local"
              className={inputClass}
              {...register("end_time")}
            />
            {errors.end_time ? (
              <p className="mt-2 ml-2 text-sm font-bold text-red-500">{errors.end_time.message}</p>
            ) : null}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={createAuctionMutation.isPending}
            className="w-full cursor-pointer rounded-2xl bg-black p-5 text-xl font-black tracking-tight text-white shadow-xl shadow-black/10 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createAuctionMutation.isPending ? "Publishing..." : "Publish Listing"}
          </button>
        </div>
      </form>
    </div>
  );
}
