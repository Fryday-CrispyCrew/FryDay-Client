import React from "react";
import { Pressable, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import ChevronIcon from "../../../shared/components/ChevronIcon";
import colors from "../../../shared/styles/colors";

/**
 * 설정 카드 안 한 줄. 좌측 title + 우측 trailing (텍스트/토글/체브론) row.
 * - trailing: 우측에 렌더할 React 노드 (예: <SettingToggle />)
 * - trailingText + showChevron: 텍스트 라벨 + chevron 조합 편의
 * - onPress 주면 눌리는 row (nav 용)
 *
 * @prop {string} title
 * @prop {ReactNode} trailing
 * @prop {string} trailingText
 * @prop {boolean} showChevron
 * @prop {() => void} onPress
 */
export default function SettingRow({
  title,
  trailing,
  trailingText,
  showChevron = false,
  onPress,
}) {
  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 16,
      }}
    >
      <AppText variant="L500" className="text-gr700">
        {title}
      </AppText>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {trailingText ? (
          <AppText variant="M500" className="text-gr700">
            {trailingText}
          </AppText>
        ) : null}
        {trailing}
        {showChevron ? (
          <ChevronIcon
            direction="right"
            size={16}
            color={colors.gr500}
            strokeWidth={2}
          />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} android_ripple={{ color: colors.gr100 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}
