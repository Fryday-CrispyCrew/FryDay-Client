import React from "react";
import { Pressable, View } from "react-native";
import AppText from "./AppText";
import PlusIcon from "../assets/svg/Plus.svg";
import colors from "../styles/colors";

/**
 * 세로 배치 버튼 (아이콘 위 + 텍스트 아래)
 *
 * @prop {"primary"|"secondary"} variant
 *  - primary: 오렌지(or) 배경 + 하양 아이콘/텍스트, pressed = 다크 오렌지(do)
 *  - secondary: 라이트 그레이(gr100) 배경 + 오렌지 아이콘/텍스트, pressed = gr200
 * @prop {string} text
 * @prop {ReactNode} icon - 미지정 시 PlusIcon 사용
 * @prop {() => void} onPress
 * @prop {boolean} disabled
 * @prop {object} style - 최상단 컨테이너 스타일 오버라이드
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

  // 목업 스펙:
  // - primary: bg OR → DO(pressed), border 없음, 아이콘 원 배경 wt25 (하양 반투명)
  // - secondary: bg Secondary/GR → GR200(pressed), border 1px GR100, 아이콘 원 배경 OR (solid)
  const bg = isPrimary ? colors.or : colors.gr;
  const bgPressed = isPrimary ? colors.do : colors.gr200;
  const textColor = isPrimary ? colors.wt : colors.or;
  // 아이콘 (+) 은 원형 배경 위에 얹히므로 두 variant 모두 하양
  const iconColor = colors.wt;
  const iconCircleBg = isPrimary ? colors.wt25 : colors.or;

  const IconElement = icon ?? <PlusIcon width={24} height={24} color={iconColor} />;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: pressed && !disabled ? bgPressed : bg,
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

      <AppText variant="M600" style={{ color: textColor }}>
        {text}
      </AppText>
    </Pressable>
  );
}
