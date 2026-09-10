import React from "react";
import { View } from "react-native";
import AppText from "../../../shared/components/AppText";
import GroupReactionButton from "./GroupReactionButton";
import colors from "../../../shared/styles/colors";

/**
 * 그룹 상세 그리드의 멤버 셀. (2열 그리드 안의 한 칸)
 * 상단: 캐릭터/집 그래픽 슬롯 (외부 주입, 없으면 비어있음)
 * 하단: 이름 · 카운트 · 반응 버튼
 *
 * @prop {ReactNode} illustration
 * @prop {string} name
 * @prop {number} current
 * @prop {number} max
 * @prop {"bell"|"order"|"more"|"deil"} reactionType - 반응 버튼 프리셋
 * @prop {() => void} onPressReaction
 */
export default function GroupMemberCell({
  illustration,
  name,
  current = 0,
  max = 10,
  reactionType = "bell",
  onPressReaction,
}) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 20 }}>
      {/* 그래픽 슬롯 */}
      <View
        style={{
          width: 120,
          height: 120,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {illustration}
      </View>

      {/* 이름 - L600 BK */}
      <AppText variant="L600" className="text-bk" style={{ marginTop: 8 }}>
        {name}
      </AppText>

      {/* 완료 / 미완료 투두 - 완료 L600 OR, 미완료 L500 GR500 - 이름과 4px 간격 */}
      <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
        <AppText variant="L600" style={{ color: colors.or }}>
          {current}
        </AppText>
        <AppText variant="L500" className="text-gr500">
          /{max}
        </AppText>
      </View>

      {/* 반응 버튼 */}
      <View style={{ marginTop: 12 }}>
        <GroupReactionButton type={reactionType} onPress={onPressReaction} />
      </View>
    </View>
  );
}
