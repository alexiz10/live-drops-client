import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export type AuthInput = z.infer<typeof authSchema>;

export const auctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().min(10, "Please provide a description"),
  starting_price: z.number().positive("Price must be greater than 0"),
  end_time: z.string().refine(val => new Date(val) > new Date(), {
    message: "End time must be in the future",
  }),
});

export type AuctionInput = z.infer<typeof auctionSchema>;
