import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "./AppText";
import PlusIcon from "../assets/svg/Plus.svg";
import colors from "../styles/colors";

/**
 * 세로 배치 버튼 (아이콘 위 + 텍스트 아래)
 *
 * @prop {"primary"|"secondary"} variant
 * @prop {string} text
 * @prop {ReactNode} icon - 미지정 시 PlusIcon 사용
 * @prop {() => void} onPress
 * @prop {boolean} disabled
 * @prop {object} style
 */
export default function VerticalButton({
  variant = "primary",
  text,
  icon,
  onPress,
  disabled = false,
  style,
}) {
  const isPrimary = variant === "primary";

  const bg = isPrimary ? colors.or : colors.gr;
  const textColor = isPrimary ? colors.wt : colors.or;
  const iconCircleBg = isPrimary ? colors.wt25 : colors.or;

  const IconElement =
    icon ?? <PlusIcon width={24} height={24} color={colors.wt} />;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: bg,
          borderRadius: 16,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isPrimary ? "transparent" : colors.gr100,
          paddingVertical: 20,
          paddingHorizontal: 16,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: iconCircleBg,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 8,
        }}
      >
        {IconElement}
      </View>

      <AppText variant="L500" style={{ color: textColor }}>
        {text}
      </AppText>
    </TouchableOpacity>
  );
}
