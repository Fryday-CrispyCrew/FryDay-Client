import React, { useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import AppText from "../../../shared/components/AppText";
import colors from "../../../shared/styles/colors";

import BellIcon from "../assets/svg/group-bell-icon.svg";
import OrderIcon from "../assets/svg/group-order-icon.svg";
import MoreIcon from "../assets/svg/group-more-icon.svg";
import DeilIcon from "../assets/svg/group-deil-icon.svg";

// type → { Icon, label } 프리셋
const REACTION_MAP = {
  bell: { Icon: BellIcon, label: "계신가요?" },
  order: { Icon: OrderIcon, label: "주문이요!" },
  more: { Icon: MoreIcon, label: "더 주세요" },
  deil: { Icon: DeilIcon, label: "맛집 인정" },
};

const ICON_SIZE = 24;

/**
 * 그룹 상세 - 응원/반응 버튼 (pill 형태).
 * type 만 지정하면 아이콘+라벨 세팅됨.
 *
 * Figma 스펙:
 * - padding: 4/16/4/12 (T/R/B/L), gap 4
 * - radius 999 (pill), border 1px GR200, bg GR100
 * - text L600, OR
 * - 기본 115×34, pressed 시 scale 0.98 (Animated spring)
 *
 * @prop {"bell"|"order"|"more"|"deil"} type
 * @prop {() => void} onPress
 * @prop {boolean} disabled
 * @prop {object} style
 */
export default function GroupReactionButton({
  type = "bell",
  onPress,
  disabled = false,
  style,
}) {
  const { Icon, label } = REACTION_MAP[type] ?? REACTION_MAP.bell;
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale }], alignSelf: "flex-start" },
        disabled && { opacity: 0.4 }, // 30초 쿨다운 등 disabled 시 시각적 표시
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        hitSlop={4}
        style={styles.button}
      >
        <View
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon width={ICON_SIZE} height={ICON_SIZE} />
        </View>
        <AppText variant="L600" style={{ color: colors.or }}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingTop: 4,
    paddingRight: 16,
    paddingBottom: 4,
    paddingLeft: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gr200,
    backgroundColor: colors.gr100,
  },
});
