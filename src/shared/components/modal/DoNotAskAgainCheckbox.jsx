// src/shared/components/modal/DoNotAskAgainCheckbox.jsx
import React from "react";
import {TouchableOpacity, StyleSheet} from "react-native";
import RadioOn from "../../assets/svg/buttons/RadioOn.svg";
import RadioOff from "../../assets/svg/buttons/RadioOff.svg";
import AppText from "../AppText";
import colors from "../../styles/colors";

export default function DoNotAskAgainCheckbox({checked, onToggle}) {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onToggle} style={styles.row}>
      <AppText variant="M500" style={styles.label}>
        다시 묻지 않기
      </AppText>
      {checked ? (
        <RadioOn width={20} height={20} color={colors.or} />
      ) : (
        <RadioOff width={20} height={20} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: colors.gr700,
  },
});
