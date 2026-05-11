import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useRepeatEditorStore } from "../../stores/repeatEditorStore";
import { toast } from "../../../../shared/components/toast/CenterToast";
import YearMonthWheelModal from "./wheel/YearMonthWheelModal";
import RepeatSummaryView from "./components/RepeatSummaryView";
import RepeatCyclePanel from "./components/RepeatCyclePanel";
import RepeatStartDatePanel from "./components/RepeatStartDatePanel";
import RepeatEndDatePanel from "./components/RepeatEndDatePanel";
import RepeatAlarmPanel from "./components/RepeatAlarmPanel";
import { buildMonthGrid } from "./utils/calendar";
import { isAfterDay, isBeforeDay } from "./utils/date";

export default function RepeatSettingsSection({
  visible,
  openKey,
  onToggleOpenKey,
}) {
  const repeatStartDate = useRepeatEditorStore((s) => s.repeatStartDate);
  const repeatEndType = useRepeatEditorStore((s) => s.repeatEndType);
  const repeatEndDate = useRepeatEditorStore((s) => s.repeatEndDate);
  const repeatCycle = useRepeatEditorStore((s) => s.repeatCycle);
  const repeatAlarm = useRepeatEditorStore((s) => s.repeatAlarm);
  const repeatAlarmTime = useRepeatEditorStore((s) => s.repeatAlarmTime);

  const repeatWeekdays = useRepeatEditorStore((s) => s.repeatWeekdays);
  const repeatMonthDays = useRepeatEditorStore((s) => s.repeatMonthDays);
  const repeatYearMonths = useRepeatEditorStore((s) => s.repeatYearMonths);
  const repeatYearDays = useRepeatEditorStore((s) => s.repeatYearDays);

  const setRepeatStartDate = useRepeatEditorStore((s) => s.setRepeatStartDate);
  const setRepeatEndType = useRepeatEditorStore((s) => s.setRepeatEndType);
  const setRepeatEndDate = useRepeatEditorStore((s) => s.setRepeatEndDate);
  const setRepeatCycle = useRepeatEditorStore((s) => s.setRepeatCycle);
  const setRepeatAlarm = useRepeatEditorStore((s) => s.setRepeatAlarm);
  const setRepeatAlarmTime = useRepeatEditorStore((s) => s.setRepeatAlarmTime);

  const setRepeatWeekdays = useRepeatEditorStore((s) => s.setRepeatWeekdays);
  const setRepeatMonthDays = useRepeatEditorStore((s) => s.setRepeatMonthDays);
  const setRepeatYearMonths = useRepeatEditorStore(
    (s) => s.setRepeatYearMonths,
  );
  const setRepeatYearDays = useRepeatEditorStore((s) => s.setRepeatYearDays);

  const isCycleUnset = !repeatCycle || repeatCycle === "unset";

  const [draftStartDate, setDraftStartDate] = useState(
    repeatStartDate ?? new Date(),
  );
  const [draftEndType, setDraftEndType] = useState(repeatEndType);
  const [draftEndDate, setDraftEndDate] = useState(repeatEndDate ?? new Date());
  const [draftCycle, setDraftCycle] = useState(repeatCycle);
  const [draftWeekdays, setDraftWeekdays] = useState([]);
  const [draftMonthDays, setDraftMonthDays] = useState([]);
  const [draftYearMonths, setDraftYearMonths] = useState([]);
  const [draftYearDays, setDraftYearDays] = useState([]);

  const [startMonthCursor, setStartMonthCursor] = useState(() => {
    const base = repeatStartDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [endMonthCursor, setEndMonthCursor] = useState(() => {
    const base = repeatEndDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [repeatAlarmDraftDate, setRepeatAlarmDraftDate] = useState(new Date());
  const [hasPickedRepeatAlarmTime, setHasPickedRepeatAlarmTime] =
    useState(false);
  const [
    isIosInlineRepeatAlarmPickerOpen,
    setIsIosInlineRepeatAlarmPickerOpen,
  ] = useState(false);

  const [ymWheelOpen, setYmWheelOpen] = useState(false);
  const [ymTarget, setYmTarget] = useState("start");
  const [ymInitial, setYmInitial] = useState({ year: 0, month: 0 });

  useEffect(() => {
    if (openKey === "repeatStart") {
      const base = repeatStartDate ?? new Date();
      setDraftStartDate(base);
      setStartMonthCursor(new Date(base.getFullYear(), base.getMonth(), 1));
    }
  }, [openKey, repeatStartDate]);

  useEffect(() => {
    if (openKey === "repeatEnd") {
      setDraftEndType(repeatEndType);

      const base =
        repeatEndType === "date"
          ? (repeatEndDate ?? repeatStartDate ?? new Date())
          : (repeatStartDate ?? new Date());

      const normalized =
        repeatStartDate && base < repeatStartDate ? repeatStartDate : base;

      setDraftEndDate(normalized);
      setEndMonthCursor(
        new Date(normalized.getFullYear(), normalized.getMonth(), 1),
      );
    }
  }, [openKey, repeatEndType, repeatEndDate, repeatStartDate]);

  useEffect(() => {
    if (openKey === "repeatCycle") {
      setDraftCycle(repeatCycle ?? "unset");
      setDraftWeekdays(repeatWeekdays ?? []);
      setDraftMonthDays(repeatMonthDays ?? []);
      setDraftYearMonths(repeatYearMonths ?? []);
      setDraftYearDays(repeatYearDays ?? []);
    }
  }, [
    openKey,
    repeatCycle,
    repeatWeekdays,
    repeatMonthDays,
    repeatYearMonths,
    repeatYearDays,
  ]);

  useEffect(() => {
    if (openKey !== "repeatAlarm") return;

    if (repeatAlarm === "custom" && repeatAlarmTime) {
      const [hh, mm] = repeatAlarmTime.split(":").map(Number);
      const base = new Date();
      base.setHours(hh || 0);
      base.setMinutes(mm || 0);
      base.setSeconds(0);
      base.setMilliseconds(0);

      setRepeatAlarmDraftDate(base);
      setHasPickedRepeatAlarmTime(true);
    } else {
      setRepeatAlarmDraftDate(new Date());
      setHasPickedRepeatAlarmTime(false);
    }

    setIsIosInlineRepeatAlarmPickerOpen(false);
  }, [openKey, repeatAlarm, repeatAlarmTime]);

  const guardOpen = useCallback(
    (nextKey) => {
      if (isCycleUnset) {
        toast.show("반복 주기를 먼저 설정해주세요.");
        return;
      }
      onToggleOpenKey(nextKey);
    },
    [isCycleUnset, onToggleOpenKey],
  );

  const toggleWeekday = useCallback((key) => {
    setDraftWeekdays((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }, []);

  const toggleMonthDay = useCallback((day) => {
    setDraftMonthDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  const toggleYearMonth = useCallback((month) => {
    setDraftYearMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month],
    );
  }, []);

  const toggleYearDay = useCallback((day) => {
    setDraftYearDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  const handleApplyStartDate = useCallback(() => {
    if (
      repeatEndType === "date" &&
      repeatEndDate &&
      isAfterDay(draftStartDate, repeatEndDate)
    ) {
      toast.show("시작 날짜는 종료 날짜보다 뒤로 선택할 수 없어요");
      return;
    }

    setRepeatStartDate(draftStartDate);

    if (repeatEndType === "date" && draftStartDate > repeatEndDate) {
      setRepeatEndDate(draftStartDate);
    }

    onToggleOpenKey("repeatStart");
  }, [
    draftStartDate,
    repeatEndType,
    repeatEndDate,
    setRepeatStartDate,
    setRepeatEndDate,
    onToggleOpenKey,
  ]);

  const handlePickEndDateFromCalendar = useCallback(
    (date) => {
      if (!date) return;

      if (repeatStartDate && isBeforeDay(date, repeatStartDate)) {
        toast.show("종료 날짜는 시작 날짜보다 앞설 수 없어요");
        return;
      }

      setDraftEndDate(date);
      setDraftEndType("date");
    },
    [repeatStartDate],
  );

  const handleApplyEndDate = useCallback(() => {
    if (repeatStartDate && isBeforeDay(draftEndDate, repeatStartDate)) {
      toast.show("종료 날짜는 시작 날짜보다 앞설 수 없어요");
      return;
    }

    if (draftEndType === "none") {
      setRepeatEndType("none");
      onToggleOpenKey("repeatEnd");
      return;
    }

    setRepeatEndType("date");

    const normalized =
      repeatStartDate && draftEndDate < repeatStartDate
        ? repeatStartDate
        : draftEndDate;

    setRepeatEndDate(normalized);
    onToggleOpenKey("repeatEnd");
  }, [
    draftEndType,
    draftEndDate,
    repeatStartDate,
    setRepeatEndType,
    setRepeatEndDate,
    onToggleOpenKey,
  ]);

  const isApplyDisabled =
    (draftCycle === "weekly" && draftWeekdays.length === 0) ||
    (draftCycle === "monthly" && draftMonthDays.length === 0) ||
    (draftCycle === "yearly" &&
      (draftYearMonths.length === 0 || draftYearDays.length === 0));

  const handleApplyRepeatCycle = useCallback(() => {
    if (isApplyDisabled) return;

    setRepeatCycle(draftCycle);

    setRepeatWeekdays([]);
    setRepeatMonthDays([]);
    setRepeatYearMonths([]);
    setRepeatYearDays([]);

    if (draftCycle === "unset") {
      setRepeatStartDate(null);
      setRepeatEndType("unset");
      setRepeatEndDate(null);
      setRepeatAlarm("unset");
      setRepeatAlarmTime(null);
      onToggleOpenKey("repeatCycle");
      return;
    }

    if (draftCycle === "weekly") setRepeatWeekdays(draftWeekdays);
    if (draftCycle === "monthly") setRepeatMonthDays(draftMonthDays);
    if (draftCycle === "yearly") {
      setRepeatYearMonths(draftYearMonths);
      setRepeatYearDays(draftYearDays);
    }

    const isStartUnset = !repeatStartDate;
    const isEndUnset = repeatEndType !== "none" && repeatEndType !== "date";

    if (isStartUnset && isEndUnset) {
      const today = new Date();
      today.setSeconds(0);
      today.setMilliseconds(0);

      setRepeatStartDate(today);
      setRepeatEndType("none");
    }

    onToggleOpenKey("repeatCycle");
  }, [
    isApplyDisabled,
    draftCycle,
    draftWeekdays,
    draftMonthDays,
    draftYearMonths,
    draftYearDays,
    repeatStartDate,
    repeatEndType,
    setRepeatCycle,
    setRepeatWeekdays,
    setRepeatMonthDays,
    setRepeatYearMonths,
    setRepeatYearDays,
    setRepeatStartDate,
    setRepeatEndType,
    setRepeatEndDate,
    setRepeatAlarm,
    setRepeatAlarmTime,
    onToggleOpenKey,
  ]);

  const handlePickStartDateFromCalendar = useCallback(
    (date) => {
      if (!date) return;

      if (
        repeatEndType === "date" &&
        repeatEndDate &&
        isAfterDay(date, repeatEndDate)
      ) {
        toast.show("시작 날짜는 종료 날짜보다 뒤로 선택할 수 없어요");
        return;
      }

      setDraftStartDate(date);
    },
    [repeatEndType, repeatEndDate],
  );

  const openStartYearMonthWheel = useCallback(() => {
    setYmTarget("start");
    setYmInitial({
      year: startMonthCursor.getFullYear(),
      month: startMonthCursor.getMonth() + 1,
    });
    setYmWheelOpen(true);
  }, [startMonthCursor]);

  const openEndYearMonthWheel = useCallback(() => {
    if (draftEndType === "none") return;

    setYmTarget("end");
    setYmInitial({
      year: endMonthCursor.getFullYear(),
      month: endMonthCursor.getMonth() + 1,
    });
    setYmWheelOpen(true);
  }, [draftEndType, endMonthCursor]);

  const unlockEndCalendarIfNone = useCallback(() => {
    if (draftEndType !== "none") return;
    setDraftEndType("date");
  }, [draftEndType]);

  const handleConfirmYearMonth = useCallback(
    (year, month) => {
      const next = new Date(year, month - 1, 1);

      if (ymTarget === "start") {
        setStartMonthCursor(next);
      } else {
        setEndMonthCursor(next);
      }

      setYmWheelOpen(false);
    },
    [ymTarget],
  );

  const isRepeatStartSet = !!repeatStartDate;
  const isRepeatEndSet = repeatEndType === "none" || repeatEndType === "date";
  const isRepeatCycleSet = repeatCycle && repeatCycle !== "unset";
  const isRepeatAlarmSet = repeatAlarm && repeatAlarm !== "unset";

  const shouldShowRepeatReset =
    isRepeatCycleSet || isRepeatStartSet || isRepeatEndSet || isRepeatAlarmSet;

  const setIsCancelRecurrence = useRepeatEditorStore(
    (s) => s.setIsCancelRecurrence,
  );

  const handleResetRepeatAll = useCallback(() => {
    setIsCancelRecurrence(true);

    setRepeatCycle("unset");
    setRepeatWeekdays([]);
    setRepeatMonthDays([]);
    setRepeatYearMonths([]);
    setRepeatYearDays([]);

    setRepeatStartDate(null);
    setRepeatEndType("unset");
    setRepeatEndDate(null);

    setRepeatAlarm("unset");
    setRepeatAlarmTime(null);

    if (openKey !== null) onToggleOpenKey(openKey);
  }, [
    setIsCancelRecurrence,
    setRepeatCycle,
    setRepeatWeekdays,
    setRepeatMonthDays,
    setRepeatYearMonths,
    setRepeatYearDays,
    setRepeatStartDate,
    setRepeatEndType,
    setRepeatEndDate,
    setRepeatAlarm,
    setRepeatAlarmTime,
    openKey,
    onToggleOpenKey,
  ]);

  const startMonthGrid = useMemo(
    () => buildMonthGrid(startMonthCursor),
    [startMonthCursor],
  );

  const endMonthGrid = useMemo(
    () => buildMonthGrid(endMonthCursor),
    [endMonthCursor],
  );

  const today = useMemo(() => new Date(), []);

  const isApplyStartDisabled = !draftStartDate;
  const isEndNone = draftEndType === "none";
  const isApplyEndDisabled = !isEndNone && !draftEndDate;

  if (!visible) return null;

  return (
    <View className="min-h-[335px]">
      {openKey === null && (
        <RepeatSummaryView
          repeatCycle={repeatCycle}
          repeatWeekdays={repeatWeekdays}
          repeatMonthDays={repeatMonthDays}
          repeatYearMonths={repeatYearMonths}
          repeatYearDays={repeatYearDays}
          repeatStartDate={repeatStartDate}
          repeatEndType={repeatEndType}
          repeatEndDate={repeatEndDate}
          repeatAlarm={repeatAlarm}
          repeatAlarmTime={repeatAlarmTime}
          shouldShowRepeatReset={shouldShowRepeatReset}
          handleResetRepeatAll={handleResetRepeatAll}
          guardOpen={guardOpen}
          onToggleOpenKey={onToggleOpenKey}
        />
      )}

      {openKey === "repeatCycle" && (
        <RepeatCyclePanel
          repeatCycle={repeatCycle}
          draftCycle={draftCycle}
          setDraftCycle={setDraftCycle}
          draftWeekdays={draftWeekdays}
          draftMonthDays={draftMonthDays}
          draftYearMonths={draftYearMonths}
          draftYearDays={draftYearDays}
          toggleWeekday={toggleWeekday}
          toggleMonthDay={toggleMonthDay}
          toggleYearMonth={toggleYearMonth}
          toggleYearDay={toggleYearDay}
          isApplyDisabled={isApplyDisabled}
          handleApplyRepeatCycle={handleApplyRepeatCycle}
          onToggleOpenKey={onToggleOpenKey}
        />
      )}

      {openKey === "repeatStart" && (
        <RepeatStartDatePanel
          repeatStartDate={repeatStartDate}
          draftStartDate={draftStartDate}
          startMonthCursor={startMonthCursor}
          setStartMonthCursor={setStartMonthCursor}
          startMonthGrid={startMonthGrid}
          today={today}
          handlePickStartDateFromCalendar={handlePickStartDateFromCalendar}
          handleApplyStartDate={handleApplyStartDate}
          isApplyStartDisabled={isApplyStartDisabled}
          openStartYearMonthWheel={openStartYearMonthWheel}
          onToggleOpenKey={onToggleOpenKey}
        />
      )}

      {openKey === "repeatEnd" && (
        <RepeatEndDatePanel
          repeatEndType={repeatEndType}
          repeatEndDate={repeatEndDate}
          draftEndType={draftEndType}
          setDraftEndType={setDraftEndType}
          draftEndDate={draftEndDate}
          endMonthCursor={endMonthCursor}
          setEndMonthCursor={setEndMonthCursor}
          endMonthGrid={endMonthGrid}
          today={today}
          isApplyEndDisabled={isApplyEndDisabled}
          handleApplyEndDate={handleApplyEndDate}
          handlePickEndDateFromCalendar={handlePickEndDateFromCalendar}
          openEndYearMonthWheel={openEndYearMonthWheel}
          unlockEndCalendarIfNone={unlockEndCalendarIfNone}
          onToggleOpenKey={onToggleOpenKey}
        />
      )}

      {openKey === "repeatAlarm" && (
        <RepeatAlarmPanel
          repeatAlarm={repeatAlarm}
          repeatAlarmTime={repeatAlarmTime}
          repeatAlarmDraftDate={repeatAlarmDraftDate}
          hasPickedRepeatAlarmTime={hasPickedRepeatAlarmTime}
          isIosInlineRepeatAlarmPickerOpen={isIosInlineRepeatAlarmPickerOpen}
          setRepeatAlarmDraftDate={setRepeatAlarmDraftDate}
          setHasPickedRepeatAlarmTime={setHasPickedRepeatAlarmTime}
          setIsIosInlineRepeatAlarmPickerOpen={
            setIsIosInlineRepeatAlarmPickerOpen
          }
          setRepeatAlarm={setRepeatAlarm}
          setRepeatAlarmTime={setRepeatAlarmTime}
          onToggleOpenKey={onToggleOpenKey}
        />
      )}

      <YearMonthWheelModal
        visible={ymWheelOpen}
        initialYear={ymInitial.year}
        initialMonth={ymInitial.month}
        onCancel={() => setYmWheelOpen(false)}
        onConfirm={handleConfirmYearMonth}
      />
    </View>
  );
}
