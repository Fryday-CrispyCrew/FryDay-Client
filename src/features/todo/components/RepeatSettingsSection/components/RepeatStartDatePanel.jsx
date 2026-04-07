import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import RepeatRow from "./RepeatRow";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";
import colors from "../../../../../shared/styles/colors";
import { formatKoreanDate } from "../../../utils/dateFormat";
import { WEEKDAYS } from "../constants/repeatConstants";
import { addMonths, isSameDay } from "../utils/date";

export default function RepeatStartDatePanel({
  repeatStartDate,
  draftStartDate,
  startMonthCursor,
  setStartMonthCursor,
  startMonthGrid,
  today,
  handlePickStartDateFromCalendar,
  handleApplyStartDate,
  isApplyStartDisabled,
  openStartYearMonthWheel,
  onToggleOpenKey,
}) {
  return (
    <View className="relative flex-1">
      <RepeatRow
        label="반복 시작 날짜"
        value={formatKoreanDate(repeatStartDate)}
        isOpen
        onPress={() => onToggleOpenKey("repeatStart")}
      />

      <View>
        <View className="h-[38px] flex-row items-center gap-[10px]">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStartMonthCursor((d) => addMonths(d, -1))}
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
            onPress={openStartYearMonthWheel}
          >
            <Text
              style={{
                fontFamily: "Pretendard-SemiBold",
                fontSize: 14,
                lineHeight: 21,
                color: colors.bk,
              }}
            >
              {startMonthCursor.getFullYear()}년{" "}
              {startMonthCursor.getMonth() + 1}월
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setStartMonthCursor((d) => addMonths(d, 1))}
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
        </View>

        <View className="mb-2 mt-[10px] flex-row">
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
        </View>

        <View
          className="min-h-[145px] flex-row flex-wrap"
          style={{ rowGap: 10 }}
        >
          {startMonthGrid.map((cellDate, i) => {
            const isEmpty = !cellDate;
            const selected = cellDate
              ? isSameDay(cellDate, draftStartDate)
              : false;
            const isToday = cellDate ? isSameDay(cellDate, today) : false;
            const useTodayStyle = isToday && !selected;

            return (
              <TouchableOpacity
                key={`start-${i}`}
                disabled={isEmpty}
                activeOpacity={0.85}
                onPress={() => handlePickStartDateFromCalendar(cellDate)}
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

      <View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleApplyStartDate}
          className="h-11 w-[100px] self-end items-center justify-center rounded-2xl"
          style={{
            backgroundColor: isApplyStartDisabled ? colors.gr200 : colors.or,
          }}
        >
          <Text
            style={{
              fontFamily: "Pretendard-SemiBold",
              fontSize: 14,
              color: isApplyStartDisabled ? colors.gr300 : colors.wt,
            }}
          >
            적용하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
