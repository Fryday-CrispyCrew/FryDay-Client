import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import ChevronRight from "../../../shared/assets/svg/chevrons/ChevronRight";
import colors from "../../../shared/styles/colors";

const GROUP_IMAGES = {
  "01": require("../assets/png/Group_Img_01.png"),
  "02": require("../assets/png/Group_Img_02.png"),
  "03": require("../assets/png/Group_Img_03.png"),
};

/**
 * 그룹 리스트 아이템 (하나의 그룹 카드).
 *
 * @prop {string} name - 그룹명
 * @prop {number} current - 현재 인원수
 * @prop {number} max - 최대 인원수 (기본 10)
 * @prop {string} imageCode - 서버가 배정한 그룹 이미지 코드
 * @prop {ReactNode} illustration - 좌측 일러스트를 직접 지정할 때 사용
 * @prop {() => void} onPress
 */
export default function GroupHomeCard({
  name,
  imageCode,
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
      {/* 서버에서 배정한 그룹 이미지 */}
      <View
        style={{
          width: 44,
          height: 44,
          overflow: "hidden",
        }}
      >
        {illustration ?? (GROUP_IMAGES[imageCode] ? (
          <Image
            source={GROUP_IMAGES[imageCode]}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
        ) : null)}
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
