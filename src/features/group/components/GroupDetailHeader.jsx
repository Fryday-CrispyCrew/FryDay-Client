import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import colors from "../../../shared/styles/colors";

/**
 * 그룹 상세 헤더.
 * 좌: back chevron / 중앙: 날짜 + 그룹명·인원수 / 우: 케밥(더보기)
 * height 74, padding 16/20, space-between
 *
 * @prop {string} date - "2026년 1월 1일" 같은 문자열
 * @prop {string} groupName
 * @prop {number} memberCount - 현재 인원수 (OR 색으로 강조)
 * @prop {() => void} onBackPress
 * @prop {() => void} onMenuPress
 */
export default function GroupDetailHeader({
  date,
  groupName,
  memberCount,
  onBackPress,
  onMenuPress,
}) {
  return (
    <View
      style={{
        height: 74,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center", // back / 중앙 content / 케밥 → 2줄 컨텐츠 세로 중앙
      }}
    >
      {/* 좌: back — 2줄 컨텐츠 세로 중앙 */}
      <TouchableOpacity
        onPress={onBackPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{ paddingRight: 8 }}
      >
        <ChevronIcon
          direction="left"
          size={18}
          color={colors.bk}
          strokeWidth={2}
        />
      </TouchableOpacity>

      {/* 중앙: 날짜(M500 GR500) + 그룹명(H3 BK) + 인원수(H3 OR) */}
      <View style={{ flex: 1 }}>
        {date ? (
          <AppText variant="M500" className="text-gr500">
            {date}
          </AppText>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            marginTop: 2,
          }}
        >
          <AppText
            variant="H3"
            className="text-bk"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ flexShrink: 1 }}
          >
            {groupName}
          </AppText>
          <AppText
            variant="H3"
            style={{ color: colors.or, marginLeft: 6 }}
          >
            {memberCount}
          </AppText>
        </View>
      </View>

      {/* 우: 케밥(⋮) — 2줄 컨텐츠 세로 중앙 */}
      <TouchableOpacity
        onPress={onMenuPress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={{
          width: 20,
          height: 16,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={dot} />
        <View style={dot} />
        <View style={dot} />
      </TouchableOpacity>
    </View>
  );
}

const dot = {
  width: 3,
  height: 3,
  borderRadius: 1.5,
  backgroundColor: colors.bk,
};
