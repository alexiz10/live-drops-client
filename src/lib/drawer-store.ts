import { create } from "zustand";

interface DrawerState {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
  reset: () => void;
}

export const useDrawerStore = create<DrawerState>(set => ({
  isOpen: false,
  toggle: () => set(state => ({ isOpen: !state.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  reset: () => set({ isOpen: false }),
}));
