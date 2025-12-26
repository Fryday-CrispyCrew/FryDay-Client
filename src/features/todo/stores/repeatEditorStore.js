import {create} from "zustand";

const initialState = {
  // 날짜는 JS Date로 들고 있다가, submit할 때 ISO로 변환 추천
  repeatStartDate: new Date(),
  repeatEndType: "none", // "none" | "date"
  repeatEndDate: new Date(),
  repeatCycle: "unset", // "unset" | "daily" | "weekly" | "monthly" | "yearly"
  repeatAlarm: "unset", // "unset" | "sameTime" | "morning9" | "custom"
};

export const useRepeatEditorStore = create((set, get) => ({
  ...initialState,

  setRepeatStartDate: (date) => set({repeatStartDate: date}),
  setRepeatEndType: (type) => set({repeatEndType: type}),
  setRepeatEndDate: (date) => set({repeatEndDate: date}),
  setRepeatCycle: (cycle) => set({repeatCycle: cycle}),
  setRepeatAlarm: (alarm) => set({repeatAlarm: alarm}),

  // ✅ 한 번에 세팅 (예: 기존 todo 편집 진입 시)
  setRepeatAll: (partial) => set((s) => ({...s, ...partial})),

  // ✅ 닫거나 완료하면 초기화
  resetRepeat: () => set({...initialState}),

  // ✅ submit할 payload 형태로 뽑아주면 handleSubmitInternal이 깔끔해짐
  getRepeatPayload: () => {
    const {
      repeatStartDate,
      repeatEndType,
      repeatEndDate,
      repeatCycle,
      repeatAlarm,
    } = get();

    return {
      repeatStartDate: repeatStartDate?.toISOString?.() ?? null,
      repeatEndType,
      repeatEndDate:
        repeatEndType === "date"
          ? (repeatEndDate?.toISOString?.() ?? null)
          : null,
      repeatCycle,
      repeatAlarm,
    };
  },
}));
