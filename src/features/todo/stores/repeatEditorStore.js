import {create} from "zustand";

const initialState = {
  // 날짜는 JS Date로 들고 있다가, submit할 때 ISO로 변환 추천
  repeatStartDate: new Date(),
  repeatEndType: "none", // "none" | "date"
  repeatEndDate: new Date(),
  repeatCycle: "unset", // "unset" | "daily" | "weekly" | "monthly" | "yearly"
  repeatAlarm: "unset", // "unset" | "sameTime" | "morning9" | "custom"

  // ✅ 반복 주기별 상세 선택값
  repeatWeekdays: [], // ["mon","tue"...]
  repeatMonthDays: [], // [1, 12, 28...]
  repeatYearMonths: [], // [1..12]
  repeatYearDays: [], // [1..31]
};

export const useRepeatEditorStore = create((set, get) => ({
  ...initialState,

  setRepeatStartDate: (date) => set({repeatStartDate: date}),
  setRepeatEndType: (type) => set({repeatEndType: type}),
  setRepeatEndDate: (date) => set({repeatEndDate: date}),
  setRepeatCycle: (cycle) => set({repeatCycle: cycle}),
  setRepeatAlarm: (alarm) => set({repeatAlarm: alarm}),

  setRepeatWeekdays: (days) => set({repeatWeekdays: days}),
  setRepeatMonthDays: (days) => set({repeatMonthDays: days}),
  setRepeatYearMonths: (months) => set({repeatYearMonths: months}),
  setRepeatYearDays: (days) => set({repeatYearDays: days}),

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
      repeatWeekdays,
      repeatMonthDays,
      repeatYearMonths,
      repeatYearDays,
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

      repeatWeekdays,
      repeatMonthDays,
      repeatYearMonths,
      repeatYearDays,
    };
  },
}));
