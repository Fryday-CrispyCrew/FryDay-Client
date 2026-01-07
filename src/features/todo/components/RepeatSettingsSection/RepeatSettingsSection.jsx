// src/features/todo/components/RepeatSettingsSection/RepeatSettingsSection.jsx
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Switch,
} from "react-native";
import RadioOn from "../../assets/svg/RadioOn.svg";
import RadioOff from "../../assets/svg/RadioOff.svg";
import DateTimePicker from "@react-native-community/datetimepicker";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {useRepeatEditorStore} from "../../stores/repeatEditorStore";
import {formatKoreanDate} from "../../utils/dateFormat";
import colors from "../../../../shared/styles/colors";
import YearMonthWheelModal from "./wheel/YearMonthWheelModal";
import AlarmTimeSettingSection from "../TodoEditorSheet/AlarmTimeSettingsSection";
import ChevronIcon from "../../../../shared/components/ChevronIcon";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const addMonths = (date, delta) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + delta);
  return d;
};

/**
 * 월 달력 grid 생성 (7열 고정)
 * - 빈 칸은 null
 */
const buildMonthGrid = (monthDate) => {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth(); // 0~11
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startDow = first.getDay(); // 0(일)~6(토)

  const daysInMonth = last.getDate();
  const cells = [];

  // leading blanks
  for (let i = 0; i < startDow; i++) cells.push(null);
  // days
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(y, m, day));
  }
  // trailing blanks to fill 7 columns
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
};

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
    (s) => s.setRepeatYearMonths
  );
  const setRepeatYearDays = useRepeatEditorStore((s) => s.setRepeatYearDays);

  const [draftStartDate, setDraftStartDate] = useState(
    repeatStartDate ?? new Date()
  );
  const [draftEndType, setDraftEndType] = useState(repeatEndType); // "none" | "date"
  const [draftEndDate, setDraftEndDate] = useState(repeatEndDate ?? new Date());
  const [endMonthCursor, setEndMonthCursor] = useState(() => {
    const base = repeatEndDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [draftCycle, setDraftCycle] = useState(repeatCycle);
  const [draftWeekdays, setDraftWeekdays] = useState([]);
  const [draftMonthDays, setDraftMonthDays] = useState([]);
  const [draftYearMonths, setDraftYearMonths] = useState([]);
  const [draftYearDays, setDraftYearDays] = useState([]);

  // ===== 반복 알림 설정(Repeat Alarm) 전용 상태 =====
  const [repeatAlarmDraftDate, setRepeatAlarmDraftDate] = useState(new Date());
  // const [repeatAlarmTime, setRepeatAlarmTime] = useState(null); // "HH   :   mm" 형태로 저장
  const [hasPickedRepeatAlarmTime, setHasPickedRepeatAlarmTime] =
    useState(false);
  const [
    isIosInlineRepeatAlarmPickerOpen,
    setIsIosInlineRepeatAlarmPickerOpen,
  ] = useState(false);

  // ✅ repeatStart 캘린더 표시용(월 이동 상태)
  const [startMonthCursor, setStartMonthCursor] = useState(() => {
    const base = repeatStartDate ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const [ymWheelOpen, setYmWheelOpen] = useState(false);
  const [ymTarget, setYmTarget] = useState("start"); // "start" | "end"
  const [ymInitial, setYmInitial] = useState({year: 0, month: 0}); // month: 1~12

  // ✅ repeatStart 열릴 때: 선택된 시작 날짜 기준으로 캘린더 월 커서 맞추기
  useEffect(() => {
    if (openKey === "repeatStart") {
      const base = repeatStartDate ?? new Date();
      setDraftStartDate(base); // ✅ 드롭다운 열릴 때 현재 값으로 세팅
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

      // 종료일은 시작일보다 빠를 수 없게 보정
      const normalized =
        repeatStartDate && base < repeatStartDate ? repeatStartDate : base;

      setDraftEndDate(normalized);
      setEndMonthCursor(
        new Date(normalized.getFullYear(), normalized.getMonth(), 1)
      );
    }
  }, [openKey, repeatEndType, repeatEndDate, repeatStartDate]);

  // repeatCycle 드롭다운이 열릴 때마다 현재 store 값을 draft로 동기화
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

    // custom 시간이 있으면 그 시간을 draft에 반영
    if (repeatAlarm === "custom" && repeatAlarmTime) {
      const [hh, mm] = repeatAlarmTime.split(":").map((n) => Number(n));
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

  const toggleWeekday = useCallback((key) => {
    setDraftWeekdays((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const toggleMonthDay = useCallback((day) => {
    setDraftMonthDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const toggleYearMonth = useCallback((month) => {
    setDraftYearMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  }, []);

  const toggleYearDay = useCallback((day) => {
    setDraftYearDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const openAndroidDatePicker = useCallback(
    (kind) => {
      DateTimePickerAndroid.open({
        value: kind === "start" ? repeatStartDate : repeatEndDate,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event?.type === "dismissed") return;
          if (!selectedDate) return;

          if (kind === "start") {
            setRepeatStartDate(selectedDate);

            // 시작일이 종료일보다 뒤면 종료일도 당겨주기
            if (repeatEndType === "date" && selectedDate > repeatEndDate) {
              setRepeatEndDate(selectedDate);
            }
          } else {
            setRepeatEndType("date");
            setRepeatEndDate(selectedDate);
          }
        },
      });
    },
    [
      repeatStartDate,
      repeatEndDate,
      repeatEndType,
      setRepeatStartDate,
      setRepeatEndType,
      setRepeatEndDate,
    ]
  );

  //반복 시작 날짜 관련
  const isApplyStartDisabled = !draftStartDate;

  const handleApplyStartDate = useCallback(() => {
    setRepeatStartDate(draftStartDate);

    // 시작일이 종료일보다 뒤면 종료일도 당겨주기(기존 규칙 유지)
    if (repeatEndType === "date" && draftStartDate > repeatEndDate) {
      setRepeatEndDate(draftStartDate);
    }

    onToggleOpenKey("repeatStart"); // ✅ 드롭다운 닫기
  }, [
    draftStartDate,
    setRepeatStartDate,
    repeatEndType,
    repeatEndDate,
    setRepeatEndDate,
    onToggleOpenKey,
  ]);

  //반복 종료 날짜 관련
  const endMonthGrid = useMemo(
    () => buildMonthGrid(endMonthCursor),
    [endMonthCursor]
  );

  const handlePickEndDateFromCalendar = useCallback(
    (date) => {
      if (!date) return;

      // 종료일은 시작일보다 빠를 수 없음
      const normalized =
        repeatStartDate && date < repeatStartDate ? repeatStartDate : date;

      setDraftEndDate(normalized);
      setDraftEndType("date");
    },
    [repeatStartDate]
  );

  const isEndNone = draftEndType === "none";

  // ✅ "반복 종료 없음"이 아니고 && 날짜가 없을 때만 disabled
  const isApplyEndDisabled = !isEndNone && !draftEndDate;

  const handleApplyEndDate = useCallback(() => {
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

  // 반복 주기 관련
  const isApplyDisabled =
    draftCycle === "unset" ||
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

    if (draftCycle === "weekly") setRepeatWeekdays(draftWeekdays);
    if (draftCycle === "monthly") setRepeatMonthDays(draftMonthDays);
    if (draftCycle === "yearly") {
      setRepeatYearMonths(draftYearMonths);
      setRepeatYearDays(draftYearDays);
    }

    // ✅ 주기를 처음 설정하는 순간: 시작=오늘, 종료=종료 없음 기본값 세팅
    // (처음 상태에서만 자동 세팅되도록 조건 걸기)
    const isStartUnset = !repeatStartDate;
    const isEndUnset = repeatEndType !== "none" && repeatEndType !== "date";

    if (isStartUnset && isEndUnset) {
      const today = new Date();
      today.setSeconds(0);
      today.setMilliseconds(0);

      setRepeatStartDate(today);
      setRepeatEndType("none");
      // endDate는 none일 때 굳이 세팅할 필요 없지만, store 정책에 따라 유지해도 됨
    }

    onToggleOpenKey("repeatCycle");
  }, [
    isApplyDisabled,
    draftCycle,
    draftWeekdays,
    draftMonthDays,
    draftYearMonths,
    draftYearDays,
    setRepeatCycle,
    setRepeatWeekdays,
    setRepeatMonthDays,
    setRepeatYearMonths,
    setRepeatYearDays,
    onToggleOpenKey,
    repeatStartDate,
    repeatEndType,
    setRepeatStartDate,
    setRepeatEndType,
  ]);

  // ✅ repeatStart 캘린더 grid
  const startMonthGrid = useMemo(
    () => buildMonthGrid(startMonthCursor),
    [startMonthCursor]
  );

  const today = useMemo(() => new Date(), []);

  const handlePickStartDateFromCalendar = useCallback((date) => {
    if (!date) return;
    setDraftStartDate(date); // ✅ store 반영 X, 임시값만 변경
  }, []);

  const openStartYearMonthWheel = () => {
    setYmInitial({
      year: startMonthCursor.getFullYear(),
      month: startMonthCursor.getMonth() + 1,
    });
    setYmWheelOpen(true);
  };

  const openEndYearMonthWheel = useCallback(() => {
    // ✅ 종료 없음이면 모달 못 열게
    if (draftEndType === "none") return;

    setYmTarget("end");
    setYmInitial({
      year: endMonthCursor.getFullYear(),
      month: endMonthCursor.getMonth() + 1,
    });
    setYmWheelOpen(true);
  }, [draftEndType, endMonthCursor]);

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
    [ymTarget]
  );

  const applyStartYearMonth = (year, month) => {
    setStartMonthCursor(new Date(year, month - 1, 1));
    setYmWheelOpen(false);
  };

  if (!visible) return null;

  return (
    <View style={styles.repeatPanel}>
      {openKey === null && (
        <>
          <Row
            label="반복 주기"
            value={cycleLabel(repeatCycle)}
            onPress={() => onToggleOpenKey("repeatCycle")}
          />
          <View style={styles.rowDivider} />
          <Row
            label="반복 시작 날짜"
            value={
              repeatStartDate ? formatKoreanDate(repeatStartDate) : "미설정"
            }
            onPress={() => onToggleOpenKey("repeatStart")}
          />
          <View style={styles.rowDivider} />
          <Row
            label="반복 종료 날짜"
            value={
              repeatEndType === "none"
                ? "종료 없음"
                : repeatEndType === "date"
                  ? formatKoreanDate(repeatEndDate)
                  : "미설정"
            }
            onPress={() => onToggleOpenKey("repeatEnd")}
          />
          <View style={styles.rowDivider} />
          <Row
            label="반복 알림 설정"
            value={alarmLabel(repeatAlarm, repeatAlarmTime)}
            onPress={() => onToggleOpenKey("repeatAlarm")}
          />
        </>
      )}

      {openKey === "repeatCycle" && (
        <View>
          <RowOpen
            label="반복 주기"
            value={cycleLabel(repeatCycle)}
            onPress={() => onToggleOpenKey("repeatCycle")}
          />

          <View style={styles.segmentWrap}>
            <View style={styles.segmentPill}>
              {[
                {key: "daily", label: "매일"},
                {key: "weekly", label: "매주"},
                {key: "monthly", label: "매월"},
                {key: "yearly", label: "매년"},
              ].map((opt) => {
                const isActive = draftCycle === opt.key;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    activeOpacity={0.85}
                    onPress={() => setDraftCycle(opt.key)}
                    style={[
                      styles.segmentItem,
                      isActive && styles.segmentItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isActive && styles.segmentTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {draftCycle === "weekly" && (
            <View style={styles.weekdayRow}>
              {[
                {key: "mon", label: "월"},
                {key: "tue", label: "화"},
                {key: "wed", label: "수"},
                {key: "thu", label: "목"},
                {key: "fri", label: "금"},
                {key: "sat", label: "토"},
                {key: "sun", label: "일"},
              ].map((d) => {
                const active = draftWeekdays.includes(d.key);
                return (
                  <TouchableOpacity
                    key={d.key}
                    activeOpacity={0.85}
                    onPress={() => toggleWeekday(d.key)}
                    style={[
                      styles.weekdayChip,
                      active && styles.weekdayChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekdayText,
                        active && styles.weekdayTextActive,
                      ]}
                    >
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {draftCycle === "monthly" && (
            <View style={styles.monthGrid}>
              {Array.from({length: 31}, (_, i) => i + 1).map((day) => {
                const active = draftMonthDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    activeOpacity={0.85}
                    onPress={() => toggleMonthDay(day)}
                    style={styles.monthCell}
                  >
                    <View
                      style={[
                        styles.monthCircle,
                        active && styles.monthCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthText,
                          active && styles.monthTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {draftCycle === "yearly" && (
            <View style={styles.yearlyWrap}>
              <Text style={styles.yearlyLabel}>반복 월 선택</Text>

              <View style={styles.yearMonthGrid}>
                {Array.from({length: 12}, (_, i) => i + 1).map((m) => {
                  const active = draftYearMonths.includes(m);
                  return (
                    <TouchableOpacity
                      key={m}
                      activeOpacity={0.85}
                      onPress={() => toggleYearMonth(m)}
                      style={styles.yearMonthCell}
                    >
                      <View
                        style={[
                          styles.yearMonthChip,
                          active && styles.yearMonthChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.yearMonthText,
                            active && styles.yearMonthTextActive,
                          ]}
                        >
                          {m}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.yearlyLabel, {marginTop: 18}]}>
                반복 일 선택
              </Text>

              <View style={styles.monthGrid}>
                {Array.from({length: 31}, (_, i) => i + 1).map((day) => {
                  const active = draftYearDays.includes(day);
                  return (
                    <TouchableOpacity
                      key={day}
                      activeOpacity={0.85}
                      onPress={() => toggleYearDay(day)}
                      style={styles.monthCell}
                    >
                      <View
                        style={[
                          styles.monthCircle,
                          active && styles.monthCircleActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.monthText,
                            active && styles.monthTextActive,
                          ]}
                        >
                          {day}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.9}
            disabled={isApplyDisabled}
            style={[
              styles.applyButton,
              isApplyDisabled && styles.applyButtonDisabled,
            ]}
            onPress={handleApplyRepeatCycle}
          >
            <Text
              style={[
                styles.applyButtonText,
                isApplyDisabled && styles.applyButtonTextDisabled,
              ]}
            >
              적용하기
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ✅ 반복 시작 날짜 - 첨부 스샷처럼 캘린더 펼치기 */}
      {openKey === "repeatStart" && (
        <View>
          <RowOpen
            label="반복 시작 날짜"
            value={formatKoreanDate(repeatStartDate)}
            onPress={() => onToggleOpenKey("repeatStart")}
          />

          {/* 필요하면 Android도 네이티브 picker가 아니라 이 캘린더를 그대로 쓰면 됨 */}
          {/* 지금 요구사항(스샷 UI)대로면 아래 커스텀 캘린더를 우선 렌더 */}
          <View style={styles.calendarWrap}>
            {/* 월 네비게이션 */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setStartMonthCursor((d) => addMonths(d, -1))}
                style={styles.monthNavBtn}
                hitSlop={8}
              >
                <ChevronIcon
                  direction="left"
                  size={18}
                  color={colors.gr500}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={openStartYearMonthWheel}>
                <Text style={styles.calendarHeaderText}>
                  {startMonthCursor.getFullYear()}년{" "}
                  {startMonthCursor.getMonth() + 1}월
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setStartMonthCursor((d) => addMonths(d, 1))}
                style={styles.monthNavBtn}
                hitSlop={8}
              >
                <ChevronIcon
                  direction="right"
                  size={18}
                  color={colors.gr500}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>

            {/* 요일 */}
            <View style={styles.weekHeaderRow}>
              {WEEKDAYS.map((w, idx) => (
                <View key={w} style={styles.weekHeaderCell}>
                  <Text
                    style={[
                      styles.weekHeaderText,
                      idx === 0 && styles.weekHeaderSun,
                      idx === 6 && styles.weekHeaderSat,
                    ]}
                  >
                    {w}
                  </Text>
                </View>
              ))}
            </View>

            {/* 날짜 grid */}
            <View style={styles.calendarGrid}>
              {startMonthGrid.map((cellDate, i) => {
                const isEmpty = !cellDate;
                const selected = cellDate
                  ? isSameDay(cellDate, draftStartDate)
                  : false;
                const isToday = cellDate ? isSameDay(cellDate, today) : false;

                // ✅ 오늘이더라도 "선택"이면 오늘 스타일을 쓰지 않음
                const useTodayStyle = isToday && !selected;

                return (
                  <TouchableOpacity
                    key={`d-${i}`}
                    disabled={isEmpty}
                    activeOpacity={0.85}
                    onPress={() => handlePickStartDateFromCalendar(cellDate)}
                    style={styles.dayCell}
                  >
                    {isEmpty ? (
                      <View style={styles.dayCircle} />
                    ) : (
                      <View
                        style={[
                          styles.dayCircle,
                          selected && styles.daySelectedCircle,
                          useTodayStyle && styles.dayTodayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            selected && styles.daySelectedText,
                            useTodayStyle && styles.dayTodayText,
                          ]}
                        >
                          {cellDate.getDate()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.repeatStartButtonSection}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleApplyStartDate}
              style={[
                styles.applyButton,
                isApplyStartDisabled && styles.applyButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.applyButtonText,
                  isApplyStartDisabled && styles.applyButtonTextDisabled,
                ]}
              >
                적용하기
              </Text>
            </TouchableOpacity>
          </View>

          {/* (원하면) Android에서 네이티브 picker로도 진입할 수 있게 보조 옵션 유지 가능 */}
          {/* {Platform.OS === "android" && (
            <Option text="날짜 선택하기" onPress={() => openAndroidDatePicker("start")} />
          )} */}
        </View>
      )}

      {openKey === "repeatEnd" && (
        <View>
          <RowOpen
            label="반복 종료 날짜"
            value={
              repeatEndType === "none"
                ? "종료 없음"
                : formatKoreanDate(repeatEndDate)
            }
            onPress={() => onToggleOpenKey("repeatEnd")}
          />
          {/* 캘린더 (repeatStart UI 재사용) */}
          <View
            style={[
              styles.calendarWrap,
              isEndNone && styles.calendarWrapDisabled,
            ]}
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setEndMonthCursor((d) => addMonths(d, -1))}
                style={styles.monthNavBtn}
                hitSlop={8}
              >
                <ChevronIcon
                  direction="left"
                  size={18}
                  color={colors.gr500}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={openEndYearMonthWheel}
                disabled={draftEndType === "none"} // ✅ 종료 없음일 때는 탭 비활성
              >
                <Text style={styles.calendarHeaderText}>
                  {endMonthCursor.getFullYear()}년{" "}
                  {endMonthCursor.getMonth() + 1}월
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setEndMonthCursor((d) => addMonths(d, 1))}
                style={styles.monthNavBtn}
                hitSlop={8}
              >
                <ChevronIcon
                  direction="right"
                  size={18}
                  color={colors.gr500}
                  strokeWidth={2}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.weekHeaderRow}>
              {WEEKDAYS.map((w, idx) => (
                <View key={w} style={styles.weekHeaderCell}>
                  <Text
                    style={[
                      styles.weekHeaderText,
                      idx === 0 && styles.weekHeaderSun,
                      idx === 6 && styles.weekHeaderSat,
                    ]}
                  >
                    {w}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {endMonthGrid.map((cellDate, i) => {
                const isEmpty = !cellDate;

                const selected =
                  cellDate && draftEndType === "date"
                    ? isSameDay(cellDate, draftEndDate)
                    : false;

                const isToday = cellDate ? isSameDay(cellDate, today) : false;

                // ✅ 오늘이더라도 "선택"이면 오늘 스타일을 쓰지 않음
                const useTodayStyle = isToday && !selected;

                return (
                  <TouchableOpacity
                    key={`end-${i}`}
                    disabled={isEmpty || draftEndType === "none"}
                    activeOpacity={0.85}
                    onPress={() => handlePickEndDateFromCalendar(cellDate)}
                    style={styles.dayCell}
                  >
                    {isEmpty ? (
                      <View style={styles.dayCircle} />
                    ) : (
                      <View
                        style={[
                          styles.dayCircle,
                          selected && styles.daySelectedCircle,
                          useTodayStyle && styles.dayTodayCircle,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            selected && styles.daySelectedText,
                            useTodayStyle && styles.dayTodayText,
                          ]}
                        >
                          {cellDate.getDate()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* 첨부처럼 "반복 종료 없음" 스위치 */}
          <View style={styles.endBottomRow}>
            <View style={styles.endNoneRow}>
              <Text style={styles.endNoneText}>반복 종료 없음</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDraftEndType(isEndNone ? "date" : "none")}
                style={styles.endNoneRadioBtn}
                hitSlop={8}
              >
                {isEndNone ? (
                  <RadioOn width={18} height={18} />
                ) : (
                  <RadioOff width={18} height={18} />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              disabled={isApplyEndDisabled}
              onPress={handleApplyEndDate}
              style={[
                styles.applyButton,
                isApplyEndDisabled && styles.applyButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.applyButtonText,
                  isApplyEndDisabled && styles.applyButtonTextDisabled,
                ]}
              >
                적용하기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {openKey === "repeatAlarm" && (
        <View>
          <RowOpen
            label="반복 알림 설정"
            value={alarmLabel(repeatAlarm, repeatAlarmTime)}
            onPress={() => onToggleOpenKey("repeatAlarm")}
          />
          <View style={styles.repeatAlarmPanel}>
            <AlarmTimeSettingSection
              alarmDraftDate={repeatAlarmDraftDate}
              alarmTime={repeatAlarmTime} // 표시에는 크게 영향 없음(컴포넌트 내부가 hasPicked 기준)
              hasPickedAlarmTime={hasPickedRepeatAlarmTime}
              isIosInlineAlarmPickerOpen={isIosInlineRepeatAlarmPickerOpen}
              setAlarmDraftDate={setRepeatAlarmDraftDate}
              setHasPickedAlarmTime={setHasPickedRepeatAlarmTime}
              setIsIosInlineAlarmPickerOpen={
                setIsIosInlineRepeatAlarmPickerOpen
              }
              setAlarmTime={(t) => {
                // AlarmTimeSettingSection은 "HH   :   mm" 형태로 내려주므로 공백 제거해서 "HH:mm"로 저장
                const compact = t ? t.replace(/\s+/g, "") : null;

                if (!compact) {
                  setRepeatAlarm("unset");
                  setRepeatAlarmTime(null);
                  return;
                }

                setRepeatAlarm("custom");
                setRepeatAlarmTime(compact); // ✅ store에 저장
              }}
              onClosePanel={() => onToggleOpenKey("repeatAlarm")}
            />
          </View>
        </View>
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

function Row({label, value, onPress}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.left}>{label}</Text>
      <View style={styles.right}>
        <Text style={styles.value}>{value}</Text>
        <ChevronIcon
          direction="down"
          size={18}
          color={styles.chev.color}
          strokeWidth={1.5}
        />
      </View>
    </TouchableOpacity>
  );
}

function RowOpen({label, value, onPress}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.left}>{label}</Text>
      <View style={styles.right}>
        <Text style={styles.value}>{value}</Text>
        <ChevronIcon
          direction="up"
          size={18}
          color={styles.chev.color}
          strokeWidth={1.5}
        />
      </View>
    </TouchableOpacity>
  );
}

function Option({text, onPress, active}) {
  return (
    <TouchableOpacity
      style={styles.option}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Text style={[styles.optionText, active && {color: colors.or}]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function PickerBox({children}) {
  return <View style={styles.pickerBox}>{children}</View>;
}

const cycleLabel = (v) =>
  v === "unset"
    ? "미설정"
    : v === "daily"
      ? "매일"
      : v === "weekly"
        ? "매주"
        : v === "monthly"
          ? "매월"
          : "매년";

const alarmLabel = (v, time) =>
  v === "unset"
    ? "미설정"
    : v === "sameTime"
      ? "시작 시간과 동일"
      : v === "morning9"
        ? "오전 9시"
        : (time ?? "미설정");

const styles = StyleSheet.create({
  repeatPanel: {
    minHeight: 335,
    // paddingTop: 14,
  },

  row: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {fontSize: 12, color: "#5D5E60"},
  right: {flexDirection: "row", alignItems: "center", gap: 4},
  value: {fontSize: 12, color: "#5D5E60"},
  chev: {fontSize: 14, color: "#B0B0B0"},
  rowDivider: {height: 1, backgroundColor: colors.gr100, marginVertical: 8},

  option: {
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#F6F6F6",
    marginBottom: 8,
  },
  optionText: {fontSize: 12, color: "#333"},
  pickerBox: {
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
    paddingVertical: 8,
    marginBottom: 8,
  },

  // ===== repeatStart calendar =====
  calendarWrap: {
    // marginTop: 6,
    // borderWidth: 1,
  },
  // ✅ 캘린더 흐리게
  calendarWrapDisabled: {
    opacity: 0.35,
  },
  calendarHeader: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "center",
    height: 38,
    gap: 10,
  },
  monthNavBtn: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarHeaderText: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 14,
    lineHeight: 14 * 1.5,
    color: colors.bk,
  },

  weekHeaderRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 8,
  },
  weekHeaderCell: {
    width: `${100 / 7.01}%`,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  weekHeaderText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 11,
    color: colors.bk,
  },
  weekHeaderSun: {color: colors.or}, // 일
  weekHeaderSat: {color: "#2F6BFF"}, // 토 (스샷 느낌)

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 10,
  },
  dayCell: {
    width: `${100 / 7.01}%`,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  dayCircle: {
    width: "100%",
    height: 20,
    // borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    // borderWidth: 1,
  },
  dayText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 10,
    color: colors.bk,
    lineHeight: 12,
  },
  // 선택 날짜(18일): 테두리
  daySelectedCircle: {
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: 20,

    borderColor: colors.or,
    // backgroundColor: "transparent",
  },
  daySelectedText: {
    color: colors.or,
  },
  // 오늘(19일): 채움
  dayTodayCircle: {
    aspectRatio: 1,
    backgroundColor: colors.or,
    borderRadius: 20,
  },
  dayTodayText: {
    color: colors.wt,
  },
  // ===== repeatCycle 기존 스타일 =====
  segmentWrap: {
    marginTop: 8,
    marginBottom: 24,
  },
  segmentPill: {
    borderRadius: 200,
    backgroundColor: colors.gr100,
    flexDirection: "row",
    alignItems: "center",
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: colors.wt,
    borderWidth: 1,
    borderColor: colors.or,
  },
  segmentText: {
    fontSize: 12,
    color: colors.gr300,
  },
  segmentTextActive: {
    color: colors.or,
    fontWeight: "600",
  },
  endNoneRow: {
    // marginTop: 10,
    // height: 44,
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    gap: 6,
  },
  endBottomRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  endNoneText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: colors.bk,
  },

  // ✅ none일 때 라벨 톤 다운(첨부 2번째처럼)
  endNoneTextDisabled: {
    color: colors.gr300,
  },

  // ✅ 라디오 버튼 터치 영역
  endNoneRadioBtn: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  repeatStartButtonSection: {
    marginTop: 16,
  },

  applyButton: {
    alignSelf: "flex-end",
    height: 44,
    width: 100,
    borderRadius: 16,
    backgroundColor: colors.or,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonDisabled: {
    backgroundColor: colors.gr200,
  },
  applyButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: colors.wt,
    fontSize: 14,
  },
  applyButtonTextDisabled: {
    color: colors.gr300,
  },

  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 24,
  },
  weekdayChip: {
    width: 36,
    height: 36,
    borderRadius: 17,
    backgroundColor: colors.gr100,
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayChipActive: {
    backgroundColor: colors.or,
  },
  weekdayText: {
    fontSize: 12,
    color: colors.gr300,
  },
  weekdayTextActive: {
    color: colors.wt,
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  monthCell: {
    width: `${100 / 7.01}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  monthCircle: {
    width: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  monthCircleActive: {
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.or,
    borderRadius: 24,
  },
  monthText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 10,
    color: colors.bk,
    lineHeight: 12,
  },
  monthTextActive: {
    color: colors.or,
  },

  yearlyWrap: {},
  yearlyLabel: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    color: colors.gr400 ?? "#5D5E60",
    marginBottom: 10,
  },
  yearMonthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  yearMonthCell: {
    width: `${100 / 6}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  yearMonthChip: {
    height: 18,
    width: 18,
    borderRadius: 18,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  yearMonthChipActive: {
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.or,
    borderRadius: 24,
  },
  yearMonthText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 10,
    color: colors.bk,
    lineHeight: 12,
  },
  yearMonthTextActive: {
    color: colors.or,
  },
  repeatAlarmPanel: {
    height: 287,
    justifyContent: "space-evenly",
    paddingBottom: 12,
  },
});
