import {create} from "zustand";

export const useModalStore = create((set) => ({
  //공용 모달
  visible: false,
  props: null,

  //로딩/에러 상태 처리 모달
  loadingVisible: false,
  errorVisible: false,
  errorMessage: "",

  //공용 모달
  open: (props) => set({visible: true, props}),
  close: () => set({visible: false, props: null}),

  //로딩/에러 상태 처리 모달
  openLoading: () => set({loadingVisible: true}),
  closeLoading: () => set({loadingVisible: false}),

  openError: (message) => set({errorVisible: true, errorMessage: message}),
  closeError: () => set({errorVisible: false, errorMessage: ""}),
}));
