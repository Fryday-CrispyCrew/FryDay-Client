import {View, TouchableOpacity} from "react-native";
import dayjs from "dayjs";
import AppText from "../../../shared/components/AppText";
import ArrowLeft from "../assets/svg/ArrowLeft.svg";
import ArrowRight from "../assets/svg/ArrowRight.svg";

export default function ReportHeader({
  currentDate,
  onChangeMonth,
  joinedAt,
  onPressYearMonth,
}) {
  const date = dayjs(currentDate).startOf("month");

  const yearText = date.format("YYYY년");
  const monthText = date.format("M월 리포트");

  const joinedMonth = joinedAt
    ? dayjs(joinedAt, "YYYY-MM").startOf("month")
    : null;

  const maxMonth = dayjs().startOf("month");

  const isPrevHidden = joinedMonth ? date.isSame(joinedMonth, "month") : true;

  const isNextHidden = date.isSame(maxMonth, "month");

  const handlePrev = () => {
    if (isPrevHidden) return;

    const prev = date.subtract(1, "month");
    if (joinedMonth && prev.isBefore(joinedMonth, "month")) return;

    onChangeMonth(prev);
  };

  const handleNext = () => {
    if (isNextHidden) return;

    const next = date.add(1, "month");
    if (next.isAfter(maxMonth, "month")) return;

    onChangeMonth(next);
  };

  return (
    <View
      className="flex-row justify-between items-center"
      style={{paddingVertical: 16, paddingHorizontal: 20}}
    >
      <TouchableOpacity onPress={onPressYearMonth}>
        <View>
          <AppText variant="M500" className="text-gr500">
            {yearText}
          </AppText>
          <AppText variant="H3" className="mt-1 text-bk">
            {monthText}
          </AppText>
        </View>
      </TouchableOpacity>

      <View className="flex-row items-center gap-4">
        <TouchableOpacity onPress={handlePrev}>
          <View
            className={`w-6 h-6 rounded-full items-center justify-center ${
              isPrevHidden ? "opacity-30" : ""
            }`}
          >
            {!isPrevHidden ? <ArrowLeft width="100%" height="100%" /> : null}
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext}>
          <View
            className={`w-6 h-6 rounded-full items-center justify-center ${
              isNextHidden ? "opacity-30" : ""
            }`}
          >
            {!isNextHidden ? <ArrowRight width="100%" height="100%" /> : null}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
