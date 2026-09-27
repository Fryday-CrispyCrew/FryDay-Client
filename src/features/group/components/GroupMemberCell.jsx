import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import GroupReactionButton from "./GroupReactionButton";
import GroupStoreImage from "./GroupStoreImage";
import colors from "../../../shared/styles/colors";

/**
 * 그룹 상세 그리드의 멤버 셀. (2열 그리드 안의 한 칸)
 * 상단: 서버 영업 상태에 맞는 가게 이미지 (외부 illustration 주입 시 우선 사용)
 *   → 탭 시 onPressGraphic 발동 (해당 멤버의 공개 투두 화면으로 이동)
 * 하단: 이름 · 카운트 · 반응 버튼
 *
 * @prop {ReactNode} illustration
 * @prop {string} name
 * @prop {number} current
 * @prop {number} max
 * @prop {"bell"|"order"|"more"|"deil"} reactionType - 반응 버튼 프리셋
 * @prop {() => void} onPressReaction
 * @prop {() => void} onPressGraphic - 그래픽 슬롯 tap
 */
export default function GroupMemberCell({
  illustration,
  status,
  name,
  current = 0,
  max = 10,
  reactionType = "bell",
  reactionDisabled = false,
  onPressReaction,
  onPressGraphic,
}) {
  return (
    <View style={{ alignItems: "center", paddingVertical: 20 }}>
      {/* 그래픽 슬롯 (tap 하면 해당 멤버 공개 투두 화면으로) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPressGraphic}
        disabled={!onPressGraphic}
        style={{
          width: 120,
          height: 120,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {illustration ?? <GroupStoreImage status={status} />}
      </TouchableOpacity>

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
        <GroupReactionButton
          type={reactionType}
          onPress={onPressReaction}
          disabled={reactionDisabled}
        />
      </View>
    </View>
  );
}
