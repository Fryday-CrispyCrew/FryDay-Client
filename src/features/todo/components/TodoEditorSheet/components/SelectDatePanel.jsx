import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";
import YearMonthWheelModal from "../../RepeatSettingsSection/wheel/YearMonthWheelModal";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function SelectDatePanel({
  visible,
  todoMonthCursor,
  setTodoMonthCursor,
  draftTodoDate,
  setDraftTodoDate,
  today,
  todoMonthGrid,
  isSameDay,
  addMonths,
  handlePickDate,
  handleApply,
  isWheelOpen,
  setIsWheelOpen,
  wheelYear,
  setWheelYear,
  wheelMonth,
  setWheelMonth,
}) {
  if (!visible) return null;

  const handleOpenWheel = () => {
    setWheelYear(todoMonthCursor.getFullYear());
    setWheelMonth(todoMonthCursor.getMonth() + 1);
    setIsWheelOpen(true);
  };

  const handleConfirmWheel = (year, month) => {
    setTodoMonthCursor(new Date(year, month - 1, 1));

    setDraftTodoDate((prev) => {
      const base = prev ?? new Date();
      const day = base.getDate();
      const lastDay = new Date(year, month, 0).getDate();
      return new Date(year, month - 1, Math.min(day, lastDay));
    });

    setIsWheelOpen(false);
  };

  return (
    <View className="min-h-[335px]">
      <Text className="py-[15px] text-[12px] leading-[18px] text-gr700 font-pretendard-medium">
        변경할 날짜
      </Text>

      <View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTodoMonthCursor((d) => addMonths(d, -1))}
            className="h-6 w-6 items-center justify-center"
            hitSlop={8}
          >
            <ChevronIcon
              direction="left"
              size={18}
              color="#666666"
              strokeWidth={2}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenWheel}
            hitSlop={8}
          >
            <Text className="text-[14px] leading-[21px] text-bk font-pretendard-semibold">
              {todoMonthCursor.getFullYear()}년 {todoMonthCursor.getMonth() + 1}
              월
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setTodoMonthCursor((d) => addMonths(d, 1))}
            className="h-6 w-6 items-center justify-center"
            hitSlop={8}
          >
            <ChevronIcon
              direction="right"
              size={18}
              color="#666666"
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>

        <View className="mt-4 mb-3 flex-row">
          {WEEKDAYS.map((weekday, idx) => (
            <View
              key={weekday}
              className="items-center justify-center"
              style={{ width: `${100 / 7.01}%` }}
            >
              <Text
                className={[
                  "text-[12px] leading-[18px] font-pretendard-medium",
                  idx === 0 ? "text-rd75" : idx === 6 ? "text-bl75" : "text-bk",
                ].join(" ")}
              >
                {weekday}
              </Text>
            </View>
          ))}
        </View>

        <View
          className="min-h-[150px] flex-row flex-wrap"
          style={{ rowGap: 12 }}
        >
          {todoMonthGrid.map((cellDate, i) => {
            const isEmpty = !cellDate;
            const selected = cellDate
              ? isSameDay(cellDate, draftTodoDate)
              : false;
            const isToday = cellDate ? isSameDay(cellDate, today) : false;
            const useTodayStyle = isToday && !selected;

            return (
              <TouchableOpacity
                key={`todo-d-${i}`}
                disabled={isEmpty}
                activeOpacity={0.85}
                onPress={() => handlePickDate(cellDate)}
                className="items-center justify-center"
                style={{ width: `${100 / 7.01}%` }}
              >
                {isEmpty ? (
                  <View className="h-5 w-full items-center justify-center" />
                ) : (
                  <View
                    className={[
                      "h-5 w-full items-center justify-center",
                      selected
                        ? "aspect-square rounded-full border border-or"
                        : "",
                      useTodayStyle ? "aspect-square rounded-full bg-or" : "",
                    ].join(" ")}
                  >
                    <Text
                      className={[
                        "text-[10px] leading-[15px] text-bk font-pretendard-medium",
                        selected ? "text-or" : "",
                        useTodayStyle ? "text-wt" : "",
                      ].join(" ")}
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

      <View className="mt-4 items-end">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleApply}
          className="h-11 w-[100px] items-center justify-center rounded-2xl bg-or"
        >
          <Text className="text-[14px] text-wt font-pretendard-semibold">
            적용하기
          </Text>
        </TouchableOpacity>
      </View>

      <YearMonthWheelModal
        visible={isWheelOpen}
        initialYear={wheelYear}
        initialMonth={wheelMonth}
        onCancel={() => setIsWheelOpen(false)}
        onConfirm={handleConfirmWheel}
      />
    </View>
  );
}
