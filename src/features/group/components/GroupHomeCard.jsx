import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import ChevronRight from "../../../shared/assets/svg/chevrons/ChevronRight";
import colors from "../../../shared/styles/colors";

/**
 * 그룹 리스트 아이템 (하나의 그룹 카드).
 *
 * @prop {string} name - 그룹명
 * @prop {number} current - 현재 인원수
 * @prop {number} max - 최대 인원수 (기본 10)
 * @prop {ReactNode} illustration - 좌측 일러스트 슬롯 (없으면 하양 placeholder)
 * @prop {() => void} onPress
 */
export default function GroupHomeCard({
  name,
  current = 0,
  max = 10,
  illustration,
  onPress,
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        alignSelf: "stretch",
        paddingVertical: 12,
      }}
    >
      {/* 좌측 일러스트 슬롯 (나중에 이미지 넣을 자리) */}
      <View
        style={{
          width: 44,
          height: 44,
          overflow: "hidden",
        }}
      >
        {illustration}
      </View>

      {/* 그룹명 + 인원 */}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <AppText variant="L500" className="text-gr900" numberOfLines={1}>
          {name}
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <AppText
            variant="M600"
            style={{ color: colors.or, lineHeight: 18, letterSpacing: 0.144 }}
          >
            {current}
          </AppText>
          <AppText
            variant="M500"
            className="text-gr500"
            style={{ lineHeight: 18, letterSpacing: 0.144 }}
          >
            /{max}
          </AppText>
        </View>
      </View>

      <ChevronRight size={16} color={colors.gr500} strokeWidth={2.5} />
    </TouchableOpacity>
  );
}
