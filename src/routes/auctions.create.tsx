import {createFileRoute, redirect, useNavigate} from '@tanstack/react-router'
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {type AuctionInput, auctionSchema} from "../lib/schemas.ts";
import {getAuthSnapshot} from "../lib/auth.ts";
import {useCreateAuction} from "../hooks/use-auctions.ts";

export const Route = createFileRoute('/auctions/create')({
  beforeLoad: async () => {
    const snapshot = await getAuthSnapshot();

    if (snapshot.status === "unauthenticated") {
      throw redirect({ to: "/auth/login" })
    }
  },
  component: CreateAuctionPage,
})

function CreateAuctionPage() {
  const navigate = useNavigate();
  const createAuctionMutation = useCreateAuction();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuctionInput>({
    resolver: zodResolver(auctionSchema)
  });

  const onSubmit = (data: AuctionInput) => {
    createAuctionMutation.mutate(data, {
      onSuccess: () => {
        void navigate({ to: "/" });
      }
    });
  }

  const inputClass = "w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-black text-lg font-medium text-zinc-900 transition-all outline-none";
  const labelClass = "block text-xs font-black text-zinc-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight mb-3">
          List an Item
        </h1>
        <p className="text-zinc-500 font-medium text-lg">
          Set your starting price and let the bidding war begin.
        </p>
      </div>

      {createAuctionMutation.isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 font-bold text-center border border-red-100">
          Failed to create listing. Please try again.
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8 bg-white md:border border-zinc-100 md:shadow-2xl md:shadow-zinc-200/40 md:p-10 rounded-[2.5rem]">
        <div>
          <label htmlFor="title" className={labelClass}>Listing Title</label>
          <input
            id="title"
            className={inputClass}
            placeholder="e.g., LEGO Star Wars Collection"
            {...register("title")}
          />
          {errors.title ? <p className="text-red-500 text-sm font-bold mt-2 ml-2">{errors.title.message}</p> : null}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            rows={5}
            className={`${inputClass} resize-none`}
            placeholder="Describe the item in detail..."
            {...register('description')}
          />
          {errors.description ? <p className="text-red-500 text-sm font-bold mt-2 ml-2">{errors.description.message}</p> : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label htmlFor="starting_price" className={labelClass}>Starting Price ($)</label>
            <input
              id="starting_price"
              type="number"
              step="0.01"
              className={`${inputClass} pl-9 font-mono font-bold`}
              placeholder="0.00"
              {...register('starting_price')}
            />
            {errors.starting_price ? <p className="text-red-500 text-sm font-bold mt-2 ml-2">{errors.starting_price.message}</p> : null}
          </div>

          <div>
            <label htmlFor="end_time" className={labelClass}>End Time</label>
            <input
              id="end_time"
              type="datetime-local"
              className={inputClass}
              {...register("end_time")}
            />
            {errors.end_time ? <p className="text-red-500 text-sm font-bold mt-2 ml-2">{errors.end_time.message}</p> : null}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={createAuctionMutation.isPending}
            className="w-full bg-black text-white cursor-pointer p-5 rounded-2xl font-black text-xl tracking-tight hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-black/10"
          >
            {createAuctionMutation.isPending ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
