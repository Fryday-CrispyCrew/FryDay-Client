import React from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import RepeatRow from "./RepeatRow";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";
import RadioOn from "../../../assets/svg/RadioOn.svg";
import RadioOff from "../../../assets/svg/RadioOff.svg";
import colors from "../../../../../shared/styles/colors";
import { formatKoreanDate } from "../../../utils/dateFormat";
import { WEEKDAYS } from "../constants/repeatConstants";
import { addMonths, isSameDay } from "../utils/date";

export default function RepeatEndDatePanel({
  repeatEndType,
  repeatEndDate,
  draftEndType,
  setDraftEndType,
  draftEndDate,
  endMonthCursor,
  setEndMonthCursor,
  endMonthGrid,
  today,
  isApplyEndDisabled,
  handleApplyEndDate,
  handlePickEndDateFromCalendar,
  openEndYearMonthWheel,
  unlockEndCalendarIfNone,
  onToggleOpenKey,
}) {
  const isEndNone = draftEndType === "none";

  return (
    <View>
      <RepeatRow
        label="반복 종료 날짜"
        value={
          repeatEndType === "none"
            ? "종료 없음"
            : formatKoreanDate(repeatEndDate)
        }
        isOpen
        onPress={() => onToggleOpenKey("repeatEnd")}
      />

      <View style={{ opacity: isEndNone ? 0.35 : 1 }}>
        <Pressable
          onPress={unlockEndCalendarIfNone}
          className="h-[38px] flex-row items-center gap-[10px]"
          pointerEvents="auto"
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEndMonthCursor((d) => addMonths(d, -1))}
            disabled={isEndNone}
            className="h-6 w-6 items-center justify-center"
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
            disabled={isEndNone}
          >
            <Text
              style={{
                fontFamily: "Pretendard-SemiBold",
                fontSize: 14,
                lineHeight: 21,
                color: colors.bk,
              }}
            >
              {endMonthCursor.getFullYear()}년 {endMonthCursor.getMonth() + 1}월
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setEndMonthCursor((d) => addMonths(d, 1))}
            disabled={isEndNone}
            className="h-6 w-6 items-center justify-center"
            hitSlop={8}
          >
            <ChevronIcon
              direction="right"
              size={18}
              color={colors.gr500}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </Pressable>

        <Pressable
          onPress={unlockEndCalendarIfNone}
          className="mb-2 mt-[10px] flex-row"
        >
          {WEEKDAYS.map((w, idx) => (
            <View
              key={w}
              className="items-center justify-center"
              style={{ width: `${100 / 7.01}%` }}
            >
              <Text
                style={{
                  fontFamily: "Pretendard-Medium",
                  fontSize: 11,
                  color:
                    idx === 0 ? colors.or : idx === 6 ? "#2F6BFF" : colors.bk,
                }}
              >
                {w}
              </Text>
            </View>
          ))}
        </Pressable>

        <View
          className="min-h-[145px] flex-row flex-wrap"
          style={{ rowGap: 10 }}
        >
          {endMonthGrid.map((cellDate, i) => {
            const isEmpty = !cellDate;
            const selected =
              cellDate && draftEndType === "date"
                ? isSameDay(cellDate, draftEndDate)
                : false;
            const isToday = cellDate ? isSameDay(cellDate, today) : false;
            const useTodayStyle = isToday && !selected;

            return (
              <TouchableOpacity
                key={`end-${i}`}
                disabled={isEmpty}
                activeOpacity={0.85}
                onPress={() => {
                  if (!cellDate) return;

                  if (draftEndType === "none") {
                    setDraftEndType("date");
                    return;
                  }

                  handlePickEndDateFromCalendar(cellDate);
                }}
                className="items-center justify-center"
                style={{ width: `${100 / 7.01}%` }}
              >
                {isEmpty ? (
                  <View className="h-5 w-full items-center justify-center" />
                ) : (
                  <View
                    className="h-5 w-full items-center justify-center"
                    style={[
                      selected && {
                        aspectRatio: 1,
                        borderWidth: 1,
                        borderRadius: 20,
                        borderColor: colors.or,
                      },
                      useTodayStyle && {
                        aspectRatio: 1,
                        borderRadius: 20,
                        backgroundColor: colors.or,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontFamily: "Pretendard-Medium",
                        fontSize: 10,
                        lineHeight: 12,
                        color: selected
                          ? colors.or
                          : useTodayStyle
                            ? colors.wt
                            : colors.bk,
                      }}
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

      <View className="mt-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-[6px]">
          <Text
            style={{
              fontFamily: "Pretendard-Medium",
              fontSize: 12,
              color: colors.bk,
            }}
          >
            반복 종료 없음
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setDraftEndType(isEndNone ? "date" : "none")}
            className="h-7 w-7 items-center justify-center"
            hitSlop={8}
          >
            {isEndNone ? (
              <RadioOn width={18} height={18} color={colors.or} />
            ) : (
              <RadioOff width={18} height={18} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.9}
          disabled={isApplyEndDisabled}
          onPress={handleApplyEndDate}
          className="h-11 w-[100px] items-center justify-center rounded-2xl"
          style={{
            backgroundColor: isApplyEndDisabled ? colors.gr200 : colors.or,
          }}
        >
          <Text
            style={{
              fontFamily: "Pretendard-SemiBold",
              fontSize: 14,
              color: isApplyEndDisabled ? colors.gr300 : colors.wt,
            }}
          >
            적용하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
