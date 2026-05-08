import { create } from "zustand";

export const useServerStatusStore = create((set) => ({
  isServerError: false,
  openServerError: () => set({ isServerError: true }),
  closeServerError: () => set({ isServerError: false }),
}));