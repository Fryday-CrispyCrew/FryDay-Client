// src/shared/components/modal/CommonModal.jsx
import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from "react-native";
import BaseModal from "./BaseModal";
import colors from "../../styles/colors";
import AppText from "../AppText";

function Button({label, onPress, variant = "primary"}) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.btn, isPrimary ? styles.btnPrimary : styles.btnOutline]}
    >
      <AppText
        variant="L500"
        style={[
          styles.btnText,
          isPrimary ? styles.btnTextPrimary : styles.btnTextOutline,
        ]}
      >
        {label}
      </AppText>
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
      {!!description && (
        <AppText variant="L500" style={styles.desc}>
          {description}
        </AppText>
      )}

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

      {!!footerSlot && <View style={styles.footer}>{footerSlot}</View>}
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  desc: {
    lineHeight: 14 * 1.5,
    color: colors.gr700,
    textAlign: "center",
    // marginTop: 6,
    // borderWidth: 1,
  },
  btnStack: {marginTop: 24, gap: 12},
  footer: {marginTop: 12, alignItems: "flex-end"},
  btn: {
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {backgroundColor: colors.bk},
  btnOutline: {
    borderWidth: 1,
    borderColor: colors.bk,
    backgroundColor: colors.wt,
  },
  btnText: {lineHeight: 14 * 1.5, color: colors.bk},
  btnTextPrimary: {color: colors.wt},
  btnTextOutline: {color: colors.bk},
});
