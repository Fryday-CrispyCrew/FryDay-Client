import { create } from "zustand";

export const useModalStore = create((set) => ({
  loadingVisible: false,
  errorVisible: false,
  errorMessage: "",

  openLoading: () => set({ loadingVisible: true }),
  closeLoading: () => set({ loadingVisible: false }),

  openError: (message) =>
      set({ errorVisible: true, errorMessage: message }),
  closeError: () =>
      set({ errorVisible: false, errorMessage: "" }),
}));