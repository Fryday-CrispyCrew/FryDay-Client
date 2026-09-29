import React from "react";
import { Pressable, View } from "react-native";
import colors from "../../../shared/styles/colors";

/**
 * 순수 토글 스위치 (라벨/타이틀 없음).
 * value=true 면 OR 배경 + knob 우측, false 면 GR300 배경 + knob 좌측.
 *
 * @prop {boolean} value
 * @prop {(next: boolean) => void} onToggle
 * @prop {boolean} disabled
 */
export default function SettingToggle({ value, onToggle, disabled = false }) {
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        onToggle?.(!value);
      }}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        paddingHorizontal: 3,
        justifyContent: "center",
        backgroundColor: value ? colors.or : colors.gr300,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: colors.wt,
          alignSelf: value ? "flex-end" : "flex-start",
        }}
      />
    </Pressable>
  );
}
