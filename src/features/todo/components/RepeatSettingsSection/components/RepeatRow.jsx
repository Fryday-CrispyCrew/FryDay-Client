import React from "react";
import { TouchableOpacity, View } from "react-native";
import AppText from "../../../../../shared/components/AppText";
import ChevronIcon from "../../../../../shared/components/ChevronIcon";
import colors from "../../../../../shared/styles/colors";

export default function RepeatRow({ label, value, isOpen = false, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="h-12 flex-row items-center justify-between"
    >
      <AppText variant="M500" style={{ color: colors.gr700 }}>
        {label}
      </AppText>

      <View className="flex-row items-center gap-1">
        <AppText variant="M500" style={{ color: colors.gr700 }}>
          {value}
        </AppText>
        <ChevronIcon
          direction={isOpen ? "up" : "down"}
          size={18}
          color={colors.gr500}
          strokeWidth={1.5}
        />
      </View>
    </TouchableOpacity>
  );
}
