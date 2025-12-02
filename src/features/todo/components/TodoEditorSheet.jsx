// src/components/TodoEditorSheet.jsx
// (HomeScreen에서 import 경로에 맞게 위치시켜줘)

import React, {useEffect, useRef} from "react";
import {
  Modal,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Keyboard,
  StyleSheet,
  Text,
} from "react-native";

export default function TodoEditorSheet({
  visible,
  value,
  onChangeText,
  onClose,
  onSubmit,
}) {
  const inputRef = useRef(null);

  // ✅ 모달이 열릴 때 TextInput에 포커스 -> 키보드 자동 오픈
  useEffect(() => {
    if (visible) {
      const id = setTimeout(() => {
        inputRef.current?.focus();
      }, 50); // 살짝 딜레이를 줘야 iOS에서 안정적으로 동작
      return () => clearTimeout(id);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 회색 배경 전체 영역 */}
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
        style={{borderWidth: 1, borderColor: "red"}}
      >
        <View style={styles.overlay}>
          {/* 하단 시트 부분은 닫히지 않게 한 번 더 감싸줌 */}
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardContainer}
            >
              <View style={styles.sheet}>
                {/* 상단 핸들바 */}
                <View style={styles.handleBar} />

                {/* 카테고리 칩 (왼쪽) */}
                <View style={styles.categoryRow}>
                  <View style={styles.categoryChip}>
                    <Text style={styles.categoryText}>카테고리</Text>
                  </View>
                </View>

                {/* 입력창 + 전송 버튼 */}
                <View style={styles.inputRow}>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      ref={inputRef} // ✅ ref 연결
                      //   autoFocus
                      value={value}
                      onChangeText={onChangeText}
                      placeholder="두근두근, 무엇을 튀겨볼까요?"
                      placeholderTextColor="#C6C6C6"
                      returnKeyType="done"
                      onSubmitEditing={onSubmit}
                      style={styles.input}
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onSubmit}
                    style={styles.submitButton}
                  >
                    {/* 아이콘 있으면 여기로 교체하면 됨 */}
                    <Text style={styles.submitIcon}>➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const SHEET_BG = "#F7F7F7";
const OVERLAY_BG = "#0000004d";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OVERLAY_BG, // 스샷처럼 전체 회색
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: "flex-end", // 항상 아래쪽에 붙게
  },
  sheet: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: SHEET_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: -4},
    elevation: 10,
  },
  handleBar: {
    alignSelf: "center",
    width: 80,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#D0D0D0",
    marginBottom: 14,
  },
  categoryRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F0F0F0",
  },
  categoryText: {
    fontSize: 13,
    color: "#B0B0B0",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  input: {
    fontSize: 15,
    color: "#333333",
  },
  submitButton: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E4E4E4",
    alignItems: "center",
    justifyContent: "center",
  },
  submitIcon: {
    fontSize: 18,
    color: "#888888",
  },
});
