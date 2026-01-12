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
import ClearIcon from "../../assets/svg/Clear.svg"; // ✅ 경로는 네 파일 위치에 맞게 수정
import AppText from "../AppText";

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

        <View style={styles.body}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // ✅ 스샷 같은 dim
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
    lineHeight: 16 * 1.5,
  },
  closeBtn: {
    width: 34,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {fontSize: 18, lineHeight: 18, color: colors.bk},
  body: {paddingHorizontal: 40, paddingVertical: 24},
});
