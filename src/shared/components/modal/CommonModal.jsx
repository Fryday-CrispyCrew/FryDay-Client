// src/shared/components/modal/CommonModal.jsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import BaseModal from "./BaseModal";
import colors from "../../styles/colors";
import AppText from "../AppText";

function Button({ label, onPress, variant = "primary" }) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={[
        "h-[48px] items-center justify-center rounded-2xl",
        isPrimary
          ? "bg-bk"
          : "border border-bk bg-wt",
      ].join(" ")}
    >
      <AppText
        variant="L500"
        style={{
          lineHeight: 14 * 1.5,
          color: isPrimary ? colors.wt : colors.bk,
        }}
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

                                      primary,
                                      secondary,
                                      buttons,

                                      footerSlot,

                                      closeOnBackdrop = true,
                                      showClose = true,
                                      backdropColor,
                                    }) {
  const buttonList = buttons ?? [primary, secondary].filter(Boolean);

  return (
    <BaseModal
      visible={visible}
      title={title}
      onRequestClose={onClose}
      onBackdropPress={closeOnBackdrop ? onClose : undefined}
      showClose={showClose}
      backdropColor={backdropColor}
    >
      {!!description && (
        <AppText
          variant="L500"
          className="text-center text-gr700"
          style={{ lineHeight: 14 * 1.5 }}
        >
          {description}
        </AppText>
      )}

      <View className={[description ? "mt-6" : "mt-2", "gap-3"].join(" ")}>
        {buttonList.map((button, index) => (
          <Button
            key={`${button.label}-${index}`}
            label={button.label}
            onPress={button.onPress}
            variant={button.variant ?? (index === 0 && !buttons ? "primary" : "outline")}
          />
        ))}
      </View>

      {!!footerSlot && (
        <View className="mt-2 items-end">
          {footerSlot}
        </View>
      )}
    </BaseModal>
  );
}