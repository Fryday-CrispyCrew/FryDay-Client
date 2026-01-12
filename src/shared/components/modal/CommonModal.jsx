// src/shared/components/modal/CommonModal.jsx
import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import BaseModal from "./BaseModal";
import colors from "../../styles/colors";

function Button({label, onPress, variant = "primary"}) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.btn, isPrimary ? styles.btnPrimary : styles.btnOutline]}
    >
      <Text
        style={[
          styles.btnText,
          isPrimary ? styles.btnTextPrimary : styles.btnTextOutline,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CommonModal({
  visible,
  title,
  description,
  onClose,

  // ✅ buttons
  primary,
  secondary,

  // ✅ optional slot (checkbox, extra info, etc.)
  footerSlot,

  // ✅ backdrop click behavior
  closeOnBackdrop = true,
  showClose = true,
}) {
  return (
    <BaseModal
      visible={visible}
      title={title}
      onRequestClose={onClose}
      onBackdropPress={closeOnBackdrop ? onClose : undefined}
      showClose={showClose}
    >
      {!!description && <Text style={styles.desc}>{description}</Text>}

      {!!footerSlot && <View style={{marginTop: 12}}>{footerSlot}</View>}

      <View style={styles.btnStack}>
        {primary && (
          <Button
            label={primary.label}
            onPress={primary.onPress}
            variant={primary.variant ?? "primary"}
          />
        )}
        {secondary && (
          <Button
            label={secondary.label}
            onPress={secondary.onPress}
            variant={secondary.variant ?? "outline"}
          />
        )}
      </View>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontFamily: "Pretendard-Medium",
    fontSize: 12,
    lineHeight: 12 * 1.5,
    color: colors.gr500,
    textAlign: "center",
    marginTop: 6,
  },
  btnStack: {marginTop: 16, gap: 10},
  btn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {backgroundColor: colors.bk},
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.bk,
    backgroundColor: colors.wt,
  },
  btnText: {fontFamily: "Pretendard-SemiBold", fontSize: 14},
  btnTextPrimary: {color: colors.wt},
  btnTextOutline: {color: colors.bk},
});
