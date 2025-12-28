// src/features/todo/components/RepeatSettingsSection/RepeatSettingsSection.jsx
import React, {useCallback, useEffect, useState} from "react";
import {View, Text, TouchableOpacity, Platform, StyleSheet} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {useRepeatEditorStore} from "../../stores/repeatEditorStore";
import {formatKoreanDate} from "../../utils/dateFormat";
import colors from "../../../../shared/styles/colors";

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

  const setRepeatStartDate = useRepeatEditorStore((s) => s.setRepeatStartDate);
  const setRepeatEndType = useRepeatEditorStore((s) => s.setRepeatEndType);
  const setRepeatEndDate = useRepeatEditorStore((s) => s.setRepeatEndDate);
  const setRepeatCycle = useRepeatEditorStore((s) => s.setRepeatCycle);
  const setRepeatAlarm = useRepeatEditorStore((s) => s.setRepeatAlarm);

  const [draftCycle, setDraftCycle] = useState(repeatCycle);
  const [draftWeekdays, setDraftWeekdays] = useState([]); // ["mon","tue",...]
  const [draftMonthDays, setDraftMonthDays] = useState([]); // number[] (e.g. [1, 12, 28])
  const [draftYearMonths, setDraftYearMonths] = useState([]); // number[] (1~12)
  const [draftYearDays, setDraftYearDays] = useState([]); // number[] (1~31)

  // repeatCycle 드롭다운이 열릴 때마다 현재 store 값을 draft로 동기화
  useEffect(() => {
    if (openKey === "repeatCycle") {
      // setDraftCycle(repeatCycle === "unset" ? "daily" : repeatCycle);
      setDraftCycle(repeatCycle === "unset" ? "yearly" : repeatCycle);
      // ✅ 매주일 때 요일 선택 초기 상태 (요구사항: 기본은 월~토처럼 회색 = 아무것도 선택 X)
      setDraftWeekdays([]);
      // ✅ 매월일 때 날짜 선택 초기 상태 (아무것도 선택 X)
      setDraftMonthDays([]);
      setDraftYearMonths([]);
      setDraftYearDays([]);
    }
  }, [openKey, repeatCycle]);

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

  if (!visible) return null;

  return (
    <View style={styles.repeatPanel}>
      {/* <Text style={styles.repeatTitle}>반복 설정</Text> */}

      {openKey === null && (
        <>
          <Row
            label="반복 시작 날짜"
            value={formatKoreanDate(repeatStartDate)}
            onPress={() => onToggleOpenKey("repeatStart")}
          />
          <View style={styles.rowDivider} />
          <Row
            label="반복 종료 날짜"
            value={
              repeatEndType === "none"
                ? "종료 없음"
                : formatKoreanDate(repeatEndDate)
            }
            onPress={() => onToggleOpenKey("repeatEnd")}
          />
          <View style={styles.rowDivider} />
          <Row
            label="반복 주기"
            value={cycleLabel(repeatCycle)}
            onPress={() => onToggleOpenKey("repeatCycle")}
          />
          <View style={styles.rowDivider} />
          <Row
            label="반복 알림 설정"
            value={alarmLabel(repeatAlarm)}
            onPress={() => onToggleOpenKey("repeatAlarm")}
          />
        </>
      )}

      {openKey === "repeatStart" && (
        <View>
          <RowOpen
            label="반복 시작 날짜"
            value={formatKoreanDate(repeatStartDate)}
            onPress={() => onToggleOpenKey("repeatStart")}
          />
          {Platform.OS === "android" ? (
            <Option
              text="날짜 선택하기"
              onPress={() => openAndroidDatePicker("start")}
            />
          ) : (
            <PickerBox>
              <DateTimePicker
                value={repeatStartDate}
                mode="date"
                display="spinner"
                onChange={(e, date) => date && setRepeatStartDate(date)}
              />
            </PickerBox>
          )}
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
          <Option text="종료 없음" onPress={() => setRepeatEndType("none")} />
          {Platform.OS === "android" ? (
            <Option
              text="종료 날짜 선택하기"
              onPress={() => openAndroidDatePicker("end")}
            />
          ) : (
            <PickerBox>
              <DateTimePicker
                value={repeatEndDate}
                mode="date"
                display="spinner"
                onChange={(e, date) => {
                  if (!date) return;
                  setRepeatEndType("date");
                  setRepeatEndDate(date);
                }}
              />
            </PickerBox>
          )}
        </View>
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

          {/* ✅ 매주 선택 시 요일 선택 UI */}
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

          {/* ✅ 매월 선택 시 날짜(1~31) 선택 UI */}
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

          {/* ✅ 매년 선택 시 월(1~12) + 일(1~31) 선택 UI */}
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
            style={styles.applyButton}
            onPress={() => {
              setRepeatCycle(draftCycle);
              onToggleOpenKey("repeatCycle"); // fold → 나머지 항목 다시 보이게
            }}
          >
            <Text style={styles.applyButtonText}>적용하기</Text>
          </TouchableOpacity>
        </View>
      )}

      {openKey === "repeatAlarm" && (
        <View>
          <RowOpen
            label="반복 알림 설정"
            value={alarmLabel(repeatAlarm)}
            onPress={() => onToggleOpenKey("repeatAlarm")}
          />
          {[
            ["unset", "미설정"],
            ["sameTime", "시작 시간과 동일"],
            ["morning9", "오전 9시"],
            ["custom", "직접 선택"],
          ].map(([key, label]) => (
            <Option
              key={key}
              text={label}
              active={repeatAlarm === key}
              onPress={() => setRepeatAlarm(key)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function Row({label, value, onPress}) {
  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.left}>{label}</Text>
      <View style={styles.right}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.chev}>˅</Text>
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
        <Text style={styles.chev}>˄</Text>
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

const alarmLabel = (v) =>
  v === "unset"
    ? "미설정"
    : v === "sameTime"
      ? "시작 시간과 동일"
      : v === "morning9"
        ? "오전 9시"
        : "직접 선택";

const styles = StyleSheet.create({
  repeatPanel: {
    minHeight: 335,
    marginTop: 14,
    // borderTopWidth: 1,
    // borderTopColor: "#F0F0F0",
    // paddingTop: 10,
  },
  repeatTitle: {fontSize: 12, color: "#B0B0B0", marginBottom: 8},

  row: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // borderWidth: 1,
  },
  left: {fontSize: 12, color: "#5D5E60"},
  right: {flexDirection: "row", alignItems: "center", gap: 8},
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
  segmentWrap: {
    marginTop: 8,
    marginBottom: 24,
  },
  segmentPill: {
    // height: 44,
    borderRadius: 200,
    backgroundColor: colors.gr100,
    flexDirection: "row",
    alignItems: "center",
    // padding: 4,
  },
  segmentItem: {
    flex: 1,
    // height: 44,
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

  applyButton: {
    alignSelf: "flex-end",
    height: 44,
    width: 100,
    // paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.or,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontFamily: "Pretendard-SemiBold",
    color: colors.wt,
    fontSize: 14,
    // fontWeight: "700",
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
    // fontWeight: "600",
  },
  weekdayTextActive: {
    color: colors.wt,
  },
  // ✅ monthly day grid
  monthGrid: {
    // marginTop: 8,
    // marginBottom: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    // borderWidth: 1,
    rowGap: 12,
  },
  monthCell: {
    width: `${100 / 7.01}%`, // 7칸 그리드
    alignItems: "center",
    justifyContent: "center",
    // paddingVertical: 6,
    // borderWidth: 1,
  },
  monthCircle: {
    // borderWidth: 1,
    width: 18,
    height: 18,
    // borderRadius: 20,
    // borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  monthCircleActive: {
    // height: 20,
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.or,
    borderRadius: 24,
  },
  monthText: {
    fontFamily: "Pretendard-Medium",
    fontSize: 10,
    color: "#111111",
    lineHeight: 12,
  },
  monthTextActive: {
    color: colors.or,
    // fontWeight: "600",
  },
  yearlyWrap: {
    // marginTop: 4,
  },

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
    width: `${100 / 6}%`, // 6칸 -> 2줄(1~12)
    alignItems: "center",
    justifyContent: "center",
  },

  yearMonthChip: {
    height: 18,
    width: 18,
    // paddingHorizontal: 10,
    borderRadius: 18,
    // borderWidth: 1,
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
});
