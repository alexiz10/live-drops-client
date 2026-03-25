import { create } from "zustand";
import {type AuthSnapshot, getAuthSnapshot, signOut} from "./auth.ts";

interface AuthState {
  status: "unknown" | "authenticated" | "unauthenticated";
  userId?: string;
  refresh: () => Promise<AuthSnapshot>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  status: "unknown",

  refresh: async () => {
    const snapshot = await getAuthSnapshot();

    if (snapshot.status === "unauthenticated") {
      set({
        status: "unauthenticated",
        userId: undefined,
      })
    } else {
      set({
        status: "authenticated",
        userId: snapshot.userId,
      })
    }

    return snapshot;
  },

  logout: async () => {
    await signOut();

    set({
      status: "unauthenticated",
      userId: undefined,
    })
  }
}))
