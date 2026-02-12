import {View, TouchableOpacity} from "react-native";
import AppText from "../../../shared/components/AppText";

import MonthButton from "../assets/svg/Month.svg";
import WeeklyButton from "../assets/svg/Weekly.svg";
import CategoryIcon from "../../todo/assets/svg/Category.svg";
import TodayIcon from "../../todo/assets/svg/Today.svg";
import dayjs from "dayjs";

export default function CalendarHeader({
  date,
  mode,
  onPressButton,
  onPressToday,
  navigation,
  onPressYearMonth,
}) {
  const today = dayjs().startOf("day");

  const isInSameMonth =
    date.year() === today.year() && date.month() === today.month();

  const isInSameWeek = date
    .clone()
    .startOf("week")
    .isSame(today.clone().startOf("week"));

  const isTodayDisabled = mode === "week" ? isInSameWeek : isInSameMonth;

  return (
    <View
      className="w-full flex-row justify-between items-center"
      style={{paddingHorizontal: 20, paddingVertical: 16}}
    >
      <View>
        <TouchableOpacity onPress={onPressYearMonth}>
          <AppText variant="M500" className="text-gr500">
            {date.year()}년
          </AppText>
          <AppText variant="H3" className="text-bk">
            {date.month() + 1}월
          </AppText>
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          onPress={onPressButton}
          className="w-8 h-8 items-center justify-center"
        >
          {mode === "week" ? (
            <MonthButton width={32} height={32} />
          ) : (
            <WeeklyButton width={24} height={24} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={isTodayDisabled ? undefined : onPressToday}
          disabled={isTodayDisabled}
          className="w-8 h-8 items-center justify-center"
          style={{opacity: isTodayDisabled ? 0.35 : 1}}
        >
          <TodayIcon width={24} height={24} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Category", {
              screen: "CategList",
            })
          }
          className="w-8 h-8 items-center justify-center"
        >
          <CategoryIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
