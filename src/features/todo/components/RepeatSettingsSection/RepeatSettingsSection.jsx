// src/features/todo/components/RepeatSettingsSection/RepeatSettingsSection.jsx
import React, {useCallback} from "react";
import {View, Text, TouchableOpacity, Platform, StyleSheet} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {DateTimePickerAndroid} from "@react-native-community/datetimepicker";
import {useRepeatEditorStore} from "../../stores/repeatEditorStore";
import {formatKoreanDate} from "../../utils/dateFormat";

const ORANGE = "#FF5722";

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
          {[
            ["unset", "미설정"],
            ["daily", "매일"],
            ["weekly", "매주"],
            ["monthly", "매월"],
            ["yearly", "매년"],
          ].map(([key, label]) => (
            <Option
              key={key}
              text={label}
              active={repeatCycle === key}
              onPress={() => setRepeatCycle(key)}
            />
          ))}
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
      <Text style={[styles.optionText, active && {color: ORANGE}]}>{text}</Text>
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
    height: 335,
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
  },
  left: {fontSize: 12, color: "#5D5E60"},
  right: {flexDirection: "row", alignItems: "center", gap: 8},
  value: {fontSize: 12, color: "#5D5E60"},
  chev: {fontSize: 14, color: "#B0B0B0"},
  rowDivider: {height: 1, backgroundColor: "#F2F2F2", marginVertical: 8},
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
});
