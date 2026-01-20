import {create} from "zustand";

const initialState = {
  repeatStartDate: null, // ✅ 미설정
  repeatEndType: "unset", // ✅ "unset" | "none" | "date"
  repeatEndDate: null, // ✅ 미설정
  repeatCycle: "unset", // "unset" | "daily" | "weekly" | "monthly" | "yearly"
  repeatAlarm: "unset", // "unset" | "sameTime" | "morning9" | "custom"
  repeatAlarmTime: null, // ✅ "HH:mm" (예: "07:30") / custom일 때만 사용

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
  setRepeatAlarmTime: (time) => set({repeatAlarmTime: time}),

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
    const s = get();

    // ✅ 반복 주기 자체가 미설정이면 반복 관련 값은 모두 null 처리
    if (s.repeatCycle === "unset") {
      return {
        repeatStartDate: null,
        repeatEndType: null,
        repeatEndDate: null,
        repeatCycle: "unset",
        repeatAlarm: "unset",
        repeatAlarmTime: null,
        repeatWeekdays: [],
        repeatMonthDays: [],
        repeatYearMonths: [],
        repeatYearDays: [],
      };
    }

    return {
      repeatStartDate: s.repeatStartDate ?? null,
      repeatEndType: s.repeatEndType === "unset" ? "none" : s.repeatEndType,
      repeatEndDate:
        s.repeatEndType === "date" ? (s.repeatEndDate ?? null) : null,
      repeatCycle: s.repeatCycle,
      repeatAlarm: s.repeatAlarm,
      repeatAlarmTime: s.repeatAlarmTime,
      repeatWeekdays: s.repeatWeekdays,
      repeatMonthDays: s.repeatMonthDays,
      repeatYearMonths: s.repeatYearMonths,
      repeatYearDays: s.repeatYearDays,
    };
  },
}));
