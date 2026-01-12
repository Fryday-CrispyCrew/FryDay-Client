// src/shared/components/modal/BaseModal.jsx
import React from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import colors from "../../styles/colors";

export default function BaseModal({
  visible,
  title,
  children,
  onRequestClose,
  onBackdropPress,
  showClose = true,
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

      {/* card */}
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.side} />
          <Text style={styles.title}>{title}</Text>

          {showClose ? (
            <TouchableOpacity
              onPress={onRequestClose}
              hitSlop={10}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.side} />
          )}
        </View>

        <View style={styles.body}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)", // ✅ 스샷 같은 dim
  },
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
  side: {width: 34, height: 18},
  title: {
    fontFamily: "Pretendard-SemiBold",
    fontSize: 16,
    lineHeight: 16 * 1.5,
    color: colors.bk,
  },
  closeBtn: {
    width: 34,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {fontSize: 18, lineHeight: 18, color: colors.bk},
  body: {paddingHorizontal: 18, paddingVertical: 16},
});
