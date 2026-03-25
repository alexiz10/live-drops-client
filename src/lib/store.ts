import { create } from "zustand";
import Session from "supertokens-web-js/recipe/session";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(set => ({
  isAuthenticated: false,
  isLoading: true,

  checkSession: async () => {
    try {
      const hasSession = await Session.doesSessionExist();
      set({ isAuthenticated: hasSession, isLoading: false });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    await Session.signOut();
    set({ isAuthenticated: false });
  }
}))
