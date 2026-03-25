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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuctionInput>({
    resolver: zodResolver(auctionSchema)
  });

  const createAuctionMutation = useCreateAuction();

  const onSubmit = (data: AuctionInput) => {
    createAuctionMutation.mutate(data, {
      onSuccess: () => {
        void navigate({ to: "/" });
      }
    });
  }

  const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400";

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm mt-8 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Create New Auction</h1>

      {createAuctionMutation.isError ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
          Failed to create auction. Please check your connection.
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">Title</label>
          <input
            id="title"
            className={inputClass}
            placeholder="Vintage 1970s Fender Stratocaster"
            {...register("title")}
          />
          {errors.title ? (
            <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description</label>
          <textarea
            id="description"
            className={inputClass}
            placeholder="Describe the condition, history, etc..."
            rows={4}
            {...register("description")}
          />
          {errors.description ? (
            <p className="text-red-600 text-xs mt-1">{errors.description.message}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="starting_price">Starting Price ($)</label>
            <input
              id="starting_price"
              type="number"
              className={inputClass}
              placeholder="100.00"
              step="0.01"
              {...register("starting_price")}
            />
            {errors.starting_price ? (
              <p className="text-red-600 text-xs mt-1">{errors.starting_price.message}</p>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="end_time">End Time</label>
            <input
              id="end_time"
              type="datetime-local"
              className={inputClass}
              {...register("end_time")}
            />
            {errors.end_time ? (
              <p className="text-red-600 text-xs mt-1">{errors.end_time.message}</p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={createAuctionMutation.isPending}
          className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {createAuctionMutation.isPending ? "Creating..." : "Launch Auction"}
        </button>
      </form>
    </div>
  )
}
