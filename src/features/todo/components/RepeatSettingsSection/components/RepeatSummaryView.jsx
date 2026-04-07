import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RepeatRow from "./RepeatRow";
import RepeatOffIcon from "../../../assets/svg/todoEditorSheet/RepeatSettingsSection/RepeatOff.svg";
import colors from "../../../../../shared/styles/colors";
import { formatKoreanDate } from "../../../utils/dateFormat";
import { alarmLabel, repeatCycleLabel } from "../utils/labels";

export default function RepeatSummaryView({
  repeatCycle,
  repeatWeekdays,
  repeatMonthDays,
  repeatYearMonths,
  repeatYearDays,
  repeatStartDate,
  repeatEndType,
  repeatEndDate,
  repeatAlarm,
  repeatAlarmTime,
  shouldShowRepeatReset,
  handleResetRepeatAll,
  guardOpen,
  onToggleOpenKey,
}) {
  return (
    <>
      <RepeatRow
        label="반복 주기"
        value={repeatCycleLabel({
          repeatCycle,
          repeatWeekdays,
          repeatMonthDays,
          repeatYearMonths,
          repeatYearDays,
        })}
        onPress={() => onToggleOpenKey("repeatCycle")}
      />

      <View
        className="my-2 h-[1px]"
        style={{ backgroundColor: colors.gr100 }}
      />

      <RepeatRow
        label="반복 시작 날짜"
        value={repeatStartDate ? formatKoreanDate(repeatStartDate) : "미설정"}
        onPress={() => guardOpen("repeatStart")}
      />

      <View
        className="my-2 h-[1px]"
        style={{ backgroundColor: colors.gr100 }}
      />

      <RepeatRow
        label="반복 종료 날짜"
        value={
          repeatEndType === "none"
            ? "종료 없음"
            : repeatEndType === "date"
              ? formatKoreanDate(repeatEndDate)
              : "미설정"
        }
        onPress={() => guardOpen("repeatEnd")}
      />

      <View
        className="my-2 h-[1px]"
        style={{ backgroundColor: colors.gr100 }}
      />

      <RepeatRow
        label="반복 알림 설정"
        value={alarmLabel(repeatAlarm, repeatAlarmTime)}
        onPress={() => guardOpen("repeatAlarm")}
      />

      {shouldShowRepeatReset && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleResetRepeatAll}
          className="absolute bottom-[50px] right-0 flex-row items-center gap-1 rounded-2xl px-[10px] py-[6px]"
          style={{ backgroundColor: colors.gr200 }}
        >
          <RepeatOffIcon width={14} height={14} />
          <Text
            style={{
              fontFamily: "Pretendard-SemiBold",
              fontSize: 12,
              lineHeight: 18,
              color: colors.gr700,
            }}
          >
            반복 해제
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
}
