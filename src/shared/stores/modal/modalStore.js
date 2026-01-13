// src/shared/stores/modal/modalStore.js
import {create} from "zustand";

export const useModalStore = create((set, get) => ({
  visible: false,
  props: null,

  open: (props) => set({visible: true, props}),
  close: () => set({visible: false, props: null}),
}));
