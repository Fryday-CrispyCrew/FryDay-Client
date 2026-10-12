import React from "react";
import { View, TouchableOpacity } from "react-native";
import dayjs from "dayjs";
import AppText from "../../../shared/components/AppText";
import BorderButton from "../../../shared/components/BorderButton";
import BackIcon from "../../../shared/assets/svg/Back.svg";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import colors from "../../../shared/styles/colors";

export default function ReportHeader({
  currentDate,
  onBack,
  onToday,
  onPressYearMonth,
}) {
  const date = dayjs(currentDate);
  return (
    <View
      className="flex-row justify-between items-center"
      style={{ paddingVertical: 16, paddingHorizontal: 20, gap: 12 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
        <TouchableOpacity
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
          hitSlop={8}
          style={{ paddingVertical: 10, paddingRight: 8 }}
        >
          <ChevronIcon direction="left" size={18} color={colors.bk} strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onPressYearMonth}
          accessibilityRole="button"
          accessibilityLabel="리포트 연월 선택"
          style={{ flexShrink: 1 }}
        >
          <AppText variant="M500" className="text-gr500">{date.format("YYYY년")}</AppText>
          <AppText variant="H3" className="text-bk" numberOfLines={1}>{date.format("M월 리포트")}</AppText>
        </TouchableOpacity>
      </View>
      <BorderButton
        text="오늘로"
        icon={<BackIcon width={14} height={14} />}
        onPress={onToday}
      />
    </View>
  );
}
