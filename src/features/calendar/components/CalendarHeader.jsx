import {View, TouchableOpacity} from "react-native";
import AppText from "../../../shared/components/AppText";

import MonthButton from "../assets/svg/Month.svg";
import WeeklyButton from "../assets/svg/Weekly.svg";
import dayjs from "dayjs";
import BorderButton from "../../../shared/components/BorderButton";
import BackIcon from "../../../shared/assets/svg/Back.svg"
import colors from "../../../shared/styles/colors";

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

      <View
        // className="flex-row items-center gap-4"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >

        {!isTodayDisabled && (
          <BorderButton
            text="오늘로"
            icon={<BackIcon width={14} height={14} />}
            onPress={onPressToday}
          />
        )}
          {mode === "week" ? (
            <BorderButton
              text="월별 보기"
              borderColor={colors.gr200}
              backgroundColor={colors.gr100}
              textColor={colors.gr900}
              textVariant={"M600"}
              icon={<MonthButton width={14} height={14} />}
              onPress={onPressButton}/>

          ) : (
            <BorderButton
              text="주별 보기"
              borderColor={colors.gr200}
              backgroundColor={colors.gr100}
              textColor={colors.gr900}
              textVariant={"M600"}
              icon={<WeeklyButton width={14} height={14} />}
              onPress={onPressButton}/>
          )}

      </View>
    </View>
  );
}
