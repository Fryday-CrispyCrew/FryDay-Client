import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RepeatRow from "./RepeatRow";
import AppText from "../../../../../shared/components/AppText";
import colors from "../../../../../shared/styles/colors";
import {
  REPEAT_CYCLE_OPTIONS,
  WEEKDAY_OPTIONS,
} from "../constants/repeatConstants";
import { cycleLabel } from "../utils/labels";

export default function RepeatCyclePanel({
  repeatCycle,
  draftCycle,
  setDraftCycle,
  draftWeekdays,
  draftMonthDays,
  draftYearMonths,
  draftYearDays,
  toggleWeekday,
  toggleMonthDay,
  toggleYearMonth,
  toggleYearDay,
  isApplyDisabled,
  handleApplyRepeatCycle,
  onToggleOpenKey,
}) {
  return (
    <View className="relative flex-1 pb-[68px]">
      <RepeatRow
        label="반복 주기"
        value={cycleLabel(repeatCycle)}
        isOpen
        onPress={() => onToggleOpenKey("repeatCycle")}
      />

      <View className="mb-6 mt-2">
        <View
          className="flex-row items-center rounded-full"
          style={{ backgroundColor: colors.gr100 }}
        >
          {REPEAT_CYCLE_OPTIONS.map((opt) => {
            const isActive = draftCycle === opt.key;

            return (
              <TouchableOpacity
                key={opt.key}
                activeOpacity={0.85}
                onPress={() =>
                  setDraftCycle((prev) =>
                    prev === opt.key ? "unset" : opt.key,
                  )
                }
                className="flex-1 items-center justify-center rounded-full py-[10px]"
                style={
                  isActive
                    ? {
                        backgroundColor: colors.wt,
                        borderWidth: 1,
                        borderColor: colors.or,
                      }
                    : undefined
                }
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: isActive ? colors.or : colors.gr300,
                    fontWeight: isActive ? "600" : "400",
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {draftCycle === "weekly" && (
        <View className="mb-6 mt-3 flex-row justify-between">
          {WEEKDAY_OPTIONS.map((d) => {
            const active = draftWeekdays.includes(d.key);

            return (
              <TouchableOpacity
                key={d.key}
                activeOpacity={0.85}
                onPress={() => toggleWeekday(d.key)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: active ? colors.or : colors.gr100 }}
              >
                <AppText
                  variant="M500"
                  style={{ color: active ? colors.wt : colors.gr300 }}
                >
                  {d.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {draftCycle === "monthly" && (
        <View className="flex-row flex-wrap" style={{ rowGap: 12 }}>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
            const active = draftMonthDays.includes(day);

            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.85}
                onPress={() => toggleMonthDay(day)}
                className="items-center justify-center"
                style={{ width: `${100 / 7.01}%` }}
              >
                <View
                  className="h-[18px] w-[18px] items-center justify-center"
                  style={
                    active
                      ? {
                          aspectRatio: 1,
                          borderWidth: 1,
                          borderColor: colors.or,
                          borderRadius: 24,
                        }
                      : undefined
                  }
                >
                  <Text
                    style={{
                      fontFamily: "Pretendard-Medium",
                      fontSize: 10,
                      lineHeight: 12,
                      color: active ? colors.or : colors.bk,
                    }}
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
        <View>
          <Text
            style={{
              fontFamily: "Pretendard-Medium",
              fontSize: 12,
              color: colors.gr400 ?? "#5D5E60",
              marginBottom: 10,
            }}
          >
            반복 월 선택
          </Text>

          <View className="flex-row flex-wrap" style={{ rowGap: 12 }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const active = draftYearMonths.includes(month);

              return (
                <TouchableOpacity
                  key={month}
                  activeOpacity={0.85}
                  onPress={() => toggleYearMonth(month)}
                  className="items-center justify-center"
                  style={{ width: `${100 / 6}%` }}
                >
                  <View
                    className="h-[18px] w-[18px] items-center justify-center rounded-full"
                    style={
                      active
                        ? {
                            aspectRatio: 1,
                            borderWidth: 1,
                            borderColor: colors.or,
                            borderRadius: 24,
                          }
                        : undefined
                    }
                  >
                    <Text
                      style={{
                        fontFamily: "Pretendard-Medium",
                        fontSize: 10,
                        lineHeight: 12,
                        color: active ? colors.or : colors.bk,
                      }}
                    >
                      {month}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            style={{
              fontFamily: "Pretendard-Medium",
              fontSize: 12,
              color: colors.gr400 ?? "#5D5E60",
              marginTop: 18,
              marginBottom: 10,
            }}
          >
            반복 일 선택
          </Text>

          <View className="flex-row flex-wrap" style={{ rowGap: 12 }}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const active = draftYearDays.includes(day);

              return (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.85}
                  onPress={() => toggleYearDay(day)}
                  className="items-center justify-center"
                  style={{ width: `${100 / 7.01}%` }}
                >
                  <View
                    className="h-[18px] w-[18px] items-center justify-center"
                    style={
                      active
                        ? {
                            aspectRatio: 1,
                            borderWidth: 1,
                            borderColor: colors.or,
                            borderRadius: 24,
                          }
                        : undefined
                    }
                  >
                    <Text
                      style={{
                        fontFamily: "Pretendard-Medium",
                        fontSize: 10,
                        lineHeight: 12,
                        color: active ? colors.or : colors.bk,
                      }}
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
        onPress={handleApplyRepeatCycle}
        className="absolute bottom-6 h-11 w-[100px] self-end items-center justify-center rounded-2xl"
        style={{ backgroundColor: isApplyDisabled ? colors.gr200 : colors.or }}
      >
        <Text
          style={{
            fontFamily: "Pretendard-SemiBold",
            fontSize: 14,
            color: isApplyDisabled ? colors.gr300 : colors.wt,
          }}
        >
          적용하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
