// src/shared/components/modal/BaseModal.jsx
import React from "react";
import {
  Modal,
  Pressable,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../../styles/colors";
import ClearIcon from "../../assets/svg/Clear.svg";
import AppText from "../AppText";

export default function BaseModal({
                                    visible,
                                    title,
                                    children,
                                    onRequestClose,
                                    onBackdropPress,
                                    showClose = true,
                                    hideCard = false,
                                    cardStyle,
                                    bodyStyle,
                                  }) {
  return (
      <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={onRequestClose}
      >
        {/* dim */}
        <Pressable
            style={styles.backdrop}
            onPress={onBackdropPress ?? onRequestClose}
        />

        {hideCard ? (
            <View style={styles.fullscreen}>{children}</View>
        ) : (
            <View style={[styles.card, cardStyle]}>
              <View style={styles.header}>
                <View style={styles.side} />
                <AppText variant="H3" style={styles.title}>
                  {title}
                </AppText>

                {showClose ? (
                    <TouchableOpacity
                        onPress={onRequestClose}
                        hitSlop={10}
                        style={styles.closeBtn}
                    >
                      <ClearIcon
                          width={18}
                          height={18}
                          color={colors?.bk ?? "#141312"}
                      />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.side} />
                )}
              </View>

              <View style={[styles.body, bodyStyle]}>{children}</View>
            </View>
        )}
      </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  // 기존 카드 모달
  card: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "30%",
    borderRadius: 20,
    backgroundColor: colors.wt,
    overflow: "hidden",
  },

  header: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.gr100,
  },

  side: { width: 34, height: 18 },

  title: {
    lineHeight: 16 * 1.5,
  },

  closeBtn: {
    width: 34,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  body: {
    paddingHorizontal: 40,
    paddingVertical: 24,
  },

  fullscreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: colors.wt,
  },
});
